import { Effect } from "effect";
import { Rx } from "@effect-rx/rx-react";

export const updateFailsRx = Rx.make(false);

export const todosRx = Rx.make<string[]>([]);

export const optimisticTodosRx = Rx.writable(
  (get) => get(todosRx),
  (ctx, value: string[]) => ctx.setSelf(value)
);

export const addTodoRx = Rx.fn(
  Effect.fnUntraced(function* (todo: string) {
    const todos = yield* Rx.get(todosRx);
    yield* Rx.set(optimisticTodosRx, [...todos, todo]);
    yield* Effect.addFinalizer(() => Rx.refresh(optimisticTodosRx));
    yield* Effect.sleep("1 second");
    if (yield* Rx.get(updateFailsRx)) {
      yield* Effect.fail("Update failed");
    }
    yield* Rx.set(todosRx, [...todos, todo]);
  }, Effect.scoped)
);

export const removeTodoRx = Rx.family((todo: string) =>
  Rx.fn(
    Effect.fnUntraced(function* () {
      const todos = yield* Rx.get(todosRx);
      yield* Effect.sleep("1 second");
      if (yield* Rx.get(updateFailsRx)) {
        yield* Effect.fail("Update failed");
      }
      yield* Rx.set(
        todosRx,
        todos.filter((t) => t !== todo)
      );
    })
  )
);
