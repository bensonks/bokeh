import type flatpickr from "flatpickr"

import {BaseDatetimePicker, BaseDatetimePickerView} from "./base_datetime_picker"
import {DateLike} from "./base_date_picker"
import {unreachable} from "core/util/assert"
import type * as p from "core/properties"

export class DatetimeRangePickerView extends BaseDatetimePickerView {
  declare model: DatetimeRangePicker

  protected override get flatpickr_options(): flatpickr.Options.Options {
    const options = super.flatpickr_options
    options.mode = "range"

    options.onClose = (selected) => {
      this._on_close(selected)
    }

    return options
  }

  protected _on_close(selected: Date[]): void {
    switch (selected.length) {
      case 0:
        break
      case 1: {
        // Incomplete selection, treat as no selection.
        this.model.value = null
        this.picker.clear(false, false)
        this.picker._input.focus()
        this.picker.close()
        break
      }
      case 2:
        break
      default: {
        unreachable("invalid length")
      }
    }
  }

  protected override _on_change(selected: Date[]): void {
    switch (selected.length) {
      case 0:
        this.model.value = null
        break
      case 1: {
        // Selection in progress, so do nothing and wait for two selected
        // datetimes. Single datetime selection is still possible and represented
        // by [datetime, datetime] tuple.
        break
      }
      case 2: {
        const [from, to] = selected
        const from_date = this._format_date(from)
        const to_date = this._format_date(to)
        this.model.value = [from_date, to_date]
        break
      }
      default: {
        unreachable("invalid length")
      }
    }
  }
}

export namespace DatetimeRangePicker {
  export type Attrs = p.AttrsOf<Props>

  export type Props = BaseDatetimePicker.Props
}

export interface DatetimeRangePicker extends DatetimeRangePicker.Attrs {}

export class DatetimeRangePicker extends BaseDatetimePicker {
  declare properties: DatetimeRangePicker.Props
  declare __view_type__: DatetimeRangePickerView

  declare value: [DateLike, DateLike] | null

  constructor(attrs?: Partial<DatetimeRangePicker.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = DatetimeRangePickerView

    this.define<DatetimeRangePicker.Props>(({Nullable, Tuple}) => ({
      value: [ Nullable(Tuple(DateLike, DateLike)), null ],
    }))
  }
}
