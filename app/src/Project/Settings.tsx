import React, { useEffect, useState } from "react";
import Container from "../common/Container";
import Explanation from "../common/Explanation";
import InfoButton from "../common/InfoButton";
import Input from "../common/Input";
import Select from "../common/Select";
import Title from "../common/Title";
import { dateToYYYYMMDD } from "../useApi/dates";
import { useData } from "./context/data/data";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = (props) => {
  const { updateProject, project } = useData();

  const [name, setName] = useState(project.name);
  const [startedAt, setStartedAt] = useState(dateToYYYYMMDD(project.startedAt));
  const [endingAt, setEndingAt] = useState(
    project.endingAt ? dateToYYYYMMDD(project.endingAt) : "",
  );
  const [appetite, setAppetite] = useState(project.appetite.toString());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setName(project.name);
    setStartedAt(dateToYYYYMMDD(project.startedAt));
    // Ensure endingAt is always a string or component switches from uncontrolled to controlled
    setEndingAt(project.endingAt ? dateToYYYYMMDD(project.endingAt) : "");
    setAppetite(project.appetite.toString());
    setIsDirty(false);
  }, [project]);

  const toggleArchiveStatus = () => {
    const updatedProject = { ...project, archived: !project.archived };
    updateProject(updatedProject);
  };

  const handleChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setIsDirty(true);
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject({
      name,
      startedAt: new Date(startedAt),
      endingAt: endingAt ? new Date(endingAt) : undefined,
      appetite: parseInt(appetite, 10),
    });
    setTimeout(() => {
      setIsDirty(false);
    }, 1000);
  };

  const maxEnding = new Date(startedAt);
  maxEnding.setFullYear(maxEnding.getFullYear() + 5);

  const isValid =
    appetite !== "0" ||
    (appetite === "0" &&
      endingAt !== undefined &&
      new Date(endingAt) >= new Date(startedAt) &&
      new Date(endingAt) <= maxEnding);

  return (
    <>
      <Container>
        <div className="grid grid-cols-2 gap-10 mt-4">
          <div>
            <div className="flex items-center justify-start gap-2">
              <Title>Settings</Title>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="mb-4">
                <Input
                  title="Project Name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={handleChange(setName)}
                  maxLength={40}
                  placeholder="Enter project name"
                  className=" w-96"
                />
                <Explanation>
                  The project name is the unique identifier for your initiative.
                  It's how you and your team refer to the project in discussions
                  and documentation. Choose a name that is both meaningful and
                  concise.
                </Explanation>
              </div>
              <div className="mb-4">
                <Select
                  title="Appetite"
                  name="appetite"
                  value={appetite}
                  className=" w-44"
                  onChange={handleChange(setAppetite)}
                  options={[
                    { value: "2", label: "2 Weeks" },
                    { value: "3", label: "3 Weeks" },
                    { value: "4", label: "4 Weeks" },
                    { value: "5", label: "5 Weeks" },
                    { value: "6", label: "6 Weeks" },
                    { value: "7", label: "7 Weeks" },
                    { value: "8", label: "8 Weeks" },
                    { value: "0", label: "Select custom end date" },
                  ]}
                />
                <Explanation>
                  With an appetite, the question is about how much time we want
                  to spend getting some version of something we want to do. It
                  is a strategic question about the value of what we want to do
                  with a fixed-time-variable-scope constraint. Choosing 'manual'
                  for appetite allows to manually set an end date.
                </Explanation>
              </div>

              <div className="mb-4">
                <div className="flex items-start justify-start gap-4">
                  <div>
                    <Input
                      title="Start Date"
                      name="startedAt"
                      type="date"
                      value={startedAt}
                      onChange={handleChange(setStartedAt)}
                      placeholder="Select start date"
                      className=" w-44"
                    />
                  </div>
                  {appetite === "0" && (
                    <div>
                      <Input
                        title="End Date"
                        name="endingAt"
                        type="date"
                        value={endingAt}
                        onChange={handleChange(setEndingAt)}
                        min={startedAt}
                        placeholder="Select end date"
                        className=" w-44"
                      />
                    </div>
                  )}
                </div>
                <Explanation>
                  The 'Start Date' marks the commencement of your project and is
                  the point from which your project's appetite is measured.{" "}
                  {appetite === "0" && (
                    <>
                      Without appetite, you can also specify an 'End Date' to
                      define the project's duration and scope.
                    </>
                  )}
                </Explanation>
              </div>

              <div className="flex items-center justify-start">
                <InfoButton type="submit" disabled={!isValid || !isDirty}>
                  Save Settings
                </InfoButton>
              </div>
            </form>
          </div>
          <div>
            <div className="flex flex-col gap-4 mt-10">
              {/* Danger Zone for Archiving */}
              <div className="p-4 bg-gray-100 border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-700 text-md">
                  {project.archived ? "Reactivate Project" : "Archive Project"}
                </h3>
                <p className="mb-2 text-sm text-gray-600">
                  {project.archived
                    ? "This project is currently archived. In this state, it remains accessible in a read-only format, meaning it is essentially frozen and no operational changes can be made. However, you can still modify project settings, such as changing its archived status. Reactivating the project at any time will restore its full functionality, including the ability to make comprehensive edits and updates."
                    : "You can opt to archive this project. When archived, the project enters a read-only state, frozen in its current form with no scope for operational modifications. However, you retain the ability to alter project settings, like toggling the archived status. Should you need to, the project can be reactivated later, enabling full access and the capability to perform necessary updates and changes."}
                </p>
                <InfoButton color={"gray"} onClick={toggleArchiveStatus}>
                  {project.archived ? "Reactivate Project" : "Archive Project"}
                </InfoButton>
              </div>
              {/* delete */}
              <div className="p-4 bg-red-100 border border-red-300 rounded">
                <h3 className="font-semibold text-red-700 text-md">
                  Delete Project
                </h3>
                <p className="mb-2 text-sm text-red-600">
                  For security purposes and the lack of a user authentication
                  system, projects cannot be directly deleted from the web
                  interface. To request the deletion of your project, please
                  email{" "}
                  <a
                    className="underline hover:no-underline"
                    href="mailto:support@dump.link"
                  >
                    support@dump.link
                  </a>{" "}
                  using the email account associated with your dumplink, and
                  include the ID or link to your dumplink.
                </p>
                <InfoButton
                  color={"red"}
                  href={`mailto:support@dump.link?subject=Deletion of Project ID ${project.id}`}
                >
                  Delete Project
                </InfoButton>
              </div>
              {/* Discord */}
              <div className="p-4 border rounded bg-violet-100 border-violet-500">
                <h3 className="font-semibold text-md text-violet-700">
                  Need More Help?
                </h3>
                <p className="mb-2 text-sm text-violet-600">
                  If you wish for more configuration options or have questions
                  that you don't find answers to, please join us on our Discord
                  server.
                </p>
                <InfoButton
                  color={"violet"}
                  href="https://discord.gg/C3hdezbYdD"
                  target="_blank"
                >
                  Join Discord
                </InfoButton>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Settings;

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
