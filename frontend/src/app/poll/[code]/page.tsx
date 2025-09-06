'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePoll } from '@/contexts/PollContext';
import api from '@/lib/api';
import { Poll, PollResponse } from '@/types';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const { joinPoll, submitResponse, loading } = usePoll();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [step, setStep] = useState<'join' | 'questions' | 'submitted'>('join');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pollCode = params.code as string;

  useEffect(() => {
    fetchPoll();
  }, [pollCode]);

  const fetchPoll = async () => {
    try {
      const response = await api.get(`/polls/code/${pollCode}`);
      setPoll(response.data.poll);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        return (
          <div key={questionId} className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-600">Drag to reorder (most preferred first)</p>
            <div className="space-y-2">
              {question.options?.map((option: any, optionIndex: number) => (
                <div key={optionIndex} className="flex items-center p-3 border border-gray-200 rounded-md">
                  <span className="text-gray-500 mr-3">#{optionIndex + 1}</span>
                  <span className="text-gray-700">{option.text}</span>
                </div>
              ))}
            </div>
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
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </button>
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{poll.title}</h1>
            {poll.description && (
              <p className="mt-2 text-gray-600">{poll.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">Poll Code: {poll.code}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'join' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Join Poll
              </h2>
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
                  className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Join Poll
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {poll.questions.map((question, index) => (
                  <div key={question._id || index} className="bg-white rounded-lg shadow-sm p-6">
                    {renderQuestion(question, index)}
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-6 text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Response
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
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
