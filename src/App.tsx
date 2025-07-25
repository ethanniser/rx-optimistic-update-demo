import { useRx, useRxValue } from "@effect-rx/rx-react";
import {
  updateFailsRx,
  addTodoRx,
  removeTodoRx,
  optimisticTodosRx,
} from "./rx";
import { useState } from "react";

export default function App() {
  const [updateFails, setUpdateFails] = useRx(updateFailsRx);
  const todos = useRxValue(optimisticTodosRx);
  const [addTodoState, addTodo] = useRx(addTodoRx);

  const [input, setInput] = useState("");
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="">
        <p className="text-lg mb-2">Will fail: {updateFails.toString()}</p>
        <button
          onClick={() => setUpdateFails(!updateFails)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Toggle update fails
        </button>
      </div>
      <pre>{JSON.stringify(addTodoState, null, 2)}</pre>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => addTodo(input)}
          disabled={addTodoState.waiting}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {addTodoState.waiting ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="space-y-4">
        {todos.map((todo) => (
          <TodoItem key={todo} todo={todo} />
        ))}
      </div>
    </div>
  );
}

function TodoItem({ todo }: { todo: string }) {
  const [removeTodoState, removeTodo] = useRx(removeTodoRx(todo));
  return (
    <div
      key={todo}
      className="flex items-center justify-between p-4 bg-gray-100 rounded"
    >
      <p className="text-gray-800">{todo}</p>
      <button
        onClick={() => removeTodo()}
        disabled={removeTodoState.waiting}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded disabled:opacity-50"
      >
        {removeTodoState.waiting ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}
