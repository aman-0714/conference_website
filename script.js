// ================= COUNTDOWN =================

function countdown() {
    const eventDate = new Date("March 26, 2027 00:00:00").getTime();
    const now = new Date().getTime();
    const gap = eventDate - now;

    if (gap <= 0) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        return;
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const d = Math.floor(gap / day);
    const h = Math.floor((gap % day) / hour);
    const m = Math.floor((gap % hour) / minute);
    const s = Math.floor((gap % minute) / second);

    document.getElementById("days").innerText = d.toString().padStart(2, "0");
    document.getElementById("hours").innerText = h.toString().padStart(2, "0");
    document.getElementById("minutes").innerText = m.toString().padStart(2, "0");
    document.getElementById("seconds").innerText = s.toString().padStart(2, "0");
}

setInterval(countdown, 1000);
countdown(); // run once immediately



// ================= MOBILE NAV TOGGLE =================

const toggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

if (toggle) {
    toggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });
}
let slides = document.querySelectorAll(".slide");
let dots = document.querySelectorAll(".dot");

let index = 0;

function showSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  dots.forEach(dot => dot.classList.remove("active"));

  slides[i].classList.add("active");
  dots[i].classList.add("active");
}

function nextSlide() {
  index++;
  if (index >= slides.length) {
    index = 0;
  }
  showSlide(index);
}

setInterval(nextSlide, 4000);

/* Click on dots */
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    index = i;
    showSlide(index);
  });
});

let leftArrow = document.querySelector(".hero-left");
let rightArrow = document.querySelector(".hero-right");

leftArrow.addEventListener("click", () => {
  index--;
  if (index < 0) {
    index = slides.length - 1;
  }
  showSlide(index);
});

rightArrow.addEventListener("click", () => {
  index++;
  if (index >= slides.length) {
    index = 0;
  }
  showSlide(index);
});