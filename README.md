# CodeBin - Real-Time Collaborative Code Editor

CodeBin is a full-stack web application that allows developers to code together in real-time. It features a live code editor, syntax highlighting, and instant synchronization across multiple users, similar to Google Docs for code.

## 🚀 Live Demo
[Click here to view the Live App](codebin-smoky.vercel.app)

## ✨ Features
- **Real-Time Collaboration:** Multiple users can edit the same snippet simultaneously using WebSockets.
- **Syntax Highlighting:** Supports JavaScript, Python, Java, and C++ via Ace Editor.
- **User Accounts:** Secure registration and login using JWT authentication.
- **Snippet Management:** Create, save, open, and delete code snippets.
- **Modern Architecture:** Built with a microservices approach (separate API and Real-Time servers).

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Socket.io-client, Ace Editor
- **Backend (API):** Node.js, Express, Mongoose (MongoDB)
- **Backend (Real-Time):** Node.js, Socket.io
- **Database:** MongoDB Atlas
- **DevOps:** Docker, Docker Compose, Nginx, Render, Vercel

## ⚙️ How to Run Locally (Docker)

1. **Clone the repository**
   ```bash
   git clone [https://github.com/saumyeah/codebin.git](https://github.com/saumyeah/codebin.git)
   cd codebin
