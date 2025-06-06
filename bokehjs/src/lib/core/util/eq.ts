// Based on Underscore.js 1.8.3 (http://underscorejs.org)

import type {PlainObject} from "../types"
import {isObject} from "./types"

const {hasOwnProperty} = Object.prototype

export const equals = Symbol("equals")

export interface Equatable {
  [equals](that: this, cmp: Comparator): boolean
}

function is_Equatable<T>(obj: T): obj is T & Equatable {
  return isObject(obj) && equals in obj
}

export const wildcard: any = Symbol("wildcard")

const toString = Object.prototype.toString

export class EqNotImplemented extends Error {}

export class Comparator {
  private readonly a_stack: unknown[] = []
  private readonly b_stack: unknown[] = []

  readonly structural: boolean

  constructor(options?: {structural?: boolean}) {
    this.structural = options?.structural ?? false
  }

  eq(a: any, b: any): boolean {
    if (a === b || Object.is(a, b)) {
      return true
    }

    if (a === wildcard || b === wildcard) {
      return true
    }

    if (a == null || b == null) {
      return a === b
    }

    const class_name = toString.call(a)
    if (class_name != toString.call(b)) {
      return false
    }

    switch (class_name) {
      case "[object Number]":
        return this.numbers(a, b)
      case "[object Symbol]":
        return a === b
      case "[object RegExp]":
      case "[object String]":
        return `${a}` == `${b}`
      case "[object Date]":
      case "[object Boolean]":
        return +a === +b
    }

    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    const {a_stack, b_stack} = this
    let length = a_stack.length
    while (length-- > 0) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (a_stack[length] === a) {
        return b_stack[length] === b
      }
    }

    a_stack.push(a)
    b_stack.push(b)

    const result = (() => {
      if (is_Equatable(a) && is_Equatable(b)) {
        return a[equals](b, this)
      }

      switch (class_name) {
        case "[object Array]":
        case "[object Uint8Array]":
        case "[object Int8Array]":
        case "[object Uint16Array]":
        case "[object Int16Array]":
        case "[object Uint32Array]":
        case "[object Int32Array]":
        case "[object Float32Array]":
        case "[object Float64Array]": {
          return this.arrays(a, b)
        }
        case "[object ArrayBuffer]":
        case "[object SharedArrayBuffer]": {
          return this.array_buffers(a, b)
        }
        case "[object Map]": {
          return this.maps(a, b)
        }
        case "[object Set]": {
          return this.sets(a, b)
        }
        case "[object Object]": {
          if (a.constructor == b.constructor && (a.constructor == null || a.constructor === Object)) {
            return this.objects(a, b)
          }
        }
        case "[object Function]": {
          if (a.constructor == b.constructor && a.constructor === Function) {
            return this.eq(`${a}`, `${b}`)
          }
        }
      }

      if (typeof Node !== "undefined" && a instanceof Node) {
        return this.nodes(a, b)
      }

      throw new EqNotImplemented(`can't compare objects of type ${class_name}`)
    })()

    a_stack.pop()
    b_stack.pop()

    return result
  }

  numbers(a: number, b: number): boolean {
    return a === b || Object.is(a, b)
  }

  arrays(a: ArrayLike<unknown>, b: ArrayLike<unknown>): boolean {
    const {length} = a

    if (length != b.length) {
      return false
    }

    for (let i = 0; i < length; i++) {
      if (!this.eq(a[i], b[i])) {
        return false
      }
    }

    return true
  }

  array_buffers(a: ArrayBufferLike, b: ArrayBufferLike): boolean {
    // compare array buffers byte-wise; this doesn't allocate any memory
    return this.arrays(new Uint8Array(a), new Uint8Array(b))
  }

  iterables(a: Iterable<unknown>, b: Iterable<unknown>): boolean {
    const ai = a[Symbol.iterator]()
    const bi = b[Symbol.iterator]()

    while (true) {
      const an = ai.next()
      const bn = bi.next()

      const an_done = an.done ?? false
      const bn_done = bn.done ?? false

      if (an_done && bn_done) {
        return true
      }
      if (an_done || bn_done) {
        return false
      }

      if (!this.eq(an.value, bn.value)) {
        return false
      }
    }
  }

  maps(a: Map<unknown, unknown>, b: Map<unknown, unknown>): boolean {
    if (a.size != b.size) {
      return false
    }

    if (this.structural) {
      return this.iterables(a.entries(), b.entries())
    } else {
      for (const [key, val] of a) {
        if (!b.has(key) || !this.eq(val, b.get(key))) {
          return false
        }
      }

      return true
    }
  }

  sets(a: Set<unknown>, b: Set<unknown>): boolean {
    if (a.size != b.size) {
      return false
    }

    if (this.structural) {
      return this.iterables(a.entries(), b.entries())
    } else {
      for (const key of a) {
        if (!b.has(key)) {
          return false
        }
      }

      return true
    }
  }

  objects(a: PlainObject, b: PlainObject): boolean {
    const keys = Object.keys(a)

    if (keys.length != Object.keys(b).length) {
      return false
    }

    for (const key of keys) {
      if (!hasOwnProperty.call(b, key) || !this.eq(a[key], b[key])) {
        return false
      }
    }

    return true
  }

  nodes(a: Node, b: Node): boolean {
    if (this.structural) {
      if (a.nodeType != b.nodeType) {
        return false
      }

      if (a.textContent != b.textContent) {
        return false
      }

      if (!this.iterables(a.childNodes, b.childNodes)) {
        return false
      }

      return true
    } else {
      return a === b
    }
  }
}

const {abs} = Math

export class SimilarComparator extends Comparator {
  constructor(readonly tolerance: number = 1e-4) {
    super()
  }

  override numbers(a: number, b: number): boolean {
    return super.numbers(a, b) || abs(a - b) < this.tolerance
  }
}

export function is_equal(a: unknown, b: unknown): boolean {
  const comparator = new Comparator()
  return comparator.eq(a, b)
}

export function is_structurally_equal(a: unknown, b: unknown): boolean {
  const comparator = new Comparator({structural: true})
  return comparator.eq(a, b)
}

export function is_similar(a: unknown, b: unknown, tolerance?: number): boolean {
  const comparator = new SimilarComparator(tolerance)
  return comparator.eq(a, b)
}
