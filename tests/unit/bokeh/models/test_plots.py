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

# Standard library imports
from math import isnan
from unittest import mock
from unittest.mock import MagicMock, patch

# External imports
import xyzservices.providers as xyz

# Bokeh imports
from bokeh.core.validation import check_integrity, process_validation_issues
from bokeh.core.validation.check import ValidationIssue, ValidationIssues
from bokeh.models import (
    CategoricalScale,
    CustomJS,
    DataRange1d,
    FactorRange,
    GlyphRenderer,
    Grid,
    Label,
    LinearAxis,
    LinearScale,
    LogScale,
    PanTool,
    Plot,
    Range1d,
    ResetTool,
    Title,
    WMTSTileSource,
    ZoomInTool,
    ZoomOutTool,
)
from bokeh.plotting import figure

# Module under test
import bokeh.models.plots as bmp # isort:skip

#-----------------------------------------------------------------------------
# Setup
#-----------------------------------------------------------------------------

_LEGEND_EMPTY_WARNING = """
You are attempting to set `plot.legend.location` on a plot that has zero legends added, this will have no effect.

Before legend properties can be set, you must add a Legend explicitly, or call a glyph method with a legend parameter set.
"""

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------


class TestPlotLegendProperty:
    def test_basic(self) -> None:
        plot = figure(tools='')
        x = plot.legend
        assert isinstance(x, bmp._list_attr_splat)
        assert len(x) == 0
        plot.scatter([1,2], [3,4], legend_label="foo")
        x = plot.legend
        assert isinstance(x, bmp._list_attr_splat)
        assert len(x) == 1

    def test_warning(self) -> None:
        plot = figure(tools='')
        with pytest.warns(UserWarning) as warns:
            plot.legend.location = "above"
            assert len(warns) == 1
            assert warns[0].message.args[0] == _LEGEND_EMPTY_WARNING


class TestPlotSelect:
    def setup_method(self):
        self._plot = figure(tools='pan')
        self._plot.scatter([1,2,3], [3,2,1], name='foo')

    @patch('bokeh.models.plots.find')
    def test_string_arg(self, mock_find: MagicMock) -> None:
        self._plot.select('foo')
        assert mock_find.called
        assert mock_find.call_args[0][1] == dict(name='foo')

    @patch('bokeh.models.plots.find')
    def test_type_arg(self, mock_find: MagicMock) -> None:
        self._plot.select(PanTool)
        assert mock_find.called
        assert mock_find.call_args[0][1] == dict(type=PanTool)

    @patch('bokeh.models.plots.find')
    def test_kwargs(self, mock_find: MagicMock) -> None:
        kw = dict(name='foo', type=GlyphRenderer)
        self._plot.select(**kw)
        assert mock_find.called
        assert mock_find.call_args[0][1] == kw

    @patch('bokeh.models.plots.find')
    def test_single_selector_kwarg(self, mock_find: MagicMock) -> None:
        kw = dict(name='foo', type=GlyphRenderer)
        self._plot.select(selector=kw)
        assert mock_find.called
        assert mock_find.call_args[0][1] == kw

    def test_selector_kwarg_and_extra_kwargs(self) -> None:
        with pytest.raises(TypeError) as exc:
            self._plot.select(selector=dict(foo='foo'), bar='bar')
        assert "when passing 'selector' keyword arg, not other keyword args may be present" == str(exc.value)

    def test_bad_arg_type(self) -> None:
        with pytest.raises(TypeError) as exc:
            self._plot.select(10)
        assert "selector must be a dictionary, string or plot object." == str(exc.value)

    def test_too_many_args(self) -> None:
        with pytest.raises(TypeError) as exc:
            self._plot.select('foo', 'bar')
        assert 'select accepts at most ONE positional argument.' == str(exc.value)

    def test_no_input(self) -> None:
        with pytest.raises(TypeError) as exc:
            self._plot.select()
        assert 'select requires EITHER a positional argument, OR keyword arguments.' == str(exc.value)

    def test_arg_and_kwarg(self) -> None:
        with pytest.raises(TypeError) as exc:
            self._plot.select('foo', type=PanTool)
        assert 'select accepts EITHER a positional argument, OR keyword arguments (not both).' == str(exc.value)


