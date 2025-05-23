import {display} from "./_util"
import {actions, xy} from "../interactive"

import {Dialog, Drawer, Pane, Menu, MenuItem, CustomJS, BoxSelectTool} from "@bokehjs/models"
import type {Figure} from "@bokehjs/api/plotting"
import {figure} from "@bokehjs/api/plotting"
import {Random} from "@bokehjs/core/util/random"
import {color2hex} from "@bokehjs/core/util/color"
import {paint} from "@bokehjs/core/util/defer"
import {Spectral11} from "@bokehjs/api/palettes"
import {f} from "@bokehjs/api/expr"

function draw(plot: Figure, N: number = 4000): Figure {
  const random = new Random(1)

  const x = f`${random.floats(N)}*${100}`
  const y = f`${random.floats(N)}*${100}`
  const radii = f`${random.floats(N)}*${1.5}`
  const colors = random.choices(N, Spectral11)

  plot.circle({x, y, radius: radii, fill_color: colors, fill_alpha: 0.6, line_color: null})
  return plot
}

describe("UI elements", () => {
  describe("should implement UIElement", () => {
    it("which should support dashed, snake and camel CSS property names and CSS variables in styles", async () => {
      const [width, height] = [100, 100]
      const common = {width: `${width}px`, height: `${height}px`}

      const p0 = new Pane({styles: {...common, "background-color": "red"}})
      const p1 = new Pane({styles: {...common, background_color: "green"}})
      const p2 = new Pane({styles: {...common, backgroundColor: "blue"}})
      const p3 = new Pane({styles: {...common, "--bg-color": "yellow"}, stylesheets: [":host { background-color: var(--bg-color); }"]})

      const layout = new Pane({styles: {display: "inline-flex"}, elements: [p0, p1, p2, p3]})
      await display(layout, [layout.elements.length*width + 50, height + 50])
    })
  })

  describe("should implement Dialog", () => {
    it("which should support basic features", async () => {
      const plot = draw(figure({sizing_mode: "stretch_both"}))

      const dialog = new Dialog({
        title: "A dialog",
        content: plot,
        stylesheets: [`
        :host {
          position: relative; /* the default is fixed */
          left: 20px;
          top: 40px;
          width: 400px;
          height: 400px;
        }
        `],
      })
      await display(dialog, [500, 500])
    })
  })

  describe("should implement Menu", () => {
    it("which should support basic features", async () => {
      const box_select = new BoxSelectTool({persistent: true, continuous: true})

      const palette = Spectral11.map((color) => color2hex(color))
      const menu = new Menu({
        items: [
          new MenuItem({
            label: "Count",
            shortcut: "Alt+C",
            disabled: true,
            action: new CustomJS({code: "console.log('count not implemented')"}),
          }),
          new MenuItem({
            label: "Delete",
            shortcut: "Alt+Shift+D",
            icon: "delete",
            action: new CustomJS({code: "console.log('delete not implemented')"}),
          }),
          null,
          new MenuItem({
            label: "Choose color",
            menu: new Menu({
              stylesheets: [
                palette.map((color) => `.color-${color.substring(1)} { background-color: ${color}; }`).join("\n"),
                ".bk-label { font-family: monospace; }",
              ],
              items: palette.map((color) => {
                return new MenuItem({
                  label: color,
                  icon: `.color-${color.substring(1)}`,
                  action: new CustomJS({code: "console.log('color not implemented')"}),
                })
              }),
            }),
          }),
          null,
          new MenuItem({
            label: "Continuous selection",
            checked: box_select.continuous,
            action: new CustomJS({code: "console.log('continuous not implemented')"}),
          }),
          null,
          new MenuItem({
            icon: "invert_selection",
            label: "Invert selection",
            action: new CustomJS({code: "console.log('invert not implemented')"}),
          }),
          new MenuItem({
            icon: "clear_selection",
            label: "Clear selection",
            shortcut: "Esc",
            action: new CustomJS({code: "console.log('clear not implemented')"}),
          }),
        ],
      })
      box_select.overlay.context_menu = menu

      const plot = draw(figure({width: 400, height: 400, tools: [box_select], active_drag: box_select}))
      const {view} = await display(plot)

      await actions(view).pan(xy(20, 20), xy(80, 80))
      await view.ready

      // can't dispatch `contextmenu` with `el.dispatchEvent()`
      const {x, y} = view.el.getBoundingClientRect()
      view.show_context_menu(new MouseEvent("contextmenu", {clientX: x + 120, clientY: y + 120, shiftKey: false}))
      // TODO hover "Choose color" item to show its sub-menu
      await paint()
    })
  })

  describe("should implement Drawer component", () => {
    function size(width: number, height: number) {
      return `
        :host {
          width: ${width}px;
          height: ${height}px;
        }
      `
    }

    const checkerboard_background = `
      :host {
        background-image: linear-gradient(45deg, #808080 25%, transparent 25%),
                          linear-gradient(-45deg, #808080 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #808080 75%),
                          linear-gradient(-45deg, transparent 75%, #808080 75%);
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        background-size: 20px 20px;
      }
    `

    async function drawer(attrs: Partial<Drawer.Attrs>) {
      const drawer = new Drawer({
        open: true,
        size: "80px",
        ...attrs,
      })
      const pane = new Pane({
        elements: [drawer],
        stylesheets: [size(200, 200), checkerboard_background],
      })
      return await display(pane, [250, 250])
    }

    it("supporting location = 'left'", async () => {
      await drawer({location: "left"})
    })

    it("supporting location = 'right'", async () => {
      await drawer({location: "right"})
    })

    it("supporting location = 'above'", async () => {
      await drawer({location: "above"})
    })

    it("supporting location = 'below'", async () => {
      await drawer({location: "below"})
    })
  })
})
