// DOM Elements
let btn, content, voice, responseText, statusText, loadingOverlay;

// Initialize DOM elements
function initDOM() {
    console.log('Initializing DOM elements...');
    
    btn = document.querySelector("#btn");
    content = document.querySelector("#content");
    voice = document.querySelector("#voice");
    responseText = document.querySelector("#response-text");
    statusText = document.querySelector("#status");
    loadingOverlay = document.querySelector("#loading");
    
    console.log('DOM elements initialized:', { 
        btn: !!btn, 
        content: !!content, 
        voice: !!voice, 
        responseText: !!responseText, 
        statusText: !!statusText, 
        loadingOverlay: !!loadingOverlay 
    });
}

// Handle button click
function handleButtonClick() {
    try {
        console.log('Microphone button clicked');
        
        if (!recognition) {
            console.error('Speech recognition not initialized');
            if (statusText) {
                statusText.textContent = 'Error: Speech recognition not available';
            }
            speak('Sorry, speech recognition is not available in your browser.');
            return;
        }
        
        // Toggle listening state
        if (btn.classList.contains('listening')) {
            console.log('Stopping speech recognition');
            recognition.stop();
            btn.classList.remove('listening');
            if (statusText) {
                statusText.textContent = 'Ready to listen...';
            }
        } else {
            console.log('Starting speech recognition');
            if (content) {
                content.textContent = 'Listening...';
            }
            if (responseText) {
                responseText.textContent = '';
            }
            
            // Set language and start recognition
            recognition.lang = 'en-US';
            try {
                recognition.start();
                btn.classList.add('listening');
                if (statusText) {
                    statusText.textContent = 'Listening...';
                }
            } catch (error) {
                console.error('Error starting recognition:', error);
                if (statusText) {
                    statusText.textContent = 'Error: ' + (error.message || 'Failed to start listening');
                }
                btn.classList.remove('listening');
                speak('Sorry, I could not start listening. Please check your microphone settings.');
            }
        }
    } catch (error) {
        console.error('Error in button click handler:', error);
        if (statusText) {
            statusText.textContent = 'Error: ' + (error.message || 'An error occurred');
        }
        btn.classList.remove('listening');
        speak('Sorry, an error occurred. Please try again.');
    }
}

// Initialize the application
function initApp() {
    console.log('Initializing application...');
    
    // Initialize DOM elements
    initDOM();
    
    // Check if button exists and add click handler
    if (btn) {
        console.log('Button element found:', btn);
        
        // Add direct click handler for debugging
        btn.onclick = function(e) {
            console.log('Direct button click detected!');
            console.log('Event:', e);
            console.log('Button classes:', btn.className);
            console.log('Button disabled:', btn.disabled);
            
            // Try to manually trigger speech recognition
            try {
                console.log('Attempting to start speech recognition...');
                if (window.SpeechRecognition || window.webkitSpeechRecognition) {
                    console.log('SpeechRecognition API is available');
                    if (!recognition) {
                        console.log('Initializing recognition...');
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        recognition = new SpeechRecognition();
                        recognition.continuous = false;
                        recognition.interimResults = false;
                        recognition.lang = 'en-US';
                        
                        recognition.onstart = () => {
                            console.log('Speech recognition started!');
                            if (statusText) statusText.textContent = 'Listening...';
                            btn.classList.add('listening');
                        };
                        
                        recognition.onresult = (event) => {
                            const transcript = event.results[0][0].transcript;
                            console.log('Recognized speech:', transcript);
                            if (content) content.textContent = transcript;
                            takeCommand(transcript);
                        };
                        
                        recognition.onerror = (event) => {
                            console.error('Recognition error:', event.error);
                            if (statusText) statusText.textContent = 'Error: ' + event.error;
                            btn.classList.remove('listening');
                        };
                        
                        recognition.onend = () => {
                            console.log('Recognition ended');
                            btn.classList.remove('listening');
                            if (statusText) statusText.textContent = 'Ready to listen...';
                        };
                    }
                    
                    // Start recognition
                    recognition.start();
                    console.log('Recognition start called');
                } else {
                    console.error('SpeechRecognition API not available');
                    if (statusText) statusText.textContent = 'Speech recognition not supported in this browser';
                }
            } catch (error) {
                console.error('Error in direct click handler:', error);
                if (statusText) statusText.textContent = 'Error: ' + error.message;
            }
        };
        
        // Also add the regular event listener
        btn.addEventListener('click', handleButtonClick);
        console.log('Click handlers added to button');
    } else {
        console.error('Button element not found!');
        if (statusText) {
            statusText.textContent = 'Error: Could not initialize microphone button';
        }
    }
    
    // Set initial status
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = 'Initializing...';
    }
    
    // Check browser support
    if (!('speechSynthesis' in window)) {
        const errorMsg = 'Sorry, your browser does not support speech synthesis.';
        console.error(errorMsg);
        if (statusElement) statusElement.textContent = errorMsg;
        return;
    }
    
    // Load voices when they become available
    let voices = [];
    
    function loadVoices() {
        voices = window.speechSynthesis.getVoices();
        console.log('Voices loaded:', voices);
        
        if (voices.length === 0) {
            console.log('No voices available, retrying...');
            setTimeout(loadVoices, 100);
            return;
        }
        
        if (statusElement) {
            statusElement.textContent = 'Ready to listen...';
        }
        
        // Speak a welcome message
        setTimeout(() => {
            speak("Welcome to SuhaniQ. How can I help you today?");
        }, 500);
    }
    
    // Chrome needs this event to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Call it directly in case voices are already loaded
    
    // Hide loading overlay
    hideLoading();
}