class TestPlotValidation:
    def test_missing_renderers(self) -> None:
        p = figure()
        p.renderers = []
        with mock.patch('bokeh.core.validation.check.log') as mock_logger:
            issues = check_integrity([p])
            process_validation_issues(issues)
        assert mock_logger.warning.call_count == 1
        assert mock_logger.warning.call_args[0][0].startswith("W-1000 (MISSING_RENDERERS): Plot has no renderers")

    def test_missing_scale(self) -> None:
        p = figure()

        with pytest.raises(ValueError):
            p.x_scale = None

        with pytest.raises(ValueError):
            p.y_scale = None

    def test_missing_range(self) -> None:
        p = figure()

        with pytest.raises(ValueError):
            p.x_range = None

        with pytest.raises(ValueError):
            p.y_range = None

    def test_bad_extra_range_name(self) -> None:
        p = figure()
        p.xaxis.x_range_name="junk"
        with mock.patch('bokeh.core.validation.check.log') as mock_logger:
            issues = check_integrity([p])
            process_validation_issues(issues)
        assert mock_logger.error.call_count == 1
        assert mock_logger.error.call_args[0][0].startswith(
            "E-1020 (BAD_EXTRA_RANGE_NAME): An extra range name is configured with a name that does not correspond to any range: x_range_name='junk' [LinearAxis",
        )

        p = figure()
        p.extra_x_ranges['foo'] = Range1d()
        p.grid.x_range_name="junk"
        with mock.patch('bokeh.core.validation.check.log') as mock_logger:
            issues = check_integrity([p])
            process_validation_issues(issues)
        assert mock_logger.error.call_count == 1
        assert mock_logger.error.call_args[0][0].startswith(
            "E-1020 (BAD_EXTRA_RANGE_NAME): An extra range name is configured with a name that does not correspond to any range: x_range_name='junk' [Grid",
        )
        assert mock_logger.error.call_args[0][0].count("Grid") == 2

    def test_bad_extra_range_only_immediate_refs(self) -> None:
        # test whether adding a figure (*and* it's extra ranges)
        # to another's references doesn't create a false positive
        p, dep = figure(), figure()
        dep.extra_x_ranges['foo'] = Range1d()
        dep.grid.x_range_name="foo"
        p.grid[0].js_on_change("dimension", CustomJS(code = "", args = {"toto": dep.grid[0]}))
        with mock.patch('bokeh.core.validation.check.log') as mock_logger:
            issues = check_integrity([p])
            process_validation_issues(issues)
        assert mock_logger.error.call_count == 0

    def test_min_preferred_max_width__issue13716(self):
        p = figure(min_width=100, width=200, max_width=300)
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues()

        p = figure(min_width=100, max_width=300)
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues()

        p = figure(min_width=100, max_width=300, sizing_mode="stretch_width")
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues()

        p = figure(min_width=100, max_width=300, sizing_mode="fixed")
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues(error=[
            ValidationIssue(code=1022, name="MIN_PREFERRED_MAX_WIDTH", text="Expected min_width <= width <= max_width"),
        ])

    def test_min_preferred_max_height__issue13716(self):
        p = figure(min_height=100, height=200, max_height=300)
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues()

        p = figure(min_height=100, max_height=300)
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues()

        p = figure(min_height=100, max_height=300, sizing_mode="stretch_height")
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues()

        p = figure(min_height=100, max_height=300, sizing_mode="fixed")
        p.circle([1, 2, 3], [1, 2, 3])
        issues = check_integrity([p])
        assert issues == ValidationIssues(error=[
            ValidationIssue(code=1023, name="MIN_PREFERRED_MAX_HEIGHT", text="Expected min_height <= height <= max_height"),
        ])


def test_plot_add_layout_raises_error_if_not_render() -> None:
    plot = figure()
    with pytest.raises(ValueError):
        plot.add_layout(Range1d())


def test_plot_add_layout_adds_label_to_plot_renderers() -> None:
    plot = figure()
    label = Label()
    plot.add_layout(label)
    assert label in plot.center


def test_plot_add_layout_adds_axis_to_renderers_and_side_renderers() -> None:
    plot = figure()
    axis = LinearAxis()
    plot.add_layout(axis, 'left')
    assert axis in plot.left


def test_plot_add_layout_moves_an_existing_renderer() -> None:
    plot = figure()
    axis = LinearAxis()

    plot.add_layout(axis, 'left')
    assert axis in plot.left
    assert axis not in plot.right
    assert axis not in plot.above
    assert axis not in plot.below
    assert axis not in plot.center

    plot.add_layout(axis, 'above')
    assert axis not in plot.left
    assert axis not in plot.right
    assert axis in plot.above
    assert axis not in plot.below
    assert axis not in plot.center

def test_plot_add_layout_moves_an_existing_renderer_added_manually() -> None:
    plot = figure()
    axis = LinearAxis()
    grid = Grid()

    plot.left = [axis, grid, axis]
    assert grid in plot.left
    assert axis in plot.left
    assert axis not in plot.right
    assert axis not in plot.above
    assert axis not in plot.below
    assert axis not in plot.center

    plot.add_layout(axis, 'above')
    assert grid in plot.left
    assert axis not in plot.left
    assert axis not in plot.right
    assert axis in plot.above
    assert axis not in plot.below
    assert axis not in plot.center

