const newPlayer = document.getElementById('newPlayer');
const enterUsername = document.getElementById('enterUsername');
const continueGame = document.getElementById('continueGame');
const existingUser = document.getElementById('existingUser');
const message = document.getElementById('message');

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
document.getElementById('Enter').addEventListener('click', () => {
    const username = document.getElementById('newUsername').value.trim();
    if (!username) return alert('Please enter a username!');

    enterUsername.classList.add('hidden');
    message.textContent = `Welcome, ${username}! Starting a new game...`;
});

/* Step 4: Enter existing username */
document.getElementById('submitExistingUser').addEventListener('click', () => {
    const username = document.getElementById('existingUsername').value.trim();
    if (!username) return alert('Please enter your username!');

    existingUser.classList.add('hidden');
    message.textContent = `Welcome back, ${username}! Continuing your game...`;

});
