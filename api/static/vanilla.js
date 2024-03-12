document.addEventListener("DOMContentLoaded", function () {
  const menuToggles = document.querySelectorAll(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  menuToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var videos = document.querySelectorAll(".video");

  videos.forEach(function (video) {
    video.onended = function () {
      setTimeout(function () {
        video.play();
      }, 2000);
    };
  });
});