// Speech synthesis function
function speak(text) {
    console.log('Attempting to speak:', text);
    
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported in this browser');
        return;
    }
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    // Try to find a suitable voice
    const preferredVoices = ['Google US English', 'Microsoft David - English (United States)', 'English (US)'];
    const voice = voices.find(v => preferredVoices.some(pv => v.name.includes(pv))) || voices[0];
    
    if (voice) {
        utterance.voice = voice;
        console.log('Using voice:', voice.name);
    }
    
    utterance.onstart = () => {
        console.log('Speech started');
        btn.classList.add('speaking');
    };
    
    utterance.onend = () => {
        console.log('Speech ended');
        btn.classList.remove('speaking');
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        btn.classList.remove('speaking');
    };
    
    try {
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error('Error in speechSynthesis.speak:', error);
    }
}

// Welcome message based on time of day
function wishMe() {
    const day = new Date();
    const hours = day.getHours();
    let greeting = "";
    
    if (hours >= 0 && hours < 12) {
        greeting = "Good Morning! I'm SuhaniQ, your AI assistant. How can I help you today?";
    } else if (hours >= 12 && hours < 16) {
        greeting = "Good afternoon! Ready to assist you with anything?";
    } else {
        greeting = "Good evening! What can I do for you tonight?";
    }
    
    responseText.textContent = greeting;
    speak(greeting);
}

// Speech recognition setup
let recognition;

try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    console.log('Speech recognition initialized');
    
    // Event handlers for speech recognition
    recognition.onstart = () => {
        console.log('Voice recognition started');
        if (statusText) {
            statusText.textContent = 'Listening...';
        }
        btn.classList.add('listening');
    };
    
    recognition.onend = () => {
        console.log('Voice recognition ended');
        if (statusText && !statusText.textContent.startsWith('Error')) {
            statusText.textContent = 'Ready to listen...';
        }
        btn.classList.remove('listening');
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (statusText) {
            statusText.textContent = `Error: ${event.error}`;
        }
        btn.classList.remove('listening');
        hideLoading();
        
        // Provide user feedback
        if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access to use voice commands.');
        } else if (event.error === 'audio-capture') {
            alert('No microphone was found. Please ensure a microphone is connected.');
        } else {
            alert('Error with speech recognition. Please try again.');
        }
    };
    
    recognition.onresult = (event) => {
        console.log('Speech recognition result:', event);
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript.trim();
        
        console.log('Recognized speech:', transcript);
        
        if (content) {
            content.textContent = transcript;
        }
        
        if (statusText) {
            statusText.textContent = 'Processing...';
        }
        
        takeCommand(transcript);
    };
    
} catch (error) {
    console.error('Failed to initialize speech recognition:', error);
    if (statusText) {
        statusText.textContent = 'Error: Speech recognition not available';
    }
    alert('Speech recognition is not supported in your browser. Please try a modern browser like Chrome or Edge.');
}

