import React, { useEffect, useState } from "react";
import InfoButton from "./common/InfoButton";
import Title from "./common/Title";
import { useData } from "./context/data";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = (props) => {
  const { updateProject, getProject } = useData();
  const project = getProject();

  const [isDirty, setIsDirty] = useState(false);
  const [name, setName] = useState(project.name);
  const [startedAt, setStartedAt] = useState(
    project.startedAt.toISOString().split("T")[0],
  );
  const [appetite, setAppetite] = useState(project.appetite.toString());

  const handleChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setIsDirty(true);
    };

  useEffect(() => {
    setName(project.name);
    setStartedAt(project.startedAt.toISOString().split("T")[0]);
    setAppetite(project.appetite.toString());
    setIsDirty(false);
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject({
      name,
      startedAt: new Date(startedAt),
      appetite: parseInt(appetite, 10),
    });
    setTimeout(() => {
      console.log("timeout");

      setIsDirty(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-start gap-2">
        <Title title="Settings" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col max-w-sm mt-4 ">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Project Name
          </label>
          <input
            type="text"
            id="name"
            maxLength={40}
            value={name}
            onChange={handleChange(setName)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="w-40 mb-4">
          <label
            htmlFor="startedAt"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startedAt"
            value={startedAt}
            onChange={handleChange(setStartedAt)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="w-40 mb-4">
          <label
            htmlFor="appetite"
            className="block text-sm font-medium text-gray-700"
          >
            Appetite
          </label>
          <select
            id="appetite"
            value={appetite}
            onChange={handleChange(setAppetite)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {[2, 3, 4, 6, 8].map((week) => (
              <option key={week} value={week}>
                {week} Weeks
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-start">
          <InfoButton type="submit" disabled={!isDirty}>
            Save Settings
          </InfoButton>
        </div>
      </form>
    </div>
  );
};

export default Settings;
