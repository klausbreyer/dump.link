document.addEventListener("DOMContentLoaded", function () {
  const menuToggles = document.querySelectorAll(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  menuToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  });
});
