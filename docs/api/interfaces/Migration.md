[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / Migration

# Interface: Migration

Defined in: core.ts:16

一条版本化迁移：把库从 version-1 推到 version。up 必须幂等。

## Properties

### name

> `readonly` **name**: `string`

Defined in: core.ts:18

***

### up

> `readonly` **up**: (`db`) => `void`

Defined in: core.ts:19

#### Parameters

##### db

`DatabaseSync`

#### Returns

`void`

***

### version

> `readonly` **version**: `number`

Defined in: core.ts:17
