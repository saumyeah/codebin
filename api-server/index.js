// Import our "ingredients"
require('dotenv').config(); // This loads the .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Create the App ---
// Create an "app" by running the express function
const app = express();

// --- "Middleware" ---
// These are "helpers" that run on every request
// 1. Let our frontend (on a different domain) talk to our backend
app.use(cors());
// 2. Allow our app to understand JSON data sent in requests
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI||"mongodb://localhost:27017/codebin";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// --- "Schemas" (Blueprints for our data) ---

// 1. User Blueprint
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// 2. Snippet Blueprint
const SnippetSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  content: { type: String },
  language: { type: String, default: 'javascript' },
  // This 'owner' field links a snippet to a user
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// --- "Models" (The tools to work with our blueprints) ---
const User = mongoose.model('User', UserSchema);
const Snippet = mongoose.model('Snippet', SnippetSchema);

// --- "Routes" (The "Menu" for our API) ---

// A simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the CodeBin API Kitchen!');
});

// === Auth Routes ===

// 1. Register a new user
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Hash the password (scramble it)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User created!' });
  } catch (error) {
    res.status(400).send({ message: 'Error creating user', error });
  }
});

// 2. Login an existing user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the "scrambled" password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid password' });
    }

    // Create a "Digital ID Card" (JWT)
    const token = jwt.sign(
      { userId: user._id }, // The data we want to store in the card
      JWT_SECRET,           // The secret key to sign it
      { expiresIn: '1d' }  // Make it expire in 1 day
    );
    
    res.status(200).send({ message: 'Logged in!', token });
  } catch (error) {
    res.status(400).send({ message: 'Login failed', error });
  }
});

// === Middleware (Our "Security Guard") ===
// This function will check the "ID Card" (JWT)
// on every request that needs it.
const authMiddleware = (req, res, next) => {
  // Get the token from the "Authorization" header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).send({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the "ID Card" is valid
    const decoded = jwt.verify(token, JWT_SECRET);
    // Add the user's ID to the request object
    req.userId = decoded.userId;
    next(); // Let the request proceed
  } catch (error) {
    res.status(401).send({ message: 'Token is not valid' });
  }
};

// === Snippet Routes (Protected by our Security Guard) ===

// 1. Create a new snippet
app.post('/snippets', authMiddleware, async (req, res) => {
  try {
    const { title, content, language } = req.body;
    const snippet = new Snippet({
      title,
      content,
      language,
      owner: req.userId // We get this from authMiddleware
    });
    await snippet.save();
    res.status(201).send(snippet);
  } catch (error) {
    res.status(400).send({ message: 'Could not create snippet', error });
  }
});

// 2. Get all snippets for the logged-in user
app.get('/snippets', authMiddleware, async (req, res) => {
  try {
    const snippets = await Snippet.find({ owner: req.userId });
    res.status(200).send(snippets);
  } catch (error) {
    res.status(400).send({ message: 'Could not get snippets', error });
  }
});

// 3. Get a SINGLE snippet by its ID
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

// 4. Update a snippet
app.put('/snippets/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, language } = req.body;
    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId }, // Find
      { title, content, language }, // Update
      { new: true } // Return the updated version
    );
    if (!snippet) {
      return res.status(404).send({ message: 'Snippet not found' });
    }
    res.status(200).send(snippet);
  } catch (error) {
    res.status(400).send({ message: 'Could not update snippet', error });
  }
});

// 5. Delete a snippet
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


// --- Start the Server ---
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`API Server (Kitchen) is running on http://localhost:${PORT}`);
});