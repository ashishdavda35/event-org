const express = require('express');
const Poll = require('../models/Poll');
const { auth, optionalAuth } = require('../middleware/auth');
const { validatePoll, validateResponse } = require('../middleware/validation');

const router = express.Router();

// Create poll
router.post('/', auth, validatePoll, async (req, res) => {
  try {
    const poll = new Poll({
      ...req.body,
      creator: req.user._id
    });

    await poll.save();
    await poll.populate('creator', 'name email');

    res.status(201).json({
      message: 'Poll created successfully',
      poll
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all polls by user
router.get('/my-polls', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select('-responses');

    res.json({ polls });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get poll by code
router.get('/code/:code', optionalAuth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() })
      .populate('creator', 'name email');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Don't send responses to participants
    const pollData = poll.toObject();
    if (!req.user || poll.creator._id.toString() !== req.user._id.toString()) {
      delete pollData.responses;
      delete pollData.analytics;
    }

    res.json({ poll: pollData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join poll
router.post('/join/:code', async (req, res) => {
  try {
    const { participantName, participantEmail } = req.body;
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.settings.isActive) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    // Check if participant already exists
    const existingParticipant = poll.participants.find(p => {
      // If email is provided and not empty, match by email
      if (participantEmail && participantEmail.trim()) {
        return p.email === participantEmail.trim();
      }
      // Otherwise, match by name
      return p.name === participantName;
    });

    if (existingParticipant) {
      // Update analytics to ensure consistency
      poll.analytics.totalParticipants = poll.participants.length;
      await poll.save();
      
      return res.json({
        message: 'Successfully joined poll',
        participantId: existingParticipant._id,
        poll: {
          id: poll._id,
          title: poll.title,
          questions: poll.questions
        }
      });
    }

    // Add new participant
    const participant = {
      name: participantName,
      email: participantEmail,
      joinedAt: new Date()
    };

    poll.participants.push(participant);
    poll.analytics.totalParticipants = poll.participants.length;
    await poll.save();

    res.json({
      message: 'Successfully joined poll',
      participantId: poll.participants[poll.participants.length - 1]._id,
      poll: {
        id: poll._id,
        title: poll.title,
        questions: poll.questions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit response
router.post('/:code/respond', validateResponse, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.settings.isActive) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    const { participantName, participantEmail, answers } = req.body;

    // Check if participant exists
    let participant = poll.participants.find(p => {
      // If email is provided and not empty, match by email
      if (participantEmail && participantEmail.trim()) {
        return p.email === participantEmail.trim();
      }
      // Otherwise, match by name
      return p.name === participantName;
    });

    if (!participant) {
      return res.status(400).json({ message: 'Participant not found. Please join the poll first.' });
    }

    // Check if already responded (if multiple submissions not allowed)
    if (!poll.settings.allowMultipleSubmissions) {
      const existingResponse = poll.responses.find(
        r => r.participantId === participant._id.toString()
      );

      if (existingResponse) {
        return res.status(400).json({ message: 'You have already submitted a response' });
      }
    }

    // Add response
    const response = {
      participantId: participant._id.toString(),
      participantName: participantName,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer,
        submittedAt: new Date()
      }))
    };

    poll.responses.push(response);
    poll.analytics.totalResponses += 1;
    await poll.save();

    res.json({ message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get poll results
router.get('/:code/results', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fix analytics if they're inconsistent
    const actualParticipants = poll.participants.length;
    const actualResponses = poll.responses.length;
    
    if (poll.analytics.totalParticipants !== actualParticipants || 
        poll.analytics.totalResponses !== actualResponses) {
      poll.analytics.totalParticipants = actualParticipants;
      poll.analytics.totalResponses = actualResponses;
      await poll.save();
    }

    res.json({
      poll: {
        _id: poll._id,
        id: poll._id,
        code: poll.code,
        title: poll.title,
        description: poll.description,
        questions: poll.questions,
        responses: poll.responses,
        analytics: poll.analytics,
        participants: poll.participants,
        settings: poll.settings,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update poll settings
router.patch('/:code/settings', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { showResults, isActive } = req.body;

    if (showResults !== undefined) {
      poll.settings.showResults = showResults;
    }

    if (isActive !== undefined) {
      poll.settings.isActive = isActive;
    }

    await poll.save();

    res.json({ message: 'Poll settings updated successfully', poll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete poll
router.delete('/:code', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Poll.findByIdAndDelete(poll._id);

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export results as CSV
router.get('/:code/export', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate CSV data
    const csvData = generateCSV(poll);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="poll-${poll.code}-results.csv"`);
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to generate CSV
function generateCSV(poll) {
  const headers = ['Participant Name', 'Participant Email', 'Submitted At'];
  
  // Add question headers
  poll.questions.forEach((question, index) => {
    headers.push(`Q${index + 1}: ${question.question}`);
  });

  const rows = [headers.join(',')];

  // Add response data
  poll.responses.forEach(response => {
    const participant = poll.participants.find(p => p._id.toString() === response.participantId);
    const row = [
      participant ? participant.name : 'Anonymous',
      participant ? participant.email : '',
      response.answers[0]?.submittedAt || ''
    ];

    // Add answers for each question
    poll.questions.forEach(question => {
      const answer = response.answers.find(a => a.questionId.toString() === question._id.toString());
      const answerText = answer ? (Array.isArray(answer.answer) ? answer.answer.join('; ') : answer.answer) : '';
      row.push(`"${answerText}"`);
    });

    rows.push(row.join(','));
  });

  return rows.join('\n');
}

module.exports = router;
