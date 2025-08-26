// SuhaniQ Virtual Assistant - Enhanced Version
console.log('SuhaniQ Virtual Assistant script loaded!');

// DOM Elements
const btn = document.querySelector("#btn");
const statusText = document.querySelector("#status");
const content = document.querySelector("#content");
const responseText = document.querySelector("#response-text");
const voice = document.querySelector("#voice");

// Check browser support for Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// Initialize speech recognition if supported
function initSpeechRecognition() {
    if (!SpeechRecognition) {
        console.warn('Web Speech API not supported in this browser');
        if (statusText) {
            statusText.textContent = '❌ Voice recognition not supported. Please use Chrome or Edge.';
        }
        return false;
    }
    
    try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            console.log('Voice recognition started');
            isListening = true;
            if (statusText) statusText.textContent = '🎤 Listening... Speak now';
            if (btn) btn.classList.add('listening');
        };
        
        recognition.onresult = (event) => {
            console.log('Recognition result received:', event);
            const transcript = event.results[0][0].transcript;
            console.log('You said:', transcript);
            if (content) content.textContent = transcript;
            processVoiceInput(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            isListening = false;
            if (btn) btn.classList.remove('listening');
            
            const errorMessages = {
                'no-speech': 'No speech detected. Please try again.',
                'audio-capture': 'Microphone not available.',
                'not-allowed': 'Microphone permission denied.',
                'default': 'Voice recognition error. Please try again.'
            };
            
            const message = errorMessages[event.error] || errorMessages.default;
            if (statusText) statusText.textContent = `❌ ${message}`;
        };
        
        recognition.onend = () => {
            console.log('Recognition ended');
            isListening = false;
            if (btn) btn.classList.remove('listening');
            if (statusText) statusText.textContent = 'Ready to listen...';
        };
        
        console.log('Speech recognition initialized successfully');
        return true;
        
    } catch (error) {
        console.error('Error initializing speech recognition:', error);
        if (statusText) statusText.textContent = '❌ Failed to initialize voice recognition';
        return false;
    }
}

// Speech synthesis function
function speak(text) {
    let textSpeak = new SpeechSynthesisUtterance(text);
    textSpeak.rate = 1;
    textSpeak.pitch = 1;
    textSpeak.volume = 1;
    textSpeak.lang = "en-US";
    window.speechSynthesis.speak(textSpeak);
}

// Greeting function
function wishMe() {
    let day = new Date();
    let hours = day.getHours();
    if (hours >= 0 && hours < 12) {
        speak("Good Morning Sir");
    } else if (hours >= 12 && hours < 16) {
        speak("Good Afternoon Sir");
    } else {
        speak("Good Evening Sir");
    }
}

// Process voice input and send to AI
function processVoiceInput(transcript) {
    if (statusText) statusText.textContent = '🤖 Processing...';
    if (responseText) responseText.textContent = `You said: ${transcript}`;
    
    // Check for open commands
    if (transcript.toLowerCase().includes("open")) {
        const command = transcript.split("open ")[1];
        console.log(`Opening: ${command}`);
        window.open(`http://${command}`, '_blank');
        return;
    }
    
    // Send to AI server
    fetch('/api/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: transcript })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
    })
    .then(data => {
        if (responseText) {
            responseText.textContent = data.response || 'No response from AI';
        }
        if (statusText) statusText.textContent = '✅ Response received';
    })
    .catch(error => {
        console.error('AI processing error:', error);
        if (statusText) statusText.textContent = '❌ Failed to process request';
        if (responseText) responseText.textContent = 'Sorry, I encountered an error. Please try again.';
    });
}

// Handle microphone button click
function handleButtonClick() {
    console.log('Microphone button clicked');
    
    if (isListening) {
        console.log('Already listening, stopping...');
        if (recognition) recognition.stop();
        return;
    }
    
    if (!recognition && !initSpeechRecognition()) {
        return;
    }
    
    try {
        console.log('Starting voice recognition...');
        if (statusText) statusText.textContent = '🔄 Starting...';
        recognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
        if (statusText) statusText.textContent = '❌ Failed to start. Please try again.';
    }
}

// Initialize the application
function initApp() {
    console.log('Initializing SuhaniQ application...');
    
    // Set up microphone button
    if (btn) {
        btn.onclick = handleButtonClick;
        console.log('Microphone button ready');
    } else {
        console.error('Microphone button not found');
    }
    
    // Set initial status
    if (statusText) {
        statusText.textContent = '🎯 Click the microphone to speak';
    }
    
    // Pre-initialize speech recognition for better performance
    initSpeechRecognition();
    
    console.log('SuhaniQ initialization complete');
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
