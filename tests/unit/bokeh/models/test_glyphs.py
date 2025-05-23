#-----------------------------------------------------------------------------
# Copyright (c) Anaconda, Inc., and Bokeh Contributors.
# All rights reserved.
#
# The full license is in the file LICENSE.txt, distributed with this software.
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Boilerplate
#-----------------------------------------------------------------------------
from __future__ import annotations # isort:skip

import pytest ; pytest

#-----------------------------------------------------------------------------
# Imports
#-----------------------------------------------------------------------------

# Bokeh imports
import bokeh.models.glyphs as m  # module under test
from bokeh.core.enums import (
    Anchor,
    AngleUnits,
    ButtonType,
    DashPattern,
    Dimension,
    Direction,
    FontStyle,
    LegendLocation,
    LineCap,
    LineDash,
    LineJoin,
    Location,
    MapType,
    NamedColor as Color,
    TextAlign,
    TextBaseline,
)
from bokeh.core.property.vectorization import field, value

from _util_models import (
    BACKGROUND_FILL,
    BACKGROUND_HATCH,
    BORDER_LINE,
    FILL,
    GLYPH,
    HATCH,
    LINE,
    TEXT,
    check_fill_properties,
    check_hatch_properties,
    check_line_properties,
    check_properties_existence,
    check_text_properties,
)

#-----------------------------------------------------------------------------
# Setup
#-----------------------------------------------------------------------------


# fool linters
(LineJoin, LineDash, LineCap, FontStyle, TextAlign, TextBaseline, Direction,
 AngleUnits, Dimension, Anchor, Location, LegendLocation,
 DashPattern, ButtonType, MapType, Color)

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------

def test_AnnularWedge() -> None:
    glyph = m.AnnularWedge()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.inner_radius == field("inner_radius")
    assert glyph.outer_radius == field("outer_radius")
    assert glyph.start_angle == field("start_angle")
    assert glyph.end_angle == field("end_angle")
    assert glyph.direction == "anticlock"
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "inner_radius",
        "inner_radius_units",
        "outer_radius",
        "outer_radius_units",
        "start_angle",
        "start_angle_units",
        "end_angle",
        "end_angle_units",
        "direction",
    ], LINE, FILL, HATCH, GLYPH)


def test_Annulus() -> None:
    glyph = m.Annulus()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.inner_radius == field("inner_radius")
    assert glyph.outer_radius == field("outer_radius")
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "inner_radius",
        "inner_radius_units",
        "outer_radius",
        "outer_radius_units",
    ], LINE, FILL, HATCH, GLYPH)


def test_Arc() -> None:
    glyph = m.Arc()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.radius == field("radius")
    assert glyph.start_angle == field("start_angle")
    assert glyph.end_angle == field("end_angle")
    assert glyph.direction == "anticlock"
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "radius",
        "radius_units",
        "start_angle",
        "start_angle_units",
        "end_angle",
        "end_angle_units",
        "direction",
    ], LINE, GLYPH)


def test_Bezier() -> None:
    glyph = m.Bezier()
    assert glyph.x0 == field("x0")
    assert glyph.y0 == field("y0")
    assert glyph.x1 == field("x1")
    assert glyph.y1 == field("y1")
    assert glyph.cx0 == field("cx0")
    assert glyph.cy0 == field("cy0")
    assert glyph.cx1 == field("cx1")
    assert glyph.cy1 == field("cy1")
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x0",
        "y0",
        "x1",
        "y1",
        "cx0",
        "cy0",
        "cx1",
        "cy1",
    ], LINE, GLYPH)


def test_Block() -> None:
    glyph = m.Block()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.width == 1
    assert glyph.height == 1
    assert glyph.border_radius == 0
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "width",
        "width_units",
        "height",
        "height_units",
        "border_radius",
    ], FILL, HATCH, LINE, GLYPH)


def test_HArea() -> None:
    glyph = m.HArea()
    assert glyph.y == field("y")
    assert glyph.x1 == field("x1")
    assert glyph.x2 == field("x2")
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "y",
        "x1",
        "x2",
    ], FILL, HATCH, GLYPH)


def test_HAreaStep() -> None:
    glyph = m.HAreaStep()
    assert glyph.x1 == field("x1")
    assert glyph.x2 == field("x2")
    assert glyph.y == field("y")
    assert glyph.step_mode == "before"
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x1",
        "x2",
        "y",
        "step_mode",
    ], FILL, HATCH, GLYPH)


def test_HBar() -> None:
    glyph = m.HBar()
    assert glyph.y == field("y")
    assert glyph.height == 1
    assert glyph.left == 0
    assert glyph.right == field("right")
    assert glyph.border_radius == 0
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "y",
        "height",
        "height_units",
        "left",
        "right",
        "border_radius",
    ], FILL, HATCH, LINE, GLYPH)


