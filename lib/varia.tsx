import React from "react"
import { Store, Updater, Reducer } from "./store"

export * from "./state"
export const VariaStore = Store

interface Props<S, R extends Reducer<S>> {
  getStore: () => Store<S, R>
  render: (state: S, update: Updater<S, R>) => React.ReactNode
  loader?: React.ReactNode
}

interface State<S> {
  state: S
}

export class Varia<S, R extends Reducer<S>> extends React.Component<
  Props<S, R>,
  State<S>
> {
  store: Store<S, R> = this.props.getStore()
  unsubscribe?: () => void

  componentDidMount(): void {
    const { unsubscribe } = this.store.subscribe(
      (state: S) => new Promise(resolve => this.setState({ state }, resolve)),
    )
    this.unsubscribe = unsubscribe
  }

  componentWillUnmount(): void {
    this.unsubscribe && this.unsubscribe()
  }

  render(): React.ReactNode {
    return this.state
      ? this.props.render(this.state.state, this.store.update)
      : this.props.loader || null
  }
}

function isInitializer<P extends object, S>(
  value: S | Promise<S> | ((props: P) => S | Promise<S>),
): value is (props: P) => S | Promise<S> {
  return typeof value === "function"
}

export const varia = <P extends object, S, R extends Reducer<S>>(args: {
  init: S | Promise<S> | ((props: P) => S | Promise<S>)
  reduce: R
  render: (props: P, state: S, update: Updater<S, R>) => React.ReactNode
  renderLoader?: (props: P) => React.ReactNode
}): ((props: P) => React.ReactElement<Varia<S, R>>) => props => (
  <Varia
    getStore={() =>
      new Store(
        isInitializer(args.init) ? args.init(props) : args.init,
        args.reduce,
      )
    }
    render={(state, update) => args.render(props, state, update)}
    loader={args.renderLoader && args.renderLoader(props)}
  />
)

export const variaApp = <S, R extends Reducer<S>>(args: {
  init: S | Promise<S>
  reduce: R
}): {
  VariaApp: (props: {
    render: (state: S, update: Updater<S, R>) => React.ReactNode
  }) => React.ReactElement<Varia<S, R>>
  updateApp: Updater<S, R>
} => {
  const store = new Store(args.init, args.reduce)
  return {
    VariaApp: ({ render }) => <Varia getStore={() => store} render={render} />,
    updateApp: store.update,
  }
}
