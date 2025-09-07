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

    // Check and update expired polls
    const updatedPolls = await Promise.all(polls.map(async (poll) => {
      // Migration: Move isActive from settings to root level if needed
      if (poll.settings && poll.settings.isActive !== undefined && poll.isActive === undefined) {
        console.log(`Migrating poll ${poll.code}: moving isActive from settings to root level`);
        poll.isActive = poll.settings.isActive;
        delete poll.settings.isActive;
        await poll.save();
      }

      // Migration: Add new fields for synchronized polling
      let needsSave = false;
      if (poll.currentQuestionIndex === undefined) {
        poll.currentQuestionIndex = 0;
        needsSave = true;
      }
      if (poll.adminJoined === undefined) {
        poll.adminJoined = false;
        needsSave = true;
      }
      if (poll.adminSessionId === undefined) {
        poll.adminSessionId = null;
        needsSave = true;
      }
      if (needsSave) {
        console.log(`Migrating poll ${poll.code}: adding synchronized polling fields`);
        await poll.save();
      }
      
      const now = new Date();
      const hasEndDate = poll.settings.endDate && new Date(poll.settings.endDate);
      const isExpiredByTime = hasEndDate && hasEndDate < now;
      
      console.log(`Poll ${poll.code}: isActive=${poll.isActive}, manuallyDeactivated=${poll.manuallyDeactivated}, isExpiredByTime=${isExpiredByTime}`);
      
      // Only auto-expire if poll is active and has expired by time
      // If poll was manually activated (manuallyDeactivated = false), respect that choice
      if (isExpiredByTime && poll.isActive && poll.manuallyDeactivated === false) {
        // This poll was manually activated but has expired by time
        // Keep it active as per user's manual choice, but mark it as time-expired
        // The frontend will handle showing appropriate status
        console.log(`Poll ${poll.code}: Keeping manually activated poll active despite time expiration`);
      } else if (isExpiredByTime && poll.isActive && poll.manuallyDeactivated === undefined) {
        // This is an old poll without the manuallyDeactivated field, auto-expire it
        console.log(`Poll ${poll.code}: Auto-expiring old poll without manuallyDeactivated field`);
        poll.isActive = false;
        poll.manuallyDeactivated = false;
        await poll.save();
      }
      return poll;
    }));

    res.json({ polls: updatedPolls });
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

    // Migration: Move isActive from settings to root level if needed
    if (poll.settings && poll.settings.isActive !== undefined && poll.isActive === undefined) {
      console.log(`Migrating poll ${poll.code}: moving isActive from settings to root level`);
      poll.isActive = poll.settings.isActive;
      delete poll.settings.isActive;
      await poll.save();
    }

    // Migration: Add new fields for synchronized polling
    let needsSave = false;
    if (poll.currentQuestionIndex === undefined) {
      poll.currentQuestionIndex = 0;
      needsSave = true;
    }
    if (poll.adminJoined === undefined) {
      poll.adminJoined = false;
      needsSave = true;
    }
    if (poll.adminSessionId === undefined) {
      poll.adminSessionId = null;
      needsSave = true;
    }
    if (needsSave) {
      console.log(`Migrating poll ${poll.code}: adding synchronized polling fields`);
      await poll.save();
    }
    
    // Check if poll has expired and update status
    const now = new Date();
    const hasEndDate = poll.settings.endDate && new Date(poll.settings.endDate);
    const isExpiredByTime = hasEndDate && hasEndDate < now;
    
    // Only auto-expire if poll is active and has expired by time
    // If poll was manually activated (manuallyDeactivated = false), respect that choice
    if (isExpiredByTime && poll.isActive && poll.manuallyDeactivated === false) {
      // This poll was manually activated but has expired by time
      // Keep it active as per user's manual choice
    } else if (isExpiredByTime && poll.isActive && poll.manuallyDeactivated === undefined) {
      // This is an old poll without the manuallyDeactivated field, auto-expire it
      poll.isActive = false;
      poll.manuallyDeactivated = false;
      await poll.save();
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

    if (!poll.isActive) {
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

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    // Check if poll has expired based on endDate
    if (poll.settings.endDate && new Date(poll.settings.endDate) < new Date()) {
      // Update poll status to inactive
      poll.isActive = false;
      await poll.save();
      return res.status(400).json({ message: 'Poll has expired and is no longer accepting responses' });
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

// Update poll
router.put('/:code', auth, validatePoll, async (req, res) => {
  try {
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update poll data
    const { title, description, questions, settings } = req.body;
    
    // Sanitize questions data to ensure proper settings
    const sanitizedQuestions = questions.map(question => {
      const sanitizedQuestion = { ...question };
      
      // Ensure settings object exists
      if (!sanitizedQuestion.settings) {
        sanitizedQuestion.settings = {};
      }
      
      // Set defaults for rating questions
      if (question.type === 'rating') {
        sanitizedQuestion.settings.minRating = sanitizedQuestion.settings.minRating || 1;
        sanitizedQuestion.settings.maxRating = sanitizedQuestion.settings.maxRating || 5;
        
        // Ensure maxRating is greater than minRating
        if (sanitizedQuestion.settings.maxRating < sanitizedQuestion.settings.minRating) {
          sanitizedQuestion.settings.maxRating = sanitizedQuestion.settings.minRating;
        }
      }
      
      // Set defaults for word cloud questions
      if (question.type === 'word-cloud') {
        sanitizedQuestion.settings.maxWords = sanitizedQuestion.settings.maxWords || 3;
      }
      
      // Set defaults for multiple choice questions
      if (question.type === 'multiple-choice') {
        sanitizedQuestion.settings.allowMultiple = sanitizedQuestion.settings.allowMultiple || false;
      }
      
      return sanitizedQuestion;
    });
    
    poll.title = title;
    poll.description = description;
    poll.questions = sanitizedQuestions;
    
    // Handle endDate conversion and poll expiration
    const updatedSettings = { ...poll.settings, ...settings };
    if (updatedSettings.endDate) {
      // Convert string to Date object
      updatedSettings.endDate = new Date(updatedSettings.endDate);
      
      // Check if poll has expired
      if (updatedSettings.endDate < new Date()) {
        poll.isActive = false;
        poll.manuallyDeactivated = false; // Reset manual deactivation flag
      } else {
        // If endDate is in future, only activate if not manually deactivated
        if (!poll.manuallyDeactivated) {
          poll.isActive = true;
        }
      }
    } else {
      // If no endDate, only activate if not manually deactivated
      if (!poll.manuallyDeactivated) {
        poll.isActive = true;
      }
    }
    
    poll.settings = updatedSettings;
    poll.updatedAt = new Date();

    await poll.save();
    await poll.populate('creator', 'name email');

    res.json({
      message: 'Poll updated successfully',
      poll
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle poll active status
router.patch('/:code/toggle-status', auth, async (req, res) => {
  try {
    console.log('Toggle request for poll code:', req.params.code);
    const poll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    console.log('Found poll:', poll.title, 'Current isActive:', poll.isActive, 'manuallyDeactivated:', poll.manuallyDeactivated);

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const hasEndDate = poll.settings.endDate && new Date(poll.settings.endDate);
    const isExpiredByTime = hasEndDate && hasEndDate < now;
    
    console.log('Time check - hasEndDate:', hasEndDate, 'isExpiredByTime:', isExpiredByTime);

    // Toggle logic
    if (poll.isActive) {
      // Currently active - deactivate it (always allowed)
      console.log('Deactivating poll');
      poll.isActive = false;
      poll.manuallyDeactivated = true;
    } else {
      // Currently inactive - check if we can activate
      if (isExpiredByTime) {
        console.log('Cannot activate - poll expired by time');
        return res.status(400).json({ 
          message: 'Cannot activate poll that has expired by end date',
          isExpiredByTime: true
        });
      } else {
        // Can activate (either no end date or end date in future)
        console.log('Activating poll');
        poll.isActive = true;
        poll.manuallyDeactivated = false;
      }
    }

    poll.updatedAt = new Date();
    await poll.save();
    console.log('Poll saved with new status - isActive:', poll.isActive, 'manuallyDeactivated:', poll.manuallyDeactivated);
    console.log('Poll settings endDate:', poll.settings.endDate);
    console.log('Current time:', new Date());
    console.log('Is expired by time:', isExpiredByTime);

    res.json({ 
      message: `Poll ${poll.isActive ? 'activated' : 'deactivated'} successfully`, 
      poll: {
        _id: poll._id,
        code: poll.code,
        title: poll.title,
        isActive: poll.isActive,
        settings: poll.settings,
        manuallyDeactivated: poll.manuallyDeactivated,
        isExpiredByTime: isExpiredByTime
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
      poll.isActive = isActive;
    }

    await poll.save();

    res.json({ message: 'Poll settings updated successfully', poll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clone poll
router.post('/:code/clone', auth, async (req, res) => {
  try {
    const originalPoll = await Poll.findOne({ code: req.params.code.toUpperCase() });

    if (!originalPoll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (originalPoll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate new poll code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let newCode;
    let codeExists = true;
    while (codeExists) {
      newCode = generateCode();
      const existingPoll = await Poll.findOne({ code: newCode });
      codeExists = !!existingPoll;
    }

    // Create cloned poll
    const clonedPoll = new Poll({
      title: `${originalPoll.title} (Copy)`,
      description: originalPoll.description,
      code: newCode,
      creator: req.user._id,
      questions: originalPoll.questions.map(q => ({
        ...q.toObject(),
        _id: undefined // Remove _id to generate new ones
      })),
      settings: {
        ...originalPoll.settings,
        isActive: false, // Start as inactive
        endDate: undefined // Remove end date for cloned poll
      },
      participants: [],
      responses: [],
      analytics: {
        totalParticipants: 0,
        totalResponses: 0,
        averageResponseTime: 0
      },
      isActive: false
    });

    await clonedPoll.save();
    await clonedPoll.populate('creator', 'name email');

    res.status(201).json({
      message: 'Poll cloned successfully',
      poll: clonedPoll
    });
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

// Toggle poll view mode (single/step)
router.patch('/:code/toggle-view-mode', auth, async (req, res) => {
  try {
    console.log('Toggle view mode request for poll code:', req.params.code);
    
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    console.log('Found poll:', poll.title, 'Current viewMode:', poll.viewMode);

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Toggle view mode
    poll.viewMode = poll.viewMode === 'single' ? 'step' : 'single';
    poll.updatedAt = new Date();
    await poll.save();
    
    console.log('Poll view mode updated to:', poll.viewMode);

    res.json({ 
      message: `Poll view mode set to ${poll.viewMode === 'single' ? 'All Questions' : 'Step by Step'}`, 
      poll: { 
        _id: poll._id,
        code: poll.code,
        viewMode: poll.viewMode 
      } 
    });
  } catch (error) {
    console.error('Error toggling view mode:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin join poll for synchronized control
router.post('/:code/admin-join', auth, async (req, res) => {
  try {
    console.log('Admin join request for poll code:', req.params.code);
    
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate unique session ID for admin
    const adminSessionId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update poll with admin join info
    poll.adminJoined = true;
    poll.adminSessionId = adminSessionId;
    poll.currentQuestionIndex = 0; // Reset to first question
    
    // Ensure new fields exist (migration for existing polls)
    if (poll.currentQuestionIndex === undefined) {
      poll.currentQuestionIndex = 0;
    }
    if (poll.adminJoined === undefined) {
      poll.adminJoined = true;
    }
    if (poll.adminSessionId === undefined) {
      poll.adminSessionId = adminSessionId;
    }
    
    poll.updatedAt = new Date();
    await poll.save();
    
    console.log('Admin joined poll:', poll.title, 'Session ID:', adminSessionId);

    res.json({ 
      message: 'Admin joined successfully', 
      poll: { 
        _id: poll._id,
        code: poll.code,
        adminJoined: poll.adminJoined,
        adminSessionId: poll.adminSessionId,
        currentQuestionIndex: poll.currentQuestionIndex
      } 
    });
  } catch (error) {
    console.error('Error in admin join:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin leave poll
router.post('/:code/admin-leave', auth, async (req, res) => {
  try {
    console.log('Admin leave request for poll code:', req.params.code);
    
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update poll to remove admin
    poll.adminJoined = false;
    poll.adminSessionId = null;
    poll.updatedAt = new Date();
    await poll.save();
    
    console.log('Admin left poll:', poll.title);

    res.json({ 
      message: 'Admin left successfully', 
      poll: { 
        _id: poll._id,
        code: poll.code,
        adminJoined: poll.adminJoined,
        adminSessionId: poll.adminSessionId
      } 
    });
  } catch (error) {
    console.error('Error in admin leave:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin navigate to next question
router.post('/:code/admin-next-question', auth, async (req, res) => {
  try {
    console.log('Admin next question request for poll code:', req.params.code);
    
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator and admin is joined
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!poll.adminJoined) {
      return res.status(400).json({ message: 'Admin must be joined to control navigation' });
    }

    // Move to next question if available
    if (poll.currentQuestionIndex < poll.questions.length - 1) {
      poll.currentQuestionIndex += 1;
      poll.updatedAt = new Date();
      await poll.save();
      
      console.log('Moved to question:', poll.currentQuestionIndex + 1);

      res.json({ 
        message: 'Moved to next question', 
        poll: { 
          _id: poll._id,
          code: poll.code,
          currentQuestionIndex: poll.currentQuestionIndex
        } 
      });
    } else {
      res.status(400).json({ message: 'Already at the last question' });
    }
  } catch (error) {
    console.error('Error in admin next question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin navigate to previous question
router.post('/:code/admin-previous-question', auth, async (req, res) => {
  try {
    console.log('Admin previous question request for poll code:', req.params.code);
    
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator and admin is joined
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!poll.adminJoined) {
      return res.status(400).json({ message: 'Admin must be joined to control navigation' });
    }

    // Move to previous question if available
    if (poll.currentQuestionIndex > 0) {
      poll.currentQuestionIndex -= 1;
      poll.updatedAt = new Date();
      await poll.save();
      
      console.log('Moved to question:', poll.currentQuestionIndex + 1);

      res.json({ 
        message: 'Moved to previous question', 
        poll: { 
          _id: poll._id,
          code: poll.code,
          currentQuestionIndex: poll.currentQuestionIndex
        } 
      });
    } else {
      res.status(400).json({ message: 'Already at the first question' });
    }
  } catch (error) {
    console.error('Error in admin previous question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin jump to specific question
router.post('/:code/admin-jump-question', auth, async (req, res) => {
  try {
    const { questionIndex } = req.body;
    console.log('Admin jump to question request for poll code:', req.params.code, 'question:', questionIndex);
    
    const poll = await Poll.findOne({ code: req.params.code });
    if (!poll) {
      console.log('Poll not found for code:', req.params.code);
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the creator and admin is joined
    if (poll.creator.toString() !== req.user._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!poll.adminJoined) {
      return res.status(400).json({ message: 'Admin must be joined to control navigation' });
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= poll.questions.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    // Jump to specified question
    poll.currentQuestionIndex = questionIndex;
    poll.updatedAt = new Date();
    await poll.save();
    
    console.log('Jumped to question:', poll.currentQuestionIndex + 1);

    res.json({ 
      message: 'Jumped to question', 
      poll: { 
        _id: poll._id,
        code: poll.code,
        currentQuestionIndex: poll.currentQuestionIndex
      } 
    });
  } catch (error) {
    console.error('Error in admin jump question:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