def test_sizing_mode_property_is_fixed_by_default() -> None:
    plot = figure()
    assert plot.sizing_mode is None


class BaseTwinAxis:
    """Base class for testing extra ranges"""

    def verify_axis(self, axis_name):
        plot = Plot()
        range_obj = getattr(plot, f"extra_{axis_name}_ranges")
        range_obj["foo_range"] = self.get_range_instance()
        assert range_obj["foo_range"]

    def test_x_range(self) -> None:
        self.verify_axis('x')

    def test_y_range(self) -> None:
        self.verify_axis('y')

    @staticmethod
    def get_range_instance():
        raise NotImplementedError


class TestCategoricalTwinAxis(BaseTwinAxis):
    """Test whether extra x and y ranges can be categorical"""

    @staticmethod
    def get_range_instance():
        return FactorRange('foo', 'bar')


class TestLinearTwinAxis(BaseTwinAxis):
    """Test whether extra x and y ranges can be Range1d"""

    @staticmethod
    def get_range_instance():
        return Range1d(0, 42)


def test_plot_with_no_title_specified_creates_an_empty_title() -> None:
    plot = Plot()
    assert plot.title.text == ""


def test_plot_if_title_is_converted_from_string_to_Title() -> None:
    plot = Plot()
    plot.title = "A title"
    plot.title.text_color = "olive"
    assert isinstance(plot.title, Title)
    assert plot.title.text == "A title"
    assert plot.title.text_color == "olive"


def test__check_required_scale_has_scales() -> None:
    plot = Plot()
    check = plot._check_required_scale()
    assert check == []


def test__check_required_scale_missing_scales() -> None:
    with pytest.raises(ValueError):
        Plot(x_scale=None, y_scale=None)


def test__check_compatible_scale_and_ranges_compat_numeric() -> None:
    plot = Plot(x_scale=LinearScale(), x_range=Range1d())
    check = plot._check_compatible_scale_and_ranges()
    assert check == []

    plot = Plot(y_scale=LogScale(), y_range=DataRange1d())
    check = plot._check_compatible_scale_and_ranges()
    assert check == []


def test__check_compatible_scale_and_ranges_compat_factor() -> None:
    plot = Plot(x_scale=CategoricalScale(), x_range=FactorRange())
    check = plot._check_compatible_scale_and_ranges()
    assert check == []


def test__check_compatible_scale_and_ranges_incompat_numeric_scale_and_factor_range() -> None:
    plot = Plot(x_scale=LinearScale(), x_range=FactorRange())
    check = plot._check_compatible_scale_and_ranges()
    assert check != []


def test__check_compatible_scale_and_ranges_incompat_factor_scale_and_numeric_range() -> None:
    plot = Plot(x_scale=CategoricalScale(), x_range=DataRange1d())
    check = plot._check_compatible_scale_and_ranges()
    assert check != []


@pytest.mark.parametrize("test_input, provider", [
    ("OpenStreetMap Mapnik", xyz.OpenStreetMap.Mapnik),
    ("OSM", xyz.OpenStreetMap.Mapnik),
    ("CARTODBPOSITRON", xyz.CartoDB.Positron),
    ("CARTODBPOSITRON_RETINA", xyz.CartoDB.Positron),
    ("STAMEN_TERRAIN", xyz.Stadia.StamenTerrain),
    ("STAMEN_TERRAIN_RETINA", xyz.Stadia.StamenTerrain),
    ("STAMEN_TONER", xyz.Stadia.StamenToner),
    ("STAMEN_TONER_BACKGROUND", xyz.Stadia.StamenTonerBackground),
    ("STAMEN_TONER_LABELS", xyz.Stadia.StamenTonerLabels),
    ("ESRI_IMAGERY", xyz.Esri.WorldImagery),
    (xyz.Stadia.StamenTerrain, xyz.Stadia.StamenTerrain),
    ])
def test_add_tile(test_input, provider):
    plot = figure(x_range=(-2000000, 6000000), y_range=(-1000000, 7000000),
            x_axis_type="mercator", y_axis_type="mercator")
    plot.add_tile(test_input)
    tile_source = plot.renderers[0].tile_source
    sf = "@2x" if "RETINA" in test_input else None
    assert tile_source.url == provider.build_url(scale_factor=sf)
    assert tile_source.attribution == provider.html_attribution
    if hasattr(provider, "max_zoom"):
        assert tile_source.max_zoom == provider.max_zoom

    # test retina keyword
    if "RETINA" not in test_input and "{r}" in provider.url:
        plot2 = figure(x_range=(-2000000, 6000000), y_range=(-1000000, 7000000),
            x_axis_type="mercator", y_axis_type="mercator")
        plot2.add_tile(test_input, retina=True)
        tile_source2 = plot2.renderers[0].tile_source
        assert tile_source2.url == provider.build_url(scale_factor="@2x")

