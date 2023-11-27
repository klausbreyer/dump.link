import React, { useEffect, useState } from "react";
import InfoButton from "./common/InfoButton";
import Title from "./common/Title";
import { useData } from "./context/data";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = (props) => {
  const { updateProject, getProject } = useData();
  const project = getProject();

  const [name, setName] = useState(project.name);
  const [startedAt, setStartedAt] = useState(
    project.startedAt.toISOString().split("T")[0],
  );
  const [appetite, setAppetite] = useState(project.appetite.toString());

  useEffect(() => {
    setName(project.name);
    setStartedAt(project.startedAt.toISOString().split("T")[0]);
    setAppetite(project.appetite.toString());
  }, [project]);

  console.log(startedAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProject({
      name,
      startedAt: new Date(startedAt),
      appetite: parseInt(appetite, 10),
    });
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="mb-4">
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
            onChange={(e) => setStartedAt(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="appetite"
            className="block text-sm font-medium text-gray-700"
          >
            Appetite
          </label>
          <select
            id="appetite"
            value={appetite}
            onChange={(e) => setAppetite(e.target.value)}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                {week} Week{week > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end">
          <InfoButton type="submit">Save Settings</InfoButton>
        </div>
      </form>
    </div>
  );
};

export default Settings;
