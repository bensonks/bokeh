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
from unittest.mock import MagicMock, patch

# External imports
import numpy as np

# Bokeh imports
from bokeh.core.properties import (
    Angle,
    Any,
    Bool,
    Color,
    ColumnData,
    Complex,
    DashPattern,
    Dict,
    Either,
    Enum,
    Float,
    Instance,
    Int,
    Interval,
    List,
    MinMaxBounds,
    Percent,
    Regex,
    Seq,
    Size,
    String,
    Tuple,
)
from bokeh.models import ColumnDataSource
from tests.support.util.api import verify_all

from _util_property import _TestModel

# Module under test
import bokeh.core.property.wrappers as bcpw # isort:skip

#-----------------------------------------------------------------------------
# Setup
#-----------------------------------------------------------------------------

ALL = (
    'PropertyValueColumnData',
    'PropertyValueContainer',
    'PropertyValueDict',
    'PropertyValueList',
    'PropertyValueSet',
    'notify_owner',
)

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

def test_notify_owner() -> None:
    result = {}
    class Foo:
        @bcpw.notify_owner
        def test(self): pass

        def _notify_owners(self, old):
            result['old'] = old

        def _saved_copy(self): return "foo"

    f = Foo()
    f.test()
    assert result['old'] == 'foo'
    assert f.test.__doc__ == "Container method ``test`` instrumented to notify property owners"

def test_PropertyValueContainer() -> None:
    pvc = bcpw.PropertyValueContainer()
    assert pvc._owners == set()

    pvc._register_owner("owner", "prop")
    assert pvc._owners == {("owner", "prop")}

    pvc._unregister_owner("owner", "prop")
    assert pvc._owners == set()

    with pytest.raises(RuntimeError):
        pvc._saved_copy()

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueDict_mutators(mock_notify: MagicMock) -> None:
    pvd = bcpw.PropertyValueDict(dict(foo=10, bar=20, baz=30))

    mock_notify.reset_mock()
    del pvd['foo']
    assert mock_notify.called

    mock_notify.reset_mock()
    pvd['foo'] = 11
    assert mock_notify.called

    mock_notify.reset_mock()
    pvd.pop('foo')
    assert mock_notify.called

    mock_notify.reset_mock()
    pvd.popitem()
    assert mock_notify.called

    mock_notify.reset_mock()
    pvd.setdefault('baz')
    assert mock_notify.called

    mock_notify.reset_mock()
    pvd.clear()
    assert mock_notify.called

    mock_notify.reset_mock()
    pvd.update(bar=1)
    assert mock_notify.called

@patch('bokeh.core.property.descriptors.ColumnDataPropertyDescriptor._notify_mutated')
def test_PropertyValueColumnData___setitem__(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnDataChangedEvent

    source = ColumnDataSource(data=dict(foo=[10], bar=[20], baz=[30]))
    pvcd = bcpw.PropertyValueColumnData(source.data)
    pvcd._register_owner(source, source.lookup('data'))

    mock_notify.reset_mock()
    pvcd['foo'] = [11]
    assert pvcd == dict(foo=[11], bar=[20], baz=[30])
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == (source, dict(foo=[10], bar=[20], baz=[30]))
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnDataChangedEvent)
    assert event.model == source
    assert event.attr == "data"
    assert event.cols == ['foo']

