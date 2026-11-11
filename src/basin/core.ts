// basin 核心：SQLite 连接与版本迁移的通用底座（node:sqlite 封装，零依赖）。
// 为什么要有它：juli 各域（ledger/feedback/gates）此前各自手搓建表 SQL +
// PRAGMA table_info 手工加列，没有版本号，升级历史无从审计。basin 把这套
// 手艺提炼成显式数据——迁移是有序表，每条一个版本号，库的进度钉在
// PRAGMA user_version 上。
//
// 设计取舍（以 ledger 现有实现为底）：
// - 迁移必须幂等（CREATE TABLE IF NOT EXISTS / 列检查后加列）。存量库从
//   user_version=0 直跑 v1 全量，新库走同一条路，新老收敛到同一状态。
// - 每条迁移单独事务：中途抛错即回滚，user_version 不前移——失败可以重跑。
// - 版本号从 1 开始严格递增、不许重复。校验在任何执行之前完成。

import { DatabaseSync } from 'node:sqlite';

/** 一条版本化迁移：把库从 version-1 推到 version。up 必须幂等。 */
export interface Migration {
  readonly version: number;
  readonly name: string;
  readonly up: (db: DatabaseSync) => void;
}

/** migrate 的执行报告。 */
export interface MigrateReport {
  /** 执行前的 user_version。 */
  readonly from: number;
  /** 执行后的 user_version（= 已应用迁移的最大版本，无应用时 = from）。 */
  readonly to: number;
  /** 本次实际执行的迁移（版本 + 名字），按应用顺序。 */
  readonly applied: readonly { readonly version: number; readonly name: string }[];
}

/** verify 的只读报告。 */
export interface VerifyReport {
  /** 库当前的 user_version。 */
  readonly version: number;
  /** 迁移表的最新版本（空表为 0）。 */
  readonly latest: number;
  /** version === latest。 */
  readonly upToDate: boolean;
}

/** 打开（或创建）一个 SQLite 库。跨包唯一入口，方便日后统一 pragma/日志。 */
export const openDatabase = (path: string): DatabaseSync => new DatabaseSync(path);

/** 读库的当前迁移版本（PRAGMA user_version）。 */
export const currentVersion = (db: DatabaseSync): number => {
  const row = db.prepare('PRAGMA user_version').get() as { user_version?: number } | undefined;
  return Number(row?.['user_version'] ?? 0);
};

const writeVersion = (db: DatabaseSync, version: number): void => {
  db.exec(`PRAGMA user_version = ${Math.floor(version)}`);
};

/** 校验迁移表：版本从 1 起严格递增且不重复。校验先于任何执行。 */
export const validateMigrations = (migrations: readonly Migration[]): void => {
  let prev = 0;
  for (const m of migrations) {
    if (!Number.isInteger(m.version) || m.version < 1) {
      throw new Error(`迁移版本必须是 >=1 的整数，收到 ${m.version}（${m.name}）`);
    }
    if (m.version <= prev) {
      throw new Error(`迁移版本必须严格递增：v${m.version}（${m.name}）跟在 v${prev} 之后`);
    }
    prev = m.version;
  }
};

/** 构造一条迁移（带版本校验的显式数据）。 */
export const defineMigration = (
  version: number,
  name: string,
  up: (db: DatabaseSync) => void,
): Migration => {
  if (!Number.isInteger(version) || version < 1) {
    throw new Error(`迁移版本必须是 >=1 的整数，收到 ${version}（${name}）`);
  }
  return { version, name, up };
};

/** 纯 SQL 迁移的便捷构造——up 就是一段 script（须自幂等）。 */
export const sqlMigration = (version: number, name: string, script: string): Migration =>
  defineMigration(version, name, (db) => {
    db.exec(script);
  });

/** 应用所有比当前版本高的迁移。每条独立事务，失败即停且库停在最后成功版本。 */
export const migrate = (db: DatabaseSync, migrations: readonly Migration[]): MigrateReport => {
  validateMigrations(migrations);
  const from = currentVersion(db);
  const applied: { version: number; name: string }[] = [];
  for (const m of migrations) {
    if (m.version <= from) continue;
    db.exec('BEGIN IMMEDIATE');
    try {
      m.up(db);
      writeVersion(db, m.version);
      db.exec('COMMIT');
      applied.push({ version: m.version, name: m.name });
    } catch (e) {
      db.exec('ROLLBACK');
      throw new Error(`迁移 v${m.version}（${m.name}）失败，已回滚：${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { from, to: currentVersion(db), applied };
};

/** 只读核对：报当前版本与迁移表最新版，是否追平。不执行任何写。 */
export const verify = (db: DatabaseSync, migrations: readonly Migration[]): VerifyReport => {
  validateMigrations(migrations);
  const version = currentVersion(db);
  const latest = migrations.length === 0 ? 0 : migrations[migrations.length - 1]!.version;
  return { version, latest, upToDate: version === latest };
};

/** 表的列名清单（PRAGMA table_info 封装——幂等加列的判据）。 */
export const tableColumns = (db: DatabaseSync, table: string): string[] => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) {
    throw new Error(`表名只允许字母数字下划线，收到 ${table}`);
  }
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name?: string }[];
  return rows.map((r) => String(r['name']));
};

/** 幂等加列：列不存在才执行 DDL。返回是否真的加了（false = 本来就有）。 */
export const addColumnIfMissing = (
  db: DatabaseSync,
  table: string,
  column: string,
  ddl: string,
): boolean => {
  if (tableColumns(db, table).includes(column)) return false;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  return true;
};