def test_Image() -> None:
    glyph = m.Image()
    assert glyph.image == field("image")
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.dw == field("dw")
    assert glyph.dh == field("dh")
    assert glyph.dilate is False
    check_properties_existence(glyph, [
        "image",
        "x",
        "y",
        "dw",
        "dw_units",
        "dh",
        "dh_units",
        "global_alpha",
        "dilate",
        "origin",
        "anchor",
        "color_mapper",
    ], GLYPH)

def test_Image_kwargs() -> None:
    glyph = m.Image(x=0, y=0, dw=10, dh=10)
    assert glyph.image == field("image")
    assert glyph.x == 0
    assert glyph.y == 0
    assert glyph.dw == 10
    assert glyph.dh == 10
    assert glyph.dilate is False


def test_ImageRGBA() -> None:
    glyph = m.ImageRGBA()
    assert glyph.image == field("image")
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.dw == field("dw")
    assert glyph.dh == field("dh")
    assert glyph.dilate is False
    check_properties_existence(glyph, [
        "image",
        "x",
        "y",
        "dw",
        "dw_units",
        "dh",
        "dh_units",
        "global_alpha",
        "dilate",
        "origin",
        "anchor",
    ], GLYPH)


def test_ImageStack() -> None:
    glyph = m.ImageStack()
    assert glyph.image == field("image")
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.dw == field("dw")
    assert glyph.dh == field("dh")
    assert glyph.dilate is False
    check_properties_existence(glyph, [
        "image",
        "x",
        "y",
        "dw",
        "dw_units",
        "dh",
        "dh_units",
        "global_alpha",
        "dilate",
        "origin",
        "anchor",
        "color_mapper",
    ], GLYPH)

def test_ImageStack_kwargs() -> None:
    glyph = m.Image(x=0, y=0, dw=10, dh=10)
    assert glyph.image == field("image")
    assert glyph.x == 0
    assert glyph.y == 0
    assert glyph.dw == 10
    assert glyph.dh == 10
    assert glyph.dilate is False


def test_ImageURL() -> None:
    glyph = m.ImageURL()
    assert glyph.url == field("url")
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.w is None
    assert glyph.h is None
    assert glyph.angle == 0
    assert glyph.dilate is False
    assert glyph.anchor == Anchor.top_left
    assert glyph.retry_attempts == 0
    assert glyph.retry_timeout == 0
    assert glyph.global_alpha == 1.0
    check_properties_existence(glyph, [
        "url",
        "x",
        "y",
        "w",
        "w_units",
        "h",
        "h_units",
        "angle",
        "angle_units",
        "dilate",
        "anchor",
        "retry_attempts",
        "retry_timeout",
        "global_alpha",
    ], GLYPH)


def test_Line() -> None:
    glyph = m.Line()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
    ], LINE, GLYPH)


def test_MultiLine() -> None:
    glyph = m.MultiLine()
    assert glyph.xs == field("xs")
    assert glyph.ys == field("ys")
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "xs",
        "ys",
    ], LINE, GLYPH)


def test_MultiPolygons() -> None:
    glyph = m.MultiPolygons()
    assert glyph.xs == field("xs")
    assert glyph.ys == field("ys")
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "xs",
        "ys",
    ], FILL, HATCH, LINE, GLYPH)


def test_Patch() -> None:
    glyph = m.Patch()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
    ], FILL, HATCH, LINE, GLYPH)


def test_Patches() -> None:
    glyph = m.Patches()
    assert glyph.xs == field("xs")
    assert glyph.ys == field("ys")
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "xs",
        "ys",
    ], FILL, HATCH, LINE, GLYPH)


def test_Quad() -> None:
    glyph = m.Quad()
    assert glyph.left == field("left")
    assert glyph.right == field("right")
    assert glyph.bottom == field("bottom")
    assert glyph.top == field("top")
    assert glyph.border_radius == 0
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "left",
        "right",
        "bottom",
        "top",
        "border_radius",
    ], FILL, HATCH, LINE, GLYPH)


def test_Quadratic() -> None:
    glyph = m.Quadratic()
    assert glyph.x0 == field("x0")
    assert glyph.y0 == field("y0")
    assert glyph.x1 == field("x1")
    assert glyph.y1 == field("y1")
    assert glyph.cx == field("cx")
    assert glyph.cy == field("cy")
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x0",
        "y0",
        "x1",
        "y1",
        "cx",
        "cy",
    ], LINE, GLYPH)


def test_MathMLGlyph() -> None:
    glyph = m.MathMLGlyph()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.text == field("text")
    assert glyph.angle == 0
    assert glyph.x_offset == 0
    assert glyph.y_offset == 0
    assert glyph.anchor == value("auto")
    assert glyph.padding == 0
    assert glyph.border_radius == 0
    assert glyph.outline_shape == "box"
    check_text_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "text",
        "angle",
        "angle_units",
        "x_offset",
        "y_offset",
        "anchor",
        "padding",
        "border_radius",
        "outline_shape",
    ], TEXT, BORDER_LINE, BACKGROUND_FILL, BACKGROUND_HATCH, GLYPH)