// Show loading state
function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// Hide loading state
function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Helper function to update the response in the UI
function updateResponse(text) {
    if (responseText) {
        responseText.textContent = text;
    }
}

// Main command processing function
function takeCommand(message) {
    console.log('Processing command:', message);
    showLoading();
    
    try {
        // Process commands
        if (message.toLowerCase().includes('open ')) {
            const website = message.toLowerCase().split('open ')[1];
            let url;
            
            // Map common website names to their URLs
            const websites = {
                'youtube': 'https://youtube.com',
                'facebook': 'https://facebook.com',
                'instagram': 'https://instagram.com',
                'twitter': 'https://twitter.com',
                'google': 'https://google.com',
                'gmail': 'https://gmail.com',
                'github': 'https://github.com',
                'linkedin': 'https://linkedin.com',
                'netflix': 'https://netflix.com',
                'amazon': 'https://amazon.com',
                'wikipedia': 'https://wikipedia.org',
                'whatsapp': 'https://web.whatsapp.com',
                'spotify': 'https://open.spotify.com',
                'reddit': 'https://reddit.com',
                'yahoo': 'https://yahoo.com',
                'bing': 'https://bing.com',
                'msn': 'https://msn.com',
                'ebay': 'https://ebay.com',
                'imdb': 'https://imdb.com',
                'pinterest': 'https://pinterest.com',
                'twitch': 'https://twitch.tv',
                'discord': 'https://discord.com',
                'zoom': 'https://zoom.us',
                'slack': 'https://slack.com',
                'dropbox': 'https://dropbox.com',
                'drive': 'https://drive.google.com',
                'docs': 'https://docs.google.com',
                'sheets': 'https://sheets.google.com',
                'slides': 'https://slides.google.com',
                'outlook': 'https://outlook.live.com',
                'office': 'https://office.com',
                'onedrive': 'https://onedrive.live.com',
                'teams': 'https://teams.microsoft.com',
                'skype': 'https://web.skype.com',
                'telegram': 'https://web.telegram.org',
                'signal': 'https://signal.org',
                'tiktok': 'https://tiktok.com',
                'snapchat': 'https://web.snapchat.com',
                'tumblr': 'https://tumblr.com',
                'wordpress': 'https://wordpress.com',
                'blogger': 'https://blogger.com',
                'medium': 'https://medium.com',
                'quora': 'https://quora.com',
                'stackoverflow': 'https://stackoverflow.com',
                'github': 'https://github.com',
                'gitlab': 'https://gitlab.com',
                'bitbucket': 'https://bitbucket.org',
                'docker': 'https://hub.docker.com',
                'npm': 'https://npmjs.com',
                'yarn': 'https://yarnpkg.com',
                'nodejs': 'https://nodejs.org',
                'python': 'https://python.org',
                'java': 'https://java.com',
                'oracle': 'https://oracle.com',
                'microsoft': 'https://microsoft.com',
                'apple': 'https://apple.com',
                'samsung': 'https://samsung.com',
                'xiaomi': 'https://mi.com',
                'oneplus': 'https://oneplus.com',
                'oppo': 'https://oppo.com',
                'vivo': 'https://vivo.com',
                'realme': 'https://realme.com',
                'motorola': 'https://motorola.com',
                'nokia': 'https://nokia.com',
                'sony': 'https://sony.com',
                'lg': 'https://lg.com',
                'asus': 'https://asus.com',
                'acer': 'https://acer.com',
                'dell': 'https://dell.com',
                'hp': 'https://hp.com',
                'lenovo': 'https://lenovo.com',
                'msi': 'https://msi.com',
                'intel': 'https://intel.com',
                'amd': 'https://amd.com',
                'nvidia': 'https://nvidia.com',
                'corsair': 'https://corsair.com',
                'razer': 'https://razer.com',
                'logitech': 'https://logitech.com',
                'steam': 'https://store.steampowered.com',
                'epic games': 'https://epicgames.com',
                'ubisoft': 'https://ubisoft.com',
                'ea': 'https://ea.com',
                'rockstar': 'https://rockstargames.com',
                'blizzard': 'https://blizzard.com',
                'battlenet': 'https://battle.net',
                'origin': 'https://origin.com',
                'uplay': 'https://uplay.ubisoft.com',
                'gog': 'https://gog.com',
                'humble': 'https://humblebundle.com',
                'itch.io': 'https://itch.io',
                'twitch': 'https://twitch.tv',
                'youtube gaming': 'https://gaming.youtube.com',
                'facebook gaming': 'https://fb.gg',
                'mixer': 'https://mixer.com',
                'dlive': 'https://dlive.tv',
                'caffeine': 'https://caffeine.tv',
                'trovo': 'https://trovo.live',
                'nimo': 'https://nimo.tv',
                'afreeca': 'https://afreecatv.com',
                'vimeo': 'https://vimeo.com',
                'dailymotion': 'https://dailymotion.com',
                'viki': 'https://viki.com',
                'hotstar': 'https://hotstar.com',
                'voot': 'https://voot.com',
                'zee5': 'https://zee5.com',
                'sonyliv': 'https://sonyliv.com',
                'altbalaji': 'https://altbalaji.com',
                'erosnow': 'https://erosnow.com',
                'jio cinema': 'https://jiocinema.com',
                'mx player': 'https://mxplayer.in',
                'aha': 'https://aha.video',
                'disney+': 'https://disneyplus.com',
                'disney plus': 'https://disneyplus.com',
                'hbo max': 'https://hbomax.com',
                'hbo': 'https://hbomax.com',
                'hulu': 'https://hulu.com',
                'peacock': 'https://peacocktv.com',
                'paramount+': 'https://paramountplus.com',
                'paramount plus': 'https://paramountplus.com',
                'apple tv': 'https://tv.apple.com',
                'appletv': 'https://tv.apple.com',
                'apple tv+': 'https://tv.apple.com',
                'apple tv plus': 'https://tv.apple.com',
                'apple music': 'https://music.apple.com',
                'spotify': 'https://open.spotify.com',
                'youtube music': 'https://music.youtube.com',
                'yt music': 'https://music.youtube.com',
                'amazon music': 'https://music.amazon.com',
                'pandora': 'https://pandora.com',
                'tidal': 'https://tidal.com',
                'deezer': 'https://deezer.com',
                'soundcloud': 'https://soundcloud.com',
                'bandcamp': 'https://bandcamp.com',
                'iheartradio': 'https://iheart.com',
                'tunein': 'https://tunein.com',
                'radio.com': 'https://radio.com',
                'audacy': 'https://audacy.com',
                'iheart': 'https://iheart.com',
                'iheart radio': 'https://iheart.com',
                'iheartradio': 'https://iheart.com',
                'iheart': 'https://iheart.com',
                'iheart radio': 'https://iheart.com',
                'audible': 'https://audible.com',
                'audiobooks': 'https://audible.com',
                'audible books': 'https://audible.com',
                'audiobook': 'https://audible.com',
                'audible book': 'https://audible.com',
                'audible.com': 'https://audible.com',
                'audible': 'https://audible.com',
                'audible books': 'https://audible.com',
                'audible book': 'https://audible.com',
                'audible.com': 'https://audible.com',
                'audible': 'https://audible.com',
                'audible books': 'https://audible.com',
                'audible book': 'https://audible.com',
                'audible.com': 'https://audible.com'
            };
            
            // Check if the requested website is in our mapping
            if (websites[website]) {
                url = websites[website];
                window.open(url, '_blank');
                updateResponse(`Opening ${website}...`);
                speak(`Opening ${website}`);
            } else if (website.startsWith('http') || website.includes('.com') || website.includes('.in') || website.includes('.org') || website.includes('.net') || website.includes('.io') || website.includes('.co') || website.includes('.ai') || website.includes('.dev') || website.includes('.me') || website.includes('.tv') || website.includes('.app') || website.includes('.store') || website.includes('.shop') || website.includes('.blog') || website.includes('.tech') || website.includes('.online') || website.includes('.site') || website.includes('.website') || website.includes('.live') || website.includes('.xyz') || website.includes('.info') || website.includes('.biz') || website.includes('.us') || website.includes('.uk') || website.includes('.ca') || website.includes('.au') || website.includes('.nz') || website.includes('.in') || website.includes('.sg') || website.includes('.my') || website.includes('.id') || website.includes('.ph') || website.includes('.th') || website.includes('.vn') || website.includes('.jp') || website.includes('.kr') || website.includes('.cn') || website.includes('.ru') || website.includes('.br') || website.includes('.mx') || website.includes('.ar') || website.includes('.co.uk') || website.includes('.co.in') || website.includes('.co.jp') || website.includes('.co.kr') || website.includes('.com.br') || website.includes('.com.mx') || website.includes('.com.ar') || website.includes('.com.au') || website.includes('.co.nz') || website.includes('.co.za') || website.includes('.ae') || website.includes('.sa') || website.includes('.eg') || website.includes('.ma') || website.includes('.dz') || website.includes('.tn') || website.includes('.ly') || website.includes('.jo') || website.includes('.lb') || website.includes('.ps') || website.includes('.iq') || website.includes('.kw') || website.includes('.qa') || website.includes('.bh') || website.includes('.om') || website.includes('.ye') || website.includes('.sy') || website.includes('.iq') || website.includes('.jo') || website.includes('.lb') || website.includes('.ps') || website.includes('.iq') || website.includes('.kw') || website.includes('.qa') || website.includes('.bh') || website.includes('.om') || website.includes('.ye') || website.includes('.sy')) {
                // Try to open the URL directly if it looks like a URL
                url = website.startsWith('http') ? website : `https://${website}`;
                window.open(url, '_blank');
                updateResponse(`Opening ${url}...`);
                speak(`Opening ${url}`);
            } else {
                updateResponse(`I'm sorry, I don't know how to open ${website}.`);
                speak(`I'm sorry, I don't know how to open ${website}.`);
            }
        } else {
            // For all other commands, just acknowledge
            updateResponse("I'm sorry, this feature is not available right now.");
            speak("I'm sorry, this feature is not available right now.");
        }
    } catch (error) {
        console.error('Error processing command:', error);
        updateResponse("Sorry, I encountered an error processing your request.");
        speak("Sorry, I encountered an error processing your request.");
    } finally {
        hideLoading();
    }
}

