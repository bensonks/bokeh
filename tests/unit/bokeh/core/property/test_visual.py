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
import base64
import datetime
import tempfile
from io import BytesIO
from pathlib import Path
from typing import Literal
from urllib.parse import quote

# External imports
import numpy as np
import PIL.Image

# Bokeh imports
from bokeh.core.enums import MarkerType, ToolIcon
from bokeh.core.has_props import HasProps
from tests.support.util.api import verify_all

from _util_property import _TestHasProps, _TestModel

# Module under test
import bokeh.core.property.visual as bcpv # isort:skip

#-----------------------------------------------------------------------------
# Setup
#-----------------------------------------------------------------------------

ALL = (
    'CSSLength',
    'DashPattern',
    'FontSize',
    'HatchPatternType',
    'Image',
    'MinMaxBounds',
    'MarkerType',
)

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------

class Foo(HasProps):
    pat = bcpv.DashPattern()

class TestDashPattern:
    def test_valid_named(self) -> None:
        f = Foo()

        assert f.pat == []
        f.pat = "solid"
        assert f.pat == []
        f.pat = "dashed"
        assert f.pat == [6]
        f.pat = "dotted"
        assert f.pat == [2, 4]
        f.pat = "dotdash"
        assert f.pat == [2, 4, 6, 4]
        f.pat = "dashdot"
        assert f.pat == [6, 4, 2, 4]

    def test_valid_string(self) -> None:
        f = Foo()

        f.pat = ""
        assert f.pat == []
        f.pat = "2"
        assert f.pat == [2]
        f.pat = "2 4"
        assert f.pat == [2, 4]
        f.pat = "2 4 6"
        assert f.pat == [2, 4, 6]

        with pytest.raises(ValueError):
            f.pat = "abc 6"

    def test_valid_list(self) -> None:
        f = Foo()

        f.pat = ()
        assert f.pat == ()
        f.pat = (2,)
        assert f.pat == (2,)
        f.pat = (2, 4)
        assert f.pat == (2, 4)
        f.pat = (2, 4, 6)
        assert f.pat == (2, 4, 6)

        with pytest.raises(ValueError):
            f.pat = (2, 4.2)
        with pytest.raises(ValueError):
            f.pat = (2, "a")

    def test_valid(self) -> None:
        prop = bcpv.DashPattern()

        assert prop.is_valid("")
        assert prop.is_valid(())
        assert prop.is_valid([])

        assert prop.is_valid("solid")
        assert prop.is_valid("dashed")
        assert prop.is_valid("dotted")
        assert prop.is_valid("dotdash")
        assert prop.is_valid("dashdot")

        assert prop.is_valid([1, 2, 3])
        assert prop.is_valid("1 2 3")


    def test_invalid(self) -> None:
        prop = bcpv.DashPattern()

        assert not prop.is_valid(None)
        assert not prop.is_valid(False)
        assert not prop.is_valid(True)
        assert not prop.is_valid(0)
        assert not prop.is_valid(1)
        assert not prop.is_valid(0.0)
        assert not prop.is_valid(1.0)
        assert not prop.is_valid(1.0+1.0j)

        assert not prop.is_valid("foo")
        assert not prop.is_valid("DASHDOT")

        assert not prop.is_valid([1, 2, 3.0])
        assert not prop.is_valid("1 2 x")

        assert not prop.is_valid(_TestHasProps())
        assert not prop.is_valid(_TestModel())

    def test_has_ref(self) -> None:
        prop = bcpv.DashPattern()
        assert not prop.has_ref

    def test_str(self) -> None:
        prop = bcpv.DashPattern()
        assert str(prop) == "DashPattern"

css_units = "%|em|ex|ch|ic|rem|vw|vh|vi|vb|vmin|vmax|cm|mm|q|in|pc|pt|px"


