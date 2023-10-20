// hooks/useHashChange.tsx

import { useEffect, useState } from "react";

export const useHashChange = () => {
  const [hash, setHash] = useState(window.location.hash.slice(1));

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.slice(1));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return hash;
};
