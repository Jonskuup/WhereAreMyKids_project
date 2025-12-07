

// Leave button will go back to start game screen
document.getElementById("leaveButton").addEventListener("click", () => {
    window.location.href = "../startgame/startgame.html";
});


const input = document.getElementById('guess-input');
const mapObject = document.getElementById('europe-map');

// Tallennetaan löydetyt maat, jotta väri pysyy
const guessedCountries = new Set();

mapObject.addEventListener('load', () => {
    const svgDoc = mapObject.contentDocument; // SVG:n sisältö

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const countryName = input.value.trim().toLowerCase();
            const paths = svgDoc.querySelectorAll('path');
            let found = false;

            paths.forEach(path => {
                const name = path.getAttribute('name');
                if (name && name.toLowerCase() === countryName) {
                    path.style.fill = '#d45b50';
                    guessedCountries.add(countryName);
                    found = true;
                } else {
                    // Jos maa on jo arvattu, säilytetään väri
                    if (!guessedCountries.has(name.toLowerCase())) {
                        path.style.fill = '#ececec';
                    }
                }
            });

            if (!found) {
                alert('Country not found!');
            }

            input.value = '';
        }
    });
});
