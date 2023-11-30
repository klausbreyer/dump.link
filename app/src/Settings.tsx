import React, { useEffect, useState } from "react";
import InfoButton from "./common/InfoButton";
import Title from "./common/Title";
import { useData } from "./context/data";
import Container from "./common/Container";
import ShareLink from "./ShareLink";
import InfoTooltip from "./common/InfoTooltip";

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
    "  bg-white  rounded-sm shadow-md relative border-b-2 select-text overflow-hidden focus:outline outline-2 outline-indigo-500 border-slate-500 hover:border-slate-600 focus:border-slate-600";

  return (
    <Container>
      <div className="grid max-w-xl grid-cols-1 gap-10 mt-4">
        <div>
          <div className="flex items-center justify-start gap-2">
            <Title>Settings</Title>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="">
              <div className="flex items-center gap-2">
                <Label htmlFor="name">Project Name</Label>
                <InfoTooltip>
                  The project name is the unique identifier for your initiative.
                  It's how you and your team refer to the project in discussions
                  and documentation. Choose a name that is both meaningful and
                  concise, reflecting the essence of what you're aiming to do.
                </InfoTooltip>
              </div>
              <input
                type="text"
                id="name"
                maxLength={40}
                value={name}
                onChange={handleChange(setName)}
                className={`${inputClassNames}`}
              />
            </div>
            <div className="">
              <div className="flex items-center gap-2">
                <Label htmlFor="appetite">Appetite</Label>
                <InfoTooltip>
                  With an appetite, the question is about how much time we want
                  to spend getting some version of something we want to do. It
                  is a strategic question about the value of what we want to do
                  with a fixed-time-variable-scope constraint. With an appetite,
                  we start with a number and end with an approach/solution.
                </InfoTooltip>
              </div>
              <select
                id="appetite"
                value={appetite}
                onChange={handleChange(setAppetite)}
                className={`${inputClassNames} w-36`}
              >
                {[2, 3, 4, 5, 6, 7, 8].map((week) => (
                  <option key={week} value={week}>
                    {week} Weeks
                  </option>
                ))}
              </select>
            </div>

            <div className="">
              <div className="flex items-center gap-2">
                <Label htmlFor="startedAt">Start Date</Label>
                <InfoTooltip>
                  "The 'Start Date' marks the commencement of your project and
                  is the point from which your project's appetite is measured.
                  It's essential for aligning the team's efforts and
                  establishing a clear timeline. This date not only aids in
                  planning and resource allocation but also serves as a critical
                  reference for tracking progress against your project's
                  objectives and milestones.
                </InfoTooltip>
              </div>
              <input
                type="date"
                id="startedAt"
                value={startedAt}
                onChange={handleChange(setStartedAt)}
                className={`${inputClassNames} w-36`}
              />
            </div>
            <div></div>

            <div className="flex items-center justify-start">
              <InfoButton type="submit" disabled={!isDirty}>
                Save Settings
              </InfoButton>
            </div>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Settings;

interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-slate-700"
    >
      {children}
    </label>
  );
};
