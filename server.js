const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

// Initialize OpenAI (will use environment variable)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Initialize SQLite database
const db = new sqlite3.Database('./nova.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Reminders table
        db.run(`CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reminder TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Feedback table
        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feedback TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Command history table
        db.run(`CREATE TABLE IF NOT EXISTS command_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            command TEXT NOT NULL,
            response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Preferences table
        db.run(`CREATE TABLE IF NOT EXISTS preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files

// Enhanced AI query endpoint with OpenAI integration
app.post('/api/query', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Save command to history
        db.run('INSERT INTO command_history (command) VALUES (?)', [message]);

        // Use OpenAI for intelligent responses
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are SuhaniQ, a helpful AI assistant. Provide concise, friendly responses. Keep responses under 2-3 sentences when possible."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            });

            const aiResponse = completion.choices[0].message.content;
            
            // Update command history with AI response
            db.run('UPDATE command_history SET response = ? WHERE id = (SELECT MAX(id) FROM command_history)', [aiResponse]);
            
            return res.json({ response: aiResponse });
        } else {
            // Fallback responses if OpenAI is not configured
            const fallbackResponses = {
                'hello': "Hello! I'm SuhaniQ, your AI assistant. How can I help you today?",
                'hey': "Hey there! What can I do for you?",
                'how are you': "I'm doing great, thanks for asking! Ready to help you with anything.",
                'what can you do': "I can help with reminders, answer questions, open websites, tell time and date, set timers, and much more!",
                'thank you': "You're welcome! Is there anything else I can help with?",
                'who made you': "I was created to be your helpful AI assistant!",
                'default': `I heard you say: "${message}". I'm here to help! What would you like me to do?`
            };

            const lowerMessage = message.toLowerCase();
            let response = fallbackResponses.default;

            for (const [key, value] of Object.entries(fallbackResponses)) {
                if (lowerMessage.includes(key)) {
                    response = value;
                    break;
                }
            }

            db.run('UPDATE command_history SET response = ? WHERE id = (SELECT MAX(id) FROM command_history)', [response]);
            return res.json({ response });
        }
    } catch (error) {
        console.error('AI query error:', error);
        res.json({ response: "I'm having trouble processing your request right now. Please try again later." });
    }
});

// Enhanced reminders endpoints
app.post('/api/reminders', (req, res) => {
    const { reminder } = req.body;
    
    if (!reminder) {
        return res.status(400).json({ success: false, message: 'Reminder is required' });
    }

    db.run('INSERT INTO reminders (reminder) VALUES (?)', [reminder], function(err) {
        if (err) {
            console.error('Error adding reminder:', err);
            return res.status(500).json({ success: false, message: 'Failed to add reminder' });
        }
        
        // Get all reminders
        db.all('SELECT reminder FROM reminders ORDER BY created_at DESC', (err, rows) => {
            if (err) {
                console.error('Error fetching reminders:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
            }
            
            const reminders = rows.map(row => row.reminder);
            res.json({ success: true, reminders });
        });
    });
});

app.get('/api/reminders', (req, res) => {
    db.all('SELECT reminder FROM reminders ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching reminders:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
        }
        
        const reminders = rows.map(row => row.reminder);
        res.json({ reminders });
    });
});

// Enhanced feedback endpoint
app.post('/api/feedback', (req, res) => {
    const { feedback } = req.body;
    
    if (!feedback) {
        return res.status(400).json({ success: false, message: 'Feedback is required' });
    }

    db.run('INSERT INTO feedback (feedback) VALUES (?)', [feedback], function(err) {
        if (err) {
            console.error('Error saving feedback:', err);
            return res.status(500).json({ success: false, message: 'Failed to save feedback' });
        }
        
        res.json({ success: true, message: 'Feedback received successfully' });
    });
});

// New endpoints for additional features

// Get command history
app.get('/api/history', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    db.all('SELECT command, response, created_at FROM command_history ORDER BY created_at DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
            console.error('Error fetching history:', err);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }
        
        res.json({ history: rows });
    });
});

// Weather endpoint (mock implementation)
app.get('/api/weather', async (req, res) => {
    try {
        // Create weather data and use JSON.stringify to ensure proper formatting
        const weatherData = {
            location: "Your Location",
            temperature: 72,
            condition: "Sunny",
            message: "Weather data is currently mocked for testing purposes."
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(weatherData));
    } catch (error) {
        res.status(500).json({ error: 'Weather service unavailable' });
    }
});

// News endpoint (mock implementation)
app.get('/api/news', async (req, res) => {
    try {
        // Mock news data
        const mockNewsData = [
            { title: "Latest technology developments", description: "New advancements in AI technology." },
            { title: "Current world events", description: "Updates on global affairs." },
            { title: "Interesting science discoveries", description: "Recent findings in the field of science." }
        ];
        res.json({ news: mockNewsData, message: "News data is currently mocked for testing purposes." });
    } catch (error) {
        res.status(500).json({ error: 'News service unavailable' });
    }
});

// System info endpoint
app.get('/api/system', (req, res) => {
    res.json({
        status: 'online',
        serverTime: new Date().toISOString(),
        version: '1.0.0',
        features: ['voice-commands', 'reminders', 'ai-responses', 'feedback']
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`\n🚀 SuhaniQ Virtual Assistant Server running at http://localhost:${port}`);
    console.log('📋 Available endpoints:');
    console.log('   POST /api/query      - Process AI queries');
    console.log('   POST /api/reminders  - Add reminders');
    console.log('   GET  /api/reminders  - Get all reminders');
    console.log('   POST /api/feedback   - Submit feedback');
    console.log('   GET  /api/history    - Get command history');
    console.log('   GET  /api/weather    - Get weather info');
    console.log('   GET  /api/news       - Get news');
    console.log('   GET  /api/system     - System status');
    console.log('\n🔑 To enable AI features, set OPENAI_API_KEY in .env file');
    console.log('💡 Quick start: Open http://localhost:3000 in your browser');
});