// Handle AI queries
async function handleAIQuery(message) {
    try {
        const response = await fetch('http://localhost:3000/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();
        if (data.response) {
            responseText.textContent = data.response;
            speak(data.response);
        } else {
            throw new Error('No response from AI');
        }
    } catch (error) {
        console.error('AI query failed:', error);
        const searchQuery = message.replace(/nova|shifra|shipra/gi, "").trim();
        responseText.textContent = `I'm not sure about that. Searching the web for: ${searchQuery}`;
        speak("I couldn't find an answer. Let me search the internet for you.");
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    }
}

// Handle reminders
async function handleReminder(reminder) {
    try {
        const response = await fetch('http://localhost:3000/api/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reminder })
        });
        
        if (response.ok) {
            const data = await response.json();
            memory.reminders = data.reminders;
            speak("Reminder added: " + reminder);
            responseText.textContent = `Reminder set: ${reminder}`;
        } else {
            throw new Error('Failed to add reminder');
        }
    } catch (error) {
        console.error('Reminder error:', error);
        speak("I couldn't save your reminder. Please try again later.");
    }
}

async function handleGetReminders() {
    try {
        const response = await fetch('http://localhost:3000/api/reminders');
        if (response.ok) {
            const data = await response.json();
            if (data.reminders.length === 0) {
                speak("You have no reminders.");
                responseText.textContent = "No reminders set.";
            } else {
                const reminderText = data.reminders.join(", ");
                speak("Your reminders are: " + reminderText);
                responseText.textContent = `Your reminders: ${reminderText}`;
            }
        } else {
            throw new Error('Failed to get reminders');
        }
    } catch (error) {
        console.error('Get reminders error:', error);
        speak("I couldn't retrieve your reminders. Please try again later.");
    }
}

