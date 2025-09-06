#!/bin/bash

# Event Org Environment Setup Script

echo "🔧 Setting up Event Org environment..."

# Backend .env setup
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/env.example backend/.env
    
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s/your-super-secret-jwt-key-here/$JWT_SECRET/" backend/.env
    rm backend/.env.bak
    
    echo "✅ Backend .env created with random JWT secret"
    echo "⚠️  Please update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env"
else
    echo "✅ Backend .env already exists"
fi

# Frontend .env.local setup
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF
    echo "✅ Frontend .env.local created"
else
    echo "✅ Frontend .env.local already exists"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your MongoDB URI and Google OAuth credentials"
echo "2. Run './start-dev.sh' to start the development servers"
echo "3. Open http://localhost:3000 in your browser"
