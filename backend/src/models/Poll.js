const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'rating', 'open-ended', 'word-cloud', 'ranking'],
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    text: String,
    value: String
  }],
  required: {
    type: Boolean,
    default: true
  },
  settings: {
    allowMultiple: {
      type: Boolean,
      default: false
    },
    minRating: {
      type: Number,
      default: 1
    },
    maxRating: {
      type: Number,
      default: 5
    },
    maxWords: {
      type: Number,
      default: 3
    }
  }
});

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: Boolean,
      default: true
    },
    allowMultipleSubmissions: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    endDate: {
      type: Date
    }
  },
  participants: [{
    name: String,
    email: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  responses: [{
    participantId: String,
    participantName: String,
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: mongoose.Schema.Types.Mixed,
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  analytics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalResponses: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate unique poll code
pollSchema.pre('save', async function(next) {
  if (!this.code) {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let code;
    do {
      code = generateCode();
    } while (await this.constructor.findOne({ code }));

    this.code = code;
  }
  next();
});

module.exports = mongoose.model('Poll', pollSchema);
