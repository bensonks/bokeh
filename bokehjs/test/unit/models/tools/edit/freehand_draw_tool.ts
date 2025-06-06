import * as sinon from "sinon"

import {expect} from "assertions"
import {display} from "../../../_util"

import {build_view} from "@bokehjs/core/build_views"

import type {PatchesView} from "@bokehjs/models/glyphs/patches"
import {Patches} from "@bokehjs/models/glyphs/patches"
import {Plot} from "@bokehjs/models/plots/plot"
import {Range1d} from "@bokehjs/models/ranges/range1d"
import {Selection} from "@bokehjs/models/selections/selection"
import {GlyphRenderer} from "@bokehjs/models/renderers/glyph_renderer"
import {ColumnDataSource} from "@bokehjs/models/sources/column_data_source"
import type {FreehandDrawToolView} from "@bokehjs/models/tools/edit/freehand_draw_tool"
import {FreehandDrawTool} from "@bokehjs/models/tools/edit/freehand_draw_tool"

import {make_pan_event, make_tap_event, make_key_event, make_move_event} from "./_util"

export interface FreehandDrawTestCase {
  data: {[key: string]: (number[] | null)[]}
  data_source: ColumnDataSource
  draw_tool_view: FreehandDrawToolView
  glyph_view: PatchesView
}

async function make_testcase(): Promise<FreehandDrawTestCase> {
  // Note default plot dimensions is 600 x 600 (height x width)
  const plot = new Plot({
    x_range: new Range1d({start: -1, end: 1}),
    y_range: new Range1d({start: -1, end: 1}),
  })

  const {view: plot_view} = await display(plot)

  const data = {
    xs: [[0, 0.5, 1], [0, 0.5, 1]],
    ys: [[0, -0.5, -1], [0, -0.5, -1]],
    z: [null, null],
  }
  const data_source = new ColumnDataSource({data})

  const glyph = new Patches({
    xs: {field: "xs"},
    ys: {field: "ys"},
  })

  const glyph_renderer = new GlyphRenderer<Patches>({glyph, data_source})
  const glyph_renderer_view = await build_view(glyph_renderer, {parent: plot_view})

  const draw_tool = new FreehandDrawTool({
    active: true,
    default_overrides: {z: "Test"},
    renderers: [glyph_renderer],
  })
  plot.add_tools(draw_tool)
  await plot_view.ready

  const draw_tool_view = plot_view.owner.get_one(draw_tool)
  plot_view.renderer_views.set(glyph_renderer, glyph_renderer_view)
  sinon.stub(glyph_renderer_view, "set_data")

  return {
    data,
    data_source,
    draw_tool_view,
    glyph_view: glyph_renderer_view.glyph as PatchesView,
  }
}

