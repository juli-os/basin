[**@juli-os/basin**](../index.md)

***

[@juli-os/basin](../index.md) / BasinDb

# Interface: BasinDb

Defined in: [core.ts:17](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L17)

basin 操作库所需的最小结构接口——node:sqlite 的 DatabaseSync 天然满足；
duck-type 的测试替身只要凑齐 prepare/get/exec 也能直接传入。

## Methods

### exec()

> **exec**(`sql`): `unknown`

Defined in: [core.ts:19](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L19)

#### Parameters

##### sql

`string`

#### Returns

`unknown`

***

### prepare()

> **prepare**(`sql`): `object`

Defined in: [core.ts:18](https://github.com/juli-os/basin/blob/main/src/basin/core.ts#L18)

#### Parameters

##### sql

`string`

#### Returns

`object`

##### all()

> **all**(...`args`): `unknown`[]

###### Parameters

###### args

...`unknown`[]

###### Returns

`unknown`[]

##### get()

> **get**(...`args`): `unknown`

###### Parameters

###### args

...`unknown`[]

###### Returns

`unknown`

##### run()

> **run**(...`args`): `unknown`

###### Parameters

###### args

...`unknown`[]

###### Returns

`unknown`
