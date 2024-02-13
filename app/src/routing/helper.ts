import { Location } from "react-router-dom";
import { ProjectID, TabContext } from "../types";

export function getCurrentTab(location: Location): TabContext {
  // Assuming the URL pattern is "/{id}/{tab}".
  const pathSegments = location.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) {
    return TabContext.Group;
  }
  const tabSegment = pathSegments[1];
  return Object.values(TabContext).includes(tabSegment as TabContext)
    ? (tabSegment as TabContext)
    : TabContext.Group;
}
