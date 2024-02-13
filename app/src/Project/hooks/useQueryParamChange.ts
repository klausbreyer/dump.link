import { useEffect, useState } from "react";

export const useQueryParamChange = (paramName: string) => {
  const getQueryParamValue = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName) || "";
  };

  const [paramValue, setParamValue] = useState(getQueryParamValue());

  useEffect(() => {
    const handleQueryParamChange = () => {
      setParamValue(getQueryParamValue());
    };

    // Listen to both 'popstate' and 'urlchanged' events
    window.addEventListener("popstate", handleQueryParamChange);
    window.addEventListener("urlchanged", handleQueryParamChange);

    return () => {
      window.removeEventListener("popstate", handleQueryParamChange);
      window.removeEventListener("urlchanged", handleQueryParamChange);
    };
  }, []);

  return paramValue;
};