class Test_FontSize:
    def test_valid(self) -> None:
        prop = bcpv.FontSize()

        for unit in css_units.split("|"):
            v = f"10{unit}"
            assert prop.is_valid(v)

            v = f"10.2{unit}"
            assert prop.is_valid(v)

        for unit in css_units.upper().split("|"):
            v = f"10{unit}"
            assert prop.is_valid(v)

            v = f"10.2{unit}"
            assert prop.is_valid(v)

    def test_invalid(self) -> None:
        prop = bcpv.FontSize()

        for unit in css_units.split("|"):
            v = f"_10{unit}"
            assert not prop.is_valid(v)

            v = f"_10.2{unit}"
            assert not prop.is_valid(v)

        for unit in css_units.upper().split("|"):
            v = f"_10{unit}"
            assert not prop.is_valid(v)

            v = f"_10.2{unit}"
            assert not prop.is_valid(v)

        assert not prop.is_valid(None)
        assert not prop.is_valid(False)
        assert not prop.is_valid(True)
        assert not prop.is_valid(0)
        assert not prop.is_valid(1)
        assert not prop.is_valid(0.0)
        assert not prop.is_valid(1.0)
        assert not prop.is_valid(1.0+1.0j)
        assert not prop.is_valid("")
        assert not prop.is_valid(())
        assert not prop.is_valid([])
        assert not prop.is_valid({})
        assert not prop.is_valid(_TestHasProps())
        assert not prop.is_valid(_TestModel())

    def test_has_ref(self) -> None:
        prop = bcpv.FontSize()
        assert not prop.has_ref

    def test_str(self) -> None:
        prop = bcpv.FontSize()
        assert str(prop) == "FontSize"


class Test_Image:
    def test_default_creation(self) -> None:
        bcpv.Image()

    def test_validate_None(self) -> None:
        prop = bcpv.Image()
        assert not prop.is_valid(None)

    def test_validate_data_urls(self) -> None:
        prop = bcpv.Image()
        assert prop.is_valid("data:image/png;base64,")
        assert prop.is_valid("data:image/svg+xml;utf8,")

    def test_validate_urls(self) -> None:
        prop = bcpv.Image()
        assert prop.is_valid("http://static.bokeh.org/branding/logos/bokeh-logo.svg")
        assert prop.is_valid("https://static.bokeh.org/branding/logos/bokeh-logo.svg")

    def test_validate_Path(self) -> None:
        prop = bcpv.Image()
        assert prop.is_valid(Path("some/path"))

    def test_validate_raw_path(self) -> None:
        prop = bcpv.Image()
        assert prop.is_valid("some/path")

    @pytest.mark.parametrize('typ', ('png', 'gif', 'tiff'))
    def test_validate_PIL(self, typ) -> None:
        file = BytesIO()
        image = PIL.Image.new('RGBA', size=(50, 50), color=(155, 0, 0))
        image.save(file, typ)
        prop = bcpv.Image()
        assert prop.is_valid(image)

    def test_validate_numpy_RGB(self) -> None:
        data = np.zeros((50, 50, 3), dtype=np.uint8)
        data[:, 30:35] = [255, 0, 0]
        prop = bcpv.Image()
        assert prop.is_valid(data)

    def test_validate_numpy_RGBA(self) -> None:
        data = np.zeros((50, 50, 4), dtype=np.uint8)
        data[:, 30:35] = [255, 0, 0, 255]
        prop = bcpv.Image()
        assert prop.is_valid(data)

    def test_validate_invalid(self) -> None:
        prop = bcpv.Image()
        assert not prop.is_valid(10)
        assert not prop.is_valid(True)
        assert not prop.is_valid(False)
        assert not prop.is_valid([])
        assert not prop.is_valid({})
        assert not prop.is_valid(set())

        data = np.zeros((50, 50, 2), dtype=np.uint8)
        assert not prop.is_valid(data)

        data = np.zeros((50, 50), dtype=np.uint8)
        assert not prop.is_valid(data)

    def test_transform_data_url(self) -> None:
        prop = bcpv.Image()
        image = "data:image/png;base64,"
        assert prop.transform(image) == image

    def test_transform_path(self) -> None:
        with tempfile.TemporaryDirectory() as dir:
            path = Path(dir) / "image.png"
            image = PIL.Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
            image.save(path, "png")
            prop = bcpv.Image()
            assert prop.transform(path).startswith("data:image/png")

    def test_transform_file(self) -> None:
        with tempfile.NamedTemporaryFile() as file:
            image = PIL.Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
            image.save(file, "png")
            prop = bcpv.Image()
            assert prop.transform(file).startswith("data:image/png")

    def test_transform_svg_file(self) -> None:
        with tempfile.TemporaryDirectory() as dir:
            svg = """
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="6" />
</svg>
"""
            path = Path(dir) / "Test_Image__test_transform_svg_file.svg"
            with path.open(mode="w") as file:
                file.write(svg)
            prop = bcpv.Image()
            assert prop.transform(path) == f"data:image/svg+xml;utf8,{quote(svg)}"

    def test_transform_string(self) -> None:
        prop = bcpv.Image()
        image = ToolIcon.zoom_in
        assert prop.transform(image) == image

    def test_transform_numpy(self) -> None:
        image_type = "png"
        data = np.zeros((50, 50, 3), dtype=np.uint8)
        data[:, 30:35] = [255, 0, 0]
        value = PIL.Image.fromarray(data)
        out = BytesIO()
        value.save(out, image_type)
        expected = f"data:image/{image_type};base64," + base64.b64encode(out.getvalue()).decode('ascii')

        prop = bcpv.Image()
        assert prop.transform(data) == expected

    @pytest.mark.parametrize('image_type', ('png', 'gif', 'tiff'))
    def test_transform_PIL(self, image_type: Literal["png", "gif", "tiff"]) -> None:
        image = PIL.Image.new("RGBA", size=(50, 50), color=(155, 0, 0))
        out0 = BytesIO()
        image.save(out0, image_type)

        value = PIL.Image.open(out0)
        out1 = BytesIO()
        value.save(out1, image_type)
        expected = f"data:image/{image_type};base64," + base64.b64encode(out1.getvalue()).decode('ascii')

        prop = bcpv.Image()
        assert prop.transform(value) == expected

    def test_transform_bad(self) -> None:
        prop = bcpv.Image()
        with pytest.raises(ValueError):
            assert prop.transform(10)

    def test_has_ref(self) -> None:
        prop = bcpv.Image()
        assert not prop.has_ref

    def test_str(self) -> None:
        prop = bcpv.Image()
        assert str(prop) == "Image"


