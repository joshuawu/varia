import React from "react"
import { render } from "react-dom"
import { make, action, assoc } from "varia"

interface Props {
  title: string
}

interface State {
  count: number
  numStr: string
}

const App = make({
  initialState: {
    count: 0,
    numStr: "",
  } as State,

  actions: {
    inc: action<"inc">("inc"),
    set: action<"set">("set"),
    numStr: action<"numStr", { text: string }>("numStr"),
  },

  reduce: (state, a) => {
    switch (a.key) {
      case "inc":
        return assoc(state, "count", state.count + 1)

      case "set":
        const count = parseInt(state.numStr, 10)
        return isNaN(count)
          ? assoc(state, "numStr", "")
          : assoc(state, "count", count)

      case "numStr":
        return assoc(state, "numStr", a.opts.text)
    }
  },

  render: ({ title }: Props, { count, numStr }, update) => (
    <div>
      <h1>{title}</h1>
      <h2>{count}</h2>
      <button onClick={update.inc}>CLICK</button>
      <input
        type="text"
        value={numStr}
        onChange={e => update.numStr({ text: e.currentTarget.value })}
      />
      <button onClick={update.set}>SET</button>
    </div>
  ),
})

render(<App title="Varia Counter" />, document.getElementById("root"))
