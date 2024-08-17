import { DateTime } from "https://cdn.jsdelivr.net/npm/luxon@3.0.1/build/es6/luxon.js";
const d = document;
const apiKey = `52e15649f4f849388022ebdf377a9d10`;
let url = "";
const $loader = d.getElementById("loader");
const $mobileWeather = d.querySelector(".mobile-weather");
const $desktopWeather = d.querySelector(".desktop-weather");
const $templateInputSearch = d.getElementById("template-input-search").content;
const $templateMainWeather = d.getElementById("template-main-weather").content;
const $templateNextWheather = d.getElementById(
  "template-next-wheather"
).content;
const $templateInfoWeather = d.getElementById("template-info-weather").content;
const mqLarge = window.matchMedia("(min-width: 700px)");
let data = {};

const getData = async (location, city) => {
  if (location !== undefined && city === undefined) {
    let res = await fetch(
      `https://api.weatherbit.io/v2.0/forecast/daily?lat=${location.lat}&lon=${location.lon}&days=5&key=${apiKey}`
    );
    data = await res.json();
    mqHandler(mqLarge);
  }
  if (city !== undefined && location === undefined) {
    try {
      let res = await fetch(
        `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=5&key=${apiKey}`
      );
      if (!res.ok) throw { status: res.status, statusText: res.statusText };
      data = await res.json();
      mqHandler(mqLarge);
    } catch (err) {
      let message = err.statusText || "Ocurrió un error";
      console.log(message);
      let $span = d.querySelector(".input-search-error");
      $span.classList.add("is-active");
      setInterval(() => $span.classList.remove("is-active"), 4000);
    }
  }
};

const toggleLoader = (show) => {
  $loader.classList.toggle("hidden", !show);
};

