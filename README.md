# Backend TypeScript Boilerplate

This is a modular and scalable backend boilerplate built with Node.js, Express, TypeScript, and MongoDB. 

## Features
- Modular MVC Architecture
- Authentication (JWT & bcrypt)
- File Uploads (Multer & Cloudinary)
- Emailing (Nodemailer)
- Validation (Zod)
- 1-to-1 & Group Messaging APIs
- Centralized Error Handling

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Update the `.env` file with your credentials (MongoDB URL, Cloudinary keys, Email settings).

3. **Run the Application**
   ```bash
   # Development Mode
   npm run dev

   # Production Build
   npm run build
   npm start
   ```
