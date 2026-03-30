const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ==========================================
// 🔐 FIREBASE ADMIN SETUP
// ==========================================
// Ensure you have added FIREBASE_SERVICE_ACCOUNT to Render Env Variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 1. Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5177',
  'http://localhost:5204',
  /\.vercel\.app$/
];

// 2. CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    if (isAllowed) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options(/.*/, cors());

// 3. Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// 🤖 AI SETUP - Use the stable model string
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ==========================================
// 📊 ADMIN ANALYTICS (Fixed: Now standalone)
// ==========================================
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').count().get();
    const questionsSnapshot = await db.collection('questions').count().get();
    
    res.json({ 
      success: true, 
      data: { 
        totalUsers: usersSnapshot.data().count, 
        totalQuestions: questionsSnapshot.data().count 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Analytics fetch failed." });
  }
});

// ==========================================
// ⚖️ THE ALAC GRADING ENGINE
// ==========================================
app.post('/api/grade-answer', async (req, res) => {
  const { studentAnswer } = req.body;

  if (!studentAnswer) {
    return res.status(400).json({ success: false, message: "Answer is empty." });
  }

  try {
    const prompt = `
      You are an expert Philippine Bar Examiner. Grade the following student answer.
      STRICT GRADING RULES:
      1. Use the ALAC Method (Issue, Law, Analysis, Conclusion).
      2. Provide a Score from 0 to 100.
      3. Provide a short, constructive Critique.
      4. Provide a Suggested "Perfect" Answer.

      STUDENT ANSWER: "${studentAnswer}"

      RESPONSE FORMAT (JSON ONLY):
      {
        "score": number,
        "critique": "string",
        "suggestedAnswer": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI format error:", responseText);
      return res.status(500).json({ success: false, message: "AI response format error." });
    }
    
    const gradedResult = JSON.parse(jsonMatch[0]);
    res.json({ success: true, ...gradedResult });

  } catch (error) {
    console.error("Grading Error:", error);
    res.status(500).json({ success: false, message: "AI Grading failed." });
  }
});

// ==========================================
// 🏛️ JURISPRUDENCE CHAT
// ==========================================
app.post('/api/ask-legal-ai', async (req, res) => {
  const { query, history = [] } = req.body;

  try {
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(query);
    res.json({ success: true, answer: result.response.text() });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ success: false, message: "AI Chat failed." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Lex Casus Engine running on port ${PORT}`));