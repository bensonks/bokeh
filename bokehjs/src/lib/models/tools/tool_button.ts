import {UIElement, UIElementView} from "../ui/ui_element"
import {IconLike} from "../common/kinds"
import {apply_icon} from "../common/resolve"
import {Tool} from "./tool"
import {ToolProxy} from "./tool_proxy"
import {ToolGroup} from "./tool_group"
import type {TapEvent} from "core/ui_gestures"
import {UIGestures} from "core/ui_gestures"
import type {StyleSheetLike, Keys} from "core/dom"
import {div} from "core/dom"
import {ContextMenu} from "core/util/menus"
import {reversed} from "core/util/array"
import type {Signal0} from "core/signaling"
import type * as p from "core/properties"

import tool_button_css, * as tool_button from "styles/tool_button.css"
import icons_css from "styles/icons.css"

import type {ToolbarView} from "./toolbar"

export abstract class ToolButtonView extends UIElementView {
  declare model: ToolButton
  declare readonly parent: ToolbarView

  protected _menu: ContextMenu
  protected _ui_gestures: UIGestures

  override initialize(): void {
    super.initialize()

    const {location} = this.parent.model
    const reverse = location == "left" || location == "above"
    const orientation = this.parent.model.horizontal ? "vertical" : "horizontal"
    const items = this.model.tool.menu ?? []
    this._menu = new ContextMenu(!reverse ? items : reversed(items), {
      target: this.parent.el,
      orientation,
      prevent_hide: (event) => {
        return event.composedPath().includes(this.el)
      },
      labels: false,
    })

    this._ui_gestures = new UIGestures(this.el, {
      on_tap: (event: TapEvent) => {
        if (this._menu.is_open) {
          this._menu.hide()
          return
        }
        if (event.native.composedPath().includes(this.el)) {
          this.tap()
        }
      },
      on_press: () => {
        this.press()
      },
    })

    this.el.addEventListener("keydown", (event) => {
      switch (event.key as Keys) {
        case "Enter": {
          this.tap()
          break
        }
        case " ": {
          this.press()
          break
        }
        default:
      }
    })
  }

  override connect_signals(): void {
    super.connect_signals()
    this._ui_gestures.connect_signals()
    this.connect(this.model.change, () => this.render())
    this.connect(this.model.tool.change as Signal0<Tool>, () => this.render())
  }

  override remove(): void {
    this._ui_gestures.remove()
    this._menu.remove()
    super.remove()
  }

  override stylesheets(): StyleSheetLike[] {
    return [...super.stylesheets(), tool_button_css, icons_css]
  }

  override render(): void {
    super.render()

    const {tool} = this.model
    this.class_list.add(tool_button[this.parent.model.location])

    this.class_list.toggle(tool_button.hidden, !tool.visible)
    this.class_list.toggle(tool_button.disabled, tool.disabled)

    const icon_el = div({class: tool_button.tool_icon})
    this.shadow_el.append(icon_el)

    const icon = this.model.icon ?? tool.computed_icon
    if (icon != null) {
      apply_icon(icon_el, icon)
    }

    if (tool.menu != null) {
      const chevron_el = div({class: tool_button.tool_chevron})
      this.shadow_el.append(chevron_el)
    }

    if (tool instanceof ToolGroup && tool.show_count) {
      const count_el = div({class: tool_button.count}, `${tool.tools.length}`)
      this.shadow_el.append(count_el)
    }

    const tooltip = this.model.tooltip ?? tool.tooltip
    this.el.title = tooltip

    this.el.tabIndex = 0
  }

  abstract tap(): void

  press(): void {
    const at = (() => {
      switch (this.parent.model.location) {
        case "right": return {left_of:  this.el}
        case "left":  return {right_of: this.el}
        case "above": return {below: this.el}
        case "below": return {above: this.el}
      }
    })()
    this._menu.toggle(at)
  }
}

export namespace ToolButton {
  export type Attrs = p.AttrsOf<Props>

  export type Props = UIElement.Props & {
    tool: p.Property<Tool | ToolProxy<Tool>>
    icon: p.Property<IconLike | null>
    tooltip: p.Property<string | null>
  }
}

export interface ToolButton extends ToolButton.Attrs {}

export abstract class ToolButton extends UIElement {
  declare properties: ToolButton.Props
  declare __view_type__: ToolButtonView

  constructor(attrs?: Partial<ToolButton.Attrs>) {
    super(attrs)
  }

  static {
    this.define<ToolButton.Props>(({Str, Ref, Nullable, Or}) => ({
      tool: [ Or(Ref(Tool), Ref(ToolProxy)) ],
      icon: [ Nullable(IconLike), null ],
      tooltip: [ Nullable(Str), null ],
    }))
  }
}
