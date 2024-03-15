import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { isOrgLink, links } from "../../routes";
import DLMenu from "../Menu/Menu";
import { LifecycleState, useLifecycle } from "../Project/context/lifecycle";
import Container from "../common/Container";
import Explanation from "../common/Explanation";
import InfoButton from "../common/InfoButton";
import Input from "../common/Input";
import Select from "../common/Select";
import { useApi } from "../hooks/useApi";

interface FormState {
  projectName: string;
  appetite: string;
  firstName: string;
  lastName: string;
  email: string;
}

const defaultFormState: FormState = {
  projectName: "",
  appetite: "6", // Default value corresponding to the 6 Weeks option
  firstName: "",
  lastName: "",
  email: "",
};

export default function New() {
  const api = useApi(true);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { setLifecycle } = useLifecycle();
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<FormState | null>(
    null,
  );

  useEffect(() => {
    setLifecycle(LifecycleState.Loaded);
  }, [setLifecycle]);

  useEffect(() => {
    const savedFirstName = localStorage.getItem("firstName");
    const savedLastName = localStorage.getItem("lastName");
    const savedEmail = localStorage.getItem("email");

    setFormData((prevState) => ({
      ...prevState,
      firstName: savedFirstName || prevState.firstName,
      lastName: savedLastName || prevState.lastName,
      email: savedEmail || prevState.email,
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem("firstName", formData.firstName);
    localStorage.setItem("lastName", formData.lastName);
    localStorage.setItem("email", formData.email);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const errors: FormState = { ...defaultFormState };
    let isValid = true;

    if (!formData.projectName) {
      errors.projectName = "This field is required";
      isValid = false;
    }

    if (!isAuthenticated && !formData.firstName) {
      errors.firstName = "This field is required";
      isValid = false;
    }
    if (!isAuthenticated && !formData.lastName) {
      errors.lastName = "This field is required";
      isValid = false;
    }
    if (!isAuthenticated && !formData.email) {
      errors.email = "This field is required";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!isAuthenticated && !emailRegex.test(formData.email)) {
        errors.email = "Invalid email format";
        isValid = false;
      }
    }

    setValidationErrors(isValid ? null : errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const project = await api.postProject(
        formData.projectName,
        parseInt(formData.appetite, 10),
        isAuthenticated ? undefined : formData.email,
        isAuthenticated ? undefined : formData.firstName,
        isAuthenticated ? undefined : formData.lastName,
      );
      const path = project.orgId
        ? links.orgProject(project.orgId, project.id)
        : links.publicProject(project.id);
      window.location.href = `/a${path}`;
    } catch (error) {
      console.error("Error in sending request:", error);
      alert("Error in sending request" + error);
    }
  };

  return (
    <>
      {isOrgLink() && <DLMenu />}
      <Container>
        <form
          className="flex-col max-w-xl m-10 mx-auto"
          onSubmit={handleSubmit}
        >
          <h1 className="mb-4 text-lg font-bold text-slate-700">
            Make a new dumplink
          </h1>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
            <div className="mb-2 sm:col-span-3">
              <Input
                title="Project name"
                name="projectName"
                type="text"
                value={formData.projectName}
                onChange={handleChange}
                errorMessage={validationErrors?.projectName}
                maxLength={40}
                placeholder="Enter project name"
                className="w-full"
              />
            </div>
            <div className="mb-2 sm:col-span-3 sm:col-start-1">
              <Select
                title="Appetite"
                name="appetite"
                className="w-36"
                value={formData.appetite}
                onChange={handleChange}
                options={[
                  { value: "2", label: "2 Weeks" },
                  { value: "3", label: "3 Weeks" },
                  { value: "4", label: "4 Weeks" },
                  { value: "5", label: "5 Weeks" },
                  { value: "6", label: "6 Weeks" },
                  { value: "7", label: "7 Weeks" },
                  { value: "8", label: "8 Weeks" },
                ]}
              />
            </div>

            {!isAuthenticated && (
              <>
                <div className=" sm:col-span-6">
                  <h2 className="text-base font-semibold leading-7 text-slate-900">
                    Personal Information
                  </h2>
                </div>

                <div className="mb-2 sm:col-span-3">
                  <Input
                    title="first name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    errorMessage={validationErrors?.firstName}
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    className="w-full"
                  />
                </div>

                <div className="mb-2 sm:col-span-3">
                  <Input
                    title="Last name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    errorMessage={validationErrors?.lastName}
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-4">
                  <Input
                    title="E-Mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    errorMessage={validationErrors?.email}
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                  <Explanation>
                    We will not spam you. We do not sell your information.
                  </Explanation>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-start mt-2">
            {!loading && (
              <InfoButton type="submit">🥟 Make dumplink!</InfoButton>
            )}
            {loading && (
              <InfoButton disabled className=" animate-pulse">
                <div id="loading" className="mx-auto text-left w-18">
                  🥟 Loading...
                </div>
              </InfoButton>
            )}
          </div>
        </form>
      </Container>
    </>
  );
}
