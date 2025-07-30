import { Effect } from "effect";
import { Rx } from "@effect-rx/rx-react";

export const updateFailsRx = Rx.make(false);

let id = 0;
let todos: {
  id: number;
  text: string;
}[] = [];
export const todosRx = Rx.make<{ id: number; text: string }[]>(() => {
  console.log("todosRx", todos);
  return todos;
});
export const optimisticTodosRx = Rx.optimistic(todosRx);

export const addTodoRx = Rx.fn(
  Effect.fnUntraced(function* (todo: string, get: Rx.FnContext) {
    console.log("addTodoRx", todo);
    yield* Effect.sleep("1 second");
    if (get(updateFailsRx)) {
      yield* Effect.fail("Update failed");
    }

    todos.push({ id: id++, text: todo });
  })
);

export const optimisticAddTodosRx = optimisticTodosRx.pipe(
  Rx.optimisticFn({
    updateToValue: (todo: string, current: { id: number; text: string }[]) => {
      console.log("optimisticAddTodosRx", todo);
      return [...current, { id: id++, text: todo }];
    },
    fn: addTodoRx,
  })
);

export const removeTodoRx = Rx.fn(
  Effect.fnUntraced(function* (id: number, get: Rx.FnContext) {
    console.log("removeTodoRx", id);
    yield* Effect.sleep("1 second");
    if (get(updateFailsRx)) {
      yield* Effect.fail("Update failed");
    }
    console.log("before", todos);
    todos = todos.filter((t) => t.id !== id);
    console.log("after", todos);
  })
);

export const optimisticRemoveTodosRx = optimisticTodosRx.pipe(
  Rx.optimisticFn({
    updateToValue: (id: number, current: { id: number; text: string }[]) => {
      console.log("optimisticRemoveTodosRx", id);
      return current.filter((t) => t.id !== id);
    },
    fn: removeTodoRx,
  })
);
