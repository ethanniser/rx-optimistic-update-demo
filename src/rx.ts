import {
  Effect,
  HashMap,
  Layer,
  Option,
  Random,
  Schedule,
  Stream,
} from "effect";
import { Rx, useRxValue } from "@effect-rx/rx-react";

export type DomainState =
  | {
      _tag: "loading";
    }
  | {
      _tag: "loaded";
      price: number;
    };

// we have a layer we need for the real app this is just an example
export const rxRuntime = Rx.runtime(Layer.empty);

const allDomainsStateRx = Rx.make(HashMap.empty<string, DomainState>()).pipe(
  Rx.keepAlive
);

export const domainStateRx = Rx.family((domain: string) =>
  Rx.writable(
    (get) => {
      const allStates = get(allDomainsStateRx);
      return HashMap.get(allStates, domain).pipe(
        Option.getOrElse(() => ({
          _tag: "loading" as const,
        }))
      );
    },
    (ctx, newValue: DomainState) => {
      ctx.set(
        allDomainsStateRx,
        HashMap.set(ctx.get(allDomainsStateRx), domain, newValue)
      );
    }
  )
);

export const initiateDomainAvailabilityRequestRx = Rx.family(
  (domains: string[]) =>
    rxRuntime.rx(
      makeStream(domains).pipe(
        Stream.tap((result) =>
          Rx.set(domainStateRx(result.domain), {
            _tag: "loaded",
            price: result.price,
          })
        ),
        Stream.runDrain
      )
    )
);

export const useDomainState = (domain: string): DomainState => {
  return useRxValue(domainStateRx(domain));
};

export const useInitiateDomainAvailabilityRequest = (domains: string[]) => {
  return useRxValue(initiateDomainAvailabilityRequestRx(domains));
};

// mock of RPC stream call
const makeStream = (domains: string[]) =>
  Stream.make(
    ...domains.map((domain) => ({
      domain,
      price: Math.random() * 100,
    }))
  ).pipe(Stream.schedule(Schedule.spaced("250 millis")));

const mockMutation = Effect.fnUntraced(function* (domain: string) {
  yield* Effect.sleep("250 millis");
  if (yield* Random.nextBoolean) {
    yield* Effect.fail("error");
  }
  return "updated";
});

export const mutationRx = Rx.fn(mockMutation);
