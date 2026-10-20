
const instruments = [
    {
        name: "bouzouki",
        image: "images/bouzouki.png"
    },
    {
        name: "piano",
        image: "images/piano.png"
    },
    {
        name: "drums",
        image: "images/drums.png"
    },
    {
        name: "violin",
        image: "images/violin.png"
    }
];

const levels = {
    1: { min: 1, max: 4 },
    2: { min: 2, max: 6 },
    3: { min: 3, max: 9 }
};

const musicFiles = [
    "music/1.mp3",
    "music/2.mp3",
    "music/3.mp3",
	"music/4.mp3",
	"music/5.mp3",
	"music/6.mp3",
	"music/7.mp3",
	"music/8.mp3",
	"music/9.mp3",
	"music/10.mp3",
	"music/11.mp3",
];

let selectedLevel = 1;
let selectedMode = 1;
let correctAnswer = 0;
let roundNumber = 0;
let answered = false;
let currentAudio = null;
let audioToken = 0;

// Επιλογή επιπέδου
function selectLevel(level) {
    selectedLevel = level;

    document.querySelectorAll(".levels button").forEach(button => {
        button.classList.remove("selected");
    });

    document.getElementById("level" + level)
        .classList.add("selected");

    document.getElementById("menuMessage").textContent =
        "Επιλέχθηκε το επίπεδο " + level + ".";
}

// Έναρξη παιχνιδιού
function startGame(mode) {
    selectedMode = mode;

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    document.getElementById("gameTitle").textContent =
        mode === 1
            ? "Μέτρησε τα μπουζούκια"
            : "Μέτρησε μόνο τα μπουζούκια";

    document.getElementById("instruction").textContent =
        mode === 1
            ? "Μέτρησε όλα τα μπουζούκια που βλέπεις."
            : "Μέτρησε τα μπουζούκια και αγνόησε τα άλλα όργανα.";

    roundNumber = 0;
    newRound();
}

// Δημιουργία νέου γύρου
function newRound() {
    stopMusic();

    roundNumber++;
    answered = false;

    document.getElementById("roundInfo").textContent =
        "Γύρος " + roundNumber;

    document.getElementById("feedback").textContent = "";
    document.getElementById("feedback").className = "";

    document.getElementById("nextButton").classList.add("hidden");
    document.getElementById("submitButton").classList.remove("hidden");

    const answerInput = document.getElementById("answer");
    answerInput.value = "";
    answerInput.disabled = false;

    const area = document.getElementById("instrumentArea");
    area.innerHTML = "";

    const settings = levels[selectedLevel];

    // Πλήθος εικόνων σε αυτόν τον γύρο
    const total = randomInt(settings.min, settings.max);

    let roundInstruments = [];

    if (selectedMode === 1) {
        // Mode 1: μόνο μπουζούκια
        roundInstruments = Array(total).fill(instruments[0]);
    } else {
        // Mode 2: τουλάχιστον ένα μπουζούκι
        const bouzoukiCount = randomInt(1, total);

        roundInstruments = Array(bouzoukiCount).fill(instruments[0]);

        // Τα υπόλοιπα είναι τυχαία πιάνα, ντραμς ή βιολιά
        for (let i = bouzoukiCount; i < total; i++) {
            const otherInstrument =
                instruments[randomInt(1, instruments.length - 1)];

            roundInstruments.push(otherInstrument);
        }
    }

    // Ανακάτεμα θέσεων
    shuffle(roundInstruments);

    correctAnswer = roundInstruments.filter(
        instrument => instrument.name === "bouzouki"
    ).length;

    // Εμφάνιση εικόνων
    roundInstruments.forEach(instrument => {
        const card = document.createElement("div");
        card.className = "instrument-card";

        const image = document.createElement("img");
        image.src = instrument.image;
        image.alt = instrument.name;

        image.onerror = function () {
            this.alt = "Δεν βρέθηκε η εικόνα: " + instrument.image;
            this.style.display = "none";
            card.textContent = "Έλεγξε την εικόνα: " + instrument.name;
        };

        card.appendChild(image);
        area.appendChild(card);
    });

    answerInput.focus();
}

// Τυχαίος ακέραιος μεταξύ min και max, συμπεριλαμβανομένων
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ανακάτεμα πίνακα
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Έλεγχος απάντησης
function checkAnswer() {
    if (answered) return;

    const input = document.getElementById("answer");
    const value = input.value.trim();
    const feedback = document.getElementById("feedback");

    if (value === "") {
        feedback.textContent = "Πληκτρολόγησε έναν αριθμό.";
        feedback.className = "wrong";
        input.focus();
        return;
    }

    if (!/^\d$/.test(value)) {
        feedback.textContent = "Πληκτρολόγησε έναν αριθμό από το 0 έως το 9.";
        feedback.className = "wrong";
        input.value = "";
        input.focus();
        return;
    }

    if (Number(value) === correctAnswer) {
        answered = true;

        feedback.textContent = "Σωστά! Άκου τη μουσική! 🎵";
        feedback.className = "correct";

        input.disabled = true;
	document.getElementById("submitButton").classList.add("hidden");
	document.getElementById("nextButton").classList.remove("hidden");

	playRandomMusic();
    } else {
        feedback.textContent = "Δοκίμασε ξανά!";
        feedback.className = "wrong";

        input.value = "";
        input.focus();
    }
}

// Αναπαραγωγή τυχαίου MP3
function playRandomMusic() {
    stopMusic();

    const token = audioToken;
    const file = musicFiles[randomInt(0, musicFiles.length - 1)];

    currentAudio = new Audio(file);

	currentAudio.addEventListener("ended", function () {
		if (token !== audioToken) return;
		newRound();
	});

    currentAudio.addEventListener("error", function () {
        if (token !== audioToken) return;

        document.getElementById("feedback").textContent =
            "Δεν βρέθηκε το τραγούδι. Έλεγξε τον φάκελο music.";

        document.getElementById("nextButton").classList.remove("hidden");
    });

    currentAudio.play().catch(function () {
        if (token !== audioToken) return;

        document.getElementById("feedback").textContent =
            "Δεν ήταν δυνατή η αναπαραγωγή. Πάτησε Επόμενος γύρος.";

        document.getElementById("nextButton").classList.remove("hidden");
    });
}

// Διακοπή ήχου
function stopMusic() {
    audioToken++;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

// Επόμενος γύρος από το κουμπί
function nextRound() {
    newRound();
}

// Επιστροφή στο μενού
function goToMenu() {
    stopMusic();

    document.getElementById("game").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");

    document.getElementById("menuMessage").textContent =
        "Επίλεξε επίπεδο και παιχνίδι.";
}

// Υποβολή με το Enter ή με τα αριθμητικά πλήκτρα
document.getElementById("answer").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});
