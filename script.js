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

const meteoToken = "0a3ada5923342f82584a314a1455bc8ade87f59a2b909ac3fbd1cc44f232a24a";
let currentCityCode = null;
let currentForecast = [];

// =================== Thème ===================
themeToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  themeMenu.classList.toggle("hidden");
  updateThemeMenuSelection();
});

// Ferme le menu si on clique ailleurs
document.addEventListener("click", () => {
  themeMenu.classList.add("hidden");
});

// Gestion du choix du thème
themeMenu.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const selected = e.target.getAttribute("data-theme");
    if (selected === "auto") {
      userTheme = null;
    } else {
      userTheme = selected;
    }
    applyTheme();
    updateThemeMenuSelection();
    themeMenu.classList.add("hidden");
  }
});


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

// Détection du thème système
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
let userTheme = null; // null = suit le système, "dark" ou "light" = forcé

function applyTheme() {
  if (userTheme === "dark" || (userTheme === null && prefersDark.matches)) {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
  updateThemeMenuSelection();
}

// Applique le thème au chargement
applyTheme();

// Réagit aux changements système si l'utilisateur n'a pas forcé
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
  // Pluriel dynamique
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

    const temp = document.createElement("p");
    temp.textContent = `Température : ${day.tmin}°C - ${day.tmax}°C`;
    card.appendChild(temp);

    // Données supplémentaires
    document.querySelectorAll("#info-options input:checked").forEach(opt => {
      const info = document.createElement("p");
      switch (opt.value) {
        case "coords":
          info.textContent = `Coordonnées : ${day.latitude}, ${day.longitude}`;
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

// =================== Slider ===================
dayRange.addEventListener("input", updateForecast);

// =================== Cases à cocher ===================
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