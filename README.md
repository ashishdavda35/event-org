# Event Org - Interactive Polling Platform

A full-stack web application similar to Mentimeter for creating and sharing interactive polls with real-time results visualization.

## Features

### Core Features
- **Multiple Question Types**:
  - Multiple choice (single/multiple select)
  - Rating scale (1-5 or custom)
  - Open-ended text responses
  - Word cloud collection
  - Ranking/ordering questions

- **Real-time Updates**: WebSocket-powered live results
- **Unique Shareable Links**: Each poll gets a unique 6-character code
- **Anonymous Participation**: Participants can join without registration
- **Live Results Visualization**: Bar charts, pie charts, and word clouds
- **Export Functionality**: Download results as CSV files
- **Mobile Responsive**: Works perfectly on all devices

### Technical Features
- **Authentication**: Email/password and Google OAuth
- **Real-time Communication**: Socket.IO for live updates
- **Database**: MongoDB for data persistence
- **API**: RESTful API with comprehensive endpoints
- **Scalability**: Supports 1000+ participants per poll

## Tech Stack

### Frontend
- **Next.js 14** with TypeScript
- **TailwindCSS** for styling
- **Recharts** for data visualization
- **React Hook Form** for form handling
- **Socket.IO Client** for real-time updates
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for OAuth
- **Joi** for validation
- **Bcrypt** for password hashing

## Project Structure

```
event-org/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── passport.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Poll.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── polls.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── railway.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── create-poll/
│   │   │   └── poll/[code]/
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── PollContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── next.config.js
│   ├── package.json
│   └── vercel.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-org
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   
   **Backend** (`backend/env.example` → `backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event-org
   JWT_SECRET=your-super-secret-jwt-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend** (create `frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000) concurrently.

### Individual Commands

- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`
- **Build frontend**: `npm run build`
- **Start production**: `npm start`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Polls
- `POST /api/polls` - Create poll
- `GET /api/polls/my-polls` - Get user's polls
- `GET /api/polls/code/:code` - Get poll by code
- `POST /api/polls/join/:code` - Join poll
- `POST /api/polls/:code/respond` - Submit response
- `GET /api/polls/:code/results` - Get poll results
- `PATCH /api/polls/:code/settings` - Update poll settings
- `GET /api/polls/:code/export` - Export results as CSV

## Deployment

### Backend (Railway/Heroku)

1. **Railway**:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Heroku**:
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   heroku addons:create mongolab:sandbox
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   git push heroku main
   ```

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend WebSocket URL
3. Deploy automatically

## Usage

### Creating a Poll
1. Register/Login to your account
2. Click "Create New Poll"
3. Add poll title and description
4. Add questions with different types
5. Configure poll settings
6. Publish and share the poll code

### Participating in a Poll
1. Enter the poll code on the homepage
2. Provide your name (email optional)
3. Answer the questions
4. Submit your response
5. View real-time results (if enabled)

### Managing Polls
- View all your polls in the dashboard
- Toggle poll visibility
- Export results as CSV
- Share poll links
- View live analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@eventorg.com or create an issue on GitHub.
