import O from "patchinko/immutable.mjs"
import * as P from "./pre.mjs"
import { D1 } from "./md.mjs"
import { parseParam } from "./param.mjs"

const Opde0 = {
  Union: "a.get, b.get",
  Int: "a.get, b.get",
  Sub: "a.get",
  SubRev: "b.get",
  Symm: "a.get, b.get"
}

const Opde1 = {
  a_isSuper: {
    Union: "a.it",
    Int: "b.it or a.it, b.has",
    Sub: "a.it, b.has",
    SubRev: "",
    Symm: "a.it, b.has"
  },
  b_isSuper: {
    Union: "b.it",
    Int: "a.it or b.it, a.has",
    Sub: "",
    SubRev: "b.it, a.has",
    Symm: "b.it, a.has"
  },
  otherwise: {
    Union: "a.it, b.it",
    Int: "a.it, b.has or b.it, a.has",
    Sub: "a.it, b.has",
    SubRev: "b.it, a.has",
    Symm: "a.it, b.has, b.it, a.has"
  }
}

const readOpde = s => s.split(" or ").map(s => s.split(", "))

const KvOpde = "a.has, b.has, a.get, b.get"

const parseOpd_ = (Id, S, Opde, op, ret) => {
  const { a: Da, b: Db } = S

  const ret_has = path => ["a", "b"].map(s => !!P.view(ret, s, path))

  const pushRet = (by, k, opds) => {
    for (let [p0, p1, f] of opds) {
      if (p1 === "get") p1 = "mkGet"
      P.mutate(ret, p0, "fn", p1)(P.fromUndef(f))
      P.mutate(ret, p0, by, k)(P.fromUndef(true))
    }
  }

  for (const by of Object.keys(op)) {
    const isKv0 = Id === 0 && by === "kv"
    const opName = Object.keys(op[by])
    for (const k of opName) {
      const opde_ = isKv0 ? KvOpde : Opde[k]
      const opde = readOpde(opde_)
      let opds = []
      for (const [i, conj] of opde.entries()) {
        let cur = []
        for (let path of conj) {
          const [p0, p1] = path.split(".")
          const [f, r] = [P.view(S, p0, p1), "ns"]
          if (f) {
            cur.push([p0, p1, f, r])
          } else {
            cur = []
            break
          }
        }
        if (cur.length) {
          opds.push(cur)
          if (isKv0) break
        }
      }
      if (opds.length) {
        pushRet(by, k, opds[0])
      } else {
        if (
          Id === 1 ||
          (Id === 0 && (op.kv || P.view(op, "key", opName, 0, "set")))
        ) {
          throw TypeError(`${k} requires ${opde_}`)
        }
      }
    }
  }
}

const parseOpd = (S, env) => {
  const { op, a_isSuper, b_isSuper } = env

  // prettier-ignore
  const k = a_isSuper ? "a_isSuper" :
            b_isSuper ? "b_isSuper" :
                        "otherwise"

  let ret = {}

  const chg = O({ get: O(f => () => P.once(f)) })
  const X = O(S, { a: chg, b: chg })

  parseOpd_(0, X, Opde0, op, ret)
  parseOpd_(1, X, Opde1[k], op, ret)

  return ret
}

const readDesc = s => {
  if (s !== undefined) {
    if (/sup(er([ ]?set)?)?/i.test(s)) return "Super"
    if (/sub([ ]?set)?/i.test(s)) return "Sub"
    throw TypeError("invalid desc")
  }
  return ""
}

