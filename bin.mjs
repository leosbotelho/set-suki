import { lcfirst } from "./pre.mjs"
import { OpName } from "./param.mjs"
import { manyOp } from "./index.mjs"

const {
  union_,
  union,
  int_,
  int,
  intByKv_,
  intByKv,
  sub_,
  sub,
  subByKv_,
  subByKv,
  symm_,
  symm,
  symmByKv_,
  symmByKv
} = (() => {
  const f =
    ope =>
    D =>
    tyn =>
    (...a) =>
    (...b) =>
      manyOp(D)([ope, tyn])(...a)(...b)[0]
  const g = opName => f(`${opName}(by: kv)`)

  return Object.fromEntries(
    OpName.map(opName => {
      if (opName === "SubRev") return []
      const k = lcfirst(opName)
      const f_ = f(opName)
      let ret = [
        [`${k}_`, f_],
        [k, f_()]
      ]
      if (opName !== "Union") {
        const g_ = g(opName)
        ret.push([`${k}ByKv_`, g_], [`${k}ByKv`, g_()])
      }
      return ret
    }).flat(1)
  )
})()

export {
  union_,
  union,
  int_,
  int,
  intByKv_,
  intByKv,
  sub_,
  sub,
  subByKv_,
  subByKv,
  symm_,
  symm,
  symmByKv_,
  symmByKv
}
