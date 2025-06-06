import {expect} from "assertions"

import type {Comparator} from "@bokehjs/core/util/eq"
import type {Equatable} from "@bokehjs/core/util/eq"
import {is_equal, is_structurally_equal, equals} from "@bokehjs/core/util/eq"
import {HasProps} from "@bokehjs/core/has_props"
import type * as p from "@bokehjs/core/properties"

namespace SomeHasProps {
  export type Attrs = p.AttrsOf<Props>

  export type Props = HasProps.Props & {
    prop: p.Property<number>
  }
}

interface SomeHasProps extends SomeHasProps.Attrs {}

class SomeHasProps extends HasProps {
  declare properties: SomeHasProps.Props

  constructor(attrs?: Partial<SomeHasProps.Attrs>) {
    super(attrs)
  }

  static {
    this.define<SomeHasProps.Props>(({Float}) => ({
      prop: [ Float, 0 ],
    }))
  }
}

describe("core/util/eq module", () => {
  describe("implements is_equal() function", () => {
    it("that supports number type", () => {
      expect(is_equal(0, 0)).to.be.true
      expect(is_equal(0, -0)).to.be.true
      expect(is_equal(-0, 0)).to.be.true
      expect(is_equal(-0, -0)).to.be.true
      expect(is_equal(0, 1)).to.be.false
      expect(is_equal(1, 0)).to.be.false
      expect(is_equal(1, 1)).to.be.true
      expect(is_equal(0, NaN)).to.be.false
      expect(is_equal(NaN, 0)).to.be.false
      expect(is_equal(NaN, NaN)).to.be.true
      expect(is_equal(Infinity, Infinity)).to.be.true
      expect(is_equal(-Infinity, -Infinity)).to.be.true
      expect(is_equal(Infinity, -Infinity)).to.be.false
      expect(is_equal(-Infinity, Infinity)).to.be.false
      expect(is_equal(Infinity, 0)).to.be.false
      expect(is_equal(-Infinity, 0)).to.be.false
      expect(is_equal(0, Infinity)).to.be.false
      expect(is_equal(0, -Infinity)).to.be.false
    })

    it("that supports string type", () => {
      expect(is_equal("a", "a")).to.be.true
      expect(is_equal("a", "b")).to.be.false
      expect(is_equal("b", "a")).to.be.false
      expect(is_equal("a", "aa")).to.be.false
      expect(is_equal("aa", "a")).to.be.false
    })

    it("that supports symbol type", () => {
      const a0 = Symbol("a")
      const a1 = Symbol("a")
      const b = Symbol("b")
      expect(is_equal(a0, a0)).to.be.true
      expect(is_equal(a1, a1)).to.be.true
      expect(is_equal(a0, a1)).to.be.false
      expect(is_equal(a1, a0)).to.be.false
      expect(is_equal(a0, b)).to.be.false
      expect(is_equal(b, a0)).to.be.false
      expect(is_equal(a1, b)).to.be.false
      expect(is_equal(b, a1)).to.be.false
    })

    it("that supports T[]", () => {
      expect(is_equal([], [])).to.be.true
      expect(is_equal([], {})).to.be.false
      expect(is_equal([], new Map())).to.be.false
      expect(is_equal([], new Set())).to.be.false
      expect(is_equal([], new WeakMap())).to.be.false
      expect(is_equal([], new WeakSet())).to.be.false
      expect(is_equal([], new Uint8Array())).to.be.false
      expect(is_equal([], new Uint16Array())).to.be.false
      expect(is_equal([], new Uint32Array())).to.be.false
      expect(is_equal([], new Int8Array())).to.be.false
      expect(is_equal([], new Int16Array())).to.be.false
      expect(is_equal([], new Int32Array())).to.be.false
      expect(is_equal([], new Float32Array())).to.be.false
      expect(is_equal([], new Float64Array())).to.be.false
    })

    it("that supports ArrayBufferLike", () => {
      const b0 = new Uint8Array([0, 1, 2]).buffer
      const b1 = new Uint8Array([0, 1, 2]).buffer
      const b2 = new Uint8Array([0, 1, 3]).buffer
      const b3 = new Uint8Array([0, 1, 2, 4]).buffer

      expect(is_equal(b0, b1)).to.be.true
      expect(is_equal(b0, b2)).to.be.false
      expect(is_equal(b0, b3)).to.be.false

      if (typeof SharedArrayBuffer !== "undefined") {
        const sb0 = new SharedArrayBuffer(3)
        const sb1 = new SharedArrayBuffer(3)
        const sb2 = new SharedArrayBuffer(3)
        const sb3 = new SharedArrayBuffer(4)

        new Uint8Array(sb0).set([0, 1, 2])
        new Uint8Array(sb1).set([0, 1, 2])
        new Uint8Array(sb2).set([0, 1, 3])
        new Uint8Array(sb3).set([0, 1, 2, 3])

        expect(is_equal(sb0, sb1)).to.be.true
        expect(is_equal(sb0, sb2)).to.be.false
        expect(is_equal(sb0, sb3)).to.be.false
      }
    })

    it("that supports Map<K, V>", () => {
      expect(is_equal(new Map(), [])).to.be.false
      expect(is_equal(new Map(), {})).to.be.false
      expect(is_equal(new Map(), new Map())).to.be.true
      expect(is_equal(new Map(), new Set())).to.be.false
      expect(is_equal(new Map(), new WeakMap())).to.be.false
      expect(is_equal(new Map(), new WeakSet())).to.be.false
      expect(is_equal(new Map(), new Uint8Array())).to.be.false
      expect(is_equal(new Map(), new Uint16Array())).to.be.false
      expect(is_equal(new Map(), new Uint32Array())).to.be.false
      expect(is_equal(new Map(), new Int8Array())).to.be.false
      expect(is_equal(new Map(), new Int16Array())).to.be.false
      expect(is_equal(new Map(), new Int32Array())).to.be.false
      expect(is_equal(new Map(), new Float32Array())).to.be.false
      expect(is_equal(new Map(), new Float64Array())).to.be.false

      const m0 = new Map([[3, "b"], [7, "d"], [5, "c"], [1, "a"]])
      const m1 = new Map([[1, "a"], [3, "b"], [5, "c"], [7, "d"]])
      expect(is_equal(m0, m1)).to.be.true
      expect(is_equal(m1, m0)).to.be.true

      const m2 = new Map([["b", 3], ["d", 7], ["c", 5], ["a", 1]])
      const m3 = new Map([["a", 1], ["b", 3], ["c", 5], ["d", 7]])
      expect(is_equal(m2, m3)).to.be.true
      expect(is_equal(m3, m2)).to.be.true
    })

    it("that supports Set<V>", () => {
      expect(is_equal(new Set(), [])).to.be.false
      expect(is_equal(new Set(), {})).to.be.false
      expect(is_equal(new Set(), new Map())).to.be.false
      expect(is_equal(new Set(), new Set())).to.be.true
      expect(is_equal(new Set(), new WeakMap())).to.be.false
      expect(is_equal(new Set(), new WeakSet())).to.be.false
      expect(is_equal(new Set(), new Uint8Array())).to.be.false
      expect(is_equal(new Set(), new Uint16Array())).to.be.false
      expect(is_equal(new Set(), new Uint32Array())).to.be.false
      expect(is_equal(new Set(), new Int8Array())).to.be.false
      expect(is_equal(new Set(), new Int16Array())).to.be.false
      expect(is_equal(new Set(), new Int32Array())).to.be.false
      expect(is_equal(new Set(), new Float32Array())).to.be.false
      expect(is_equal(new Set(), new Float64Array())).to.be.false

      const s0 = new Set([3, 7, 5, 1])
      const s1 = new Set([1, 3, 5, 7])
      expect(is_equal(s0, s1)).to.be.true
      expect(is_equal(s1, s0)).to.be.true

      const s2 = new Set(["b", "d", "c", "a"])
      const s3 = new Set(["a", "b", "c", "d"])
      expect(is_equal(s2, s3)).to.be.true
      expect(is_equal(s3, s2)).to.be.true
    })

    it("that supports {[key: string | number]: V}", () => {
      expect(is_equal({}, [])).to.be.false
      expect(is_equal({}, {})).to.be.true
      expect(is_equal({}, new Map())).to.be.false
      expect(is_equal({}, new Set())).to.be.false
      expect(is_equal({}, new WeakMap())).to.be.false
      expect(is_equal({}, new WeakSet())).to.be.false
      expect(is_equal({}, new Uint8Array())).to.be.false
      expect(is_equal({}, new Uint16Array())).to.be.false
      expect(is_equal({}, new Uint32Array())).to.be.false
      expect(is_equal({}, new Int8Array())).to.be.false
      expect(is_equal({}, new Int16Array())).to.be.false
      expect(is_equal({}, new Int32Array())).to.be.false
      expect(is_equal({}, new Float32Array())).to.be.false
      expect(is_equal({}, new Float64Array())).to.be.false

      const o0 = {3: "b", 7: "d", 5: "c", 1: "a"}
      const o1 = {1: "a", 3: "b", 5: "c", 7: "d"}
      expect(is_equal(o0, o1)).to.be.true
      expect(is_equal(o1, o0)).to.be.true

      const o2 = {b: 3, d: 7, c: 5, a: 1}
      const o3 = {a: 1, b: 3, c: 5, d: 7}
      expect(is_equal(o2, o3)).to.be.true
      expect(is_equal(o3, o2)).to.be.true
    })
  })

  it("that supports Equatable interface", () => {
    class X implements Equatable {
      constructor(readonly f: number) {}

      [equals](that: this, cmp: Comparator): boolean {
        return cmp.eq(this.f, that.f)
      }
    }

    const x0 = new X(0)
    const x1 = new X(0)
    const x2 = new X(1)

    expect(is_equal(x0, x0)).to.be.true
    expect(is_equal(x1, x1)).to.be.true
    expect(is_equal(x2, x2)).to.be.true

    expect(is_equal(x0, x1)).to.be.true
    expect(is_equal(x1, x0)).to.be.true

    expect(is_equal(x0, x2)).to.be.false
    expect(is_equal(x2, x0)).to.be.false
  })

  it("that supports Node instances", () => {
    const text0 = document.createTextNode("abc def")
    const text1 = document.createTextNode("abc def")
    const text2 = document.createTextNode("ABC DEF")
    const span0 = document.createElement("span")
    const div0 = document.createElement("div")
    const div1 = document.createElement("div")
    div1.textContent = "abc def"
    const div2 = document.createElement("div")
    div2.appendChild(div1)

    expect(is_structurally_equal(text0, text0)).to.be.true
    expect(is_structurally_equal(text0, text1)).to.be.true
    expect(is_structurally_equal(text0, text2)).to.be.false
    expect(is_structurally_equal(text0, span0)).to.be.false
    expect(is_structurally_equal(text0, div0)).to.be.false
    expect(is_structurally_equal(text0, div1)).to.be.false
    expect(is_structurally_equal(text0, div2)).to.be.false

    expect(is_structurally_equal(span0, div0)).to.be.false

    expect(is_structurally_equal(div0, div0)).to.be.true
    expect(is_structurally_equal(div0, div1)).to.be.false
    expect(is_structurally_equal(div0, div2)).to.be.false
    expect(is_structurally_equal(div1, div2)).to.be.false
    expect(is_structurally_equal(div1, div1)).to.be.true
    expect(is_structurally_equal(div2, div2)).to.be.true

    expect(is_equal(div0, div0)).to.be.true
    expect(is_equal(div0, div1)).to.be.false
  })

  it("that supports HasProps instances", () => {
    const x0 = new SomeHasProps({prop: 0})
    const x1 = new SomeHasProps({prop: 1})
    const x2 = new SomeHasProps({prop: 1})

    expect(is_equal(x0, x0)).to.be.true
    expect(is_equal(x1, x1)).to.be.true

    expect(is_equal(x0, x1)).to.be.false
    expect(is_equal(x1, x0)).to.be.false

    expect(is_equal(x0, x2)).to.be.false
    expect(is_equal(x2, x0)).to.be.false
    expect(is_equal(x1, x2)).to.be.true   // no id
    expect(is_equal(x2, x1)).to.be.true   // no id
    expect(is_equal(x2, x2)).to.be.true
  })

  it("that throws on unknown types", () => {
    class X {
      constructor(readonly f: number) {}
    }

    const x0 = new X(0)
    const x1 = new X(1)

    expect(is_equal(x0, x0)).to.be.true
    expect(is_equal(x1, x1)).to.be.true

    expect(() => is_equal(x0, x1)).to.throw()
  })
})
