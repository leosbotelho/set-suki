Prototypical.

I'll soon add 'Pairwise Testing' and docs, but feel free to beat me to it.

## Usage

Works by `key` or `(key, value)` over `Set`, `Arr`, `PairArr`, `Map`, `Obj` and any other supplied type.

<br>

```
import * as B from "./bin.mjs"
import { D3 } from "./md.mjs"

const mkMap = o => new Map(Object.entries(o))


// [1] ∪ [2] with the result as Set = {1, 2}
B.union("Set")("Arr", [1])("Arr", [2])

// ["a"] ∩ {a: 1} with the result as Set = {a}
B.int("Set")("Arr", ["a"])("Obj", {a: 1})

// {a: 1} ∪ {b: 2} with the result as Obj = {a: 1, b: 2}
B.union("Obj")("Obj", {a: 1})("Obj", {b: 2})

// {a: 1, b: 2} - Map({a: 3}) with the result as Map = Map({b: 2})
B.sub("Map")("Obj", {a: 1, b: 2})("Map", mkMap({a: 3}))


// {a: 1, b: 2} `minus by key value` Map({a: 3}) with the result as Map
//  = Map({a: 1, b: 2})

B.subByKv("Map")("Obj", {a: 1, b: 2})("Map", mkMap({a: 3}))

// with SetTheseFn
// {a: 1, b: 2} ∪ {a: 3} with the result as Obj
//  = {a: {this: 1, that: 3}, b: {this: 2}}

B.union_(D3)("Obj")("Obj", {a: 1, b: 2})("Obj", {a: 3})
```

## Addendum

One of my main use cases is:
```
const [new, existing] = manyOp()
  (["Int", "Map"], ["Sub", "Set"])("Map", a)("SArr", b)
```

A database tells me which `hashes` (eg [blake3](https://github.com/BLAKE3-team/BLAKE3)) are new; and I use this to split my input into:
- `new : Map` (for insertion)
- `existing : Set` (eg to have a `datetime` updated)

Notice that the ops are fused.

<br>

I'm also experimenting with having a 'Cost Algebra' help decide:
- what side to iterate to compute an intersection
- to replace `has` by `get`
- to use or add an intersection, eg for `A △ B = (A - B) ∪ (B - (A ∩ B))`

You can get a glimpse on these reveries on [factor](https://github.com/leosbotelho/set-suki/blob/main/factor.mjs) and [nap](https://github.com/leosbotelho/set-suki/blob/main/nap).
