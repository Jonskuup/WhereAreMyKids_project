const newPlayer = document.getElementById('newPlayer');
const enterUsername = document.getElementById('enterUsername');
const continueGame = document.getElementById('continueGame');
const existingUser = document.getElementById('existingUser');
const message = document.getElementById('message');

const server_url = 'http://127.0.0.1:5000';

/* Step 1: Are you a new player? */
document.getElementById('yesNew').addEventListener('click', () => {
    newPlayer.classList.add('hidden');
    enterUsername.dataset.mode = 'new';
    enterUsername.classList.remove('hidden');
});

document.getElementById('noNew').addEventListener('click', () => {
    newPlayer.classList.add('hidden');
    continueGame.classList.remove('hidden');  // show continue game question
});

/* Step 2: Continue existing game? */
document.getElementById('yesContinue').addEventListener('click', () => {
    continueGame.classList.add('hidden');
    existingUser.classList.remove('hidden'); // show existing username
});

document.getElementById('noContinue').addEventListener('click', () => {
    continueGame.classList.add('hidden');
    enterUsername.dataset.mode = 'new'; // user wants a new game
    enterUsername.classList.remove('hidden'); // show new username input
});

/* Step 3: Enter new username */
document.getElementById('Enter').addEventListener('click', async () => {
    const username = document.getElementById('newUsername').value.trim();
    if (!username) return alert(`Enter a username!`); //ERROR

    try {
        const response = await fetch(`${server_url}/new_player`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({screen_name: username})
        });

        const data = await response.json()

        if (response.ok) {
            enterUsername.classList.add('hidden');
            message.textContent = `Welcome, ${username}! Starting a new game...`;
            localStorage.setItem('player_id', data.player_id);
            localStorage.setItem('username', username);

            window.location.href = '../mainscreen/game.html'

        } else {
            alert(data.error);
        }
    } catch (err) {
        console.log(err)
        alert("Error connecting to the server.");
    }
});

/* Step 4: Enter existing username */
document.getElementById('submitExistingUser').addEventListener('click', async () => {
    const username = document.getElementById('existingUsername').value.trim();
    if (!username) return alert(`Please enter your username!`);

    try {
        const existsResp = await fetch(`${server_url}/player_exists/${username}`);

        if (!existsResp.ok) {
            return alert("Server error checking username.");
        }

        const existsData = await existsResp.json();

        if (!existsData.exists) {
            return alert("Player not found. Please enter a correct username.")
        }

        const idResp = await fetch(`${server_url}/game_id/${username}`);

        if (!idResp.ok) {
            return alert("Server error getting saved game.");
        }

        const idData = await idResp.json();

        existingUser.classList.add('hidden');
        message.textContent = `Welcome back, ${username}! Continuing your game...`;
        localStorage.setItem('player_id', idData.game_id);
        localStorage.setItem('username', username);

        window.location.href = '../mainscreen/game.html'

    } catch (err) {
        console.error(err)
        alert("Error connecting to the server.");
    }
});


