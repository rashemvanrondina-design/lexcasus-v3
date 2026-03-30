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

// 1. Allowed origins - SIMPLIFIED FOR VERCEL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5177',
  'http://localhost:5204',
  'https://lexcasus-v3.vercel.app' // 👈 Explicit string, no Regex
];

// 2. CORS Configuration - SIMPLIFIED
app.use(cors({
  origin: allowedOrigins, // 👈 Direct array mapping prevents callback crashes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors()); // Allow preflight on all routes

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
// ⚖️ DEFENSIVE ALAC GRADING ENGINE
// ==========================================
app.post('/api/grade-answer', async (req, res) => {
  const { studentAnswer } = req.body;

  if (!studentAnswer) {
    return res.status(400).json({ success: false, message: "Answer is empty." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Perform a legal evaluation of this Philippine Bar answer using the ALAC method.
      
      Student Answer: "${studentAnswer}"

      Return ONLY a raw JSON object. Do not include markdown code blocks, backticks, or introductory text.
      
      {
        "score": number,
        "critique": "string",
        "suggestedAnswer": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      console.error("AI did not return valid JSON structure:", text);
      throw new Error("AI response format invalid");
    }

    const jsonString = text.substring(start, end + 1);
    const gradedResult = JSON.parse(jsonString);

    res.json({ 
      success: true, 
      ...gradedResult 
    });

  } catch (error) {
    console.error("GRADELINE ERROR:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "AI Grading failed. Please try a more detailed answer.",
      error: error.message 
    });
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
// 📚 GET QUESTIONS
// ==========================================
app.post('/api/get-questions', async (req, res) => {
  try {
    console.log("Incoming Fetch Request Body:", req.body);
    
    const { topic } = req.body;

    if (!topic) {
      console.error("Error: Topic is missing in request body");
      return res.status(400).json({ success: false, message: "Topic is required." });
    }

    if (!db) {
      throw new Error("Firestore Database (db) is not initialized.");
    }

    const questionsRef = db.collection('questions');
    const snapshot = await questionsRef.where('topic', '==', topic).get();

    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Successfully fetched ${questions.length} questions for topic: ${topic}`);
    
    res.json({ 
      success: true, 
      questions: questions 
    });

  } catch (error) {
    console.error("CRITICAL FETCH ERROR:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
});

// ==========================================
// 📝 SAVE NEW QUESTION
// ==========================================
app.post('/api/save-question', async (req, res) => {
  const { mainSubject, subSubject, questionText, suggestedAnswer } = req.body;
  if (!mainSubject || !subSubject || !questionText || !suggestedAnswer) {
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  try {
    const docRef = await db.collection('questions').add({
      subject: mainSubject,
      topic: subSubject, 
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