const mainLoop = (Opd, op, eq, p0) => {
  const Opd0_mkGet = P.view(Opd, "a", "fn", "mkGet")
  const Opd1_mkGet = P.view(Opd, "b", "fn", "mkGet")
  const i = (p0 === "b") + 0
  const Sub = !i ? "Sub" : "SubRev"
  const it = P.view(Opd, p0, "fn", "it")
  if (it) {
    const has = Opd[["b", "a"][i]].fn.has
    const $Opd = Opd[p0]
    const hasKv = !!$Opd.kv
    const hasUnion = !!P.view(op, "key", "Union")
    const [$Opd_key, $Opd_kv] = [$Opd.key || {}, $Opd.kv || {}]
    for (const $x of it()) {
      const get0 = Opd0_mkGet ? Opd0_mkGet() : false
      const get1 = Opd1_mkGet ? Opd1_mkGet() : false
      const has_ = has
      const runOp_ = by => opName => op[by][opName]($x, get0, get1, i)
      const [runOp, runKvOp] = ["key", "kv"].map(runOp_)
      if (hasUnion) runOp("Union")
      if (has_) {
        if (has_($x)) {
          if ($Opd_key.Int) runOp("Int")
          if (hasKv) {
            if (eq(get0($x), get1($x))) {
              if ($Opd_kv.Int) runKvOp("Int")
            } else {
              if ($Opd_kv[Sub]) runKvOp(Sub)
              if ($Opd_kv.Symm) runKvOp("Symm")
            }
          }
        } else {
          if ($Opd_key[Sub]) runOp(Sub)
          if ($Opd_key.Symm) runOp("Symm")
          if (hasKv) {
            if ($Opd_kv[Sub]) runKvOp(Sub)
            if ($Opd_kv.Symm) runKvOp("Symm")
          }
        }
      }
    }
  }
}

const manyOp =
  (S = {}) =>
  (...ops) =>
  (a_tyn, a, a_desc) =>
  (b_tyn, b, b_desc) => {
    const D = O(D1, S)

    const eq = D.eq ? D.eq : (a, b) => a === b
    if (typeof eq !== "function") throw TypeError("invalid eq")

    a_desc = readDesc(a_desc)
    b_desc = readDesc(b_desc)
    if (a_desc && a_desc === b_desc) throw TypeError("forbidden desc")

    const a_isSuper = a_desc === "Super" || b_desc === "Sub"
    const b_isSuper = a_desc === "Sub" || b_desc === "Super"

    const [Da, Db] = [P.inst(D, a_tyn, D.a, a), P.inst(D, b_tyn, D.b, b)]

    S = { a: Da, b: Db }

    let ret = []
    let op = {}

    for (const [ope, opRet] of ops) {
      const { opName, by, has, it } = parseParam(ope)
      const f = a => {
        const isStr = P.isStr(a)
        const [empty, set_, add_] = ["empty", "set", "add"].map(s =>
          isStr ? P.view(D, a, s) : P.view(a, s)
        )
        if (!empty || (!set_ && !add_)) {
          throw TypeError(`${opName} ret requires { empty, (add | set) }`)
        }
        const ret = empty()()
        const [set, add] = [set_, add_].map(f => (f ? f(ret) : false))
        P.mutate(op, by, opName)(P.fromUndef([]))
        op[by][opName].push(set ? { set } : { add })
        return ret
      }
      if (P.isArr(opRet)) {
        ret.push(opRet.map(f))
      } else {
        ret.push(f(opRet))
      }
    }

    const parseOpd_env = { op, a_isSuper, b_isSuper }

    const Opd = parseOpd(S, parseOpd_env)

    for (const by of Object.keys(op)) {
      for (const [opName, op_] of Object.entries(op[by])) {
        op[by][opName] = ($x, get0, get1, i) => {
          const $get = [get0, get1][i]
          const env = { opName, i, get0, get1 }
          for (const { set, add } of op_) {
            if (set) set($x, $get, env)
            else add($x, env)
          }
        }
      }
    }

    ;["a", "b"].forEach(p0 => mainLoop(Opd, op, eq, p0))

    return ret
  }

export {
  Opde0,
  Opde1,
  readOpde,
  KvOpde,
  parseOpd_,
  parseOpd,
  readDesc,
  mainLoop,
  manyOp
}
