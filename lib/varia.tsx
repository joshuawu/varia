import React from "react"
import { Store, Actions, Update, Reduce } from "./store"

export * from "./state"
export { action } from "./store"

interface Props<S, A extends Actions> {
  getStore: () => Store<S, A>
  render: (state: S, update: Update<S, A>) => React.ReactNode
  loader?: React.ReactNode
}

interface State<S> {
  state: S
}

export class Varia<S, A extends Actions> extends React.Component<
  Props<S, A>,
  State<S>
> {
  store: Store<S, A> = this.props.getStore()
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

export const makeApp = <S, A extends Actions>(args: {
  initialState: S | Promise<S>
  actions: A
  reduce: Reduce<S, A>
}): {
  Provider: (props: {
    render: (state: S, update: Update<S, A>) => React.ReactNode
  }) => React.ReactElement<Varia<S, A>>
  updateApp: Update<S, A>
} => {
  const store = new Store(args.initialState, args.actions, args.reduce)
  return {
    Provider: ({ render }) => <Varia getStore={() => store} render={render} />,
    updateApp: store.update,
  }
}

export const make = <P extends object, S, A extends Actions>(args: {
  initialState: S | ((props: P) => S)
  actions: A
  reduce: Reduce<S, A>
  render: (props: P, state: S, update: Update<S, A>) => React.ReactNode
}): ((props: P) => React.ReactElement<Varia<S, A>>) => props => (
  <Varia
    getStore={() =>
      new Store(
        typeof args.initialState === "function"
          ? (args.initialState as (props: P) => S)(props)
          : args.initialState,
        args.actions,
        args.reduce,
      )
    }
    render={(state, update) => args.render(props, state, update)}
  />
)

export const makeAsync = <P extends object, S, A extends Actions>(args: {
  getInitialState: (props: P) => Promise<S>
  actions: A
  reduce: Reduce<S, A>
  render: (props: P, state: S, update: Update<S, A>) => React.ReactNode
  renderLoader?: (props: P) => React.ReactNode
}): ((props: P) => React.ReactElement<Varia<S, A>>) => props => (
  <Varia
    getStore={() =>
      new Store(args.getInitialState(props), args.actions, args.reduce)
    }
    render={(state, update) => args.render(props, state, update)}
    loader={args.renderLoader && args.renderLoader(props)}
  />
)
