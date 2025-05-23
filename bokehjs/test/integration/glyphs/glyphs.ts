import {display, fig, row, column} from "../_util"

import {Range1d, HoverTool, ColumnDataSource, Circle, Rect, GlyphRenderer} from "@bokehjs/models"
import type {DisplayMode} from "@bokehjs/models/glyphs/tex_glyph"
import type {Direction, OutputBackend} from "@bokehjs/core/enums"
import type {Color} from "@bokehjs/core/types"
import {hatch_aliases} from "@bokehjs/core/visuals/patterns"
import {entries} from "@bokehjs/core/util/object"
import {zip, range, repeat} from "@bokehjs/core/util/array"
import type {HatchPattern} from "@bokehjs/core/property_mixins"
import {np} from "@bokehjs/api/linalg"
import {Spectral11} from "@bokehjs/api/palettes"

describe("Glyph models", () => {
  const x = [1, 2, 3]
  const y = [1, 2, 3]

  const fill_color = ["red", "orange", "green"]
  const hatch_pattern = ["/", ">", "@"]

  describe("should support AnnularWedge", async () => {
    function annular_wedge(output_backend: OutputBackend, start_angle: number, end_angle: number) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.annular_wedge({
        x: [1, 2, 3], y,
        inner_radius: 0.5, outer_radius: 1,
        start_angle, start_angle_units: "deg",
        end_angle, end_angle_units: "deg",
        fill_color, alpha: 0.6,
      })
      p.annular_wedge({
        x: [3, 4, 5], y,
        inner_radius: 0.5, outer_radius: 1,
        start_angle, start_angle_units: "deg",
        end_angle, end_angle_units: "deg",
        fill_color, alpha: 0.6, hatch_pattern,
      })
      return p
    }

    it.allowing(1)("with angle range 23..275", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, 23, 275)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range 23..135", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, 23, 135)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range -23..-275", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, -23, -275)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range -23..-135", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, -23, -135)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range 23..-135", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, 23, -135)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range 23..-275", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, 23, -275)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range -23..135", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, -23, 135)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })

    it.allowing(1)("with angle range -23..275", async () => {
      function p(output_backend: OutputBackend) {
        return annular_wedge(output_backend, -23, 275)
      }
      await display(row([p("canvas"), p("svg"), p("webgl")]))
    })
  })

  it("should support Annulus", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.annulus({x: [1, 2, 3], y, inner_radius: 0.5, outer_radius: 1, fill_color, alpha: 0.6})
      p.annulus({x: [3, 4, 5], y, inner_radius: 0.5, outer_radius: 1, fill_color, alpha: 0.6, hatch_pattern})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it.allowing(1)("should support Arc", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.arc({x, y, radius: 0.25, start_angle: 0.4, end_angle: 4.8, color: "green", alpha: 0.6, line_width: 5})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Bezier", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.bezier({
        x0: [1, 2, 3], y0: [1, 2, 3],
        x1: [4, 5, 6], y1: [4, 5, 6],
        cx0: [1, 2, 3], cy0: [2, 3, 4],
        cx1: [4, 5, 6], cy1: [3, 4, 5],
        line_width: 5,
      })
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Block", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.block({x, y, width: 1, height: 2, hatch_pattern})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Circle", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.circle({x: [1, 2, 3], y, radius: [0.5, 1, 1.5], fill_color, alpha: 0.6})
      p.circle({x: [3, 4, 5], y, radius: [0.5, 1, 1.5], fill_color, alpha: 0.6, hatch_pattern})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Ellipse", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.ellipse({
        x: [1, 2, 3], y,
        width: [1, 1.5, 2], height: [1.5, 2, 2.5],
        angle: [0, 30, 90], angle_units: "deg",
        fill_color, alpha: 0.6,
      })
      p.ellipse({
        x: [3, 4, 5], y,
        width: [1, 1.5, 2], height: [1.5, 2, 2.5],
        angle: [0, 30, 90], angle_units: "deg",
        fill_color, alpha: 0.6,
        hatch_pattern,
      })
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support HArea", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.harea({x1: [1, 2, 3], x2: [2, 3, 4], y: [1, 2, 3]})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support HAreaStep", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.harea_step({x1: [1, 2, 3, 4], x2: [4, 5, 6, 7], y: [1.0, 1.3, 1.6, 1.9], step_mode: "before", color: "red"})
      p.harea_step({x1: [1, 2, 3, 4], x2: [4, 5, 6, 7], y: [2.0, 2.3, 2.6, 2.9], step_mode: "center", color: "green"})
      p.harea_step({x1: [1, 2, 3, 4], x2: [4, 5, 6, 7], y: [3.0, 3.3, 3.6, 3.9], step_mode: "after", color: "blue"})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support HBar", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.hbar({y: 1, height: [1, 2, 3], left: [1, 2, 3], right: [4, 5, 6]})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  /*
  it("should support HexTile", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      //p.hex_tile({q, r})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Image", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      //p.image({image, x, y, dw, dh})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support ImageRGBA", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      //p.image_rgba({image, x, y, dw, dh})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support ImageURL", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      //p.image_url({url, x, y, w, h})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })
  */

  it("should support Line", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.line({x, y})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support MultiLine", async () => {
    const xs = [[1, 2, 3], [1, 2, 3]]
    const ys = [[1, 3, 2], [2, 1, 3]]

    function p(output_backend: OutputBackend) {
      const p = fig([150, 200], {output_backend, title: output_backend})
      p.multi_line({xs, ys, line_color: ["red", "blue"], line_width: [5, 10], line_alpha: 0.5, line_dash: ["solid", "dashed"]})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support MultiPolygon", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.multi_polygons({xs: [[[x]]], ys: [[[y]]]})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Patch", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 7], y_range: [0, 6], output_backend, title: output_backend})

      function patch(x: number, colors: Color[], hatches: (HatchPattern | null)[]) {
        let y = 0
        for (const [color, hatch] of zip(colors, hatches)) {
          p.patch({
            x: [x + 1.0, x + 2.0, x + 0.5, x + 3.5, x + 2.0],
            y: [y + 0.5, y + 2.5, y + 3.5, y + 3.0, y + 1.0],
            fill_color: color,
            alpha: 0.6,
            hatch_pattern: hatch,
          })
          y++
        }
      }

      patch(0, fill_color, [null, null, null])
      patch(3, fill_color, hatch_pattern)

      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Patches", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 7], y_range: [0, 6], output_backend, title: output_backend})

      function patches(x: number, colors: Color[], hatches?: HatchPattern[]) {
        const xs = [], ys = []
        for (let y = 0; y < 3; y++) {
          xs.push([x + 1.0, x + 2.0, x + 0.5, x + 3.5, x + 2.0])
          ys.push([y + 0.5, y + 2.5, y + 3.5, y + 3.0, y + 1.0])
        }

        p.patches({xs, ys, fill_color: colors, alpha: 0.6, hatch_pattern: hatches})
      }

      patches(0, fill_color)
      patches(3, fill_color, hatch_pattern)

      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Quad", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.quad({
        left: [1, 2, 3], right: [2, 3, 4], bottom: [1, 2, 3], top: [2, 3, 4],
        alpha: 0.7, line_color: "red",
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Quad with rounded corners where tl=5px, tr=10px, br=15px and bl=20px", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.quad({
        left: [1, 2, 3], right: [2, 3, 4], bottom: [1, 2, 3], top: [2, 3, 4],
        alpha: 0.7, line_color: "red",
        border_radius: [5, 10, 15, 20],
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Quadratic", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.quadratic({x0: [1, 2, 3], y0: [1, 2, 3], x1: [4, 5, 6], y1: [4, 5, 6], cx: 1, cy: 1})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Ray", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.ray({x, y})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Ngon", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.ngon({
        x: [1, 2, 3], y,
        radius: 1,
        n: 3,
        fill_color, alpha: 0.8,
        line_width: 10, line_join: ["round", "miter", "bevel"],
        angle: [0, 45, 90], angle_units: "deg",
      })
      p.ngon({
        x: [3, 4, 5], y,
        radius: [1, 0.6, 0.9],
        n: [4, 5, 6],
        fill_color, alpha: 0.6, hatch_pattern,
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Rect", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.rect({
        x, y,
        width: 1, height: 2,
        angle: [0, 90, -15], angle_units: "deg",
        alpha: 0.7, line_color: "red",
        border_radius: 0,
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Rect with rounded corners where tl=5px, tr=10px, br=15px and bl=20px", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.rect({
        x, y,
        width: 1, height: 2,
        angle: [0, 90, -15], angle_units: "deg",
        alpha: 0.7, line_color: "red",
        border_radius: [5, 10, 15, 20],
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Rect with large rounded corners that need scaling", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.rect({
        x, y,
        width: {value: 50, units: "screen"},
        height: {value: 100, units: "screen"},
        alpha: 0.7, line_color: "red",
        border_radius: [30, 40, 70, 0],
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Segment", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.segment({x0: [1, 2, 3], y0: [1, 2, 3], x1: [4, 5, 6], y1: [4, 5, 6]})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support Step", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.step({x, y: [1.2, 2.2, 3.2], line_width: 5, line_cap: "round", mode: "before", line_color: "red"})
      p.step({x, y: [1.1, 2.1, 3.1], line_width: 5, line_cap: "round", mode: "center", line_color: "green"})
      p.step({x, y: [1.0, 2.0, 3.0], line_width: 5, line_cap: "round", mode: "after", line_color: "blue"})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Step with NaN", async () => {
    const x0 = [0, 1, 2, 3, 4]

    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.step({x: x0, y: [0.2, 1.2, NaN, 1.0, 0.0], line_width: 5, line_cap: "round", mode: "before", line_color: "red"})
      p.step({x: x0, y: [0.1, 1.1, NaN, 1.1, 0.1], line_width: 5, line_cap: "round", mode: "center", line_color: "green"})
      p.step({x: x0, y: [0.0, 1.0, NaN, 1.2, 0.2], line_width: 5, line_cap: "round", mode: "after", line_color: "blue"})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support MathMLGlyph", async () => {
    const p = fig([200, 200])
    p.mathml({
      anchor: "center",
      x: [0],
      y: [0],
      text: [`
        <math display="block">
          <mrow>
            <msup>
              <mi>x</mi>
              <mn>2</mn>
            </msup>
            <msup>
              <mi>y</mi>
              <mn>2</mn>
            </msup>
          </mrow>
        </math>
      `],
      background_fill_color: "yellow", background_fill_alpha: 0.8,
      padding: 10,
      border_line_color: "black",
    })
    await display(p)
  })

  describe("should support TeXGlyph", () => {
    const r = String.raw

    it("with display=auto", async () => {
      const p = fig([300, 300], {x_range: [0, 10], y_range: [0, 10]})
      p.tex({
        x: [1, 3, 3, 2],
        y: [1, 3, 5, 6],
        text: [
          r`Prefix: $$x^2$$ (suffix)`,
          r`$$\frac{1}{x^2\cdot y}$$`,
          r`Prefix: $$\int_{-\infty}^{\infty} \frac{1}{x} dx$$ (suffix)`,
          r`$$F = G \left( \frac{m_1 m_2}{r^2} \right)$$`,
        ],
        text_font_size: "10px",
        angle: [0, 0, 0, 30],
        angle_units: "deg",
        background_fill_color: "white", background_fill_alpha: 0.8,
        padding: 10,
        border_line_color: "black",
        display: "auto",
      })
      await display(p)
    })

    it("with display=block", async () => {
      const p = fig([300, 300], {x_range: [0, 10], y_range: [0, 10]})
      p.tex({
        x: [1, 3, 5, 2],
        y: [1, 3, 5, 6],
        text: [
          r`x^2`,
          r`\frac{1}{x^2\cdot y}`,
          r`\int_{-\infty}^{\infty} \frac{1}{x} dx`,
          r`F = G \left( \frac{m_1 m_2}{r^2} \right)`,
        ],
        text_font_size: "10px",
        angle: [0, 0, 0, 30],
        angle_units: "deg",
        background_fill_color: "yellow", background_fill_alpha: 0.8,
        padding: 10,
        border_line_color: "black",
        display: "block",
      })
      await display(p)
    })

    it("with display=inline", async () => {
      const p = fig([300, 300], {x_range: [0, 10], y_range: [0, 10]})
      p.tex({
        x: [1, 3, 5, 2],
        y: [1, 3, 5, 6],
        text: [
          r`x^2`,
          r`\frac{1}{x^2\cdot y}`,
          r`\int_{-\infty}^{\infty} \frac{1}{x} dx`,
          r`F = G \left( \frac{m_1 m_2}{r^2} \right)`,
        ],
        text_font_size: "10px",
        angle: [0, 0, 0, 30],
        angle_units: "deg",
        background_fill_color: "pink", background_fill_alpha: 0.8,
        padding: 10,
        border_line_color: "black",
        display: "inline",
      })
      await display(p)
    })
  })

  it("should support Text", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {
        x_range: [0, 5], y_range: [0, 5],
        output_backend, title: output_backend,
      })
      p.text({
        x, y,
        text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
      })
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  describe("should support Text", () => {
    it("with background", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with background and border", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
          border_line_color: ["blue", "red", "green"],
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with background, border and padding=10px", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
          border_line_color: ["blue", "red", "green"],
          padding: 10,
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with anchors, background, border and padding=10px", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          anchor: ["top_left", "center", "bottom_right"],
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
          border_line_color: ["blue", "red", "green"],
          padding: 10,
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with anchors, background, border, padding=10px and rounded corners where tl=5px, tr=10px, br=15px and bl=20px", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          anchor: ["top_left", "center", "bottom_right"],
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
          border_line_color: ["blue", "red", "green"],
          padding: 10,
          border_radius: {top_left: 5, top_right: 10, bottom_right: 15, bottom_left: 20},
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with anchors, angles, background, border and padding=10px", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          anchor: ["top_left", "center", "bottom_right"],
          angle: [0, -30, -60],
          angle_units: "deg",
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
          border_line_color: ["blue", "red", "green"],
          padding: 10,
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with anchors, angles, offsets, background, border and padding=10px", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 5], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          anchor: ["top_left", "center", "bottom_right"],
          angle: [0, -30, -60],
          x_offset: [-5, -10, -15],
          y_offset: [-10, -15, -25],
          angle_units: "deg",
          background_fill_color: ["#fee08b", "#fdae61", "#f46d43"],
          background_fill_alpha: 0.7,
          border_line_color: ["blue", "red", "green"],
          padding: 10,
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })

    it("with text_outline_color", async () => {
      function p(output_backend: OutputBackend) {
        const p = fig([200, 300], {
          x_range: [0, 4], y_range: [0, 5],
          output_backend, title: output_backend,
        })
        p.text({
          x, y,
          text: ["One line", "Two short\nlines", "Three\nshort\nlines"],
          text_outline_color: "black", text_color: "yellow",
          text_font_size: "30px", text_font_style: "bold",
        })
        return p
      }
      await display(row([p("canvas"), p("svg")]))
    })
  })

  describe("should support Text-like glyphs", () => {
    it("with outline_shape", async () => {
      const p = fig([1000, 400], {
        x_range: [5, 95], y_range: [0, 50],
        x_axis_type: null, y_axis_type: null,
        background_fill_color: "ivory",
      })

      const x = [10, 20, 30, 40, 50, 60, 70, 80, 90]
      const padding = 5

      p.text({
        anchor: "center",
        x,
        y: 5,
        text: ["none", "circle", "square", "ellipse", "box\nrectangle", "trapezoid", "parallelogram", "diamond", "triangle"],
        outline_shape: ["none", "circle", "square", "ellipse", "box", "trapezoid", "parallelogram", "diamond", "triangle"],
        background_fill_color: "white",
        background_fill_alpha: 1.0,
        padding,
        border_line_color: "black",
        text_font_size: "0.9em",
      })

      function tex(display: DisplayMode, y: number, color: Color) {
        const r = String.raw
        p.tex({
          anchor: "center",
          x,
          y,
          text: [
            r`\emptyset`,
            r`x^{y^z}`,
            r`\frac{1}{x^2\cdot y}`,
            r`\int_{-\infty}^{\infty} \frac{1}{x} dx`,
            r`F = G \left( \frac{m_1 m_2}{r^2} \right)`,
            r`\delta`,
            r`\sqrt[3]{\gamma}`,
            r`x^2`,
            r`y_{\rho \theta}`,
          ],
          outline_shape: ["none", "circle", "square", "ellipse", "box", "trapezoid", "parallelogram", "diamond", "triangle"],
          background_fill_color: color,
          background_fill_alpha: 0.8,
          padding,
          border_line_color: "black",
          text_font_size: "1.0em",
          display,
        })
      }

      tex("inline", 20, "yellow")
      tex("block", 40, "pink")

      await display(p)
    })
  })

  it("should support VArea", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.varea({x, y1: [1, 2, 3], y2: [4, 5, 6]})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support VAreaStep", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.varea_step({x: [1.0, 1.3, 1.6, 1.9], y1: [1, 2, 3, 4], y2: [4, 5, 6, 7], step_mode: "before", color: "red"})
      p.varea_step({x: [2.0, 2.3, 2.6, 2.9], y1: [1, 2, 3, 4], y2: [4, 5, 6, 7], step_mode: "center", color: "green"})
      p.varea_step({x: [3.0, 3.3, 3.6, 3.9], y1: [1, 2, 3, 4], y2: [4, 5, 6, 7], step_mode: "after", color: "blue"})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support VBar", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([200, 300], {output_backend, title: output_backend})
      p.vbar({x, width: [1, 2, 3], bottom: [1, 2, 3], top: [4, 5, 6]})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Wedge", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.wedge({
        x: [1, 2, 3], y,
        radius: [1, 1.25, 1.5],
        start_angle: 23, start_angle_units: "deg",
        end_angle: 275, end_angle_units: "deg",
        fill_color, alpha: 0.6,
      })
      p.wedge({
        x: [3, 4, 5], y,
        radius: [1, 1.25, 1.5],
        start_angle: 23, start_angle_units: "deg",
        end_angle: 275, end_angle_units: "deg",
        fill_color, alpha: 0.6, hatch_pattern,
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support Wedge with angle range 23..135", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {x_range: [0, 6], y_range: [0, 4], output_backend, title: output_backend})
      p.wedge({
        x: [1, 2, 3], y,
        radius: [1, 1.25, 1.5],
        start_angle: 23, start_angle_units: "deg",
        end_angle: 135, end_angle_units: "deg",
        fill_color, alpha: 0.6,
      })
      p.wedge({
        x: [3, 4, 5], y,
        radius: [1, 1.25, 1.5],
        start_angle: 23, start_angle_units: "deg",
        end_angle: 135, end_angle_units: "deg",
        fill_color, alpha: 0.6, hatch_pattern,
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support HSpan and VSpan", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {
        x_range: [-5, 105], y_range: [-5, 105],
        output_backend, title: output_backend,
      })

      p.add_tools(new HoverTool({mode: "vline"}))

      p.hspan([0, 5, 15, 33], {line_width: [1, 2, 3, 4], line_color: "red"})
      p.vspan([0, 5, 15, 33], {line_width: [1, 2, 3, 4], line_color: "blue"})
      return p
    }
    await display(row([p("canvas"), p("svg")]))
  })

  it("should support HStrip and VStrip", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {
        x_range: [-5, 105], y_range: [-5, 105],
        output_backend, title: output_backend,
      })

      p.add_tools(new HoverTool({mode: "vline"}))

      p.hstrip({
        y0: [40, 60, 80], y1: [50, 70, 90],
        line_color: "pink",
        fill_color: "purple",
        hatch_pattern: "x", hatch_color: "yellow",
      })
      p.vstrip({
        x0: [40, 60, 80], x1: [50, 70, 90],
        line_color: "pink",
        fill_color: "yellow",
        hatch_pattern: "/", hatch_color: "purple",
      })
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support full circle Wedge", async () => {
    const x = [0, 1, 0, 1]
    const y = [0, 0, 1, 1]
    const y2 = [2, 2, 3, 3]

    const small = 1e-7
    let start_angle = [0, 0, 0, 0]
    let end_angle = [2*np.pi, 2*np.pi+small, -2*np.pi, -2*np.pi-small]

    // Round angles to float32 (issue #11475).
    start_angle = start_angle.map(x => Math.fround(x))
    end_angle = end_angle.map(x => Math.fround(x))

    function p(output_backend: OutputBackend) {
      const p = fig([150, 300], {x_range: [-0.5, 1.5], y_range: [-0.5, 3.5], output_backend, title: output_backend})
      p.wedge({x, y, start_angle, end_angle, radius: 0.4, direction: "clock", alpha: 0.6, line_color: "red", line_width: 2})
      p.wedge({x, y: y2, start_angle, end_angle, radius: 0.4, direction: "anticlock", alpha: 0.6, line_color: "blue", line_width: 2})
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support fill with hatch patterns", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([400, 800], {output_backend, title: output_backend})
      let y = 0
      for (const [alias, name] of entries(hatch_aliases)) {
        p.quad({left: 0, bottom: y, right: 1.95, top: y + 0.75, hatch_pattern: alias, hatch_scale: 12})
        p.quad({left: 2.05, bottom: y, right: 4, top: y + 0.75, hatch_pattern: name, hatch_scale: 12})
        y++
      }
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should support rotation with all angle units", async () => {
    function p(sign: -1 | 1, output_backend: OutputBackend) {
      const x_range = new Range1d({start: -1, end: 7})
      const y_range = new Range1d({start: -1, end: 1})

      const p = fig([400, 150], {output_backend, title: output_backend, x_range, y_range})

      const y = 0
      const inner_radius = 0.5
      const outer_radius = 1
      const alpha = 0.6

      function f(direction: Direction, fill_color: Color, line_color: Color) {
        p.annular_wedge({
          x: 0, y, inner_radius, outer_radius, fill_color, line_color, alpha,
          start_angle: {value: sign*Math.PI/2, units: "rad"},
          end_angle: {value: sign*Math.PI/4, units: "rad"},
          direction,
        })
        p.annular_wedge({
          x: 2, y,
          inner_radius, outer_radius, fill_color, line_color, alpha,
          start_angle: {value: sign*90, units: "deg"},
          end_angle: {value: sign*45, units: "deg"},
          direction,
        })
        p.annular_wedge({
          x: 4, y,
          inner_radius, outer_radius, fill_color, line_color, alpha,
          start_angle: {value: sign*100, units: "grad"},
          end_angle: {value: sign*50, units: "grad"},
          direction,
        })
        p.annular_wedge({
          x: 6, y,
          inner_radius, outer_radius, fill_color, line_color, alpha,
          start_angle: {value: sign*0.25, units: "turn"},
          end_angle: {value: sign*0.125, units: "turn"},
          direction,
        })
      }

      f("anticlock", "yellow", "green")
      f("clock", "blue", "red")

      return p
    }

    const r0 = row([p(+1, "canvas"), p(+1, "svg"), p(+1, "webgl")])
    const r1 = row([p(-1, "canvas"), p(-1, "svg"), p(-1, "webgl")])

    await display(column([r0, r1]))
  })

  it("should allow to override Circle.radius", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {output_backend, title: output_backend})
      const N = 11
      const data_source = new ColumnDataSource({
        data: {
          x: range(N),
          y: range(N),
          radius: repeat(0.5, N),
          selection_radius: repeat(0.8, N),
          color: Spectral11,
        },
      })
      data_source.selected.indices = range(N).filter((i) => i % 2 == 0)
      const glyph = new Circle({radius: {field: "radius"}, fill_color: {field: "color"}})
      const selection_glyph = new Circle({radius: {field: "selection_radius"}, fill_color: {field: "color"}})
      const glyph_renderer = new GlyphRenderer({data_source, glyph, selection_glyph})
      p.renderers.push(glyph_renderer)
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should allow to override Circle.x and Circle.y", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {output_backend, title: output_backend})
      const N = 11
      const data_source = new ColumnDataSource({
        data: {
          x: range(N),
          y: range(N),
          x1: range(N).map((xi) => xi + 0.25),
          y1: range(N).map((yi) => yi + 0.25),
          color: Spectral11,
        },
      })
      data_source.selected.indices = range(N).filter((i) => i % 2 == 0)
      const glyph = new Circle({radius: {value: 0.5}, fill_color: {field: "color"}})
      const selection_glyph = new Circle({x: {field: "x1"}, y: {field: "y1"}, radius: {value: 0.5}, fill_color: {field: "color"}})
      const glyph_renderer = new GlyphRenderer({data_source, glyph, selection_glyph})
      p.renderers.push(glyph_renderer)
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })

  it("should allow to override Circle with Rect in a GlyphRenderer", async () => {
    function p(output_backend: OutputBackend) {
      const p = fig([300, 300], {output_backend, title: output_backend})
      const N = 11
      const data_source = new ColumnDataSource({
        data: {
          x: range(N),
          y: range(N),
          radius: repeat(0.5, N),
          width: repeat(1.0, N),
          height: repeat(1.0, N),
          color: Spectral11,
        },
      })
      data_source.selected.indices = range(N).filter((i) => i % 2 == 0)
      const glyph = new Circle({radius: {field: "radius"}, fill_color: {field: "color"}})
      const selection_glyph = new Rect({fill_color: {field: "color"}})
      const glyph_renderer = new GlyphRenderer({data_source, glyph, selection_glyph})
      p.renderers.push(glyph_renderer)
      return p
    }
    await display(row([p("canvas"), p("svg"), p("webgl")]))
  })
})
