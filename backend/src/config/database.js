const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-org';
    console.log('🔗 Connecting to MongoDB...');
    console.log('🔧 MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('🔧 Make sure MONGODB_URI is set correctly');
    console.error('🔧 MongoDB service might not be ready yet');
    
    // Don't exit immediately - let the server start and retry
    console.log('🔄 Will retry database connection...');
    setTimeout(connectDB, 5000); // Retry in 5 seconds
  }
};

module.exports = connectDB;
