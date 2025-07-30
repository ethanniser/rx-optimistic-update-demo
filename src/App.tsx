import { useRx, useRxRefresh, useRxSet, useRxValue } from "@effect-rx/rx-react";
import {
  updateFailsRx,
  addTodoRx,
  removeTodoRx,
  optimisticAddTodosRx,
  optimisticRemoveTodosRx,
  todosRx,
  optimisticTodosRx,
} from "./rx";
import { useState } from "react";

export default function App() {
  const [updateFails, setUpdateFails] = useRx(updateFailsRx);
  const [input, setInput] = useState("");
  const trueTodos = useRxValue(todosRx);
  const optimisticTodos = useRxValue(optimisticTodosRx);
  const addTodo = useRxSet(optimisticAddTodosRx);
  const addTodoState = useRxValue(addTodoRx);

  const manuallyRefresh = useRxRefresh(todosRx);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="">
        <p className="text-lg mb-2">Will fail: {updateFails.toString()}</p>
        <button
          type="button"
          onClick={() => setUpdateFails(!updateFails)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Toggle update fails
        </button>
      </div>
      <button
        type="button"
        onClick={() => manuallyRefresh()}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Manually refresh
      </button>
      <pre>{JSON.stringify(addTodoState, null, 2)}</pre>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => addTodo(input)}
          // disabled={addTodoState.waiting}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {addTodoState.waiting ? "Adding..." : "Add"}
        </button>
      </div>

      <h1>Optimistic Todos</h1>
      <div className="space-y-4">
        {optimisticTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>

      <h1>True Todos</h1>
      <div className="space-y-4">
        {trueTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}

function TodoItem({ todo }: { todo: { id: number; text: string } }) {
  const removeTodo = useRxSet(optimisticRemoveTodosRx);
  const removeTodoState = useRxValue(removeTodoRx);
  return (
    <div
      key={todo.id}
      className="flex items-center justify-between p-4 bg-gray-100 rounded"
    >
      <p className="text-gray-800">
        {todo.id}: {todo.text}
      </p>
      <button
        type="button"
        onClick={() => removeTodo(todo.id)}
        disabled={removeTodoState.waiting}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded disabled:opacity-50"
      >
        {removeTodoState.waiting ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
