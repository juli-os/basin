[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / addColumnIfMissing

# Function: addColumnIfMissing()

> **addColumnIfMissing**(`db`, `table`, `column`, `ddl`): `boolean`

Defined in: [core.ts:133](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L133)

幂等加列：列不存在才执行 DDL。返回是否真的加了（false = 本来就有）。

## Parameters

### db

[`BasinDb`](../interfaces/BasinDb.md)

### table

`string`

### column

`string`

### ddl

`string`

## Returns

`boolean`
