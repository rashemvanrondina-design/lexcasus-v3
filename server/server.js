const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// 1. Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5177',
  'http://localhost:5204',
  /\.vercel\.app$/ // Matches any Vercel preview deployment
];

// 2. Configure CORS correctly
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
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'] // 👈 CRITICAL: Added Authorization here
}));

// Ensure OPTIONS requests return a 200 OK immediately
app.options(/.*/, cors());

// 3. Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());

// 🤖 AI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
    if (!jsonMatch) throw new Error("AI did not return valid JSON");
    
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