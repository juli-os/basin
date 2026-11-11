[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / sqlMigration

# Function: sqlMigration()

> **sqlMigration**(`version`, `name`, `script`): [`Migration`](../interfaces/Migration.md)

Defined in: core.ts:82

纯 SQL 迁移的便捷构造——up 就是一段 script（须自幂等）。

## Parameters

### version

`number`

### name

`string`

### script

`string`

## Returns

[`Migration`](../interfaces/Migration.md)
