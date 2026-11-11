// basin facade — 数据库件（@juli-os/basin）的唯一公开面。
// 基础件：纯能力（打开连接、建表、版本迁移），不含任何 juli 业务概念。
// 为什么独立成包：juli 架构调整第 2 步（2026-11-11）——ledger 的建库手艺
// 提炼成显式版本化迁移，feedback/gates 等域一个域一个库文件时共用这套底座。
export {
  openDatabase, currentVersion, validateMigrations, defineMigration, sqlMigration,
  migrate, verify, tableColumns, addColumnIfMissing,
  type Migration, type MigrateReport, type VerifyReport,
} from './basin/core.ts';
