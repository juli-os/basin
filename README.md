# @juli-os/basin

juli-os 基础件：版本化 SQLite 迁移底座（`node:sqlite` 封装，零 npm 依赖）。

basin 只装通用能力：打开连接、建表、版本迁移。不含任何 juli 业务概念，谁都能用。
角色、身份、决策等业务语义住在各业务域里（见 juli-service-ts 主仓）。

## 为什么需要它

juli 的各个域（ledger、feedback、gates）此前各自手搓建表 SQL，用
`PRAGMA table_info` 手工加列，没有版本号，升级历史无从审计。basin 把这套手艺
提炼成显式数据：

- 迁移是有序表（`Migration[]`），每条一个版本号、一个名字、一段幂等的 `up`。
- 库的进度钉在 `PRAGMA user_version` 上，`verify` 只读核对。
- 每条迁移独立事务，中途失败即回滚，版本不前移，修好可重跑。

## 用法

```ts
import { openDatabase, sqlMigration, addColumnIfMissing, defineMigration, migrate, verify } from '@juli-os/basin';

const db = openDatabase('app.db');
const migrations = [
  sqlMigration(1, 'create widgets', `
    CREATE TABLE IF NOT EXISTS widgets (id TEXT PRIMARY KEY, label TEXT NOT NULL DEFAULT '');
  `),
  defineMigration(2, 'add size', (db) => {
    addColumnIfMissing(db, 'widgets', 'size', "size TEXT NOT NULL DEFAULT 'sm'");
  }),
];

migrate(db, migrations);   // { from: 0, to: 2, applied: [...] }
verify(db, migrations);    // { version: 2, latest: 2, upToDate: true }
```

迁移必须幂等（`CREATE TABLE IF NOT EXISTS` / 列检查后加列）：存量库从
`user_version=0` 直跑 v1 全量，新库走同一条路，新老收敛到同一状态。

## CLI

```
basin migrate --db=x.db --def=migrations.mjs   # 建库到 def 的最新版
basin verify  --db=x.db --def=migrations.mjs   # 报当前版本（def 可选）
```

`--def` 指向一个 ESM 模块，导出 `const migrations: Migration[]`。
CLI 一条命令一个动作，全部调用包自己的导出函数。

## 文档

本仓文档被动生成：`npm run docs:gen`（README 镜像 + 架构图 + typedoc API），
CI 校验生成物不漂移。人不手写架构长文，只在代码旁写「为什么」。

License: Apache-2.0
