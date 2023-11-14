import React, { useRef } from "react";
import { useData } from "./context/data";
import SimpleButton from "./common/SimpleButton";

interface SettingsProps {
  // [key: string]: any;
}

const Settings: React.FC<SettingsProps> = (props) => {
  const { state } = useData();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClearLocalStorage = () => {
    localStorage.clear();
    alert("Local storage cleared!"); // Optional: to notify the user
    redirectToNewURL();
  };

  const handleSaveToLocalStorage = () => {
    const content = textareaRef.current?.value;
    if (content) {
      localStorage.setItem("appData", content);
      alert("Data saved to local storage!"); // Optional: to notify the user
      redirectToNewURL();
    }
  };

  const redirectToNewURL = () => {
    // Get the current location object
    const { protocol, host, pathname } = window.location;

    // Construct the new URL without query parameters or hash
    const newURL = `${protocol}//${host}${pathname}`;

    // Redirect to the new URL
    window.location.href = newURL;
  };

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="text-xl">Settings</h1>
      <SimpleButton color="red" onClick={handleClearLocalStorage}>
        Reset localStorage
      </SimpleButton>
      <br />
      <br />
      <h1 className="text-xl">State</h1>
      <textarea
        ref={textareaRef}
        className="w-full border h-80"
        defaultValue={JSON.stringify(state)}
      ></textarea>
      <br />
      <SimpleButton color="indigo" onClick={handleSaveToLocalStorage}>
        Save to localStorage
      </SimpleButton>
    </div>
  );
};

export default Settings;
