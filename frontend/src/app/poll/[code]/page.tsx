'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePoll } from '@/contexts/PollContext';
import api, { pollApi } from '@/lib/api';
import { Poll, PollResponse } from '@/types';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  Bars3Icon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  StopIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const { joinPoll, submitResponse, loading } = usePoll();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [step, setStep] = useState<'join' | 'questions' | 'submitted' | 'admin'>('join');
  const [hasJoined, setHasJoined] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{questionId: string, index: number} | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminJoined, setAdminJoined] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const pollCode = params.code as string;

  useEffect(() => {
    fetchPoll();
    // Check if participant has already joined this poll
    const joinedPolls = JSON.parse(localStorage.getItem('joinedPolls') || '{}');
    if (joinedPolls[pollCode]) {
      setHasJoined(true);
      setParticipantName(joinedPolls[pollCode].name);
      setParticipantEmail(joinedPolls[pollCode].email || '');
      
      // Check if they've already submitted
      if (joinedPolls[pollCode].submitted) {
        setHasSubmitted(true);
        setStep('submitted');
      } else {
        setStep('questions');
      }
    }
  }, [pollCode]);

  const fetchPoll = async () => {
    try {
      const response = await api.get(`/polls/code/${pollCode}`);
      const pollData = response.data.poll;
      console.log('Fetched poll data:', pollData);
      setPoll(pollData);
      
      // Check if current user is the admin (creator)
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userResponse = await api.get('/auth/me');
          const isUserAdmin = userResponse.data.user.id === pollData.creator._id;
          console.log('User is admin:', isUserAdmin, 'Admin joined:', pollData.adminJoined);
          console.log('User ID:', userResponse.data.user.id, 'Creator ID:', pollData.creator._id);
          setIsAdmin(isUserAdmin);
          setAdminJoined(pollData.adminJoined);
          
          // If user is admin, go directly to admin view
          if (isUserAdmin) {
            setStep('admin');
          }
        } catch (error) {
          // User not authenticated or not admin
          console.log('User not authenticated or not admin');
          setIsAdmin(false);
        }
      }
      
      // Update current question index from poll data
      const newQuestionIndex = pollData.currentQuestionIndex || 0;
      console.log('Setting current question index to:', newQuestionIndex, 'Previous:', currentQuestionIndex);
      if (newQuestionIndex !== currentQuestionIndex) {
        console.log('Question index changed from', currentQuestionIndex, 'to', newQuestionIndex);
      }
      setCurrentQuestionIndex(newQuestionIndex);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Poll not found');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      setError('Name is required');
      return;
    }

    try {
      await joinPoll(pollCode, participantName.trim(), participantEmail.trim() || undefined);
      
      // Save participant session to localStorage
      const joinedPolls = JSON.parse(localStorage.getItem('joinedPolls') || '{}');
      joinedPolls[pollCode] = {
        name: participantName.trim(),
        email: participantEmail.trim() || undefined,
        joinedAt: new Date().toISOString()
      };
      localStorage.setItem('joinedPolls', JSON.stringify(joinedPolls));
      
      setHasJoined(true);
      setStep('questions');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleDragStart = (e: React.DragEvent, questionId: string, index: number) => {
    setDraggedItem({ questionId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, questionId: string, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.questionId !== questionId) return;

    const question = poll?.questions.find(q => q._id === questionId);
    if (!question?.options) return;

    const currentAnswer = answers[questionId] || question.options.map((_, i) => i);
    const newAnswer = [...currentAnswer];
    
    // Remove dragged item from its current position
    const draggedValue = newAnswer[draggedItem.index];
    newAnswer.splice(draggedItem.index, 1);
    
    // Insert at new position
    newAnswer.splice(dropIndex, 0, draggedValue);
    
    handleAnswerChange(questionId, newAnswer);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleNextQuestion = () => {
    if (poll && currentQuestionIndex < poll.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAdminJoin = async () => {
    try {
      console.log('Attempting to join as admin for poll:', pollCode);
      const response = await pollApi.adminJoin(pollCode);
      console.log('Admin join response:', response.data);
      setAdminJoined(true);
      setCurrentQuestionIndex(response.data.poll.currentQuestionIndex);
      // Start polling for updates
      startPolling();
    } catch (error: any) {
      console.error('Admin join error:', error);
      setError(error.response?.data?.message || 'Failed to join as admin');
    }
  };

  const handleAdminLeave = async () => {
    try {
      await pollApi.adminLeave(pollCode);
      setAdminJoined(false);
      // Stop polling
      stopPolling();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to leave as admin');
    }
  };

  const handleAdminNextQuestion = async () => {
    try {
      console.log('Attempting to move to next question for poll:', pollCode);
      const response = await pollApi.adminNextQuestion(pollCode);
      console.log('Next question response:', response.data);
      setCurrentQuestionIndex(response.data.poll.currentQuestionIndex);
    } catch (error: any) {
      console.error('Next question error:', error);
      setError(error.response?.data?.message || 'Failed to move to next question');
    }
  };

  const handleAdminPreviousQuestion = async () => {
    try {
      const response = await pollApi.adminPreviousQuestion(pollCode);
      setCurrentQuestionIndex(response.data.poll.currentQuestionIndex);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to move to previous question');
    }
  };

  const handleAdminJumpQuestion = async (questionIndex: number) => {
    try {
      const response = await pollApi.adminJumpQuestion(pollCode, questionIndex);
      setCurrentQuestionIndex(response.data.poll.currentQuestionIndex);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to jump to question');
    }
  };

  const startPolling = () => {
    console.log('Starting polling for updates...');
    const interval = setInterval(() => {
      console.log('Polling for updates...');
      fetchPoll();
    }, 2000); // Poll every 2 seconds
    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Start polling when admin joins, stop when admin leaves
  useEffect(() => {
    if (adminJoined && isAdmin) {
      console.log('Admin joined - starting polling');
      startPolling();
    } else if (poll?.adminJoined && !isAdmin) {
      console.log('Admin is controlling poll - starting polling for participant');
      startPolling();
    } else {
      console.log('Stopping polling');
      stopPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [adminJoined, isAdmin, poll?.adminJoined ?? false]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if already submitted
    if (hasSubmitted) {
      setError('You have already submitted a response');
      return;
    }
    
    setIsSubmitting(true);
    setError(''); // Clear previous errors

    try {
      const response: PollResponse = {
        participantName: participantName.trim(),
        participantEmail: participantEmail.trim() || undefined,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      };
      
      // Ensure we don't send empty string for email
      if (!response.participantEmail) {
        delete response.participantEmail;
      }

      console.log('Submitting response:', response);
      console.log('Poll code:', pollCode);
      console.log('Answers object:', answers);
      console.log('Poll questions:', poll?.questions);
      
      await submitResponse(response, pollCode);
      
      // Mark participant session as submitted
      const joinedPolls = JSON.parse(localStorage.getItem('joinedPolls') || '{}');
      if (joinedPolls[pollCode]) {
        joinedPolls[pollCode].submitted = true;
        joinedPolls[pollCode].submittedAt = new Date().toISOString();
        localStorage.setItem('joinedPolls', JSON.stringify(joinedPolls));
      }
      
      setHasSubmitted(true);
      setStep('submitted');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: any, index: number) => {
    const questionId = question._id;
    if (!questionId) {
      console.error('Question missing _id:', question);
      return null;
    }
    const currentAnswer = answers[questionId];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div key={questionId} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <div className="space-y-2">
              {question.options?.map((option: any, optionIndex: number) => (
                <label key={optionIndex} className="flex items-center">
                  <input
                    type={question.settings?.allowMultiple ? 'checkbox' : 'radio'}
                    name={questionId}
                    value={option.value}
                    checked={
                      question.settings?.allowMultiple
                        ? (currentAnswer || []).includes(option.value)
                        : currentAnswer === option.value
                    }
                    onChange={(e) => {
                      if (question.settings?.allowMultiple) {
                        const current = currentAnswer || [];
                        const newAnswer = e.target.checked
                          ? [...current, option.value]
                          : current.filter((v: string) => v !== option.value);
                        handleAnswerChange(questionId, newAnswer);
                      } else {
                        handleAnswerChange(questionId, option.value);
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'rating':
        const minRating = question.settings?.minRating || 1;
        const maxRating = question.settings?.maxRating || 5;
        const ratingOptions = Array.from({ length: maxRating - minRating + 1 }, (_, i) => i + minRating);
        
        return (
          <div key={questionId} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <div className="flex space-x-2">
              {ratingOptions.map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    name={questionId}
                    value={rating}
                    checked={currentAnswer === rating}
                    onChange={(e) => handleAnswerChange(questionId, parseInt(e.target.value))}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{rating}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'open-ended':
        return (
          <div key={questionId} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              rows={4}
              placeholder="Enter your response..."
            />
          </div>
        );

      case 'word-cloud':
        return (
          <div key={questionId} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-600">
              Enter up to {question.settings?.maxWords || 3} words or phrases (separated by commas)
            </p>
            <input
              type="text"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              placeholder="Enter words or phrases..."
            />
          </div>
        );

      case 'ranking':
        const currentRanking = answers[questionId] || question.options?.map((_: any, i: number) => i) || [];
        const orderedOptions = currentRanking.map((index: number) => question.options?.[index]).filter(Boolean);
        
        return (
          <div key={questionId} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-600">Drag to reorder (most preferred first)</p>
            <div className="space-y-2">
              {orderedOptions.map((option: any, displayIndex: number) => {
                const originalIndex = question.options?.findIndex((opt: any) => opt.value === option.value) || 0;
                const isDragging = draggedItem?.questionId === questionId && draggedItem?.index === originalIndex;
                
                return (
                  <div
                    key={option.value}
                    draggable
                    onDragStart={(e) => handleDragStart(e, questionId, originalIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, questionId, displayIndex)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center p-3 border rounded-md cursor-move transition-all duration-200 ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg transform rotate-2' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <Bars3Icon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 mr-3 font-medium">#{displayIndex + 1}</span>
                    <span className="text-gray-700 flex-grow">{option.text}</span>
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      Drag to reorder
                    </div>
                </div>
                );
              })}
            </div>
            {orderedOptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No options available for ranking</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </button>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </button>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{poll.title}</h1>
            {poll.description && (
              <p className="mt-2 text-gray-600">{poll.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">Poll Code: {poll.code}</p>
            
            {/* Poll Status */}
            <div className="mt-4">
              {!poll.isActive ? (
                poll.settings?.endDate && new Date(poll.settings.endDate) < new Date() ? (
                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Poll has expired
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Poll is inactive
                  </div>
                )
              ) : poll.settings?.endDate && new Date(poll.settings.endDate) < new Date() ? (
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircleIcon className="w-4 h-4" />
                  Poll active* (manually overridden)
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircleIcon className="w-4 h-4" />
                  {poll.settings?.endDate ? `Poll active until ${new Date(poll.settings.endDate).toLocaleDateString()}` : 'Poll is active'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'join' && (
          <div className="max-w-md mx-auto">
            {/* Admin Back Button */}
            {isAdmin && (
              <div className="mb-4">
                <button
                  onClick={() => setStep('admin')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Back to Admin View
                </button>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Join Poll
              </h2>
              
              {/* Check if poll is inactive or expired */}
              {!poll.isActive && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="font-medium">
                      {poll.settings?.endDate && new Date(poll.settings.endDate) < new Date() 
                        ? 'This poll has expired' 
                        : 'This poll is inactive'
                      }
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-600">
                    {poll.settings?.endDate && new Date(poll.settings.endDate) < new Date()
                      ? `The poll ended on ${new Date(poll.settings.endDate).toLocaleDateString()}`
                      : 'The poll creator has deactivated this poll.'
                    }
                  </p>
                </div>
              )}
              
              <form onSubmit={handleJoin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={!poll.isActive}
                  className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {!poll.isActive 
                    ? (poll.settings?.endDate && new Date(poll.settings.endDate) < new Date())
                      ? 'Poll Expired'
                      : 'Poll Inactive'
                    : 'Join Poll'
                  }
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'admin' && (
          <div className="max-w-4xl mx-auto">
            {/* Admin Header */}
            <div className="bg-blue-600 text-white rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Admin Control Panel</h1>
                  <p className="text-blue-100">You are controlling this poll as an administrator</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-200">Poll Code</div>
                  <div className="text-xl font-mono font-bold">{poll.code}</div>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Poll Control</h2>
                  {adminJoined && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Live Control Active
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('join')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View as Participant
                  </button>
                  {!adminJoined ? (
                    <button
                      onClick={handleAdminJoin}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Start Live Control
                    </button>
                  ) : (
                    <button
                      onClick={handleAdminLeave}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                    >
                      <StopIcon className="w-4 h-4" />
                      Stop Live Control
                    </button>
                  )}
                </div>
              </div>
              
              {adminJoined && poll.viewMode === 'step' && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-medium text-gray-700">
                        Question {currentQuestionIndex + 1} of {poll.questions.length}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / poll.questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdminPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Previous
                      </button>
                      <button
                        onClick={handleAdminNextQuestion}
                        disabled={currentQuestionIndex >= poll.questions.length - 1}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Question dots for admin */}
                  <div className="flex gap-2 justify-center">
                    {poll.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleAdminJumpQuestion(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600'
                            : index < currentQuestionIndex
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                        title={`Jump to Question ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Question Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Question Preview</h3>
              {poll.questions[currentQuestionIndex] && (
                <div className="border border-gray-200 rounded-lg p-4">
                  {renderQuestion(poll.questions[currentQuestionIndex], currentQuestionIndex)}
                </div>
              )}
            </div>

            {/* Poll Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-2xl font-bold text-blue-600">{poll.questions.length}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-2xl font-bold text-green-600">{poll.participants.length}</div>
                <div className="text-sm text-gray-600">Participants</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-2xl font-bold text-purple-600">{poll.responses.length}</div>
                <div className="text-sm text-gray-600">Responses</div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs">
              <strong>Debug Info:</strong> isAdmin: {isAdmin ? 'true' : 'false'}, adminJoined: {adminJoined ? 'true' : 'false'}, currentQuestionIndex: {currentQuestionIndex}, poll.adminJoined: {poll?.adminJoined ? 'true' : 'false'}, poll.currentQuestionIndex: {poll?.currentQuestionIndex}
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div className="max-w-2xl mx-auto">
            {/* Admin Back Button */}
            {isAdmin && (
              <div className="mb-4">
                <button
                  onClick={() => setStep('admin')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Back to Admin View
                </button>
              </div>
            )}
            
            {/* Participant Leave Button */}
            {!isAdmin && hasJoined && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    // Clear participant session
                    const joinedPolls = JSON.parse(localStorage.getItem('joinedPolls') || '{}');
                    delete joinedPolls[pollCode];
                    localStorage.setItem('joinedPolls', JSON.stringify(joinedPolls));
                    
                    // Reset state
                    setHasJoined(false);
                    setParticipantName('');
                    setParticipantEmail('');
                    setAnswers({});
                    setStep('join');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Leave Poll
                </button>
              </div>
            )}
            
            {/* Debug Info - Only show for admins */}
            {isAdmin && (
              <div className="mb-4 p-2 bg-gray-100 text-xs">
                <strong>Debug Info:</strong> isAdmin: {isAdmin ? 'true' : 'false'}, adminJoined: {adminJoined ? 'true' : 'false'}, currentQuestionIndex: {currentQuestionIndex}, poll.adminJoined: {poll?.adminJoined ? 'true' : 'false'}, poll.currentQuestionIndex: {poll?.currentQuestionIndex}
              </div>
            )}

            {/* Admin Controls */}
            {isAdmin && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Admin Controls</span>
                    {adminJoined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!adminJoined ? (
                      <button
                        onClick={handleAdminJoin}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <PlayIcon className="w-4 h-4" />
                        Join as Admin
                      </button>
                    ) : (
                      <button
                        onClick={handleAdminLeave}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                      >
                        <StopIcon className="w-4 h-4" />
                        Leave Admin
                      </button>
                    )}
                  </div>
                </div>
                
                {adminJoined && poll.viewMode === 'step' && (
                  <div className="mt-4 p-3 bg-white rounded-md border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Question {currentQuestionIndex + 1} of {poll.questions.length}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAdminPreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeftIcon className="w-3 h-3" />
                          Previous
                        </button>
                        <button
                          onClick={handleAdminNextQuestion}
                          disabled={currentQuestionIndex >= poll.questions.length - 1}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRightIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Question dots for admin */}
                    <div className="flex gap-1 justify-center">
                      {poll.questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleAdminJumpQuestion(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentQuestionIndex
                              ? 'bg-blue-600'
                              : index < currentQuestionIndex
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                          title={`Jump to Question ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Status for Participants */}
            {!isAdmin && poll.adminJoined && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">
                    Admin is controlling this poll. Questions will advance automatically.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {poll.viewMode === 'single' ? (
                // Single page view - show all questions
              <div className="space-y-8">
                {poll.questions.map((question, index) => (
                  <div key={question._id || index} className="bg-white rounded-lg shadow-sm p-6">
                    {renderQuestion(question, index)}
                  </div>
                ))}
              </div>
              ) : (
                // Step by step view - show one question at a time
                <div className="space-y-6">
                  {/* Progress indicator */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Question {currentQuestionIndex + 1} of {poll.questions.length}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(((currentQuestionIndex + 1) / poll.questions.length) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / poll.questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Current question */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    {renderQuestion(poll.questions[currentQuestionIndex], currentQuestionIndex)}
                  </div>

                  {/* Navigation buttons - only show if admin is not controlling */}
                  {!poll.adminJoined && (
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex gap-2">
                        {poll.questions.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentQuestionIndex
                                ? 'bg-indigo-600'
                                : index < currentQuestionIndex
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                            title={`Question ${index + 1}`}
                          />
                        ))}
                      </div>

                      {currentQuestionIndex < poll.questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Next
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting || !poll.isActive}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Submitting...
                            </>
                          ) : !poll.isActive ? (
                            poll.settings?.endDate && new Date(poll.settings.endDate) < new Date()
                              ? 'Poll Expired'
                              : 'Poll Inactive'
                          ) : (
                            <>
                              Submit Response
                              <ArrowRightIcon className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Submit button for admin-controlled polls */}
                  {poll.adminJoined && currentQuestionIndex >= poll.questions.length - 1 && (
                    <div className="flex justify-center">
                        <button
                          type="submit"
                          disabled={isSubmitting || !poll.isActive || hasSubmitted}
                          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting...
                          </>
                        ) : hasSubmitted ? (
                          'Already Submitted'
                        ) : !poll.isActive ? (
                          poll.settings?.endDate && new Date(poll.settings.endDate) < new Date()
                            ? 'Poll Expired'
                            : 'Poll Inactive'
                        ) : (
                          <>
                            Submit Response
                            <ArrowRightIcon className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {poll.viewMode === 'single' && (
                <>
              {error && (
                <div className="mt-6 text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                      disabled={isSubmitting || !poll.isActive || hasSubmitted}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                      ) : hasSubmitted ? (
                        'Already Submitted'
                      ) : !poll.isActive ? (
                        poll.settings?.endDate && new Date(poll.settings.endDate) < new Date()
                          ? 'Poll Expired'
                          : 'Poll Inactive'
                  ) : (
                    <>
                      Submit Response
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
                </>
              )}

              {poll.viewMode === 'step' && error && (
                <div className="mt-6 text-red-600 text-sm text-center">{error}</div>
              )}
            </form>
          </div>
        )}

        {step === 'submitted' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Response Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for participating in this poll.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
