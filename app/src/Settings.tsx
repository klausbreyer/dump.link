import React, { useEffect, useState } from "react";
import InfoButton from "./common/InfoButton";
import Title from "./common/Title";
import { useData } from "./context/data";
import Container from "./common/Container";
import ShareLink from "./ShareLink";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = (props) => {
  const { updateProject, project } = useData();

  const [isDirty, setIsDirty] = useState(false);
  const [name, setName] = useState(project.name);
  const [startedAt, setStartedAt] = useState(
    project.startedAt.toISOString().split("T")[0],
  );
  const [appetite, setAppetite] = useState(project.appetite.toString());

  const toggleArchiveStatus = () => {
    const updatedProject = { ...project, archived: !project.archived };
    updateProject(updatedProject);
    // Optional: Add logic to navigate away or show a confirmation message
  };

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
      setIsDirty(false);
    }, 1000);
  };

  const inputClassNames =
    "  bg-white rounded-sm shadow-md relative border-b-2 select-text overflow-hidden focus:outline outline-2 outline-indigo-500 border-slate-500 hover:border-slate-600 focus:border-slate-600";

  return (
    <Container>
      <div className="grid grid-cols-2 gap-10 mt-4">
        <div>
          <div className="flex items-center justify-start gap-2">
            <Title>Settings</Title>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
              <Label htmlFor="name">Project Name</Label>
              <input
                type="text"
                id="name"
                maxLength={40}
                value={name}
                onChange={handleChange(setName)}
                className={`${inputClassNames}`}
              />
              <Explanation>
                The project name is the unique identifier for your initiative.
                It's how you and your team refer to the project in discussions
                and documentation. Choose a name that is both meaningful and
                concise.
              </Explanation>
            </div>

            <div className="mb-4 ">
              <Label htmlFor="appetite">Appetite</Label>
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
              <Explanation>
                With an appetite, the question is about how much time we want to
                spend getting some version of something we want to do. It is a
                strategic question about the value of what we want to do with a
                fixed-time-variable-scope constraint.
              </Explanation>
            </div>

            <div className="mb-4">
              <Label htmlFor="startedAt">Start Date</Label>
              <input
                type="date"
                id="startedAt"
                value={startedAt}
                onChange={handleChange(setStartedAt)}
                className={`${inputClassNames} w-36`}
              />
              <Explanation>
                The 'Start Date' marks the commencement of your project and is
                the point from which your project's appetite is measured.
              </Explanation>
            </div>

            <div className="flex items-center justify-start">
              <InfoButton type="submit" disabled={!isDirty}>
                Save Settings
              </InfoButton>
            </div>
          </form>
        </div>
        <div>
          {/* Danger Zone for Archiving */}
          <div className="p-4 mt-10 bg-gray-100 border border-gray-300 rounded">
            <h3 className="font-semibold text-gray-700 text-md">
              Project Archive
            </h3>
            <p className="mb-2 text-sm text-gray-600">
              {project.archived
                ? "This project is currently archived. You can reactivate it at any time."
                : "You can archive this project. It can be reactivated later if needed."}
            </p>
            <InfoButton color={"gray"} onClick={toggleArchiveStatus}>
              {project.archived ? "Reactivate Project" : "Archive Project"}
            </InfoButton>
          </div>
          <div className="p-4 mt-10 border rounded bg-violet-100 border-violet-500">
            <h3 className="font-semibold text-md text-violet-700">
              Need More Help?
            </h3>
            <p className="mb-2 text-sm text-violet-600">
              If you wish for more configuration options or have questions that
              you don't find answers to, please join us on our Discord server.
            </p>
            <InfoButton
              color={"violet"}
              onClick={() => {
                window.open("https://discord.gg/C3hdezbYdD", "_blank");
              }}
            >
              Join Discord
            </InfoButton>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Settings;
interface ExplanationProps {
  children: React.ReactNode;
}

const Explanation: React.FC<ExplanationProps> = ({ children }) => {
  return <p className="mt-1 text-sm italic text-slate-500">{children}</p>;
};
interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-slate-700">
      {children}
    </label>
  );
};
