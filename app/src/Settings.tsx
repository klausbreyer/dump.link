import React, { useEffect, useState } from "react";
import InfoButton from "./common/InfoButton";
import Title from "./common/Title";
import { useData } from "./context/data";
import Container from "./common/Container";
import ShareLink from "./ShareLink";

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

  const inputClassNames =
    "  bg-white w-full rounded-sm shadow-md relative border-b-2 select-text overflow-hidden focus:outline outline-2 outline-indigo-500 border-slate-500 hover:border-slate-600 focus:border-slate-600";

  return (
    <Container>
      <div className="grid max-w-sm grid-cols-1 gap-10 mt-4">
        <div>
          <div className="flex items-center justify-start gap-2">
            <Title>Settings</Title>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col max-w-sm">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Project Name
              </label>
              <input
                type="text"
                id="name"
                maxLength={40}
                value={name}
                onChange={handleChange(setName)}
                className={inputClassNames}
              />
            </div>

            <div className="w-40 mb-4">
              <label
                htmlFor="startedAt"
                className="block text-sm font-medium text-slate-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startedAt"
                value={startedAt}
                onChange={handleChange(setStartedAt)}
                className={inputClassNames}
              />
            </div>

            <div className="w-40 mb-4">
              <label
                htmlFor="appetite"
                className="block text-sm font-medium text-slate-700"
              >
                Appetite
              </label>
              <select
                id="appetite"
                value={appetite}
                onChange={handleChange(setAppetite)}
                className={inputClassNames}
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
        <div>
          <div className="flex items-center justify-start gap-2">
            <Title>Share</Title>
          </div>
          <ShareLink />
        </div>
      </div>
    </Container>
  );
};

export default Settings;
