[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / migrate

# Function: migrate()

> **migrate**(`db`, `migrations`): [`MigrateReport`](../interfaces/MigrateReport.md)

Defined in: core.ts:88

应用所有比当前版本高的迁移。每条独立事务，失败即停且库停在最后成功版本。

## Parameters

### db

`DatabaseSync`

### migrations

readonly [`Migration`](../interfaces/Migration.md)[]

## Returns

[`MigrateReport`](../interfaces/MigrateReport.md)
