# SuhaniQ - Advanced AI Virtual Assistant

SuhaniQ is a modern, voice-enabled virtual assistant built with Node.js, Express, and the Web Speech API. It provides intelligent voice interactions, AI-powered responses, and various utility features.

## Features

- 🎤 **Voice Recognition**: Uses Web Speech API for speech-to-text conversion
- 🤖 **AI Integration**: OpenAI integration for intelligent responses (optional)
- 🗣️ **Text-to-Speech**: Built-in speech synthesis for audio responses
- ⏰ **Reminders**: Set and manage reminders
- 🌐 **Web Navigation**: Open popular websites with voice commands
- 📊 **Database**: SQLite for data persistence
- 🎨 **Modern UI**: Responsive design with gradient backgrounds

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with Web Speech API support (Chrome, Edge, Firefox)

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SuhaniQ-VA
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up OpenAI integration:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

1. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Click the microphone button and speak your command

## Voice Commands

- "Hello" / "Hey" - Greet the assistant
- "Open youtube" - Opens YouTube
- "Open google" - Opens Google
- "What time is it?" - Tells current time
- "What's the date?" - Tells current date
- "Set a reminder" - Sets a reminder (followed by reminder text)

## Project Structure

```
SuhaniQ-VA/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.debug.js     # Main JavaScript with voice recognition
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies and scripts
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## API Endpoints

- `POST /api/query` - Process voice commands with AI
- `POST /api/reminders` - Add new reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/feedback` - Submit feedback
- `GET /api/history` - Get command history
- `GET /api/weather` - Get weather information
- `GET /api/news` - Get news updates
- `GET /api/system` - System status

## Browser Compatibility

This application requires a browser that supports:
- Web Speech API (SpeechRecognition)
- Speech Synthesis API
- Modern JavaScript features (ES6+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

## Acknowledgments

- Web Speech API for voice recognition capabilities
- OpenAI for AI integration
- Express.js for the server framework
