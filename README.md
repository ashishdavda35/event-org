# 🎉 Event Org - Live Polling & Issues Management Platform

A full-stack application for creating and managing live polls with real-time updates, built with Next.js, Node.js, and MongoDB.

## 🚀 **Features**

- **Live Polling**: Create and manage polls in real-time
- **Multiple Question Types**: Multiple choice, ranking, rating, word cloud, open text
- **Real-time Updates**: Live results and participant synchronization
- **Admin Controls**: Step-by-step polling with admin control
- **Responsive Design**: Works on desktop and mobile
- **Authentication**: User registration and login
- **Share Functionality**: Share polls via links, QR codes, and social media

## 🏗️ **Architecture**

- **Frontend**: Next.js 15 with React 19
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Real-time**: Socket.io for live updates

## 🚀 **Local Development**

### **Prerequisites**
- Node.js 22+
- MongoDB Atlas account

### **Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/event-org.git
   cd event-org
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-org
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   PORT=5000
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development servers**
   ```bash
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm run dev
   ```

5. **Visit the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 **Project Structure**

```
event-org/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Database and passport config
│   │   ├── middleware/        # Auth and validation middleware
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   └── index.js           # Main server file
│   └── package.json
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # Next.js app router pages
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── lib/               # API client and utilities
│   │   └── types/             # TypeScript types
│   └── package.json
└── README.md
```

## 🛠️ **Available Scripts**

### **Backend**
```bash
npm run dev      # Start development server
npm start        # Start production server
```

### **Frontend**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🧪 **Testing**

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run lint
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to the branch
5. Create a Pull Request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

If you encounter any issues:
1. Check the [GitHub Issues](https://github.com/your-username/event-org/issues)
2. Review the setup instructions above

---

**Built with ❤️ using Next.js, Node.js, and MongoDB**