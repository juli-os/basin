[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / verify

# Function: verify()

> **verify**(`db`, `migrations`): [`VerifyReport`](../interfaces/VerifyReport.md)

Defined in: core.ts:109

只读核对：报当前版本与迁移表最新版，是否追平。不执行任何写。

## Parameters

### db

`DatabaseSync`

### migrations

readonly [`Migration`](../interfaces/Migration.md)[]

## Returns

[`VerifyReport`](../interfaces/VerifyReport.md)
