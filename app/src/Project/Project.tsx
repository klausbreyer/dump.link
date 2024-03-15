import { useAuth0 } from "@auth0/auth0-react";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { useEffect } from "react";
import { DndProvider } from "react-dnd-multi-backend";
import { Route, Routes } from "react-router-dom";
import { isOrgLink } from "../../routes";
import DLMenu from "../Menu/Menu";
import Arrange from "./Arrange";
import Group from "./Group";
import Header from "./Header";
import NotificationBar from "./NotificationBar";
import Sequence from "./Sequence";
import Settings from "./Settings";
import { AbsenceProvider } from "./context/absence";
import { DataProvider } from "./context/data";
import { GlobalInteractionProvider } from "./context/interaction";
import { TabContext } from "./types";

export default function Project() {
  return (
    <GlobalInteractionProvider>
      <DataProvider>
        <AbsenceProvider>
          <DndProvider options={HTML5toTouch}>
            <Router />
          </DndProvider>
        </AbsenceProvider>
      </DataProvider>
    </GlobalInteractionProvider>
  );
}

const Router = function Loaded() {
  const { isAuthenticated } = useAuth0();
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };
  useEffect(() => {
    if (isTouchDevice()) {
      alert("Mobile & touch access in beta - expect some quirks!");
    }
  }, []);

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

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="text-slate-500">Route not found</div>
    </div>
  );
}
