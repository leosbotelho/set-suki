import O from "patchinko/immutable.mjs"

const Op = new Map([
  ["Union", /union/],
  ["Int", /(int(ersect(ion)?)?)/],
  ["Sub", /(sub(tract(ion)?)?|diff(erence)?)/],
  ["SubRev", /(sub(tract(ion)?)?|diff(erence)?)[ ]?rev(erse)?/],
  ["Symm", /symm(ettric)?( diff(erence)?)?/]
])

const OpName = Array.from(Op.keys())

const Op_entries = Array.from(Op.entries())

const ByRe = /(by:[ ]?(?<by>(key|key-value|kv)))/i
const ItRe = /(it:[ ]?(?<it>(a|b)))/i

const ParamRe = [ByRe].map(re => new RegExp(`^(${re.source})$`, "i"))

const parseParam = s0 => {
  let opName
  if (!s0) throw TypeError("invalid op")
  for (const [opName_, opRe_] of Op_entries) {
    const opRe = new RegExp("^(" + opRe_.source + ")(\\(|$)", "i")
    if (opRe.test(s0)) opName = opName_
  }
  if (!opName) throw SyntaxError("invalid op")
  const lparen = s0.indexOf("(")
  if (lparen === -1) return { opName, by: "key" }
  else s0 = s0.slice(lparen)
  let i = 0
  return O(
    { opName, by: "key" },
    ...s0
      .slice(1, -1)
      .split(",")
      .map(s => {
        for (let j = i; j < ParamRe.length; j++) {
          const { groups: g } = s.trim().match(ParamRe[j]) || {}
          if (g) {
            i = j
            if (i === 0) {
              const by = g.by === "key-value" ? "kv" : g.by
              if (by === "kv" && opName === "Union")
                throw TypeError("invalid op: Union by kv")
              return { by }
            } else if (i === 1) {
              if (opName !== "Int")
                throw TypeError(`invalid op param: ${opName} it`)
              return g.it ? { it: g.it } : {}
            }
          }
        }
        throw SyntaxError("invalid op param")
      })
  )
}

export { Op, OpName, Op_entries, parseParam }
