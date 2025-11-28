/* INFO KUPLA */
const instructionsButton = document.getElementById("instructionsButton");
const instructionsBubble = document.getElementById("instructionsBubble");

instructionsButton.addEventListener("click", () => {
    if (instructionsBubble.style.display === "block") {
        instructionsBubble.style.display = "none";
    } else {
        instructionsBubble.style.display = "block";
    }
});

// Close bubble if clicking outside
document.addEventListener("click", (e) => {
    if (!instructionsButton.contains(e.target) && !instructionsBubble.contains(e.target)) {
        instructionsBubble.style.display = "none";
    }
});

document.getElementById("startButton").addEventListener("click", () => {
    window.location.href = "../story/story.html";
})