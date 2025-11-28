/* STORY */
const storySegments = [
    "Once upon a time, on a sunny day, the flying mother monkey and her ten children were on their way back home.",
    "Suddenly, fierce strong winds rose from nowhere, tearing the tiny monkeys from the mothers grasp and blew them far away, across the countries of Europe.",
    "The mother monkey panicked. She tried to reach her children, but the force of the wind was too strong.",
    "Once the storm finally calmed, only a silent sky remained, and the mother’s heart was filled with deep, aching worry.",
    "Summoning every ounce of courage, she had to go search for her lost children.",
    "Each child could be anywhere across the vast continent, and only a brave companion... perhaps even you, could aid her in this desperate search.",
    "Will you help her reunite with her lost little ones?"
];

let currentSegment = 0
let typing = false
let charIndex = 0
let timeoutId = null;

const textElement = document.getElementById("story-text");

/* TYPEWRITER */
function typeWriter() {
    typing = true;
    let segment = storySegments[currentSegment];

    if (charIndex < segment.length) {
        textElement.textContent += segment.charAt(charIndex);
        charIndex++;
        timeoutId = setTimeout(typeWriter, 28);
    } else {
        typing = false;
        timeoutId = null;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {

        const segment = storySegments[currentSegment];

        /* 1. If currently typing → instantly finish the text */
        if (typing) {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null;
            }
            typing = false;
            textElement.textContent = segment;
            return;
        }

        /* 2. If typing is done → go to next segment */
        currentSegment++;

        if (currentSegment >= storySegments.length) {
            window.location.href = "";
            return;
        }

        textElement.textContent = "";
        charIndex = 0;
        typeWriter();
    }
});

/* SKIP BUTTON */
document.getElementById("skipButton").addEventListener("click", () => {
    window.location.href = "";
});

typeWriter();


