import O from "patchinko/immutable.mjs"
import { mapUndef, undef, On } from "./pre.mjs"

const Typename = ["Set", "Arr", "SArr", "PairArr", "Map", "Obj"]

// prettier-ignore
const typename = a =>
  a instanceof Set ? "Set" :
  Array.isArray(a) ? "Arr" :
  a instanceof Map ? "Map" :
                     "Obj"

const encodesMissing = () => a => a === undefined

const u = undefined

const D0 = {
  Set: {
    empty: () => () => new Set(),
    size: o => () => o.size,
    has: o => x => o.has(x),
    add: o => x => (o.add(x), u),
    it: o => () => o
  },
  Arr: {
    empty: () => () => [],
    size: o => () => o.length,
    has: o => x => o.includes(x),
    it: o => () => o
  },
  SArr: {
    empty: () => () => [],
    size: o => () => o.length,
    has: o => x => o.some(s => s[0] === x),
    it: o =>
      function* () {
        for (const [k] of o) yield k
      }
  },
  PairArr: {
    empty: () => () => [],
    size: o => () => o.length,
    has: o => k => o.some(([$k]) => $k === k),
    get: o => k => mapUndef($kv => $kv[1])(o.find(([$k]) => $k === k)),
    encodesMissing,
    it: o =>
      function* () {
        for (const [k] of o) yield k
      }
  },
  Map: {
    empty: () => () => new Map(),
    size: o => () => o.size,
    has: o => k => o.has(k),
    get: o => k => o.get(k),
    encodesMissing,
    set: o => (k, v) => (o.set(k, v), u),
    it: o => () => o.keys()
  },
  Obj: {
    empty: () => () => Object.create(null),
    has: o => k => Object.hasOwn(o, k),
    get: o => k => o[k],
    encodesMissing,
    set: o => (k, v) => ((o[k] = v), u),
    it: o => () => Object.keys(o)
  }
}

const ArrAdd = {
  Arr: {
    add: o => x => (!o.includes(x) && o.push(x), u)
  },
  PairArr: {
    set: o => (k, v) => {
      const i = o.findIndex($kv => $kv[0] === k)
      if (i === -1) o.push([k, v])
      else o[i][1] = v
    }
  }
}

const UnsafeArrAdd = {
  Arr: { add: o => x => (o.push(x), u) },
  PairArr: { set: o => (k, v) => (o.push([k, v]), u) }
}

const compSetFn = f => set_ => o => (k, $get, S) => set_(o)(k, f(k, $get, S))

const SetFnP =
  (...tyn) =>
  set =>
    Object.fromEntries(tyn.map(k => [k, { set: O(compSetFn(set)) }]))

const set = (k, $get) => $get(k)

const SetFn = SetFnP("PairArr", "Map", "Obj")(set)

const setThese_ =
  f =>
  (k, $get, { opName, i, get0, get1 }) => {
    let $a
    let $b
    const b = ["Union", "Int", "Symm"].some(s => opName === s)
    if (i === 0 || b) $a = get0(k)
    if (i === 1 || b) $b = get1(k)
    const h = s => f({})(a => ({ [s]: a }))
    return O({}, h("this")($a), h("that")($b))
  }

const setThese = setThese_(undef)

const SetTheseFn = SetFnP("PairArr", "Map", "Obj")(setThese)

const D1 = O(D0, On(UnsafeArrAdd), On(SetFn))
const D2 = O(D0, On(ArrAdd), On(SetFn))
const D3 = O(D0, On(UnsafeArrAdd), On(SetTheseFn))
const D4 = O(D0, On(ArrAdd), On(SetTheseFn))

export {
  Typename,
  typename,
  encodesMissing,
  D0,
  ArrAdd,
  UnsafeArrAdd,
  compSetFn,
  SetFnP,
  set,
  SetFn,
  setThese_,
  setThese,
  SetTheseFn,
  D1,
  D2,
  D3,
  D4
}
