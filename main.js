import { DateTime } from "https://cdn.jsdelivr.net/npm/luxon@3.0.1/build/es6/luxon.js";
const d = document;
const apiKey = `W4W57WFQEUDV4P66AYDG35K48`;
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
let locationName = null;

const getData = async (location, city) => {
  if (location !== undefined && city === undefined) {
    let res = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location.lat},${location.lon}/next4days?key=${apiKey}&include=days&unitGroup=metric`
    );
    data = await res.json();
    let resAddress = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lon}&format=json`
    );
    let dataAddress = await resAddress.json();
    console.log(dataAddress);
    locationName =
      (await dataAddress.address.city) === ""
        ? ""
        : ` ${dataAddress.address.city}, ${dataAddress.address.state}`;
    console.log(data);
    mqHandler(mqLarge);
  }
  if (city !== undefined && location === undefined) {
    try {
      let res = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/next4days?key=${apiKey}&include=days&unitGroup=metric`
      );
      if (!res.ok) throw { status: res.status, statusText: res.statusText };
      data = await res.json();
      console.log(data);
      locationName = await data.resolvedAddress;
      mqHandler(mqLarge);
    } catch (err) {
      let message = err.statusText || "Ocurrió un error";
      console.log(message);
      let $span = d.querySelector(".input-search-error");
      $span.classList.add("is-active");
      setInterval(() => $span.classList.remove("is-active"), 6000);
    } finally {
      toggleLoader(false);
    }
  }
};

const toggleLoader = (show) => {
  $loader.classList.toggle("hidden", !show);
};

const getDate = (timezone) => {
  const date = DateTime.now().setZone(timezone).setLocale("es");
  const fullDate = date.toLocaleString(DateTime.DATE_FULL);
  let dayDate = `${date.toFormat("cccc")[0].toUpperCase()}${date
    .toFormat("cccc")
    .slice(1)}`;
  return { fullDate, dayDate };
};

const isDay = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
};

const getIcon = (code) => {
  switch (code) {
    case "thunder-rain":
    case "thunder-showers-day":
    case "thunder-showers-night":
      return "./assets/thunder.svg";
    case "rain":
    case "showers-day":
    case "showers-night":
      return "./assets/rainy-6.svg";
    case "snow":
    case "snow-showers-day":
    case "snow-showers-night":
      return "./assets/snowy-6.svg";
    case "cloudy":
    case "wind":
    case "fog":
      return "./assets/cloudy.svg";
    case "partly-cloudy-day":
      return "./assets/cloudy-day-2.svg";
    case "partly-cloudy-night":
      return "./assets/cloudy-night-2.svg";
    case "clear-day":
      return "./assets/day.svg";
    case "clear-night":
      return "./assets/night.svg";
    default:
      return "./assets/cloudy-static.svg";
  }
};

const createSearchElement = () => {
  let fragment = d.createDocumentFragment();
  fragment.appendChild($templateInputSearch.cloneNode(true));
  return fragment;
};

const createWidgetElement = (data) => {
  let $fragment = d.createDocumentFragment();
  let weekdays = data.days.filter((_, index) => index !== 0);
  let article = d.createElement(`article`);

  article.classList.add("next-weather");
  weekdays.forEach((el) => {
    let dayDate = DateTime.fromISO(el.datetime, {
      zone: data.timezone,
      locale: "es",
    });
    dayDate =
      dayDate.toFormat("cccc").slice(0, 3).charAt(0).toUpperCase() +
      dayDate.toFormat("cccc").slice(1, 3);

    $templateNextWheather.querySelector("img").src = getIcon(el.icon);
    $templateNextWheather.querySelector(".day").innerHTML = dayDate;
    $templateNextWheather.querySelector(".degrees").innerHTML = `${parseInt(
      el.tempmax
    )}°C / ${parseInt(el.tempmin)}°C`;

    let $clone = d.importNode($templateNextWheather, true);
    article.appendChild($clone);
  });
  $fragment.appendChild(article);
  return $fragment;
};

const createMoreInfoElement = (data) => {
  const weatherToday = data.days[0];
  let fragment = d.createDocumentFragment();
  $templateInfoWeather.querySelector(".name :nth-child(2)").textContent =
    locationName;
  $templateInfoWeather.querySelector(
    ".temp :nth-child(2)"
  ).textContent = `${parseInt(weatherToday.temp)}°C`;
  $templateInfoWeather.querySelector(
    ".humidity :nth-child(2)"
  ).textContent = `${weatherToday.humidity}%`;
  $templateInfoWeather.querySelector(
    ".wind-speed :nth-child(2)"
  ).textContent = `${weatherToday.windspeed} Km/h`;

  fragment.appendChild($templateInfoWeather.cloneNode(true));
  return fragment;
};

const createMainWeatherElement = (data) => {
  const mainData = data.days[0];
  let $fragment = d.createDocumentFragment();
  const date = getDate(data.timezone);
  $templateMainWeather.querySelector(".weather-date h1").innerHTML =
    date.dayDate;
  $templateMainWeather.querySelector(".weather-date small").innerHTML =
    date.fullDate;
  $templateMainWeather.querySelector("img").src = getIcon(mainData.icon);
  $templateMainWeather.querySelector(".degrees h1").innerHTML = `${parseInt(
    mainData.temp
  )}°C`;
  $templateMainWeather.querySelector(".degrees p").innerHTML = `${parseInt(
    mainData.tempmax
  )}°C / ${parseInt(mainData.tempmin)}°C`;
  $templateMainWeather.querySelector(".location p").innerHTML = locationName;
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
