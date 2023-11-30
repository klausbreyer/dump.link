document.addEventListener("DOMContentLoaded", function () {
  const menuToggles = document.querySelectorAll(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  menuToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  });
});
function openModal() {
  const modal = document.querySelector(".modal-make");

  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.querySelector(".modal-make");
  modal.classList.add("hidden");
}

document.querySelectorAll(".openModalButton").forEach((button) => {
  button.addEventListener("click", openModal);
});

document.querySelectorAll(".closeModalButton").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("DOMContentLoaded", function () {
  loadFormData();

  const submitButton = document.querySelector(".submitModalButton");
  submitButton.addEventListener("click", function (event) {
    event.preventDefault();

    const projectName = document.getElementById("project-name").value;
    const appetite = document.getElementById("appetite").value;
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;

    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("email", email);

    if (!validateForm(projectName, appetite, firstName, lastName, email)) {
      return;
    }

    const payload = {
      name: projectName,
      appetite: parseInt(appetite, 10),
      ownerEmail: email,
      ownerFirstName: firstName,
      ownerLastName: lastName,
    };

    const postUrl = "/api/v1/projects";

    fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.project.id) {
          document.getElementById("project-name").value = "";

          window.location.href =
            window.location.origin + "/a/" + data.project.id;
        } else {
          console.error("Error in receiving response:", data);
        }
      })
      .catch((error) => {
        console.error("Error in sending request:", error);
      });
  });
});

function loadFormData() {
  document.getElementById("appetite").selectedIndex = 4;

  const savedFirstName = localStorage.getItem("firstName");
  const savedLastName = localStorage.getItem("lastName");
  const savedEmail = localStorage.getItem("email");

  if (savedFirstName) {
    document.getElementById("first-name").value = savedFirstName;
  }
  if (savedLastName) {
    document.getElementById("last-name").value = savedLastName;
  }
  if (savedEmail) {
    document.getElementById("email").value = savedEmail;
  }
}

function validateForm(projectName, appetite, firstName, lastName, email) {
  console.log("Validating form");

  let isValid = true;
  clearValidationErrors();

  if (projectName === "") {
    showError("project-name");
    isValid = false;
  }
  if (appetite === "") {
    showError("appetite");
    isValid = false;
  }
  if (firstName === "") {
    showError("first-name");
    isValid = false;
  }
  if (lastName === "") {
    showError("last-name");
    isValid = false;
  }
  if (email === "") {
    showError("email");
    isValid = false;
  } else if (!validateEmail(email)) {
    showError("email");
    isValid = false;
  }

  return isValid;
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  return emailRegex.test(email);
}

function showError(fieldId) {
  const field = document.getElementById(fieldId);
  console.log(field, fieldId);

  field.classList.add("ring-2", "ring-rose-500");
}

function clearValidationErrors() {
  const fields = [
    "project-name",
    "appetite",
    "first-name",
    "last-name",
    "email",
  ];
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.classList.remove("ring-2", "ring-rose-500");
  });
}
