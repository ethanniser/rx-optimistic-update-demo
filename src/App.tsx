import { useRx, useRxRefresh, useRxSetPromise, useRxValue } from "@effect-rx/rx-react";
import {
  updateFailsRx,
  removeTodoRx,
  todosRx,
  todosRxReadonly,
  addTodoString,
} from "./rx";
import { useState } from "react";

export default function App() {
  const [updateFails, setUpdateFails] = useRx(updateFailsRx);
  const [input, setInput] = useState("");
  const trueTodos = useRxValue(todosRxReadonly);
  const optimisticTodos = useRxValue(todosRx);
  const [addTodoState, addTodo] = useRx(addTodoString);

  const manuallyRefresh = useRxRefresh(todosRx);

  return (
    <div className="w-full p-4">
      <div className="max-w-lg mx-auto space-y-4 mb-8">
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
      </div>

      <div className="flex flex-row gap-8 px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-4">Optimistic Todos</h1>
          <div className="space-y-4">
            {optimisticTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} hideRemove={true} />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-bold mb-4">True Todos</h1>
          <div className="space-y-4">
            {trueTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  hideRemove,
}: {
  todo: { id: number; text: string };
  hideRemove?: boolean;
}) {
  const [removeTodoState, removeTodo] = useRx(removeTodoRx(todo.id));
  return (
    <div
      key={todo.id}
      className="flex items-center justify-between p-4 bg-gray-100 rounded h-14"
    >
      <p className="text-gray-800">
        {todo.id}: {todo.text}
      </p>
      {!hideRemove && (
        <button
          type="button"
          onClick={() => removeTodo()}
          disabled={removeTodoState.waiting}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded disabled:opacity-50"
        >
          {removeTodoState.waiting ? "Removing..." : "Remove"}
        </button>
      )}
    </div>
  );
}
