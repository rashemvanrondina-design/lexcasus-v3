const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const helmet = require('helmet');
const morgan = require('morgan');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// ==========================================
// 🔐 FIREBASE ADMIN SETUP
// ==========================================
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

// 🤖 AI SETUP - Fixed to stable 1.5 model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ==========================================
// 📊 ADMIN ANALYTICS
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
  if (!studentAnswer) return res.status(400).json({ success: false, message: "Answer is empty." });

  try {
    const prompt = `Grade this Philippine Bar student answer using ALAC Method. Score 0-100. Critique. Suggested Answer.
      STUDENT ANSWER: "${studentAnswer}"
      FORMAT: JSON {score: number, critique: string, suggestedAnswer: string}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) return res.status(500).json({ success: false, message: "AI response error." });
    
    res.json({ success: true, ...JSON.parse(jsonMatch[0]) });
  } catch (error) {
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
    res.status(500).json({ success: false, message: "AI Chat failed." });
  }
});

// ==========================================
// 📚 GET QUESTIONS (The Specific Fetch)
// ==========================================
app.post('/api/get-questions', async (req, res) => {
  const { topic } = req.body;
  try {
    const snapshot = await db.collection('questions').where('topic', '==', topic).get();
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch error" });
  }
});

// ==========================================
// 📝 SAVE NEW QUESTION (Restored & Aligned)
// ==========================================
app.post('/api/save-question', async (req, res) => {
  const { mainSubject, subSubject, questionText, suggestedAnswer } = req.body;
  if (!mainSubject || !subSubject || !questionText || !suggestedAnswer) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  try {
    const docRef = await db.collection('questions').add({
      subject: mainSubject,
      topic: subSubject, // This matches the 'topic' used in get-questions
      text: questionText,
      answer: suggestedAnswer,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Save failed." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Lex Casus Engine running on port ${PORT}`));