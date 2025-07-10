import { useMemo, useState } from "react";
import { useDomainState, useInitiateDomainAvailabilityRequest } from "./rx";

const tlds = [".com", ".dev", ".io", ".org", ".xyz", ".app"];

export default function App() {
  const [query, setQuery] = useState("");
  const domains = useMemo(() => tlds.map((tld) => `${query}${tld}`), [query]);
  useInitiateDomainAvailabilityRequest(domains);
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

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
