import type {TickSpec} from "./ticker"
import {AdaptiveTicker} from "./adaptive_ticker"
import {range} from "core/util/array"
import type * as p from "core/properties"

export namespace LogTicker {
  export type Attrs = p.AttrsOf<Props>

  export type Props = AdaptiveTicker.Props
}

export interface LogTicker extends LogTicker.Attrs {}

export class LogTicker extends AdaptiveTicker {
  declare properties: LogTicker.Props

  constructor(attrs?: Partial<LogTicker.Attrs>) {
    super(attrs)
  }

  static {
    this.override<LogTicker.Props>({
      mantissas: [1, 5],
    })
  }

  override get_ticks_no_defaults(data_low: number, data_high: number, _cross_loc: number, desired_n_ticks: number): TickSpec<number> {
    const num_minor_ticks = this.num_minor_ticks
    const minor_ticks = []

    const base = this.base

    const log_low = Math.log(data_low) / Math.log(base)
    const log_high = Math.log(data_high) / Math.log(base)
    const log_interval = log_high - log_low

    let ticks: number[]

    if (!isFinite(log_interval) || log_interval == 0) {
      ticks = []
    } else if (log_interval < 2) { // treat as linear ticker
      const interval = this.get_interval(data_low, data_high, desired_n_ticks)
      const start_factor = Math.floor(data_low / interval)
      const end_factor   = Math.ceil(data_high / interval)

      ticks = range(start_factor, end_factor + 1)
        .filter((factor) => factor != 0)
        .map((factor) => factor*interval)
        .filter((tick) => data_low <= tick && tick <= data_high)

      if (num_minor_ticks > 0 && ticks.length > 0) {
        const minor_interval = interval / num_minor_ticks
        const minor_offsets = range(0, num_minor_ticks).map((i) => i*minor_interval)
        for (const x of minor_offsets.slice(1)) {
          minor_ticks.push(ticks[0] - x)
        }
        for (const tick of ticks) {
          for (const x of minor_offsets) {
            minor_ticks.push(tick + x)
          }
        }
      }
    } else {
      const d = 0.000001
      const low_pad = 1.0 - Math.sign(log_low)*d
      const high_pad = 1.0 + Math.sign(log_high)*d
      const startlog = Math.ceil(log_low * low_pad)
      const endlog = Math.floor(log_high * high_pad)
      const interval = Math.ceil((endlog - startlog) / 9.0)

      const base_tick_options = range(startlog-1, endlog+1, 1).map((i) => base**i)
      const tick_options = base_tick_options.filter((tick) => data_low <= tick && tick <= data_high)
      ticks = tick_options.filter((_, i) => i % interval === 0)

      if (num_minor_ticks > 0 && ticks.length > 0) {
        const minor_interval = base**interval / num_minor_ticks
        const minor_offsets = range(1, num_minor_ticks+1).map((i) => i*minor_interval)
        const max_offset = Math.max(...minor_offsets)
        for (const x of minor_offsets) {
          minor_ticks.push(ticks[0] * (x/max_offset))
        }
        for (const tick of ticks) {
          for (const x of minor_offsets) {
            minor_ticks.push(tick * x)
          }
        }
      }
    }

    return {
      major: ticks.filter((tick) => data_low <= tick && tick <= data_high),
      minor: minor_ticks.filter((tick) => data_low <= tick && tick <= data_high),
    }
  }
}
