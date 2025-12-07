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

async function loadMonkeyCount() {
    const res = await fetch(`http://127.0.0.1:5000/monkeys_found/${gameId}`);
    const data = await res.json();
    document.getElementById('monkeys_found').textContent = data.found;
}

// Lähetä käydyt maat ja update jos apinapoikanen löytyy
async function markCountry(country){
    const res = await fetch('http://127.0.0.1:5000/visit_country', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, country: country })
    });

    const data = await res.json();

    if (data.found) {
        loadMonkeyCount();
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

            if (name !== null && name.toLowerCase() === countryName) {
                path.style.fill = '#d45b50';
                guessedCountries.add(countryName);
                found = true;
                markCountry(name);
            } else {
                if (name !== null && guessedCountries.has(name.toLowerCase()) === false) {
                    path.style.fill = '#ececec';
                }
            }
        });

        if (found === false) {
            alert('Country not found!');
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
});
