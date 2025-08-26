const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

const db = new sqlite3.Database('./suhani.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reminder TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feedback TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS command_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            command TEXT NOT NULL,
            response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/api/query', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        db.run('INSERT INTO command_history (command) VALUES (?)', [message]);

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
            
            db.run('UPDATE command_history SET response = ? WHERE id = (SELECT MAX(id) FROM command_history)', [aiResponse]);
            
            return res.json({ response: aiResponse });
        } else {
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

app.get('/api/weather', async (req, res) => {
    try {
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

app.get('/api/news', async (req, res) => {
    try {
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

app.get('/api/system', (req, res) => {
    res.json({
        status: 'online',
        serverTime: new Date().toISOString(),
        version: '1.0.0',
        features: ['voice-commands', 'reminders', 'ai-responses', 'feedback']
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

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
