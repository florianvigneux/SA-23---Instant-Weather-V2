// =================== Constantes ===================
const postalInput = document.getElementById("postal-code");
const cityList = document.getElementById("city-list");
const weatherSection = document.getElementById("weather-section");
const forecastContainer = document.getElementById("forecast-cards-container");
const dayRange = document.getElementById("day-range");
const dayCountDisplay = document.getElementById("day-count");
const infoOptions = document.getElementById("info-options");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const themeMenu = document.getElementById("theme-menu");
const cityTitle = document.getElementById("city-title");
const meteoToken = "0a3ada5923342f82584a314a1455bc8ade87f59a2b909ac3fbd1cc44f232a24a";
let currentCityCode = null;
let currentForecast = [];
let userTheme = null;

// =================== Image de fond ===================
window.addEventListener("DOMContentLoaded", () => {
  const bg = document.getElementById('bg-image');
  if (!bg) return;
  const keywords = [
    "weather", "rain", "storm", "clouds", "fog", "snow", "sunny", "wind", "thunderstorm", "sky"
  ];
  const random = keywords[Math.floor(Math.random() * keywords.length)];
  const url = `https://source.unsplash.com/random/1600x900/?${random},weather`;
  bg.style.backgroundImage = `url('${url}')`;
});

// =================== Thème ===================
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  if (userTheme === "dark" || (userTheme === null && prefersDark.matches)) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
  updateThemeMenuSelection();
}
function updateThemeMenuSelection() {
  document.querySelectorAll('#theme-menu button').forEach(btn => {
    btn.classList.remove('selected');
    if (
      (btn.getAttribute('data-theme') === 'auto' && userTheme === null) ||
      btn.getAttribute('data-theme') === userTheme
    ) {
      btn.classList.add('selected');
    }
  });
}
themeToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  themeMenu.classList.toggle("hidden");
  updateThemeMenuSelection();
});
document.addEventListener("click", () => {
  themeMenu.classList.add("hidden");
});
themeMenu.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const selected = e.target.getAttribute("data-theme");
    userTheme = selected === "auto" ? null : selected;
    applyTheme();
    updateThemeMenuSelection();
    themeMenu.classList.add("hidden");
  }
});
applyTheme();
prefersDark.addEventListener("change", () => {
  if (userTheme === null) applyTheme();
});

// =================== Recherche de ville ===================
postalInput.addEventListener("input", async (e) => {
  const cp = e.target.value.trim();
  if (cp.length === 5 && /^[0-9]{5}$/.test(cp)) {
    try {
      const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom,code&format=json`);
      const data = await res.json();
      displayCities(data);
    } catch (err) {
      cityList.innerHTML = "<li>Erreur lors de la recherche.</li>";
    }
  } else {
    cityList.innerHTML = "";
  }
});
function displayCities(cities) {
  cityList.innerHTML = "";
  cities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city.nom;
    li.setAttribute("tabindex", "0");
    li.addEventListener("click", () => {
      postalInput.style.display = "none";
      cityTitle.textContent = `Prévisions météo pour ${city.nom}`;
      cityTitle.style.display = "block";
      getWeather(city.code);
    });
    cityList.appendChild(li);
  });
}

// =================== Météo ===================
async function getWeather(insee) {
  try {
    const res = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=${meteoToken}&insee=${insee}`);
    const data = await res.json();
    currentForecast = data.forecast;
    currentCityCode = insee;
    updateForecast();
    weatherSection.classList.remove("hidden");
    cityList.innerHTML = "";
  } catch (err) {
    alert("Erreur lors de la récupération des données météo.");
  }
}

// =================== Cartes météo ===================
function updateForecast() {
  const days = parseInt(dayRange.value);
  dayCountDisplay.textContent = days;
  const label = document.querySelector('label[for="day-range"]');
  if (label) {
    label.innerHTML = `Prévisions : <span id="day-count">${days}</span> jour${days > 1 ? "s" : ""}`;
  }
  forecastContainer.innerHTML = "";
  for (let i = 0; i < days; i++) {
    const day = currentForecast[i];
    const card = document.createElement("div");
    card.className = "forecast-card";
    const icon = document.createElement("img");
    icon.src = `https://img.icons8.com/color/96/000000/${getIconName(day.weather)}.png`;
    icon.alt = "Icône météo";
    card.appendChild(icon);
    const date = document.createElement("div");
    date.textContent = new Date(day.datetime).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    card.appendChild(date);
    const temp = document.createElement("div");
    temp.textContent = `Min : ${day.tmin}°C / Max : ${day.tmax}°C`;
    card.appendChild(temp);
    document.querySelectorAll("#info-options input:checked").forEach(opt => {
      const info = document.createElement("div");
      switch (opt.value) {
        case "coords":
          info.textContent = `Lat: ${day.latitude}, Lon: ${day.longitude}`;
          break;
        case "rain":
          info.textContent = `Pluie : ${day.rr10} mm`;
          break;
        case "wind":
          info.textContent = `Vent moyen : ${day.wind10m} km/h`;
          break;
        case "winddir":
          info.textContent = `Direction vent : ${day.dirwind10m}°`;
          break;
      }
      card.appendChild(info);
    });
    forecastContainer.appendChild(card);
  }
}

// =================== Slider & Options ===================
dayRange.addEventListener("input", updateForecast);
document.querySelectorAll("#info-options input").forEach(checkbox => {
  checkbox.addEventListener("change", updateForecast);
});

// =================== Icônes météo ===================
function getIconName(code) {
  const map = {
    0: "sun",
    1: "partly-cloudy-day",
    2: "cloud",
    3: "rain",
    4: "thunderstorm",
    5: "snow",
  };
  return map[code] || "partly-cloudy-day";
}

// =================== Logo cliquable ===================
document.querySelector('.logo').addEventListener('click', () => {
  window.location.reload();
});