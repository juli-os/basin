[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / Migration

# Interface: Migration

Defined in: [core.ts:23](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L23)

一条版本化迁移：把库从 version-1 推到 version。up 必须幂等。

## Properties

### name

> `readonly` **name**: `string`

Defined in: [core.ts:25](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L25)

***

### up

> `readonly` **up**: (`db`) => `void`

Defined in: [core.ts:26](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L26)

#### Parameters

##### db

[`BasinDb`](BasinDb.md)

#### Returns

`void`

***

### version

> `readonly` **version**: `number`

Defined in: [core.ts:24](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L24)