@patch('bokeh.core.property.descriptors.ColumnDataPropertyDescriptor._notify_mutated')
def test_PropertyValueColumnData_update(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnDataChangedEvent

    source = ColumnDataSource(data=dict(foo=[10], bar=[20], baz=[30]))
    pvcd = bcpw.PropertyValueColumnData(source.data)
    pvcd._register_owner(source, source.lookup('data'))

    mock_notify.reset_mock()
    pvcd.update(foo=[11], bar=[21])
    assert pvcd == dict(foo=[11], bar=[21], baz=[30])
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == (source, dict(foo=[10], bar=[20], baz=[30]))
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnDataChangedEvent)
    assert event.model == source
    assert event.attr == "data"
    assert event.cols is not None and sorted(event.cols) == ['bar', 'foo']

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_list_to_list(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=[10]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[20]), setter="setter")
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [10, 20]},) # streaming to list, "old" is actually updated value
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover is None
    assert event.data == {'foo': [20]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_list_to_array(mock_notify: MagicMock) -> None:
    import numpy as np

    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=np.array([10])))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[20]), setter="setter")
    assert mock_notify.call_count == 1
    assert (mock_notify.call_args[0][0]['foo'] == np.array([10])).all()
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover is None
    assert event.data == {'foo': [20]}


