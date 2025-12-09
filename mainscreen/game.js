// Lista maiden nimistä hardkoodattuna
const countriesList = [
    "Albania","Austria","Belgium","Bulgaria","Bosnia and Herzegovina","Belarus",
    "Switzerland","Czech Republic","Germany","Denmark","Estonia","Finland",
    "United Kingdom","Greece","Croatia","Hungary","Ireland","Iceland","Italy",
    "Lithuania","Luxembourg","Latvia","Moldova","Macedonia","Montenegro",
    "Netherlands","Norway","Poland","Portugal","Romania","Serbia","Slovakia",
    "Slovenia","Sweden","Ukraine","France","Spain"
];

// Ulkoinen API maiden lipuista
let countryCodes = {};

fetch("http://localhost:5000/country_codes")
   .then(r => r.json())
   .then(data => {
       countryCodes = data;
   })
    .catch(()=> console.log("Could not load country codes"));

// Leave button will go back to start game screen
document.getElementById("leaveButton").addEventListener("click", () => {
    window.location.href = "../startgame/startgame.html";
});

// Pelaajan nimi näkyviin
const playerName = localStorage.getItem('player_name');
const gameId = localStorage.getItem('game_id');

document.getElementById('player_name').textContent = playerName ?? "---";

const input = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const mapObject = document.getElementById('europe-map');

// Tallennetaan löydetyt maat, jotta väri pysyy
const guessedCountries = new Set();

function addLog(text) {
    const ul = document.getElementById('status');
    const li = document.createElement('li');
    li.textContent = text;
    ul.append(li);

    const box = document.getElementById('status-box');
    box.scrollTop = box.scrollHeight;
    return li;
}

async function loadMonkeyCount() {
    const res = await fetch(`http://localhost:5000/monkeys_found/${gameId}`);
    const data = await res.json();
    document.getElementById('monkeys_found').textContent = data.found;
}

// Haetaan aiemmin käydyt maat ja väritetään ne karttaan
async function loadVisitedCountries() {
    const response = await fetch(`http://localhost:5000/visited/${gameId}`);
    const data = await response.json();
    const visitedCountries = data.visited.map(country => country.toLowerCase());
    const allPaths = mapObject.contentDocument.querySelectorAll('path');

    for (const path of allPaths) {
      const countryName = path.getAttribute('name');

        if (countryName && visitedCountries.includes(countryName.toLowerCase())) {
          path.style.fill = '#d45b50';
          guessedCountries.add(countryName.toLowerCase());
        }
    }
}

function showFlag(country) {
    const code = countryCodes[country] || countryCodes[country.toLowerCase()];
    if (!code) {
        console.log("No flag code found")
        return;
    }

    const theFlag = document.getElementById("theFlag");
    theFlag.innerHTML = "";

    const img = document.createElement("img");
    img.src = `https://flagcdn.com/48x36/${code}.png`;
    img.title = country; // hover tooltip

    theFlag.appendChild(img);
}

// Lähetä käydyt maat ja update jos apinapoikanen löytyy
async function markCountry(country){
    addLog(`Flying to ${country}`);

    const loadingItem = addLog('Loading');
    loadingItem.classList.add('loading-dots');

    const res = await fetch('http://localhost:5000/visit_country', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, country: country })
    });

    const data = await res.json();

    loadingItem.remove();

    showFlag(country);

    if (data.found) {
        addLog('Baby monkey found!');
        loadMonkeyCount().then(() => {
            const found = parseInt(document.getElementById('monkeys_found').textContent);
            if (found === 10) {
                const message = document.getElementById('all-found');
                message.style.display = 'block';

                setTimeout(() => {
                    window.location.href = '../finishgame/finish.html';
                }, 2500);
            }
        });
    } else {
      addLog('No baby monkeys found here.')
    }
}

mapObject.addEventListener('load', () => {
    const svgDoc = mapObject.contentDocument; // SVG:n sisältö

    // Funktio, joka tarkistaa arvauksen ja värittää maan
    function checkGuess() {
        const countryName = input.value.trim().toLowerCase();
        if (countryName === "") {
            return;
        }

        const paths = svgDoc.querySelectorAll('path');
        let found = false;

        paths.forEach(path => {
            const name = path.getAttribute('name');

            if (name && name.toLowerCase() === countryName) {
                if (guessedCountries.has(countryName)) {
                  addLog(`You've already visited this country.`);
                  found = true;
                  return;
                }

                path.style.fill = '#d45b50';
                guessedCountries.add(countryName);
                markCountry(name);
                found = true;
            }
        });

        if (found === false) {
            addLog(`Country is not on our EU list or check the spelling.`);
        }

        input.value = '';
    }

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });

    guessButton.addEventListener('click', checkGuess);

    loadMonkeyCount();
    loadVisitedCountries();
});

const helpBtn = document.getElementById("helpButton");
const helpBubble = document.getElementById("helpBubble");
const countryListDiv = document.getElementById("countryList");

helpBtn.addEventListener("click", async () => {
    helpBubble.style.display = (helpBubble.style.display === "block") ? "none" : "block";

    let visited = [];
    try {
        const res = await fetch(`http://localhost:5000/visited/${gameId}`);
        const data = await res.json();
        visited = data.visited.map(v => v.toLowerCase());
    } catch (e) {
        console.log("No backend found, continue without visited marks");
    }

    countryListDiv.innerHTML = "";

    const chunkSize = 10;
    for (let i = 0; i < countriesList.length; i += chunkSize) {
        let column = document.createElement("div");
        column.classList.add("country-column");

        countriesList.slice(i, i+chunkSize).forEach(name => {
            let item = document.createElement("div");
            item.classList.add("country-item");

            let check = visited.includes(name.toLowerCase()) ? "✓" : "";

            item.innerHTML = `
                <span>${check ? "[✔]" : "[ ]"} ${name}</span>
`;

            column.appendChild(item);
        });

        countryListDiv.appendChild(column);
    }
});

document.addEventListener("click", e => {
    if (!helpBtn.contains(e.target) && !helpBubble.contains(e.target)) {
        helpBubble.style.display = "none";
    }
});