// Weather function (placeholder - would need API key)
async function handleWeather() {
    const response = "I'd need a weather API key to provide current weather information. You can ask me to search weather information online instead.";
    responseText.textContent = response;
    speak(response);
}

// News function (placeholder - would need API key)
async function handleNews() {
    const response = "I'd need a news API key to provide current news. You can ask me to search for latest news online.";
    responseText.textContent = response;
    speak(response);
}

// Timer function
async function handleTimer(message) {
    const match = message.match(/set a timer for (\d+) (minute|hour|second)s?/i);
    if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        let milliseconds = amount * 1000; // default to seconds
        
        if (unit === 'minute') milliseconds = amount * 60 * 1000;
        if (unit === 'hour') milliseconds = amount * 60 * 60 * 1000;
        
        speak(`Timer set for ${amount} ${unit}${amount > 1 ? 's' : ''}`);
        responseText.textContent = `Timer set for ${amount} ${unit}${amount > 1 ? 's' : ''}`;
        
        setTimeout(() => {
            speak(`Your timer for ${amount} ${unit}${amount > 1 ? 's' : ''} is up!`);
            responseText.textContent += `\n⏰ Timer completed!`;
        }, milliseconds);
        speak("I didn't understand the timer duration. Please say something like 'set a timer for 5 minutes'");
    }
}

