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
import re

# Bokeh imports
from bokeh.core.has_props import HasProps
from bokeh.core.properties import (
    Angle,
    AngleSpec,
    Bool,
    Color,
    ColorSpec,
    ColumnData,
    Complex,
    DashPattern,
    Date,
    Datetime,
    Dict,
    DistanceSpec,
    Either,
    Enum,
    Float,
    FontSize,
    FontSizeSpec,
    Instance,
    Int,
    Interval,
    List,
    MarkerType,
    MinMaxBounds,
    NumberSpec,
    Percent,
    Regex,
    Seq,
    Size,
    SizeSpec,
    String,
    StringSpec,
    Tuple,
)
from bokeh.core.property.bases import validation_on
from tests.support.util.api import verify_all

# Module under test
import bokeh.core.property.validation as bcpv # isort:skip

#-----------------------------------------------------------------------------
# Setup
#-----------------------------------------------------------------------------

ALL = (
    'validate',
    'without_property_validation',
)

SPECS = (
    AngleSpec,
    ColorSpec,
    DistanceSpec,
    FontSizeSpec,
    NumberSpec,
    SizeSpec,
    StringSpec,
)

KEYS = ((String, "Foo"), (Int, 10))
VALS = ((String, "Bar"), (Int, 20), (Float, 1.23), (List(Float), [1.23, 3.45]))

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------


class TestValidationControl:
    def test_validate(self) -> None:
        assert validation_on()
        with bcpv.validate(False):
            assert not validation_on()
        assert validation_on()

        with bcpv.validate(False):
            assert not validation_on()
            with bcpv.validate(True):
                assert validation_on()
            assert not validation_on()
        assert validation_on()

        bcpv.validate(False)
        assert not validation_on()
        bcpv.validate(True)
        assert validation_on()

    def test_without_property_validation(self) -> None:
        @bcpv.without_property_validation
        def f():
            assert not validation_on()

        assert validation_on()
        f()
        assert validation_on()


