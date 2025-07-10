import { useMemo, useState } from "react";
import {
  mutationRx,
  useDomainState,
  useInitiateDomainAvailabilityRequest,
} from "./rx";
import { useRx } from "@effect-rx/rx-react";

const tlds = [".com", ".dev", ".io", ".org", ".xyz", ".app"];

export default function App() {
  const [query, setQuery] = useState("");
  const domains = useMemo(() => tlds.map((tld) => `${query}${tld}`), [query]);
  useInitiateDomainAvailabilityRequest(domains);

  const [mutationResult, mutate] = useRx(mutationRx);
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={() => mutate("test.com")}>Mutate</button>
      <pre>{JSON.stringify(mutationResult, null, 2)}</pre>

      {domains.map((domain) => (
        <Domain key={domain} domain={domain} />
      ))}
    </div>
  );
}

function Domain({ domain }: { domain: string }) {
  const state = useDomainState(domain);

  return (
    <div>
      <h1>{domain}</h1>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