@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_list_with_rollover(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=[10, 20, 30]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[40]), rollover=3, setter="setter")
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [20, 30, 40]},) # streaming to list, "old" is actually updated value
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover == 3
    assert event.data == {'foo': [40]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_list_with_rollover_equals_zero(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=[10, 20, 30]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[40]), rollover=0, setter="setter")
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': []},) # streaming to list, "old" is actually updated value
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover == 0
    assert event.data == {'foo': [40]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_list_with_rollover_greater_than_list_length(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=[10, 20, 30]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[40]), rollover=5, setter="setter")
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [10, 20, 30, 40]},) # streaming to list, "old" is actually updated value
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover == 5
    assert event.data == {'foo': [40]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_array_to_array(mock_notify: MagicMock) -> None:
    import numpy as np

    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=np.array([10])))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[20]), setter="setter")
    assert mock_notify.call_count == 1
    assert len(mock_notify.call_args[0]) == 1
    assert 'foo' in mock_notify.call_args[0][0]
    assert (mock_notify.call_args[0][0]['foo'] == np.array([10])).all()
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover is None
    assert event.data == {'foo': [20]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_array_to_list(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=[10]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[20]), setter="setter")
    assert mock_notify.call_count == 1
    assert len(mock_notify.call_args[0]) == 1
    assert 'foo' in mock_notify.call_args[0][0]
    assert mock_notify.call_args[0] == ({'foo': [10, 20]},) # streaming to list, "old" is actually updated value
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover is None
    assert event.data == {'foo': [20]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_array_with_rollover(mock_notify: MagicMock) -> None:
    import numpy as np

    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=np.array([10, 20, 30])))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[40]), rollover=3, setter="setter")
    assert mock_notify.call_count == 1
    assert len(mock_notify.call_args[0]) == 1
    assert 'foo' in mock_notify.call_args[0][0]
    assert (mock_notify.call_args[0][0]['foo'] == np.array([10, 20, 30])).all()
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover == 3
    assert event.data == {'foo': [40]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_array_with_rollover_equals_zero(mock_notify: MagicMock) -> None:
    import numpy as np

    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=np.array([10, 20, 30])))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[40]), rollover=0, setter="setter")
    assert mock_notify.call_count == 1
    assert len(mock_notify.call_args[0]) == 1
    assert 'foo' in mock_notify.call_args[0][0]
    assert (mock_notify.call_args[0][0]['foo'] == np.array([10, 20, 30])).all()
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover == 0
    assert event.data == {'foo': [40]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__stream_array_greater_than_array_length(mock_notify: MagicMock) -> None:
    import numpy as np

    from bokeh.document.events import ColumnsStreamedEvent

    source = ColumnDataSource(data=dict(foo=np.array([10, 20, 30])))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._stream("doc", source, dict(foo=[40]), rollover=5, setter="setter")
    assert mock_notify.call_count == 1
    assert len(mock_notify.call_args[0]) == 1
    assert 'foo' in mock_notify.call_args[0][0]
    assert (mock_notify.call_args[0][0]['foo'] == np.array([10, 20, 30])).all()
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsStreamedEvent)
    assert event.setter == 'setter'
    assert event.rollover == 5
    assert event.data == {'foo': [40]}

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__patch_with_simple_indices(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsPatchedEvent
    source = ColumnDataSource(data=dict(foo=[10, 20]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._patch("doc", source, dict(foo=[(1, 40)]), setter='setter')
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [10, 40]},)
    assert pvcd == dict(foo=[10, 40])
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsPatchedEvent)
    assert event.setter == 'setter'

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__patch_with_repeated_simple_indices(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsPatchedEvent
    source = ColumnDataSource(data=dict(foo=[10, 20]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._patch("doc", source, dict(foo=[(1, 40), (1, 50)]), setter='setter')
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [10, 50]},)
    assert pvcd == dict(foo=[10, 50])
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsPatchedEvent)
    assert event.setter == 'setter'

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__patch_with_list_indices(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsPatchedEvent
    source = ColumnDataSource(data=dict(foo=[np.array([1, 40]), np.array([1, 50])]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._patch("doc", source, dict(foo=[([1, 0], 60)]), setter='setter')
    assert mock_notify.call_count == 1

    expected = [np.array([1, 40]), np.array([60, 50])]
    assert (mock_notify.call_args[0][0]["foo"][0] == expected[0]).all()
    assert (mock_notify.call_args[0][0]["foo"][1] == expected[1]).all()

    assert set(pvcd) == {"foo"}
    assert (pvcd["foo"][0] == expected[0]).all()
    assert (pvcd["foo"][1] == expected[1]).all()

    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsPatchedEvent)
    assert event.setter == 'setter'

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__patch_with_slice_indices(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsPatchedEvent
    source = ColumnDataSource(data=dict(foo=[10, 20, 30, 40, 50]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._patch("doc", source, dict(foo=[(slice(2), [1,2])]), setter='setter')
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [1, 2, 30, 40, 50]},)
    assert pvcd == dict(foo=[1, 2, 30, 40, 50])
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsPatchedEvent)
    assert event.setter == 'setter'

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueColumnData__patch_with_overlapping_slice_indices(mock_notify: MagicMock) -> None:
    from bokeh.document.events import ColumnsPatchedEvent
    source = ColumnDataSource(data=dict(foo=[10, 20, 30, 40, 50]))
    pvcd = bcpw.PropertyValueColumnData(source.data)

    mock_notify.reset_mock()
    pvcd._patch("doc", source, dict(foo=[(slice(2), [1,2]), (slice(1,3), [1000,2000])]), setter='setter')
    assert mock_notify.call_count == 1
    assert mock_notify.call_args[0] == ({'foo': [1, 1000, 2000, 40, 50]},)
    assert pvcd == dict(foo=[1, 1000, 2000, 40, 50])
    assert 'hint' in mock_notify.call_args[1]
    event = mock_notify.call_args[1]['hint']
    assert isinstance(event, ColumnsPatchedEvent)
    assert event.setter == 'setter'

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueList_mutators(mock_notify: MagicMock) -> None:
    pvl = bcpw.PropertyValueList([10, 20, 30, 40, 50])

    mock_notify.reset_mock()
    del pvl[2]
    assert mock_notify.called

    # this exercises __delslice__ on Py2 but not Py3 which just
    # uses __delitem__ and a slice index
    mock_notify.reset_mock()
    del pvl[1:2]
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl += [888]
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl *= 2
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl[0] = 2
    assert mock_notify.called

    # this exercises __setslice__ on Py2 but not Py3 which just
    # uses __setitem__ and a slice index
    mock_notify.reset_mock()
    pvl[3:1:-1] = [21, 31]
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.append(999)
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.extend([1000])
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.insert(0, 100)
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.pop()
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.remove(100)
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.reverse()
    assert mock_notify.called

    mock_notify.reset_mock()
    pvl.sort()
    assert mock_notify.called

    # OK, this is just to get a 100% test coverage inpy3 due to differences in
    # py2 vs py2. The slice methods are only exist in py2. The tests above
    # exercise all the  cases, this just makes py3 report the non-py3 relevant
    # code as covered.
    try:
        pvl.__setslice__(1,2,3)
    except Exception:
        pass

    try:
        pvl.__delslice__(1,2)
    except Exception:
        pass

@patch('bokeh.core.property.wrappers.PropertyValueContainer._notify_owners')
def test_PropertyValueSet_mutators(mock_notify: MagicMock) -> None:
    pvs: set[int] = bcpw.PropertyValueSet([10, 20, 30, 40, 50])

    mock_notify.reset_mock()
    pvs.add(60)
    assert mock_notify.called

    mock_notify.reset_mock()
    pvs.difference_update([20, 30])
    assert mock_notify.called

    mock_notify.reset_mock()
    pvs.discard(20)
    assert mock_notify.called

    mock_notify.reset_mock()
    pvs.intersection_update([20, 30])
    assert mock_notify.called

    mock_notify.reset_mock()
    pvs.remove(10)
    assert mock_notify.called

    mock_notify.reset_mock()
    pvs.symmetric_difference_update([10, 40])
    assert mock_notify.called

    mock_notify.reset_mock()
    pvs.update([50, 60])
    assert mock_notify.called

def test_PropertyValueColumnData___copy__() -> None:
    source = ColumnDataSource(data=dict(foo=[10]))
    pvcd = source.data.__copy__()
    assert source.data == pvcd
    assert id(source.data) != id(pvcd)
    pvcd['foo'][0] = 20
    assert source.data['foo'][0] == 20

def test_PropertyValueColumnData___deepcopy__() -> None:
    source = ColumnDataSource(data=dict(foo=[10]))
    pvcd = source.data.__deepcopy__()
    assert source.data == pvcd
    assert id(source.data) != id(pvcd)
    pvcd['foo'][0] = 20
    assert source.data['foo'][0] == 10

def test_Property_wrap() -> None:
    types = [
        Bool(), Int(), Float(), Complex(), String(), Enum("Some", "a", "b"), Color(),
        Regex("^$"), Seq(Any), Tuple(Any, Any), Instance(_TestModel), Any(),
        Interval(Float, 0, 1), Either(Int, String), DashPattern(), Size(), Percent(),
        Angle(), MinMaxBounds(),
    ]

    for x in types:
        for y in (0, 1, 2.3, "foo", None, (), [], {}):
            r = x.wrap(y)
            assert r == y
            assert isinstance(r, type(y))

def test_List_wrap() -> None:
    for y in (0, 1, 2.3, "foo", None, (), {}):
        r = List(Any).wrap(y)
        assert r == y
        assert isinstance(r, type(y))
    r = List(Any).wrap([1,2,3])
    assert r == [1,2,3]
    assert isinstance(r, bcpw.PropertyValueList)
    r2 = List(Any).wrap(r)
    assert r is r2

def test_Dict_wrap() -> None:
    for y in (0, 1, 2.3, "foo", None, (), []):
        r = Dict(Any, Any).wrap(y)
        assert r == y
        assert isinstance(r, type(y))
    r = Dict(Any, Any).wrap(dict(a=1, b=2))
    assert r == dict(a=1, b=2)
    assert isinstance(r, bcpw.PropertyValueDict)
    r2 = Dict(Any, Any).wrap(r)
    assert r is r2

def test_ColumnData_wrap() -> None:
    for y in (0, 1, 2.3, "foo", None, (), []):
        r = ColumnData(String, Any).wrap(y)
        assert r == y
        assert isinstance(r, type(y))
    r = ColumnData(String, Any).wrap(dict(a=1, b=2))
    assert r == dict(a=1, b=2)
    assert isinstance(r, bcpw.PropertyValueColumnData)
    r2 = ColumnData(String, Any).wrap(r)
    assert r is r2

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------

Test___all__ = verify_all(bcpw, ALL)
