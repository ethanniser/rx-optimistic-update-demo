import { Array, Effect, Fiber, flow } from "effect";
import { Result, Rx } from "@effect-rx/rx-react";

export const updateFailsRx = Rx.make(false);

interface Todo {
  readonly id: number;
  readonly text: string;
}

class TodosRepo extends Effect.Service<TodosRepo>()("TodosRepo", {
  accessors: true,
  scoped: Effect.gen(function* () {
    const scope = yield* Effect.scope
    let currentId = 0
    let todos = Array.empty<Todo>();

    const nextId = Effect.sync(() => ++currentId);

    const simulateNetwork = Effect.gen(function* () {
      yield* Effect.sleep(1000);
      const shouldFail = yield* Rx.get(updateFailsRx);
      if (shouldFail) {
        return yield* Effect.fail(new Error("Update failed"));
      }
    })

    const add = Effect.fn(function*(todo: Todo) {
      console.log("TodosRepo.add", todo);
      yield* simulateNetwork;
      todos = Array.append(todos, todo);
    })
    const addFork = flow(add, Effect.forkIn(scope))

    const remove = Effect.fn(function*(id: number) {
      console.log("TodosRepo.remove", id);
      yield* simulateNetwork;
      todos = Array.filter(todos, (t) => t.id !== id);
    })

    return {
      nextId,
      add,
      addFork,
      remove,
      all: Effect.sync(() => {
        console.log("TodosRepo.all")
        return todos;
      })
    };
  })
}) {
  static runtime = Rx.runtime(TodosRepo.Default)
}

export const todosRxReadonly = TodosRepo.runtime.rx(TodosRepo.all).pipe(
  Rx.map(Result.getOrElse(Array.empty<Todo>)),
)

export const todosRx = Rx.optimistic(todosRxReadonly);

const addTodoRx = Rx.optimisticFn(todosRx, {
  reducer(current, todo: Todo) {
    console.log("optimisticAddTodosRx", todo);
    return [...current, todo];
  },
  fn: TodosRepo.runtime.fn(
    Effect.fnUntraced(function* (todo) {
      console.log("addTodoRx", todo);
      // To support concurrency, we fork the add operation
      const fiber = yield* TodosRepo.addFork(todo)
      return yield* Fiber.join(fiber)
    })
  ),
})

export const addTodoString = TodosRepo.runtime.fn(Effect.fnUntraced(function*(text: string, get: Rx.FnContext) {
  const id = yield* TodosRepo.nextId
  get.set(addTodoRx, { id, text });
  return yield* get.result(addTodoRx)
}))

export const removeTodoRx = Rx.family((id: number) =>
  Rx.optimisticFn(todosRx, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reducer(current, _: void) {
      console.log("optimisticRemoveTodosRx", id);
      return current.filter((t) => t.id !== id);
    },
    fn: TodosRepo.runtime.fn(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Effect.fnUntraced(function* (_) {
        console.log("removeTodoRx", id);
        yield* TodosRepo.remove(id)
      })
    ),
  })
);