class TestValidateDetailDefault:
    # test_Any unnecessary (no validation)

    # TODO (bev) test_Image

    def test_Angle(self) -> None:
        p = Angle()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a value of type Real, got junk of type str")
    def test_Bool(self) -> None:
        p = Bool()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a value of type bool or bool_?, got junk of type str")
    def test_Complex(self) -> None:
        p = Complex()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a value of type Complex, got junk of type str")
    def test_Float(self) -> None:
        p = Float()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a value of type Real, got junk of type str")
    def test_Int(self) -> None:
        p = Int()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a value of type Integral, got junk of type str")
    def test_Interval(self) -> None:
        p = Interval(Float, 0.0, 1.0)
        with pytest.raises(ValueError) as e:
            p.validate(2)
        assert matches(str(e.value), r"expected a value of type Float in range \[0.0, 1.0\], got 2")
    def test_Percent(self) -> None:
        p = Percent()
        with pytest.raises(ValueError) as e:
            p.validate(10)
        assert matches(str(e.value), r"expected a value in range \[0, 1\], got 10")
    def test_Size(self) -> None:
        p = Size()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a value of type Real, got junk of type str")


    def test_List(self) -> None:
        p = List(Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an element of List\(Float\), got 'junk'")
    def test_Seq(self) -> None:
        p = Seq(Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an element of Seq\(Float\), got 'junk'")
    def test_Dict(self) -> None:
        p = Dict(String, Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a dict of type Dict\(String, Float\), got a value of type <class 'str'>")

    def test_Dict_Invalid_Key(self) -> None:
        d = Dict(String, String)
        with pytest.raises(ValueError) as err:
            d.validate({"Foo": "Bar", 1: "Baz"})
        assert "invalid keys: 1" in str(err.value)

    def test_Dict_Invalid_Value(self) -> None:
        d = Dict(String, String)
        with pytest.raises(ValueError) as err:
            d.validate({"Foo": "Bar", "Baz": 1})
        assert "invalid values for keys: Baz" in str(err.value)

    @pytest.mark.parametrize("key_type,key", KEYS)
    @pytest.mark.parametrize("val_type,val", VALS)
    def test_Dict_Valid(self, key_type, key, val_type, val) -> None:
        d = Dict(key_type, val_type)
        try:
            d.validate({key: val})
        except ValueError:
            pytest.fail("ValueError should not be raised on validating a correct dictionary")

    def test_Dict_Multiple_Invalid_Keys(self) -> None:
        d = Dict(String, String)
        with pytest.raises(ValueError) as err:
            d.validate({"Foo": "Bar", 1: "Baz", None: "Bosh", 4.5: "Bump"})
        assert "invalid keys: 1, None, 4.5" in str(err.value)

    def test_Dict_Multiple_Invalid_Values(self) -> None:
        d = Dict(String, String)
        with pytest.raises(ValueError) as err:
            d.validate({"Foo": "Bar", "Baz": 1, "Bosh": 3.2, "Bump": None})
        assert "invalid values for keys: Baz, Bosh, Bump" in str(err.value)

    def test_Dict_Multiple_Invalid_Keys_And_Values(self) -> None:
        d = Dict(String, String)
        with pytest.raises(ValueError) as err:
            d.validate({"Foo": 2, 1: "Baz", None: None, 4.5: "Bump", "Fow": 3.2})
        assert "invalid keys: 1, None, 4.5 and invalid values for keys: Foo, None, Fow" in str(err.value)

    def test_Tuple(self) -> None:
        p = Tuple(Int, Int)
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an element of Tuple\(Int, Int\), got 'junk'")


    def test_Color(self) -> None:
        p = Color()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an element of either Enum\(.*\), .* or RGB, got 'junk'")
    def test_ColumnData(self) -> None:
        p = ColumnData(String, Seq(Float))
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a dict of type ColumnData\(String, Seq\(Float\)\), got a value of type <class 'str'>")
    def test_Datetime(self) -> None:
        p = Datetime()
        with pytest.raises(ValueError) as e:
            p.validate(object())
        assert matches(str(e.value), r"Expected a date, datetime object, or timestamp, got <object object at 0x.*>")
    def test_Date(self) -> None:
        p = Date()
        with pytest.raises(ValueError) as e:
            p.validate(object())
        assert matches(str(e.value), r"Expected an ISO date string, got <object object at 0x.*>")
    def test_DashPattern(self) -> None:
        p = DashPattern()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an element of either Enum\(.*\), Regex\(.*\) or Seq\(Int\), got 'junk'")
    def test_Either(self) -> None:
        p = Either(Int, Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an element of either Int or Float, got 'junk'")
    def test_Enum(self) -> None:
        p = Enum("red", "green")
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"invalid value: 'junk'; allowed values are red or green")
    def test_FontSize(self) -> None:
        p = FontSize()
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"'junk' is not a valid font size value")
    def test_Instance(self) -> None:
        p = Instance(HasProps)
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected an instance of type HasProps, got junk of type str")
    def test_MinMaxBounds(self) -> None:
        p = MinMaxBounds()
        with pytest.raises(ValueError) as e:
            p.validate(10)
        assert matches(str(e.value), r"expected an element of either .*, got 10")
    def test_Regex(self) -> None:
        p = Regex("green")
        with pytest.raises(ValueError) as e:
            p.validate("junk")
        assert matches(str(e.value), r"expected a string matching 'green' pattern, got 'junk'")
    def test_String(self) -> None:
        p = String()
        with pytest.raises(ValueError) as e:
            p.validate(10)
        assert matches(str(e.value), r"expected a value of type str, got 10 of type int")
    def test_MarkerType(self) -> None:
        p = MarkerType()
        with pytest.raises(ValueError) as e:
            p.validate("foo")
        assert matches(str(e.value), r"invalid value: 'foo'; allowed values are asterisk, .* or y")


    @pytest.mark.parametrize('spec', SPECS)
    def test_Spec(self, spec) -> None:
        p = spec(default=None)
        with pytest.raises(ValueError) as e:
            p.validate(dict(bad="junk"))
        assert matches(str(e.value), r"expected an element of either String, .*, got {'bad': 'junk'}")

@pytest.mark.parametrize('detail', [True, False])
class TestValidateDetailExplicit:
    # test_Any unnecessary (no validation)

    # TODO (bev) test_Image

    def test_Angle(self, detail) -> None:
        p = Angle()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Bool(self, detail) -> None:
        p = Bool()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Complex(self, detail) -> None:
        p = Complex()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Float(self, detail) -> None:
        p = Float()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Int(self, detail) -> None:
        p = Int()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Interval(self, detail) -> None:
        p = Interval(Float, 0.0, 1.0)
        with pytest.raises(ValueError) as e:
            p.validate(2, detail)
        assert (str(e.value) == "") == (not detail)
    def test_Percent(self, detail) -> None:
        p = Percent()
        with pytest.raises(ValueError) as e:
            p.validate(10, detail)
        assert (str(e.value) == "") == (not detail)
    def test_Size(self, detail) -> None:
        p = Size()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)


    def test_List(self, detail) -> None:
        p = List(Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Seq(self, detail) -> None:
        p = Seq(Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Dict(self, detail) -> None:
        p = Dict(String, Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Tuple(self, detail) -> None:
        p = Tuple(Int, Int)
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)


    def test_Color(self, detail) -> None:
        p = Color()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_ColumnData(self, detail) -> None:
        p = ColumnData(String, Seq(Float))
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Date(self, detail) -> None:
        p = Date()
        with pytest.raises(ValueError) as e:
            p.validate(p, detail)
        assert (str(e.value) == "") == (not detail)
    def test_DashPattern(self, detail) -> None:
        p = DashPattern()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Either(self, detail) -> None:
        p = Either(Int, Float)
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Enum(self, detail) -> None:
        p = Enum("red", "green")
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_FontSize(self, detail) -> None:
        p = FontSize()
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_Instance(self, detail) -> None:
        p = Instance(HasProps)
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_MinMaxBounds(self, detail) -> None:
        p = MinMaxBounds()
        with pytest.raises(ValueError) as e:
            p.validate(10, detail)
        assert (str(e.value) == "") == (not detail)
    def test_Regex(self, detail) -> None:
        p = Regex("green")
        with pytest.raises(ValueError) as e:
            p.validate("junk", detail)
        assert (str(e.value) == "") == (not detail)
    def test_String(self, detail) -> None:
        p = String()
        with pytest.raises(ValueError) as e:
            p.validate(10, detail)
        assert (str(e.value) == "") == (not detail)
    def test_MarkerType(self, detail) -> None:
        p = MarkerType()
        with pytest.raises(ValueError) as e:
            p.validate("foo", detail)
        assert (str(e.value) == "") == (not detail)


    @pytest.mark.parametrize('spec', SPECS)
    def test_Spec(self, detail, spec) -> None:
        p = spec(default=None)
        with pytest.raises(ValueError) as e:
            p.validate(dict(bad="junk"), detail)
        assert (str(e.value) == "") == (not detail)

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------

def matches(string, pattern):
    return re.match(pattern, string) is not None

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------

Test___all__ = verify_all(bcpv, ALL)
