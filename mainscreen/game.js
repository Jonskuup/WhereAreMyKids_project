// Leave button will go back to start game screen
document.getElementById("leaveButton").addEventListener("click", () => {
    window.location.href = "../startgame/startgame.html";
});

const input = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const mapObject = document.getElementById('europe-map');

// Tallennetaan löydetyt maat, jotta väri pysyy
const guessedCountries = new Set();

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
});