// Event listeners
btn.addEventListener("click", () => {
    try {
        console.log('Microphone button clicked');
        
        if (!recognition) {
            console.error('Speech recognition not initialized');
            if (statusText) {
                statusText.textContent = 'Error: Speech recognition not available';
            }
            speak('Sorry, speech recognition is not available in your browser.');
            return;
        }
        
        // Toggle listening state
        if (btn.classList.contains('listening')) {
            console.log('Stopping speech recognition');
            recognition.stop();
            btn.classList.remove('listening');
            if (statusText) {
                statusText.textContent = 'Ready to listen...';
            }
        } else {
            console.log('Starting speech recognition');
            if (content) {
                content.textContent = 'Listening...';
            }
            if (responseText) {
                responseText.textContent = '';
            }
            
            // Set language and start recognition
            recognition.lang = memory.preferences.language;
            try {
                recognition.start();
                btn.classList.add('listening');
                if (statusText) {
                    statusText.textContent = 'Listening...';
                }
            } catch (error) {
                console.error('Error starting recognition:', error);
                if (statusText) {
                    statusText.textContent = 'Error: ' + (error.message || 'Failed to start listening');
                }
                btn.classList.remove('listening');
                speak('Sorry, I could not start listening. Please check your microphone settings.');
            }
        }
    } catch (error) {
        console.error('Error in button click handler:', error);
        if (statusText) {
            statusText.textContent = 'Error: ' + (error.message || 'An error occurred');
        }
        btn.classList.remove('listening');
        speak('Sorry, an error occurred. Please try again.');
    }
});

submitFeedback.addEventListener("click", async () => {
    const feedback = feedbackInput.value.trim();
    if (feedback.length === 0) {
        feedbackStatus.textContent = "Please enter feedback before submitting.";
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback })
        });
        
        if (response.ok) {
            feedbackStatus.textContent = "Thank you for your feedback!";
            feedbackStatus.style.color = "#4CAF50";
            feedbackInput.value = "";
        } else {
            throw new Error('Failed to submit feedback');
        }
    } catch (error) {
        feedbackStatus.textContent = "Failed to submit feedback. Please try again.";
        feedbackStatus.style.color = "#ff6b6b";
    }
    
    setTimeout(() => {
        feedbackStatus.textContent = "";
    }, 5000);
});

// Settings change listeners
autoSpeakCheckbox.addEventListener('change', () => {
    memory.preferences.autoSpeak = autoSpeakCheckbox.checked;
    saveMemory();
});

saveHistoryCheckbox.addEventListener('change', () => {
    memory.preferences.saveHistory = saveHistoryCheckbox.checked;
    saveMemory();
});

// Initialize the app when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOMContentLoaded has already fired
    initApp();
}
