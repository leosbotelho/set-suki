import O from "patchinko/immutable.mjs"
import { id, thfy, mapObj, On } from "./pre.mjs"

const compSz = g => o => () => g(o.size())

const [linear, log, const_] = ["linear", "log", "const"]

const Fn = {
  linear: id,
  log: n => Math.log(n + 1),
  const: () => 1
}

const SumFn = {
  linear: n => (n * (n - 1)) / 2,
  log: n => n * Math.log(n + 1),
  const: id
}

const FnP = X =>
  [Fn, SumFn].map((Fn_, i) =>
    mapObj(X)(Z => mapObj(Z)(s => [compSz, thfy][i](Fn_[s])))
  )

const F0_ = {
  Set: {
    has: log,
    add: log
  },
  Arr: {
    has: linear
  },
  PairArr: {
    has: linear,
    get: linear
  },
  Map: {
    has: log,
    get: log,
    set: log
  }
}

const [ArrAdd_, UnsafeArrAdd_] = [linear, log].map(s => ({
  Arr: { add: s },
  PairArr: { set: s }
}))

const [ArrAdd, ArrAddSum] = FnP(ArrAdd_)
const [UnsafeArrAdd, UnsafeArrAddSum] = FnP(UnsafeArrAdd_)

const [F0, Sum0] = FnP(F0_)

const F = O(F0, On(UnsafeArrAdd))
const Sum = O(Sum0, On(UnsafeArrAddSum))

const D = { Factor: F, FactorSum: Sum }

export {
  compSz,
  linear,
  log,
  const_,
  Fn,
  SumFn,
  FnP,
  F0_,
  ArrAdd_,
  UnsafeArrAdd_,
  ArrAdd,
  UnsafeArrAdd,
  ArrAddSum,
  UnsafeArrAddSum,
  F,
  Sum,
  D
}
