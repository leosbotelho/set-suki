import O from "patchinko/immutable.mjs"

const id = x => x

const thfy = f => () => f

const fromUndef = d => x => x === undefined ? d : x

const mapUndef = f => x => x === undefined ? x : f(x)

const undef = d => f => x => x === undefined ? d : f(x)

const isStr = a => typeof a === "string" || a instanceof String

const isArr = a => Array.isArray(a)

const lcfirst = s => s ? s[0].toLowerCase() + s.slice(1) : s

const view = (a, ...path) => {
  let ret = a
  if (!ret) return false
  for (const i of path) {
    ret = ret[i]
    if (ret === undefined) return false
  }
  return ret
}

const mutate =
  (a, ...path) =>
  (f, { autovivify = true } = {}) => {
    if (!path.length) throw TypeError("invalid path")
    let ret = a
    for (const i of path.slice(0, -1)) {
      if (!Object.hasOwn(ret, i)) {
        if (autovivify) ret[i] = {}
        else return false
      }
      ret = ret[i]
    }
    const last = path.slice(-1)[0]
    ret[last] = f(ret[last])
    return true
  }

const once = f => {
  let b = false
  let ret
  return x => {
    if (!b) {
      b = true
      ret = f(x)
    }
    return ret
  }
}

const mapObjWithKey = a => f =>
  Object.fromEntries(Object.entries(a).map(([k, v]) => [k, f(k, v)]))

const mapObj = a => f => mapObjWithKey(a)((_, v) => f(v))

const On = a => mapObj(a)(O)

const inst = (D, tyn, X, x) => mapObj(O({}, D[tyn], X))(g => g(x))

export {
  id,
  thfy,
  fromUndef,
  mapUndef,
  undef,
  isStr,
  isArr,
  lcfirst,
  view,
  mutate,
  once,
  mapObjWithKey,
  mapObj,
  On,
  inst
}
