<!-- 手写翻译：本页是 README（即 docs/index.md）的英文手写翻译，不参与 docs:gen 生成；README 变更时需人工同步更新本页。 -->

# @juli-os/basin

juli-os infrastructure: a versioned SQLite migration foundation (a wrapper over `node:sqlite`, zero npm dependencies).

basin ships general-purpose capability only: opening a connection, creating tables, and running versioned migrations. It carries no juli business concepts, so anyone can use it. Business semantics such as roles, identity, and decisions live in each business domain (see the juli-service-ts main repo).

## Why it exists

Each juli domain (ledger, feedback, gates) used to hand-roll its own table-creation SQL and add columns manually via `PRAGMA table_info`. There were no version numbers, so upgrade history could not be audited. basin distills that craft into explicit data:

- A migration set is an ordered list (`Migration[]`); each entry has one version number, one name, and one idempotent `up`.
- The database's progress is pinned to `PRAGMA user_version`, and `verify` checks it read-only.
- Each migration runs in its own transaction. A mid-way failure rolls back, the version does not advance, and the migration can be rerun after the fix.

## Usage

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

Migrations must be idempotent (`CREATE TABLE IF NOT EXISTS` / check the column, then add it). An existing database runs from `user_version=0` straight through the full v1 chain. A fresh database walks the same path. Old and new converge to the same state.

## CLI

```
basin migrate --db=x.db --def=migrations.mjs   # migrate the database to the latest version in def
basin verify  --db=x.db --def=migrations.mjs   # report the current version (def optional)
```

`--def` points to an ESM module that exports `const migrations: Migration[]`.
Each CLI command does one action, and every command calls the package's own exported functions.

## Docs

This repo's docs are generated passively: `npm run docs:gen` (README mirror + architecture diagram + typedoc API). CI checks that the generated output does not drift. Nobody hand-writes long architecture pages; the "why" notes live next to the code.

License: Apache-2.0
