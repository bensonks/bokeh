//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

import type {Arrayable} from "../types"
import {randomIn} from "./math"
import {assert} from "./assert"
import {isInteger} from "./types"
import {min, min_by, max_by, includes, filter} from "./arrayable"

export {
  map, reduce, min, min_by, max, max_by, sum, cumsum, every, some,
  find, find_last, find_index, find_last_index, sorted_index,
  is_empty, includes, contains, sort_by,
} from "./arrayable"

const {slice} = Array.prototype

export function head<T>(array: T[]): T {
  if (array.length != 0) {
    return array[0]
  } else {
    throw new Error("out of bounds access")
  }
}

export function last<T>(array: ArrayLike<T>): T {
  if (array.length != 0) {
    return array[array.length-1]
  } else {
    throw new Error("out of bounds access")
  }
}

export function copy<T>(array: T[]): T[] {
  return slice.call(array)
}

export function concat<T>(arrays: T[][]): T[] {
  return ([] as T[]).concat(...arrays)
}

export function nth<T>(array: T[], index: number): T {
  return array[index >= 0 ? index : array.length + index]
}

export function zip<A, B>(As: Arrayable<A>, Bs: Arrayable<B>): [A, B][]
export function zip<A, B, C>(As: Arrayable<A>, Bs: Arrayable<B>, Cs: Arrayable<C>): [A, B, C][]
export function zip<T>(...arrays: Arrayable<T>[]): T[][]
export function zip(...arrays: Arrayable<unknown>[]): unknown[][] {
  if (arrays.length == 0) {
    return []
  }

  const n = min(arrays.map((a) => a.length))
  const k = arrays.length

  const result: unknown[][] = new Array(n)

  for (let i = 0; i < n; i++) {
    result[i] = new Array(k)
    for (let j = 0; j < k; j++) {
      result[i][j] = arrays[j][i]
    }
  }

  return result
}

export function unzip<A, B>(ABs: [A, B][]): [A[], B[]]
export function unzip<A, B, C>(ABCs: [A, B, C][]): [A[], B[], C[]]
export function unzip<T>(arrays: T[][]): T[][]
export function unzip(array: unknown[][]): unknown[][] {
  const n = array.length
  if (n == 0) {
    return []
  }

  const k = min(array.map((a) => a.length))
  const results: unknown[][] = Array(k)

  for (let j = 0; j < k; j++) {
    results[j] = new Array(n)
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      results[j][i] = array[i][j]
    }
  }

  return results
}

export function range(start: number, stop?: number, step: number = 1): number[] {
  assert(step > 0, "'step' must be a positive number")

  if (stop == null) {
    stop = start
    start = 0
  }

  const {max, ceil, abs} = Math

  const delta = start <= stop ? step : -step
  const length = max(ceil(abs(stop - start) / step), 0)
  const range = new Array(length)

  for (let i = 0; i < length; i++, start += delta) {
    range[i] = start
  }

  return range
}

export function linspace(start: number, stop: number, num: number = 100): number[] {
  const step = num == 1 ? 0 : (stop - start) / (num - 1)
  const array = new Array(num)

  for (let i = 0; i < num; i++) {
    array[i] = start + i*step
  }

  return array
}

export function logspace(start: number, stop: number, num: number = 100, base: number = 10): number[] {
  const step = num == 1 ? 0 : (stop - start) / (num - 1)
  const array = new Array(num)

  for (let i = 0; i < num; i++) {
    array[i] = base**(start + i*step)
  }

  return array
}

export function transpose<T>(array: T[][]): T[][] {
  const rows = array.length
  const cols = array[0].length

  const transposed: T[][] = []

  for (let j = 0; j < cols; j++) {
    transposed[j] = []

    for (let i = 0; i < rows; i++) {
      transposed[j][i] = array[i][j]
    }
  }

  return transposed
}

export function argmin(array: number[]): number {
  return min_by(range(array.length), (i) => array[i])
}

export function argmax(array: number[]): number {
  return max_by(range(array.length), (i) => array[i])
}

/**
 * Return the permutation indices for sorting an array.
 */
export function argsort(array: number[]): number[] {
  const indices = Array.from(array.keys())
  indices.sort((a, b) => array[a] - array[b])
  return indices
}

export function uniq<T>(array: Arrayable<T>): T[] {
  const result = new Set<T>()
  for (const value of array) {
    result.add(value)
  }
  return [...result]
}