class Test_MinMaxBounds:
    def test_valid_no_datetime(self) -> None:
        prop = bcpv.MinMaxBounds(accept_datetime=False)

        assert prop.is_valid('auto')
        assert prop.is_valid((12, 13))
        assert prop.is_valid((-32, -13))
        assert prop.is_valid((12.1, 13.1))
        assert prop.is_valid((None, 13.1))
        assert prop.is_valid((-22, None))

    def test_invalid_no_datetime(self) -> None:
        prop = bcpv.MinMaxBounds(accept_datetime=False)

        assert not prop.is_valid(None)
        assert not prop.is_valid('string')
        assert not prop.is_valid(12)
        assert not prop.is_valid(('a', 'b'))
        assert not prop.is_valid((13, 12))
        assert not prop.is_valid((13.1, 12.2))
        assert not prop.is_valid((datetime.date(2012, 10, 1), datetime.date(2012, 12, 2)))

    def test_MinMaxBounds_with_datetime(self) -> None:
        prop = bcpv.MinMaxBounds(accept_datetime=True)

        assert prop.is_valid((datetime.datetime(2012, 10, 1), datetime.datetime(2012, 12, 2)))

        assert not prop.is_valid((datetime.datetime(2012, 10, 1), 22))

    def test_has_ref(self) -> None:
        prop = bcpv.MinMaxBounds()
        assert not prop.has_ref

    def test_str(self) -> None:
        prop = bcpv.MinMaxBounds()
        assert str(prop).startswith("MinMaxBounds(")


class Test_MarkerType:
    def test_valid(self) -> None:
        prop = bcpv.MarkerType()

        for typ in MarkerType:
            assert prop.is_valid(typ)

    def test_invalid(self) -> None:
        prop = bcpv.MarkerType()

        assert not prop.is_valid(None)
        assert not prop.is_valid(False)
        assert not prop.is_valid(True)
        assert not prop.is_valid(0)
        assert not prop.is_valid(1)
        assert not prop.is_valid(0.0)
        assert not prop.is_valid(1.0)
        assert not prop.is_valid(1.0+1.0j)
        assert not prop.is_valid("")
        assert not prop.is_valid(())
        assert not prop.is_valid([])
        assert not prop.is_valid({})
        assert not prop.is_valid(_TestHasProps())
        assert not prop.is_valid(_TestModel())

        assert not prop.is_valid("string")

        assert not prop.is_valid([1, 2, 3])
        assert not prop.is_valid([1, 2, 3.0])

    def test_has_ref(self) -> None:
        prop = bcpv.MarkerType()
        assert not prop.has_ref

    def test_str(self) -> None:
        prop = bcpv.MarkerType()
        assert str(prop).startswith("MarkerType(")

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------

Test___all__ = verify_all(bcpv, ALL)