def test_Ray() -> None:
    glyph = m.Ray()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.angle == 0
    assert glyph.length == 0
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "angle",
        "angle_units",
        "length",
        "length_units",
    ], LINE, GLYPH)


def test_Rect() -> None:
    glyph = m.Rect()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.width == field("width")
    assert glyph.height == field("height")
    assert glyph.angle == 0
    assert glyph.border_radius == 0
    assert glyph.dilate is False
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "width",
        "width_units",
        "height",
        "height_units",
        "angle",
        "angle_units",
        "border_radius",
        "dilate",
    ], LINE, FILL, HATCH, GLYPH)


def test_Segment() -> None:
    glyph = m.Segment()
    assert glyph.x0 == field("x0")
    assert glyph.y0 == field("y0")
    assert glyph.x1 == field("x1")
    assert glyph.y1 == field("y1")
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x0",
        "y0",
        "x1",
        "y1",
    ], LINE, GLYPH)


def test_Step() -> None:
    glyph = m.Step()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.mode == "before"
    check_line_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "mode",
    ], LINE, GLYPH)


def test_Text() -> None:
    glyph = m.Text()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.text == field("text")
    assert glyph.angle == 0
    assert glyph.x_offset == 0
    assert glyph.y_offset == 0
    assert glyph.anchor == value("auto")
    assert glyph.padding == 0
    assert glyph.border_radius == 0
    assert glyph.outline_shape == "box"
    check_text_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "text",
        "angle",
        "angle_units",
        "x_offset",
        "y_offset",
        "anchor",
        "padding",
        "border_radius",
        "outline_shape",
    ], TEXT, BORDER_LINE, BACKGROUND_FILL, BACKGROUND_HATCH, GLYPH)


def test_TeXGlyph() -> None:
    glyph = m.TeXGlyph()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.text == field("text")
    assert glyph.angle == 0
    assert glyph.x_offset == 0
    assert glyph.y_offset == 0
    assert glyph.anchor == value("auto")
    assert glyph.padding == 0
    assert glyph.border_radius == 0
    assert glyph.outline_shape == "box"
    assert glyph.display == "auto"
    assert glyph.macros == {}
    check_text_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "text",
        "angle",
        "angle_units",
        "x_offset",
        "y_offset",
        "anchor",
        "padding",
        "border_radius",
        "outline_shape",
        "display",
        "macros",
    ], TEXT, BORDER_LINE, BACKGROUND_FILL, BACKGROUND_HATCH, GLYPH)


def test_VArea() -> None:
    glyph = m.VArea()
    assert glyph.x == field("x")
    assert glyph.y1 == field("y1")
    assert glyph.y2 == field("y2")
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y1",
        "y2",
    ], FILL, HATCH, GLYPH)


def test_VAreaStep() -> None:
    glyph = m.VAreaStep()
    assert glyph.x == field("x")
    assert glyph.y1 == field("y1")
    assert glyph.y2 == field("y2")
    assert glyph.step_mode == "before"
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y1",
        "y2",
        "step_mode",
    ], FILL, HATCH, GLYPH)


def test_VBar() -> None:
    glyph = m.VBar()
    assert glyph.x == field("x")
    assert glyph.width == 1
    assert glyph.top == field("top")
    assert glyph.bottom == 0
    assert glyph.border_radius == 0
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "width",
        "width_units",
        "top",
        "bottom",
        "border_radius",
    ], FILL, HATCH, LINE, GLYPH)


def test_Wedge() -> None:
    glyph = m.Wedge()
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.radius == field("radius")
    assert glyph.start_angle == field("start_angle")
    assert glyph.end_angle == field("end_angle")
    assert glyph.direction == "anticlock"
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "radius",
        "radius_units",
        "start_angle",
        "start_angle_units",
        "end_angle",
        "end_angle_units",
        "direction",
    ], LINE, FILL, HATCH, GLYPH)


def test_Circle() -> None:
    glyph = m.Circle(radius=10)
    assert glyph.x == field("x")
    assert glyph.y == field("y")
    assert glyph.radius == 10
    check_line_properties(glyph)
    check_fill_properties(glyph)
    check_hatch_properties(glyph)
    check_properties_existence(glyph, [
        "x",
        "y",
        "radius",
        "radius_units",
        "radius_dimension",
        "hit_dilation",
    ], LINE, FILL, HATCH, GLYPH)

# regression: https://github.com/bokeh/bokeh/issues/14082
def test_Circle_XYGlpyh() -> None:
    assert issubclass(m.Circle, m.XYGlyph)

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------
