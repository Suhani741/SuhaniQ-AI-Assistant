// Test script to check voice recognition capabilities
console.log('Testing Voice Recognition Support...');

// Check if Web Speech API is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    console.log('✅ Web Speech API is supported');
    console.log('Available recognition features:');
    
    // Test basic recognition functionality
    try {
        const recognition = new SpeechRecognition();
        console.log('✅ SpeechRecognition object created successfully');
        console.log('Recognition properties:');
        console.log('- Continuous:', recognition.continuous);
        console.log('- Interim Results:', recognition.interimResults);
        console.log('- Language:', recognition.lang);
        
        // Test if we can start recognition
        recognition.onstart = () => {
            console.log('✅ Recognition started successfully');
            recognition.stop();
        };
        
        recognition.onerror = (event) => {
            console.log('❌ Recognition error:', event.error);
        };
        
        recognition.onend = () => {
            console.log('Recognition ended');
        };
        
        console.log('Attempting to start recognition...');
        recognition.start();
        
    } catch (error) {
        console.log('❌ Error creating recognition:', error.message);
    }
} else {
    console.log('❌ Web Speech API not supported in this environment');
    console.log('Available window properties:', Object.keys(window).filter(key => key.includes('Speech') || key.includes('speech')));
}

// Check if speech synthesis is available
if ('speechSynthesis' in window) {
    console.log('✅ Speech Synthesis is supported');
} else {
    console.log('❌ Speech Synthesis not supported');
}
