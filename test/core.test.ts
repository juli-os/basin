// basin 核心行为测试：版本迁移的升/幂等/回滚/校验，加列幂等。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  openDatabase, currentVersion, migrate, verify, validateMigrations,
  defineMigration, sqlMigration, tableColumns, addColumnIfMissing,
  type Migration,
} from '../src/index.ts';

const tmp = (): string => mkdtempSync(join(tmpdir(), 'basin-'));
const M1 = sqlMigration(1, 'create widgets', `
  CREATE TABLE IF NOT EXISTS widgets (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL DEFAULT ''
  );
`);
const M2 = defineMigration(2, 'add widget size column', (db) => {
  addColumnIfMissing(db, 'widgets', 'size', "size TEXT NOT NULL DEFAULT 'sm'");
});

test('新库 migrate 到最新：user_version 钉住、表可用、重跑幂等', () => {
  const dir = tmp();
  const db = openDatabase(join(dir, 'a.db'));
  assert.equal(currentVersion(db), 0);
  const r1 = migrate(db, [M1, M2]);
  assert.deepEqual(r1, { from: 0, to: 2, applied: [{ version: 1, name: 'create widgets' }, { version: 2, name: 'add widget size column' }] });
  assert.equal(currentVersion(db), 2);
  db.prepare("INSERT INTO widgets (id, label, size) VALUES ('w1', 'gear', 'lg')").run();
  const row = db.prepare('SELECT id, size FROM widgets').get() as Record<string, string>;
  assert.equal(row['id'], 'w1');
  assert.equal(row['size'], 'lg');
  const r2 = migrate(db, [M1, M2]);
  assert.equal(r2.applied.length, 0, '重跑无事可做');
  assert.equal(r2.to, 2);
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

test('存量库（user_version=0 但表已在）直跑 v1 幂等收敛', () => {
  const dir = tmp();
  const db = openDatabase(join(dir, 'b.db'));
  // 模拟 ledger 式存量库：表早建好、版本从未钉过
  db.exec('CREATE TABLE IF NOT EXISTS widgets (id TEXT PRIMARY KEY, label TEXT NOT NULL DEFAULT \'\')');
  db.prepare("INSERT INTO widgets (id) VALUES ('old')").run();
  const r = migrate(db, [M1, M2]);
  assert.equal(r.to, 2);
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM widgets').get() as { n: number })['n'], 1, '存量行不动');
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

test('版本跳跃：库在 v1，只应用 v2+', () => {
  const dir = tmp();
  const db = openDatabase(join(dir, 'c.db'));
  migrate(db, [M1]);
  const r = migrate(db, [M1, M2]);
  assert.deepEqual(r.applied, [{ version: 2, name: 'add widget size column' }]);
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

test('迁移中途抛错：回滚且版本不前移，修好后可重跑', () => {
  const dir = tmp();
  const db = openDatabase(join(dir, 'd.db'));
  const bad: Migration = defineMigration(2, 'bad', () => {
    db.exec('CREATE TABLE IF NOT EXISTS doomed (id TEXT PRIMARY KEY)');
    throw new Error('boom');
  });
  migrate(db, [M1]);
  assert.throws(() => migrate(db, [M1, bad]), /boom/);
  assert.equal(currentVersion(db), 1, '版本不前移');
  const doomed = db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name='doomed'").get() as { n: number };
  assert.equal(doomed['n'], 0, '回滚干净');
  const fixed = sqlMigration(2, 'fixed', 'CREATE TABLE IF NOT EXISTS doomed (id TEXT PRIMARY KEY)');
  const r = migrate(db, [M1, fixed]);
  assert.equal(r.to, 2, '修好后重跑通过');
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

test('validateMigrations：重复/乱序/越界版本拒绝', () => {
  assert.throws(() => validateMigrations([M1, sqlMigration(1, 'dup', 'SELECT 1')]), /严格递增/);
  assert.throws(() => validateMigrations([M2, M1]), /严格递增/);
  assert.throws(() => validateMigrations([defineMigration(0, 'zero', () => {})]), />=1/);
  validateMigrations([]); // 空表合法
});

test('verify 只读：报版本与追平与否', () => {
  const dir = tmp();
  const db = openDatabase(join(dir, 'e.db'));
  assert.deepEqual(verify(db, [M1, M2]), { version: 0, latest: 2, upToDate: false });
  migrate(db, [M1, M2]);
  assert.deepEqual(verify(db, [M1, M2]), { version: 2, latest: 2, upToDate: true });
  assert.equal(currentVersion(db), 2);
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

test('tableColumns/addColumnIfMissing：幂等加列与表名防注入', () => {
  const dir = tmp();
  const db = openDatabase(join(dir, 'f.db'));
  migrate(db, [M1]);
  assert.ok(tableColumns(db, 'widgets').includes('label'));
  assert.equal(addColumnIfMissing(db, 'widgets', 'size', "size TEXT"), true);
  assert.equal(addColumnIfMissing(db, 'widgets', 'size', "size TEXT"), false, '第二次不加');
  assert.throws(() => tableColumns(db, 'widgets; DROP TABLE widgets'), /表名只允许/);
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
