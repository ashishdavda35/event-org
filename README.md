# 🎯 Event Org - Live Polling & Issues Management Platform

A modern, real-time polling and issues management platform built with Next.js, Node.js, and MongoDB.

## ✨ Features

### 🗳️ Live Polling System
- **Interactive Polls** - Create multiple choice, text, and rating polls
- **Real-time Results** - Live audience participation with instant updates
- **Dashboard Control** - Hide/show results for audience management
- **QR Code Sharing** - Easy poll sharing with QR codes
- **Mobile Responsive** - Works perfectly on all devices

### 📋 Issues Management
- **Issue Tracking** - Create, assign, and track issues
- **Status Management** - Open, in-progress, and closed states
- **Priority Levels** - High, medium, low priority classification
- **Real-time Updates** - Live issue status updates

### 🔐 User Authentication
- **Secure Login/Register** - JWT-based authentication
- **User Dashboard** - Personalized user experience
- **Role-based Access** - Admin and user permissions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ashishdavda35/event-org.git
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

3. **Environment Setup**
```bash
# Backend
cp backend/env.example backend/.env
# Edit backend/.env with your MongoDB connection string

# Frontend
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your API URL
```

4. **Start the application**
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌐 Deployment

### Netlify (Frontend)
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`
   - Node version: `18`

### Vercel (Backend)
1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Set root directory to `backend`
4. Deploy

## 📁 Project Structure

```
event-org/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database and passport config
│   │   ├── middleware/     # Authentication and validation
│   │   ├── models/         # MongoDB models
│   │   └── routes/         # API routes
│   └── package.json
├── frontend/               # Next.js React App
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # API utilities
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Joi** - Validation

## 📱 Usage

### Creating Polls
1. Login to your dashboard
2. Click "Create New Poll"
3. Configure poll settings
4. Share poll link or QR code
5. Monitor real-time results

### Managing Issues
1. Navigate to Issues page
2. Create new issues
3. Assign priorities and status
4. Track progress in real-time

### Live Dashboard
1. Access poll results
2. Toggle visibility for audience
3. Export results
4. Manage poll settings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Polls
- `GET /api/polls` - Get user polls
- `POST /api/polls` - Create new poll
- `GET /api/polls/:code` - Get poll by code
- `POST /api/polls/:code/responses` - Submit response
- `GET /api/polls/:code/results` - Get poll results

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the deployment guides in the repository

---

**🎉 Built with ❤️ for modern event management and live polling experiences!**