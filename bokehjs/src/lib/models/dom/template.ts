import {DOMElement, DOMElementView} from "./dom_element"
import {Action} from "./action"
import {PlaceholderView} from "./placeholder"
import type {Formatters} from "./placeholder"
import type {ColumnarDataSource} from "../sources/columnar_data_source"
import type {Index} from "core/util/templating"
import type {ViewStorage, IterViews, ViewOf} from "core/build_views"
import {build_views, remove_views, traverse_views} from "core/build_views"
import type {PlainObject} from "core/types"
import type * as p from "core/properties"

export class TemplateView extends DOMElementView {
  declare model: Template

  readonly _action_views: ViewStorage<Action> = new Map()
  get actions(): Action[] {
    return this.model.actions
  }
  get action_views(): ViewOf<Action>[] {
    return this.actions.map((model) => this._action_views.get(model)).filter((view) => view != null)
  }

  protected async _update_actions(): Promise<void> {
    await build_views(this._action_views, this.actions)
  }

  override *children(): IterViews {
    yield* super.children()
    yield* this.action_views
  }

  override async lazy_initialize(): Promise<void> {
    await super.lazy_initialize()
    await this._update_actions()
  }

  override remove(): void {
    remove_views(this._action_views)
    super.remove()
  }

  update(source: ColumnarDataSource, i: Index | null, vars: PlainObject, formatters?: Formatters): void {
    traverse_views([this], (view) => {
      if (view instanceof PlaceholderView) {
        view.update(source, i, vars, formatters)
      }
    })
    for (const action of this.action_views) {
      action.update(source, i, vars)
    }
  }
}

export namespace Template {
  export type Attrs = p.AttrsOf<Props>
  export type Props = DOMElement.Props & {
    actions: p.Property<Action[]>
  }
}

export interface Template extends Template.Attrs {}

export class Template extends DOMElement {
  declare properties: Template.Props
  declare __view_type__: TemplateView

  static {
    this.prototype.default_view = TemplateView
    this.define<Template.Props>(({List, Ref}) => ({
      actions: [ List(Ref(Action)), [] ],
    }))
  }
}