const getDate = (timezone) => {
  let date = DateTime.now().setZone(timezone);
  const fullDate = date.toLocaleString({
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  let dayDate = date.toLocaleString({ weekday: "long" });
  dayDate = dayDate.charAt(0).toUpperCase() + dayDate.slice(1);
  return {
    fullDate,
    dayDate,
  };
};

const isDay = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

const getIcon = (code) => {
  switch (true) {
    case code >= 200 && code <= 233:
      return "./assets/thunder.svg";
    case code >= 300 && code <= 302:
      return "./assets/rainy-5.svg";
    case code >= 500 && code <= 522:
      return "./assets/rainy-6.svg";
    case code >= 600 && code <= 623:
      return "./assets/snowy-6.svg";
    case code >= 700 && code <= 751:
      return "./assets/cloudy-static.svg";
    case code >= 801 && code <= 900:
      return isDay()
        ? "./assets/cloudy-day-2.svg"
        : "./assets/cloudy-night-2.svg";
    case code === 800:
      return isDay() ? "./assets/day.svg" : "./assets/night.svg";
    default:
      console.log("Unknown code");
  }
};

const createSearchElement = () => {
  let fragment = d.createDocumentFragment();
  fragment.appendChild($templateInputSearch.cloneNode(true));
  return fragment;
};

const createWidgetElement = (data) => {
  let $fragment = d.createDocumentFragment();
  const weekdays = data.data.filter((_, index) => index !== 0);
  let article = d.createElement(`article`);
  article.classList.add("next-weather");
  weekdays.forEach((el) => {
    let dayDate = new Date(`${el.valid_date}T00:00:00`).toLocaleDateString(
      "es-ES",
      {
        weekday: "long",
      }
    );
    dayDate = dayDate.charAt(0).toUpperCase() + dayDate.slice(1, 3);

    $templateNextWheather.querySelector("img").src = getIcon(el.weather.code);
    $templateNextWheather.querySelector(".day").innerHTML = dayDate;
    $templateNextWheather.querySelector(".degrees").innerHTML = `${parseInt(
      el.max_temp
    )}°C / ${parseInt(el.min_temp)}°C`;

    let $clone = d.importNode($templateNextWheather, true);
    article.appendChild($clone);
  });
  $fragment.appendChild(article);
  return $fragment;
};

const createMoreInfoElement = (data) => {
  let weatherToday = data.data[0];
  let fragment = d.createDocumentFragment();
  $templateInfoWeather.querySelector(".name :nth-child(2)").textContent =
    data.city_name;
  $templateInfoWeather.querySelector(
    ".temp :nth-child(2)"
  ).textContent = `${parseInt(weatherToday.temp)}°C`;
  $templateInfoWeather.querySelector(
    ".humidity :nth-child(2)"
  ).textContent = `${weatherToday.rh}%`;
  $templateInfoWeather.querySelector(
    ".wind-speed :nth-child(2)"
  ).textContent = `${weatherToday.wind_spd} Km/h`;

  fragment.appendChild($templateInfoWeather.cloneNode(true));
  return fragment;
};

const createMainWeatherElement = (data) => {
  let $fragment = d.createDocumentFragment();
  const date = getDate(data.timezone);
  $templateMainWeather.querySelector(".weather-date h1").innerHTML =
    date.dayDate;
  $templateMainWeather.querySelector(".weather-date small").innerHTML =
    date.fullDate;
  $templateMainWeather.querySelector("img").src = getIcon(
    data.data[0].weather.code
  );
  $templateMainWeather.querySelector(".degrees h1").innerHTML = `${parseInt(
    data.data[0].temp
  )}°C`;
  $templateMainWeather.querySelector(".degrees p").innerHTML = `${parseInt(
    data.data[0].max_temp
  )}°C / ${parseInt(data.data[0].min_temp)}°C`;
  $templateMainWeather.querySelector(".location p").innerHTML = data.city_name;

  $fragment.appendChild($templateMainWeather.cloneNode(true));
  return $fragment;
};

function mqHandler(e) {
  try {
    if (e.matches) {
      console.log("desktop");
      $desktopWeather.classList.remove("hidden");
      $mobileWeather.classList.add("hidden");
      $mobileWeather.innerHTML = "";
      $desktopWeather.innerHTML = "";

      let $mainWeather = d.createElement(`article`);
      $mainWeather.classList.add(`main-weather`, `text-center`);
      let $searchWeatherD = d.createElement(`article`);
      $searchWeatherD.classList.add(`search-weather-d`);

      let $mainWeatherFragment = createMainWeatherElement(data);
      let $searchFragment = createSearchElement();
      let $moreInfoFragment = createMoreInfoElement(data);
      let $widgetFragment = createWidgetElement(data);

      $mainWeather.appendChild($mainWeatherFragment);
      $searchWeatherD.appendChild($searchFragment);
      $searchWeatherD.appendChild($moreInfoFragment);
      $searchWeatherD.appendChild($widgetFragment);

      $desktopWeather.appendChild($mainWeather);
      $desktopWeather.appendChild($searchWeatherD);
    } else {
      console.log("mobile");
      $mobileWeather.classList.remove("hidden");
      $desktopWeather.classList.add("hidden");
      $desktopWeather.innerHTML = "";
      $mobileWeather.innerHTML = "";

      let $searchFragment = createSearchElement();
      let $mainWeatherFragment = createMainWeatherElement(data);
      let $widgetFragment = createWidgetElement(data);

      $mobileWeather.appendChild($searchFragment);
      $mobileWeather.appendChild($mainWeatherFragment);
      $mobileWeather.appendChild($widgetFragment);
    }
  } catch (err) {
    console.error("Error processing data:", err);
  } finally {
    toggleLoader(false);
  }
}

mqLarge.addEventListener("change", mqHandler);

d.addEventListener("DOMContentLoaded", (e) => {
  toggleLoader(true);
  const start = () => {
    if (!navigator.geolocation) {
      return Promise.reject("Error al obtener permisos de localización");
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lon: position.coords.longitude,
            lat: position.coords.latitude,
          };
          resolve(location);
        },
        (err) => {
          reject(`${err} al optener localización`);
        }
      );
    });
  };
  start()
    .then((location) => getData(location, undefined))
    .catch((err) => console.log(err));
});

const handleSearch = () => {
  toggleLoader(true);
  let inputValue = d.querySelector(`.input-search input`).value;
  if (inputValue !== "") {
    getData(undefined, inputValue);
  }
};

d.addEventListener("click", (e) =>
  e.target.matches(`.btn-search *`) ? handleSearch() : ""
);

d.addEventListener("keydown", (e) => (e.key === "Enter" ? handleSearch() : ""));
