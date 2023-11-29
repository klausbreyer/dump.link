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
