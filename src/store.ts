type Subscription<T> = (state: T) => void | Promise<void>
type Func = (...args: any[]) => any
export type Actions = { [key: string]: Func }
type Action<T extends Actions> = ReturnType<T[keyof T]>
export type Update<S, A extends Actions> = {
  [K in keyof A]: (...args: Parameters<A[K]>) => Promise<S>
}
export type Reduce<S, A extends Actions> = (state: S, action: Action<A>) => S

export class Store<S, A extends Actions> {
  private subscriptions: Set<Subscription<S>> = new Set()
  readonly update: Update<S, A>

  constructor(
    private state: S | Promise<S>,
    actions: A,
    private reduce: Reduce<S, A>,
  ) {
    this.verify(actions)
    this.update = mapObject<Func, A, Func>(actions, action => (...args) =>
      this.dispatch(action.apply(undefined, args)),
    )
  }

  readonly subscribe = (
    sub: Subscription<S>,
  ): { unsubscribe: () => void; promise?: Promise<void> } => {
    this.subscriptions.add(sub)
    const unsubscribe = () => this.subscriptions.delete(sub)
    if (isPromise(this.state)) {
      return { unsubscribe, promise: this.state.then(sub) }
    }
    sub(this.state)
    return { unsubscribe }
  }

  private async dispatch(action: Action<A>): Promise<S> {
    if (isPromise(this.state)) {
      this.state = this.state.then(s => this.reduce(s, action))
      await this.state.then(s =>
        Promise.all(Array.from(this.subscriptions, sub => sub(s))),
      )
    } else {
      this.state = this.reduce(this.state, action)
      this.subscriptions.forEach(sub => sub(this.state as S))
    }
    return this.state
  }

  private verify(actions: A): void {
    Object.keys(actions).forEach(propKey => {
      const actionKey = actions[propKey]().key
      if (propKey !== actionKey) {
        throw new Error(
          `The property name "${propKey}" of the provided actions object does not match its ` +
            `corresponding action key "${actionKey}".`,
        )
      }
    })
  }
}

interface Act<K> {
  key: K
}

interface OptAct<K, O extends object> extends Act<K> {
  opts: O
}

export function action<K>(key: K): () => Act<K>
export function action<K, O extends object>(key: K): (opts: O) => OptAct<K, O>
export function action(key: any) {
  return (opts: any) => (opts ? { key, opts } : { key })
}

function mapObject<V0, T extends { [key: string]: V0 }, V1>(
  obj: T,
  fn: (v: V0) => V1,
): { [K in keyof T]: V1 } {
  const ret = {} as { [K in keyof T]: V1 }
  Object.keys(obj).forEach(key => {
    ret[key] = fn(obj[key])
  })
  return ret
}

const isPromise = <T>(value: T | Promise<T>): value is Promise<T> =>
  "then" in value && typeof value.then === "function"