def test_add_tile_tilesource():
    mapnik = xyz.OpenStreetMap.Mapnik
    tilesource = WMTSTileSource(
        url=mapnik.build_url(),
        attribution=mapnik.html_attribution,
        min_zoom=mapnik.get("min_zoom", 0),
        max_zoom=mapnik.get("max_zoom", 30),
    )
    plot = figure(x_range=(-2000000, 6000000), y_range=(-1000000, 7000000),
            x_axis_type="mercator", y_axis_type="mercator")
    plot.add_tile(tilesource)
    tile_source = plot.renderers[0].tile_source

    assert tile_source.url == mapnik.build_url()
    assert tile_source.attribution == mapnik.html_attribution

def test_Plot_add_tools() -> None:
    plot = Plot()
    assert len(plot.tools) == 0

    pan = PanTool()
    plot.add_tools(pan)
    assert plot.tools == [pan]

    zoom_in = ZoomInTool()
    zoom_out = ZoomOutTool()

    plot.add_tools("reset", zoom_in, zoom_out)
    assert plot.tools[0] == pan
    assert isinstance(plot.tools[1], ResetTool)
    assert plot.tools[2:] == [zoom_in, zoom_out]

    with pytest.raises(ValueError):
        plot.add_tools("foobar")

    with pytest.raises(ValueError):
        plot.add_tools(0)

def test_remove_tools_single():
    pan = PanTool()
    reset = ResetTool()
    plot = Plot(tools=[pan, reset])

    plot.remove_tools(pan)
    assert len(plot.tools) == 1
    assert plot.tools[0] == reset

def test_remove_tools_multiple():
    pan = PanTool()
    reset = ResetTool()
    plot = Plot(tools=[pan, reset])

    plot.remove_tools(pan, reset)
    assert len(plot.tools) == 0

def test_remove_tools_invalid():
    pan = PanTool()
    reset = ResetTool()
    plot = Plot(tools=[pan, reset])
    zoom_in = ZoomInTool()

    with pytest.raises(ValueError) as e:
        plot.remove_tools(zoom_in)
        assert str(e.value).startswith("ValueError: Invalid tool ZoomInTool")

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------


class Test_list_attr_splat:
    def test_set(self) -> None:
        obj = bmp._list_attr_splat([DataRange1d(), DataRange1d()])
        assert len(obj) == 2
        assert isnan(obj[0].start)
        assert isnan(obj[1].start)
        obj.start = 10
        assert obj[0].start == 10
        assert obj[1].start == 10

    def test_set_empty(self) -> None:
        obj = bmp._list_attr_splat([])
        assert len(obj) == 0
        obj.start = 10
        assert len(obj) == 0

    def test_get_set_single(self) -> None:
        p = figure()
        assert len(p.xaxis) == 1

        # check both ways to access
        assert p.xaxis.formatter.power_limit_low != 100
        assert p.xaxis[0].formatter.power_limit_low != 100

        p.axis.formatter.power_limit_low = 100

        assert p.xaxis.formatter.power_limit_low == 100
        assert p.xaxis[0].formatter.power_limit_low == 100

    def test_get_set_multi(self) -> None:
        p = figure()
        assert len(p.axis) == 2

        # check both ways to access
        assert p.axis[0].formatter.power_limit_low != 100
        assert p.axis[1].formatter.power_limit_low != 100
        assert p.axis.formatter[0].power_limit_low != 100
        assert p.axis.formatter[1].power_limit_low != 100

        p.axis.formatter.power_limit_low = 100

        assert p.axis[0].formatter.power_limit_low == 100
        assert p.axis[1].formatter.power_limit_low == 100
        assert p.axis.formatter[0].power_limit_low == 100
        assert p.axis.formatter[1].power_limit_low == 100

    def test_get_set_multi_mismatch(self) -> None:
        obj = bmp._list_attr_splat([LinearAxis(), FactorRange()])
        with pytest.raises(AttributeError) as e:
            obj.formatter.power_limit_low == 10
        assert str(e.value).endswith(f"list items have no {'formatter'!r} attribute")

    def test_get_empty(self) -> None:
        obj = bmp._list_attr_splat([])
        with pytest.raises(AttributeError) as e:
            obj.start
        assert str(e.value).endswith(f"Trying to access {'start'!r} attribute on an empty 'splattable' list")

    def test_get_index(self) -> None:
        obj = bmp._list_attr_splat([1, 2, 3])
        assert obj.index(2) == 1

    def test_pop_value(self) -> None:
        obj = bmp._list_attr_splat([1, 2, 3])
        obj.pop(1)
        assert obj == [1, 3]

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------
