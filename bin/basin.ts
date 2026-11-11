#!/usr/bin/env node
// basin — 数据库件 CLI，一条命令一个动作，全部调用包自己的导出函数。
// Usage:
//   basin migrate --db=x.db [--def=migrations.mjs]   建库到 def 的最新版
//   basin verify  --db=x.db [--def=migrations.mjs]   报当前版本（def 可选）
// --def 指向一个 ESM 模块，其导出 const migrations: Migration[]。
// 不给 --def 时 migrate 只建库文件并报版本 0（无迁移定义无从前进）。
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name: string): string | undefined => {
  const eq = `--${name}=`;
  const connected = args.find((a) => a.startsWith(eq));
  if (connected) return connected.slice(eq.length);
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = args[i + 1];
  if (!v || v.startsWith('--')) throw new Error(`--${name} 需要一个值`);
  return v;
};

const dbPath = flag('db');
const defPath = flag('def');

const usage = (): never => {
  console.error('用法: basin migrate|verify --db=<path.db> [--def=migrations.mjs]');
  process.exit(2);
};

if ((cmd !== 'migrate' && cmd !== 'verify') || !dbPath) usage();
// usage() 是 never 返回，TS 推不出来——此处 dbPath 必有值。
const dbFile = dbPath as string;

const loadMigrations = async () => {
  if (!defPath) return [];
  const mod = await import(pathToFileURL(defPath).href) as { migrations?: unknown };
  if (!Array.isArray(mod.migrations)) {
    throw new Error(`${defPath} 必须导出 const migrations = [...]`);
  }
  return mod.migrations as Parameters<typeof import('../src/index.ts').migrate>[1];
};

const { openDatabase, migrate, verify } = await import('../src/index.ts');

if (cmd === 'migrate') {
  const migrations = await loadMigrations();
  if (!defPath) {
    const db = openDatabase(dbFile);
    console.log(`basin migrate: 已建库 ${dbFile}（未提供 --def，版本保持 v${verify(db, []).version}）`);
    db.close();
    process.exit(0);
  }
  const db = openDatabase(dbFile);
  const report = migrate(db, migrations);
  console.log(`basin migrate: v${report.from} → v${report.to}`);
  for (const a of report.applied) console.log(`  + v${a.version} ${a.name}`);
  if (report.applied.length === 0) console.log('  （已最新，无事可做）');
  db.close();
} else {
  const db = openDatabase(dbFile);
  const migrations = await loadMigrations();
  const r = verify(db, migrations);
  console.log(`basin verify: ${dbFile} 当前 v${r.version}` + (migrations.length ? ` / 最新 v${r.latest} ${r.upToDate ? '（已追平）' : '（落后）'}` : '（未提供 --def，只报版本）'));
  db.close();
}