export function uniq_by<T, U>(array: T[], key: (item: T) => U): T[] {
  const result: T[] = []
  const seen: U[] = []
  for (const value of array) {
    const computed = key(value)
    if (!includes(seen, computed)) {
      seen.push(computed)
      result.push(value)
    }
  }
  return result
}

export function _union<T>(arrays: Arrayable<T>[]): Set<T> {
  const result = new Set<T>()
  for (const array of arrays) {
    for (const value of array) {
      result.add(value)
    }
  }
  return result
}

export function union<T>(...arrays: Arrayable<T>[]): T[] {
  return [..._union(arrays)]
}

export function intersection<T>(array: Arrayable<T>, ...arrays: Arrayable<T>[]): T[] {
  const result: T[] = []
  top: for (const item of array) {
    if (includes(result, item)) {
      continue
    }
    for (const other of arrays) {
      if (!includes(other, item)) {
        continue top
      }
    }
    result.push(item)
  }
  return result
}

export function difference<T>(array: Arrayable<T>, ...arrays: Arrayable<T>[]): Arrayable<T> {
  const rest = _union(arrays)
  return filter(array, (value) => !rest.has(value))
}

export function symmetric_difference<T>(array0: Arrayable<T>, array1: Arrayable<T>): Arrayable<T> {
  const set0 = new Set(array0)
  const set1 = new Set(array1)

  const result: T[] = []
  for (const val of set0) {
    if (!set1.has(val)) {
      result.push(val)
    }
  }
  for (const val of set1) {
    if (!set0.has(val)) {
      result.push(val)
    }
  }

  return result
}

export function remove_at<T>(array: T[], i: number): T[] {
  assert(isInteger(i) && i >= 0)
  const result = copy(array)
  result.splice(i, 1)
  return result
}

export function remove<T>(array: T[], item: T): void {
  remove_by(array, (value) => value == item)
}

export function remove_by<T>(array: T[], key: (item: T) => boolean): void {
  for (let i = 0; i < array.length;) {
    if (key(array[i])) {
      array.splice(i, 1)
    } else {
      i++
    }
  }
}

export function clear(array: unknown[]): void {
  array.splice(0, array.length)
}

export function split<T, S, R extends Exclude<T, S>>(array: (T | S)[], separator: S): R[][] {
  const chunks: R[][] = []
  const n = array.length
  let i = 0
  let j = 0

  while (j < n) {
    if (array[j] === separator) {
      chunks.push(array.slice(i, j) as R[])
      i = ++j
    } else {
      ++j
    }
  }

  chunks.push(array.slice(i) as R[])
  return chunks
}

// Shuffle a collection, using the modern version of the
// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
export function shuffle<T>(array: T[]): T[] {
  const length = array.length
  const shuffled = new Array(length)
  for (let i = 0; i < length; i++) {
    const rand = randomIn(0, i)
    if (rand !== i) {
      shuffled[i] = shuffled[rand]
    }
    shuffled[rand] = array[i]
  }
  return shuffled
}

export function pairwise<T, U>(array: T[], fn: (prev: T, next: T) => U): U[] {
  const n = array.length
  const result: U[] = new Array(n-1)

  for (let i = 0; i < n - 1; i++) {
    result[i] = fn(array[i], array[i+1])
  }

  return result
}

export function elementwise<T, U>(array0: Arrayable<T>, array1: Arrayable<T>, fn: (a: T, b: T) => U): U[] {
  const n = Math.min(array0.length, array1.length)
  const result: U[] = Array(n)
  for (let i = 0; i < n; i++) {
    result[i] = fn(array0[i], array1[i])
  }
  return result
}

export function reversed<T>(array: T[]): T[] {
  const n = array.length
  const result: T[] = new Array(n)

  for (let i = 0; i < n; i++) {
    result[n - i - 1] = array[i]
  }

  return result
}

export function repeat<T>(value: T, n: number): T[] {
  const result: T[] = new Array(n).fill(value)
  return result
}

export function resize<T>(array: T[], new_length: number, fill_value?: T): T[] {
  if (array.length >= new_length) {
    return array.slice(0, new_length)
  } else {
    const suffix = new Array(new_length - array.length)
    if (fill_value !== undefined) {
      suffix.fill(fill_value)
    }
    return array.concat(suffix)
  }
}
