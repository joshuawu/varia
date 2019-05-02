type Subscription<S> = (state: S) => void | Promise<void>
type Reduce<S> = (state: S, ...data: any[]) => S
type Update<S, R> = R extends (state: S, ...data: infer D) => S
  ? (...data: D) => Promise<S>
  : never
export type Reducer<S> = { [key: string]: Reduce<S> }
export type Updater<S, R extends Reducer<S>> = {
  [K in keyof R]: Update<S, R[K]>
}

const isPromise = <T>(value: T | Promise<T>): value is Promise<T> =>
  "then" in value && typeof value.then === "function"

export class Store<S, R extends Reducer<S>> {
  private subscriptions: Set<Subscription<S>> = new Set()
  readonly update: Updater<S, R>

  constructor(private state: S | Promise<S>, reduce: R) {
    this.update = {} as Updater<S, R>
    Object.keys(reduce).forEach(key => {
      this.update[key] = ((...data) =>
        this.dispatch(reduce[key], data)) as Update<S, R[typeof key]>
    })
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

  private async dispatch(fn: Reduce<S>, ...data: any[]): Promise<S> {
    if (isPromise(this.state)) {
      this.state = this.state.then(s => fn(s, ...data))
      await this.state.then(s =>
        Promise.all(Array.from(this.subscriptions, sub => sub(s))),
      )
    } else {
      this.state = fn(this.state, ...data)
      this.subscriptions.forEach(sub => sub(this.state as S))
    }
    return this.state
  }
}
