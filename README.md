# Chat App with WebRTC Video & Audio Calling

A complete Real-Time Chat Application featuring Peer-to-Peer Audio & Video Calling, File Sharing, and Voice Messaging built with **Node.js, Express, TypeScript, MongoDB**, and **Socket.io**.

## ✨ Features

- **Real-Time Messaging:** Instant messaging powered by `Socket.io`.
- **Free P2P Video & Audio Calling:** High-quality, completely free calls using WebRTC and Google STUN servers.
- **Call Recording:** Automatically record and locally download your video/audio calls as `.webm` files!
- **Media Sharing:** Send Images, Videos (up to 50MB), and Voice Messages (uploaded via Cloudinary).
- **Authentication:** Secure user authentication with JWT.
- **Typing Indicators:** See when the other person is typing in real-time.
- **Read Receipts:** Double-tick indicators when a message is seen.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for media uploads)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Ahteshamull/Chat-App-With-Call.git
cd Chat-App-With-Call
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Running the Server
To start the development server:
```bash
npm run dev
```

### 5. Testing the Application
A built-in test client is available to try out all the features immediately!
- Open your browser and navigate to: `http://localhost:5000/test-chat`
- Open a second tab or Incognito window with the same URL.
- Login with two different user accounts.
- Start sending messages, sharing files, or initiating a WebRTC Call!

## 📞 How WebRTC Calling Works
The application uses a hybrid architecture to keep media transmission 100% free:
1. **Signaling:** `Socket.io` acts as the signaling server to exchange session descriptions (Offer/Answer) and ICE candidates.
2. **P2P Connection:** Once negotiated, browsers establish a direct WebRTC connection. No media data passes through the Node.js server!
3. **Recording:** The `MediaRecorder` API runs client-side, mixing local and remote audio via `AudioContext` and downloading the recording locally to your device.

## 📁 Project Structure
- `/src/modules`: Contains the MVC structure (Controllers, Routes, Services, Models) for Auth, Messages, Users, and Uploads.
- `/src/socket`: Socket.io event listeners and WebRTC signaling logic.
- `/src/shared`: Global utilities, error handling, and Cloudinary middlewares.
- `index.html`: The fully-functional frontend client for testing.

---
*Built with ❤️ using TypeScript & Socket.io*
