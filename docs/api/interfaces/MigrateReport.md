[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / MigrateReport

# Interface: MigrateReport

Defined in: [core.ts:30](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L30)

migrate 的执行报告。

## Properties

### applied

> `readonly` **applied**: readonly `object`[]

Defined in: [core.ts:36](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L36)

本次实际执行的迁移（版本 + 名字），按应用顺序。

***

### from

> `readonly` **from**: `number`

Defined in: [core.ts:32](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L32)

执行前的 user_version。

***

### to

> `readonly` **to**: `number`

Defined in: [core.ts:34](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L34)

执行后的 user_version（= 已应用迁移的最大版本，无应用时 = from）。
