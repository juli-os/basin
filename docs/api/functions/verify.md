[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / verify

# Function: verify()

> **verify**(`db`, `migrations`): [`VerifyReport`](../interfaces/VerifyReport.md)

Defined in: [core.ts:116](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L116)

只读核对：报当前版本与迁移表最新版，是否追平。不执行任何写。

## Parameters

### db

[`BasinDb`](../interfaces/BasinDb.md)

### migrations

readonly [`Migration`](../interfaces/Migration.md)[]

## Returns

[`VerifyReport`](../interfaces/VerifyReport.md)
