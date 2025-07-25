import { Effect } from "effect";
import { Rx } from "@effect-rx/rx-react";

export const updateFailsRx = Rx.make(false);
export const todosRx = Rx.make<string[]>([]);

export const addTodoRx = Rx.fn(
  Effect.fnUntraced(function* (todo: string) {
    console.log("addTodoRx", todo);
    yield* Effect.sleep("1 second");
    if (yield* Rx.get(updateFailsRx)) {
      return Effect.fail("Update failed");
    }
    const todos = yield* Rx.get(todosRx);
    yield* Rx.set(todosRx, [...todos, todo]);
    return Effect.succeed("Update succeeded");
  })
);

export const removeTodoRx = Rx.family((todo: string) =>
  Rx.fn(
    Effect.fnUntraced(function* () {
      console.log("removeTodoRx", todo);
      yield* Effect.sleep("1 second");
      if (yield* Rx.get(updateFailsRx)) {
        return Effect.fail("Update failed");
      }
      const todos = yield* Rx.get(todosRx);
      yield* Rx.set(
        todosRx,
        todos.filter((t) => t !== todo)
      );
    })
  )
);
