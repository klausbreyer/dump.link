import { useAuth0 } from "@auth0/auth0-react";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { useEffect } from "react";
import { DndProvider } from "react-dnd-multi-backend";
import { Route, Routes } from "react-router-dom";
import DLMenu from "../Menu/Menu";
import { isOrgLink } from "../Routing";
import { LoginRequired } from "../common/Alert";
import Arrange from "./Arrange";
import Group from "./Group";
import Header from "./Header";
import NotificationBar from "./NotificationBar";
import Sequence from "./Sequence";
import Settings from "./Settings";
import { AbsenceProvider } from "./context/absence";
import { DataProvider } from "./context/data";
import { GlobalInteractionProvider } from "./context/interaction";
import { NotFoundPage } from "./context/lifecycle";
import { TabContext } from "./types";

export default function Project() {
  return (
    <GlobalInteractionProvider>
      <DataProvider>
        <AbsenceProvider>
          <DndProvider options={HTML5toTouch}>
            <Routing />
          </DndProvider>
        </AbsenceProvider>
      </DataProvider>
    </GlobalInteractionProvider>
  );
}

const Routing = function Loaded() {
  const { isAuthenticated } = useAuth0();
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };
  useEffect(() => {
    if (isTouchDevice()) {
      alert("Mobile & touch access in beta - expect some quirks!");
    }
  }, []);

  if (!isAuthenticated && isOrgLink()) {
    return <LoginRequired />;
  }

  return (
    <>
      {isOrgLink() && <DLMenu />}
      <Header />
      <Routes>
        <Route path={TabContext.Settings} element={<Settings />} />
        <Route path={TabContext.Group} element={<Group />} />
        <Route path={TabContext.Arrange} element={<Arrange />} />
        <Route path={TabContext.Sequence} element={<Sequence />} />
        <Route path="/" element={<Group />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <NotificationBar />
    </>
  );
};
