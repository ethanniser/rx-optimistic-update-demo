import { Array, Effect } from "effect";
import { Rx } from "@effect-rx/rx-react";

export const updateFailsRx = Rx.make(false);

interface Todo {
  readonly id: number;
  readonly text: string;
}

let todos = Array.empty<Todo>();

export const currentTodoIdRx = Rx.make(0);

export const todosRxReadonly = Rx.make(() => {
  console.log("todosRx", todos);
  return todos.slice();
});

export const todosRx = Rx.optimistic(todosRxReadonly);

export const addTodoRx = Rx.family((todo: Todo) =>
  Rx.optimisticFn(todosRx, {
    reducer(current, _: void) {
      console.log("optimisticAddTodosRx", todo);
      return [...current, todo];
    },
    fn: Rx.fn(
      Effect.fnUntraced(function* (_: void, get) {
        console.log("addTodoRx", todo);
        get.set(currentTodoIdRx, todo.id + 1);
        yield* Effect.sleep("1 second");
        if (get(updateFailsRx)) {
          yield* Effect.fail("Update failed");
        }
        todos.push(todo);
      })
    ),
  })
);

export const removeTodoRx = Rx.family((id: number) =>
  Rx.optimisticFn(todosRx, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reducer(current, _: void) {
      console.log("optimisticRemoveTodosRx", id);
      return current.filter((t) => t.id !== id);
    },
    fn: Rx.fn(
      Effect.fnUntraced(function* (_, get) {
        console.log("removeTodoRx", id);
        yield* Effect.sleep("1 second");
        if (get(updateFailsRx)) {
          yield* Effect.fail("Update failed");
        }
        console.log("before", todos);
        todos = todos.filter((t) => t.id !== id);
        console.log("after", todos);
      })
    ),
  })
);
