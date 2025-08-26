let btn = document.querySelector("#btn");
let content = document.querySelector("#content");
let voice = document.querySelector("#voice");
let statusText = document.querySelector("#status");

console.log("Script loaded - DOM elements:", {btn, content, voice, statusText});

function speak(text) {
    console.log("Speaking:", text);
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "en-US"; // Changed to English for better compatibility
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning Sir");
    } else if (hours >= 12 && hours < 16) {
        speak("Good afternoon Sir");
    } else {
        speak("Good Evening Sir");
    }
}

// Check if browser supports speech recognition
if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
    console.error("Speech recognition not supported");
    if (statusText) statusText.textContent = "❌ Voice recognition not supported";
} else {
    console.log("Speech recognition supported");
    
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function() {
        console.log("Voice recognition started");
        if (statusText) statusText.textContent = "🎤 Listening...";
        voice.style.display = "block";
        btn.style.display = "none";
    };

    recognition.onresult = function(event) {
        console.log("Recognition result:", event);
        let transcript = event.results[0][0].transcript;
        console.log("You said:", transcript);
        if (content) content.textContent = transcript;
        takeCommand(transcript.toLowerCase());
    };

    recognition.onerror = function(event) {
        console.error("Recognition error:", event.error);
        if (statusText) statusText.textContent = "❌ Error: " + event.error;
        voice.style.display = "none";
        btn.style.display = "flex";
    };

    recognition.onend = function() {
        console.log("Recognition ended");
        voice.style.display = "none";
        btn.style.display = "flex";
        if (statusText) statusText.textContent = "Ready to listen...";
    };

    btn.addEventListener("click", function() {
        console.log("Microphone button clicked");
        try {
            recognition.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
            if (statusText) statusText.textContent = "❌ Failed to start";
        }
    });
}

function takeCommand(message) {
    console.log("Processing command:", message);
    
    if (message.includes("hello") || message.includes("hey")) {
        speak("hello sir, what can I help you with?");
    } else if (message.includes("who are you")) {
        speak("I am a virtual assistant, created by Ayush Sir");
    } else if (message.includes("open youtube")) {
        speak("opening youtube...");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        speak("opening google...");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("open facebook")) {
        speak("opening facebook...");
        window.open("https://facebook.com/", "_blank");
    } else if (message.includes("open instagram")) {
        speak("opening instagram...");
        window.open("https://instagram.com/", "_blank");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak("The time is " + time);
    } else if (message.includes("date")) {
        let date = new Date().toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric" });
        speak("Today's date is " + date);
    } else {
        let searchQuery = message.replace("shipra", "").replace("shifra", "").trim();
        speak("Searching for " + searchQuery);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    }
}

// Initial greeting
setTimeout(wishMe, 1000);