describe("FreehandDrawTool", () => {

  describe("Model", () => {

    it("should create proper tooltip", () => {
      const tool0 = new FreehandDrawTool()
      expect(tool0.tooltip).to.be.equal("Freehand Draw Tool")

      const tool1 = new FreehandDrawTool({description: "My Freehand Draw"})
      expect(tool1.tooltip).to.be.equal("My Freehand Draw")
    })
  })

  describe("View", () => {

    it("should select patches on tap", async () => {
      const testcase = await make_testcase()
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")
      hit_test_stub.returns(new Selection({indices: [1]}))

      const tap_event = make_tap_event(300, 300)
      testcase.draw_tool_view._tap(tap_event)

      expect(testcase.data_source.selected.indices).to.be.equal([1])
    })

    it("should select multiple patches on shift-tap", async () => {
      const testcase = await make_testcase()
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")
      hit_test_stub.returns(new Selection({indices: [1]}))

      let tap_event = make_tap_event(300, 300)
      testcase.draw_tool_view._tap(tap_event)
      hit_test_stub.returns(new Selection({indices: [0]}))
      tap_event = make_tap_event(560, 560, true)
      testcase.draw_tool_view._tap(tap_event)

      expect(testcase.data_source.selected.indices).to.be.equal([1, 0])
    })

    it("should delete selected on delete key", async () => {
      const testcase = await make_testcase()
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")
      hit_test_stub.returns(new Selection({indices: [1]}))

      const tap_event = make_tap_event(300, 300)
      testcase.draw_tool_view._tap(tap_event)

      const moveenter_event = make_move_event(300, 300)
      const keyup_event = make_key_event("Backspace")
      testcase.draw_tool_view._move_enter(moveenter_event)
      testcase.draw_tool_view._keyup(keyup_event)

      expect(testcase.data_source.selected.indices).to.be.equal([])
      expect(testcase.data_source.data).to.be.equal({
        xs: [[0, 0.5, 1]],
        ys: [[0, -0.5, -1]],
        z: [null],
      })
    })

    it("should clear selection on escape key", async () => {
      const testcase = await make_testcase()
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")
      hit_test_stub.returns(new Selection({indices: [1]}))

      const tap_event = make_tap_event(300, 300)
      testcase.draw_tool_view._tap(tap_event)

      const moveenter_event = make_move_event(300, 300)
      const keyup_event = make_key_event("Escape")
      testcase.draw_tool_view._move_enter(moveenter_event)
      testcase.draw_tool_view._keyup(keyup_event)

      expect(testcase.data_source.selected.indices).to.be.equal([])
      expect(testcase.data_source.data).to.be.equal(testcase.data)
    })

    it("should draw patch on drag", async () => {
      const testcase = await make_testcase()
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")

      hit_test_stub.returns(null)
      testcase.draw_tool_view._pan_start(make_pan_event(300, 300))
      testcase.draw_tool_view._pan(make_pan_event(290, 290))
      testcase.draw_tool_view._pan_end(make_pan_event(290, 290))
      const new_xs = [0.04424778761061947, 0.008849557522123894, 0.008849557522123894]
      const new_ys = [-0, 0.03389830508474576, 0.03389830508474576]
      const xdata = [[0, 0.5, 1], [0, 0.5, 1], new_xs]
      const ydata = [[0, -0.5, -1], [0, -0.5, -1], new_ys]
      expect(testcase.data_source.data).to.be.equal({
        xs: xdata,
        ys: ydata,
        z: [null, null, "Test"],
      })
    })

    it("should draw and pop patch on drag", async () => {
      const testcase = await make_testcase()
      testcase.draw_tool_view.model.num_objects = 1
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")

      hit_test_stub.returns(null)
      testcase.draw_tool_view._pan_start(make_pan_event(300, 300))
      testcase.draw_tool_view._pan(make_pan_event(290, 290))
      testcase.draw_tool_view._pan_end(make_pan_event(290, 290))

      const xdata = [[0.04424778761061947, 0.008849557522123894, 0.008849557522123894]]
      const ydata = [[-0, 0.03389830508474576, 0.03389830508474576]]
      expect(testcase.data_source.data).to.be.equal({
        xs: xdata,
        ys: ydata,
        z: ["Test"],
      })
    })

    it("should insert default_overrides on other columns", async () => {
      const testcase = await make_testcase()
      const hit_test_stub = sinon.stub(testcase.glyph_view, "hit_test")

      hit_test_stub.returns(null)
      testcase.draw_tool_view._pan_start(make_pan_event(300, 300))
      testcase.draw_tool_view._pan(make_pan_event(290, 290))
      testcase.draw_tool_view._pan_end(make_pan_event(290, 290))

      expect(testcase.data_source.data).to.be.similar({
        xs: [[0, 0.5, 1], [0, 0.5, 1], [0.04424778761061947, 0.008849557522123894, 0.008849557522123894]],
        ys: [[0, -0.5, -1], [0, -0.5, -1], [0, 0.03389830508474576, 0.03389830508474576]],
        z: [null, null, "Test"],
      })
    })

    it("should not draw poly on doubletap when tool inactive", async () => {
      const testcase = await make_testcase()
      testcase.draw_tool_view.model.active = false

      testcase.draw_tool_view._pan_start(make_pan_event(300, 300))
      testcase.draw_tool_view._pan(make_pan_event(290, 290))
      testcase.draw_tool_view._pan_end(make_pan_event(290, 290))

      const xdata = [[0, 0.5, 1], [0, 0.5, 1]]
      const ydata = [[0, -0.5, -1], [0, -0.5, -1]]

      expect(testcase.data_source.data).to.be.equal({
        xs: xdata,
        ys: ydata,
        z: [null, null],
      })
    })
  })
})
