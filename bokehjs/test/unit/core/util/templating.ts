import {expect} from "assertions"

import * as tmpl from "@bokehjs/core/util/templating"
import {keys} from "@bokehjs/core/util/object"

import {ColumnDataSource} from "@bokehjs/models/sources/column_data_source"
import {CustomJSHover} from "@bokehjs/models/tools/inspectors/customjs_hover"

describe("templating module", () => {

  describe("DEFAULT_FORMATTERS", () => {

    it("should have 5 entries", () => {
      expect(keys(tmpl.DEFAULT_FORMATTERS).length).to.be.equal(5)
    })

    it("should have a numeral formatter", () => {
      const f = tmpl.DEFAULT_FORMATTERS.numeral
      expect(f(3.123, "$0.00", {})).to.be.equal("$3.12")
    })

    it("should have a datetime formatter", () => {
      const f = tmpl.DEFAULT_FORMATTERS.datetime
      expect(f(946684800000, "%m/%d/%Y", {})).to.be.equal("01/01/2000")

      expect(f(NaN, "%m/%d/%Y", {})).to.be.equal("NaN")
      expect(f(Infinity, "%m/%d/%Y", {})).to.be.equal("NaN")
      expect(f(-Infinity, "%m/%d/%Y", {})).to.be.equal("NaN")
      expect(f(null, "%m/%d/%Y", {})).to.be.equal("NaN")
    })

    it("should have a printf formatter", () => {
      const f = tmpl.DEFAULT_FORMATTERS.printf
      expect(f(23.123456, "%5.3f mu", {})).to.be.equal("23.123 mu")
    })
  })

  describe("basic_formatter", () => {

    it("should return strings as-is", () => {
      const v = tmpl.basic_formatter("foo", "junk", {})
      expect(v).to.be.equal("foo")
    })

    it("should not format integers as integers", () => {
      const v = tmpl.basic_formatter(5, "junk", {})
      expect(v).to.be.equal("5")
    })

    it("should use %0.3f between 0.1 and 1000", () => {
      const v1 = tmpl.basic_formatter(0.11111, "junk", {})
      expect(v1).to.be.equal("0.111")
      const v2 = tmpl.basic_formatter(1.11111, "junk", {})
      expect(v2).to.be.equal("1.111")
      const v3 = tmpl.basic_formatter(100.11111, "junk", {})
      expect(v3).to.be.equal("100.111")
      const v4 = tmpl.basic_formatter(999.11111, "junk", {})
      expect(v4).to.be.equal("999.111")
    })

    it("should use %0.3e outside 0.1 and 1000", () => {
      const v1 = tmpl.basic_formatter(0.0911111, "junk", {})
      expect(v1).to.be.equal("9.111e-2")
      const v2 = tmpl.basic_formatter(1000.11111, "junk", {})
      expect(v2).to.be.equal("1.000e+3")
    })
  })

  describe("get_formatter", () => {

    it("should return basic_formatter for null format", () => {
      const f = tmpl.get_formatter("@x")
      expect(f).to.be.equal(tmpl.DEFAULT_FORMATTERS.basic)
    })

    it("should return numeral formatter for specs not in formatters dict", () => {
      const f = tmpl.get_formatter("@x", "$0.00")
      expect(f).to.be.equal(tmpl.DEFAULT_FORMATTERS.numeral)
    })

    it("should return formatter from formatters dict when raw_spec is in formatters", () => {
      const f1 = tmpl.get_formatter("@x", "$0.00", {"@x": "numeral"})
      expect(f1).to.be.equal(tmpl.DEFAULT_FORMATTERS.numeral)

      const f2 = tmpl.get_formatter("@x", "%5.3f mu", {"@x": "printf"})
      expect(f2).to.be.equal(tmpl.DEFAULT_FORMATTERS.printf)

      const f3 = tmpl.get_formatter("@x", "%m/%d/%Y", {"@x": "datetime"})
      expect(f3).to.be.equal(tmpl.DEFAULT_FORMATTERS.datetime)

      const custom = new CustomJSHover({code: "return format + ' ' + special_vars.special + ' ' + value"})
      const f4 = tmpl.get_formatter("@x", "custom", {"@x": custom})
      expect(f4(3.123, "custom", {special: 10})).to.be.equal("custom 10 3.123")
    })

    it("should throw an error on unknown formatter type", () => {
      expect(() => tmpl.get_formatter("@x", "%5.3f mu", {"@x": "junk" as any})).to.throw()
    })
  })

  describe("get_value", () => {

    const source = new ColumnDataSource({data: {foo: [10, 1.002], bar: ["a", "<div>b</div>"], baz: [1492890671885, 1290460671885]}})

    const imsource = new ColumnDataSource({
      data: {
        arrs: [[[0, 10, 20], [30, 40, 50]]],
        floats: [[0.0, 1.0, 2.0, 3.0, 4.0, 5.0]],
        labels: ["test label"],
      },
    })
    const imindex1 = {index: 0, i: 2, j: 1, flat_index: 5}
    const imindex2 = {index: 0, i: 1, j: 0, flat_index: 1}

    it("should return $ values from special_vars", () => {
      const v = tmpl.get_value("$", "x", source, 0, {x: 99999})
      expect(v).to.be.equal(99999)
    })

    it("should return a missing value marker on unknown special vars", () => {
      expect(tmpl.get_value("$", "x", source, 0, {})).to.be.equal("???")
    })

    it("should return null for missing column", () => {
      const v = tmpl.get_value("@", "_x", source, 0, {})
      expect(v).to.be.null
    })

    it("should return integer indices from columns", () => {
      const v1 = tmpl.get_value("@", "foo", source, 0, {})
      expect(v1).to.be.equal(10)

      const v2 = tmpl.get_value("@", "foo", source, 1, {})
      expect(v2).to.be.equal(1.002)
    })

    it("should index flat typed array format for images", () => {
      const v1 = tmpl.get_value("@", "floats", imsource, imindex1, {})
      expect(v1).to.be.equal(5)

      const v2 = tmpl.get_value("@", "floats", imsource, imindex2, {})
      expect(v2).to.be.equal(1)
    })

    it("should index array of arrays format for images", () => {
      const v1 = tmpl.get_value("@", "arrs", imsource, imindex1, {})
      expect(v1).to.be.equal(50)

      const v2 = tmpl.get_value("@", "arrs", imsource, imindex2, {})
      expect(v2).to.be.equal(10)
    })

    it("should index scalar data format for images", () => {
      const v1 = tmpl.get_value("@", "labels", imsource, imindex1, {})
      expect(v1).to.be.equal("test label")

      const v2 = tmpl.get_value("@", "labels", imsource, imindex2, {})
      expect(v2).to.be.equal("test label")
    })
  })

  describe("replace_placeholders", () => {
    const source = new ColumnDataSource({data: {
      foo: [10, 1.002, NaN],
      bar: ["a", "<div>b</div>", "'qux'\"quux\""],
      baz: [1492890671885, 1290460671885, 1090410671285],
    }})

    it("should replace unknown field names with ???", () => {
      const s = tmpl.replace_placeholders("stuff @junk", source, 0)
      expect(s).to.be.equal("stuff ???")
    })

    it("should replace field names with escaped values by default", () => {
      const s1 = tmpl.replace_placeholders("stuff @foo", source, 0)
      expect(s1).to.be.equal("stuff 10")

      const s2 = tmpl.replace_placeholders("stuff @foo", source, 1)
      expect(s2).to.be.equal("stuff 1.002")

      const s3 = tmpl.replace_placeholders("stuff @foo", source, 2)
      expect(s3).to.be.equal("stuff NaN")

      const s4 = tmpl.replace_placeholders("stuff @bar", source, 0)
      expect(s4).to.be.equal("stuff a")

      const s5 = tmpl.replace_placeholders("stuff @bar", source, 1)
      expect(s5).to.be.equal("stuff <div>b</div>")

      const s6 = tmpl.replace_placeholders("stuff @bar", source, 2)
      expect(s6).to.be.equal("stuff 'qux'\"quux\"")
    })

    it("should replace field names with values as-is with safe format", () => {
      const s1 = tmpl.replace_placeholders("stuff @foo{safe}", source, 0)
      const n1 = document.createTextNode("stuff 10")
      expect(s1).to.be.structurally.equal([n1])

      const s2 = tmpl.replace_placeholders("stuff @foo{safe}", source, 1)
      const n2 = document.createTextNode("stuff 1.002")
      expect(s2).to.be.structurally.equal([n2])

      const s3 = tmpl.replace_placeholders("stuff @foo{safe}", source, 2)
      const n3 = document.createTextNode("stuff NaN")
      expect(s3).to.be.structurally.equal([n3])

      const s4 = tmpl.replace_placeholders("stuff @bar{safe}", source, 0)
      const n4 = document.createTextNode("stuff a")
      expect(s4).to.be.structurally.equal([n4])

      const s5 = tmpl.replace_placeholders("stuff @bar{safe}", source, 1)
      const n5_0 = document.createTextNode("stuff ")
      const n5_1 = document.createElement("div")
      n5_1.textContent = "b"
      expect(s5).to.be.structurally.equal([n5_0, n5_1])
    })

    it("should ignore extra/unused formatters", () => {
      const s1 = tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 0, {quux: "numeral"})
      expect(s1).to.be.equal("stuff 1000.000 %")

      const s2 = tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 1, {quux: "numeral"})
      expect(s2).to.be.equal("stuff 100.200 %")
    })

    it("should throw an error on unrecognized formatters", () => {
      const fn = () => tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 0, {"@foo": "junk" as any})
      expect(fn).to.throw()
    })

    it("should default to numeral formatter", () => {
      // just picking a random and uniquely numbro format to test with
      const s1 = tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 0)
      expect(s1).to.be.equal("stuff 1000.000 %")

      const s2 = tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 1)
      expect(s2).to.be.equal("stuff 100.200 %")
    })

    it("should use the numeral formatter if specified", () => {
      // just picking a random and uniquely numbro format to test with
      const s1 = tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 0, {"@foo": "numeral"})
      expect(s1).to.be.equal("stuff 1000.000 %")

      const s2 = tmpl.replace_placeholders("stuff @foo{(0.000 %)}", source, 1, {"@foo": "numeral"})
      expect(s2).to.be.equal("stuff 100.200 %")
    })

    it("should use a customjs hover formatter if specified", () => {
      const custom = new CustomJSHover({code: "return format + ' ' + special_vars.special + ' ' + value"})
      const s = tmpl.replace_placeholders("stuff @foo{custom}", source, 0, {"@foo": custom}, {special: "vars"})
      expect(s).to.be.equal("stuff custom vars 10")
    })

    it("should replace field names with tz formatted values with datetime formatter", () => {
      // just picking a random and uniquely tz format to test with
      const s1 = tmpl.replace_placeholders("stuff @baz{%F %T}", source, 0, {"@baz": "datetime"})
      expect(s1).to.be.equal("stuff 2017-04-22 19:51:11")

      const s2 = tmpl.replace_placeholders("stuff @baz{%F %T}", source, 1, {"@baz": "datetime"})
      expect(s2).to.be.equal("stuff 2010-11-22 21:17:51")
    })

    it("should replace field names with Sprintf formatted values with printf formatter", () => {
      // just picking a random and uniquely Sprintf formats to test with
      const s1 = tmpl.replace_placeholders("stuff @foo{%x}", source, 0, {"@foo": "printf"})
      expect(s1).to.be.equal("stuff a")

      const s2 = tmpl.replace_placeholders("stuff @foo{%0.4f}", source, 1, {"@foo": "printf"})
      expect(s2).to.be.equal("stuff 1.0020")
    })

    it("should replace special vars with supplied values", () => {
      const s = tmpl.replace_placeholders("stuff $foo", source, 0, {}, {foo: "special"})
      expect(s).to.be.equal("stuff special")
    })

    it("should replace combinations and duplicates", () => {
      const s = tmpl.replace_placeholders("stuff $foo @foo @foo @foo{(0.000 %)} @baz{%F %T}", source, 0, {"@baz": "datetime"}, {foo: "special"})
      expect(s).to.be.equal("stuff special 10 10 1000.000 % 2017-04-22 19:51:11")
    })

    it("should handle special @$name case by using special_vars.name as the column", () => {
      const s = tmpl.replace_placeholders("stuff @$name", source, 0, {}, {name: "foo"})
      expect(s).to.be.equal("stuff 10")
    })

    it("should allow custom string encoding (e.g. encodeURIComponent)", () => {
      const s0 = tmpl.replace_placeholders("stuff @bar", source, 0, undefined, undefined, encodeURIComponent)
      expect(s0).to.be.equal("stuff a")

      const s1 = tmpl.replace_placeholders("stuff @bar", source, 1, undefined, undefined, encodeURIComponent)
      expect(s1).to.be.equal("stuff %3Cdiv%3Eb%3C%2Fdiv%3E")

      const s2 = tmpl.replace_placeholders("stuff @bar", source, 2, undefined, undefined, encodeURIComponent)
      expect(s2).to.be.equal("stuff 'qux'%22quux%22")
    })
  })

  describe("process_placeholders()", () => {
    it("should support simplified syntax", () => {
      const found: [string, string, string?][] = []
      const result = tmpl.process_placeholders("@x @0 @_ @xyz @012 @_x @_0 @x_ @0_ @x_0 @ł @_ł @ł_ @ł0 @Wörter", (type, name, format, i) => {
        found.push([type, name, format])
        return `${i}`
      })
      expect(result).to.be.equal("0 1 2 3 4 5 6 7 8 9 10 11 12 13 14")
      expect(found).to.be.equal([
        ["@", "x", undefined],
        ["@", "0", undefined],
        ["@", "_", undefined],
        ["@", "xyz", undefined],
        ["@", "012", undefined],
        ["@", "_x", undefined],
        ["@", "_0", undefined],
        ["@", "x_", undefined],
        ["@", "0_", undefined],
        ["@", "x_0", undefined],
        ["@", "ł", undefined],
        ["@", "_ł", undefined],
        ["@", "ł_", undefined],
        ["@", "ł0", undefined],
        ["@", "Wörter", undefined],
      ])
    })

    it("should support complete syntax", () => {
      const found: [string, string, string?][] = []
      const result = tmpl.process_placeholders("@{x} @{0} @{_} @{} @{ } @{  xyz   } @{xyz} @{012} @{xyz 012} @{~`!@#$%^&*()_-+= []|\\:;\"'<,>.?/} @{Słowa @Wörter}", (type, name, format, i) => {
        found.push([type, name, format])
        return `${i}`
      })
      expect(result).to.be.equal("0 1 2 @{} 3 4 5 6 7 8 9")
      expect(found).to.be.equal([
        ["@", "x", undefined],
        ["@", "0", undefined],
        ["@", "_", undefined],
        ["@", "", undefined],
        ["@", "xyz", undefined],
        ["@", "xyz", undefined],
        ["@", "012", undefined],
        ["@", "xyz 012", undefined],
        ["@", "~`!@#$%^&*()_-+= []|\\:;\"'<,>.?/", undefined],
        ["@", "Słowa @Wörter", undefined],
      ])
    })

    it("should support simplified syntax with formatting", () => {
      const found: [string, string, string?][] = []
      const result = tmpl.process_placeholders("@x{} @x{ } @x{f} @x{format} @{x}{:}", (type, name, format, i) => {
        found.push([type, name, format])
        return `${i}`
      })
      expect(result).to.be.equal("0{} 1 2 3 4")
      expect(found).to.be.equal([
        ["@", "x", undefined],
        ["@", "x", " "],
        ["@", "x", "f"],
        ["@", "x", "format"],
        ["@", "x", ":"],
      ])
    })

    it("should support complete syntax with formatting", () => {
      const found: [string, string, string?][] = []
      const result = tmpl.process_placeholders("@{x}{} @{x}{ } @{x}{f} @{x}{format} @{x}{:}", (type, name, format, i) => {
        found.push([type, name, format])
        return `${i}`
      })
      expect(result).to.be.equal("0{} 1 2 3 4")
      expect(found).to.be.equal([
        ["@", "x", undefined],
        ["@", "x", " "],
        ["@", "x", "f"],
        ["@", "x", "format"],
        ["@", "x", ":"],
      ])
    })
  })
})
