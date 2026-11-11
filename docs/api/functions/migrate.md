[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / migrate

# Function: migrate()

> **migrate**(`db`, `migrations`): [`MigrateReport`](../interfaces/MigrateReport.md)

Defined in: [core.ts:95](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L95)

应用所有比当前版本高的迁移。每条独立事务，失败即停且库停在最后成功版本。

## Parameters

### db

[`BasinDb`](../interfaces/BasinDb.md)

### migrations

readonly [`Migration`](../interfaces/Migration.md)[]

## Returns

[`MigrateReport`](../interfaces/MigrateReport.md)
