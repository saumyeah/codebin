
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors({
  origin: ["https://codebin-smoky.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI||"mongodb://localhost:27017/codebin";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));




const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const SnippetSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  content: { type: String },
  language: { type: String, default: 'javascript' },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', UserSchema);
const Snippet = mongoose.model('Snippet', SnippetSchema);


app.get('/', (req, res) => {
  res.send('Welcome to the CodeBin API Kitchen!');
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User created!' });
  } catch (error) {
    res.status(400).send({ message: 'Error creating user', error });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid password' });
    }

   
    const token = jwt.sign(
      { userId: user._id }, 
      JWT_SECRET,           
      { expiresIn: '1d' }  
    );
    
    res.status(200).send({ message: 'Logged in!', token });
  } catch (error) {
    res.status(400).send({ message: 'Login failed', error });
  }
});


const authMiddleware = (req, res, next) => {
 
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).send({ message: 'No token, authorization denied' });
  }

  try {
   
    const decoded = jwt.verify(token, JWT_SECRET);
   
    req.userId = decoded.userId;
    next(); 
  } catch (error) {
    res.status(401).send({ message: 'Token is not valid' });
  }
};


app.post('/snippets', authMiddleware, async (req, res) => {
  try {
    const { title, content, language } = req.body;
    const snippet = new Snippet({
      title,
      content,
      language,
      owner: req.userId 
    });
    await snippet.save();
    res.status(201).send(snippet);
  } catch (error) {
    res.status(400).send({ message: 'Could not create snippet', error });
  }
});

app.get('/snippets', authMiddleware, async (req, res) => {
  try {
    const snippets = await Snippet.find({ owner: req.userId });
    res.status(200).send(snippets);
  } catch (error) {
    res.status(400).send({ message: 'Could not get snippets', error });
  }
});

app.get('/snippets/:id', authMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ 
      _id: req.params.id, 
      owner: req.userId 
    });
    if (!snippet) {
      return res.status(404).send({ message: 'Snippet not found' });
    }
    res.status(200).send(snippet);
  } catch (error) {
    res.status(400).send({ message: 'Could not get snippet', error });
  }
});

app.put('/snippets/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, language } = req.body;
    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { title, content, language },
      { new: true } 
    );
    if (!snippet) {
      return res.status(404).send({ message: 'Snippet not found' });
    }
    res.status(200).send(snippet);
  } catch (error) {
    res.status(400).send({ message: 'Could not update snippet', error });
  }
});
app.delete('/snippets/:id', authMiddleware, async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId
    });
    if (!snippet) {
      return res.status(404).send({ message: 'Snippet not found' });
    }
    res.status(200).send({ message: 'Snippet deleted' });
  } catch (error) {
    res.status(400).send({ message: 'Could not delete snippet', error });
  }
});
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`API Server (Kitchen) is running on http://localhost:${PORT}`);
});