import React from "react";

interface SettingsProps {
  // [key: string]: any;
}

const Settings: React.FC<SettingsProps> = (props) => {
  const handleClearLocalStorage = () => {
    localStorage.clear();
    alert("Local storage cleared!"); // Optional: to notify the user
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
      <button
        className="p-1 rounded-md shadow-lg bg-rose-200 hover:bg-rose-300"
        onClick={handleClearLocalStorage}
      >
        Reset localStorage
      </button>
    </div>
  );
};

export default Settings;
