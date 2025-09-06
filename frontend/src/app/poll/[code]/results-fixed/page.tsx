'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Poll } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  ArrowRightIcon,
  UsersIcon,
  ChartBarIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function FixedPollResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pollCode = params.code as string;

  useEffect(() => {
    fetchPollResults();
  }, [pollCode]);

  const fetchPollResults = async () => {
    try {
      console.log('Fetching poll results for code:', pollCode);
      setLoading(true);
      setError('');
      
      // Direct API call to backend
      const response = await fetch(`http://localhost:5000/api/polls/${pollCode}/results`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const resultsData = await response.json();
      console.log('Poll results received:', resultsData);
      
      if (!resultsData.poll) {
        throw new Error('No poll data received');
      }
      
      setPoll(resultsData.poll);
      console.log('Poll loaded successfully');
      
    } catch (error: any) {
      console.error('Error fetching poll results:', error);
      setError(error.message || 'Failed to fetch poll results');
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    try {
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@eventorg.com',
          password: 'admin123'
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const loginData = await loginResponse.json();
      return loginData.token;
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const toggleResultsVisibility = async () => {
    if (!poll || !poll.settings) {
      alert('Poll data not loaded properly. Please refresh the page.');
      return;
    }
    
    try {
      console.log('Toggling results visibility...');
      
      const token = await getAuthToken();
      const newShowResults = !poll.settings.showResults;
      
      console.log(`Updating showResults from ${poll.settings.showResults} to ${newShowResults}`);
      
      const updateResponse = await fetch(`http://localhost:5000/api/polls/${pollCode}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          showResults: newShowResults
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update settings');
      }

      // Update local state
      setPoll(prev => prev ? {
        ...prev,
        settings: {
          ...prev.settings,
          showResults: newShowResults
        }
      } : null);

      console.log('Results visibility toggled successfully to:', newShowResults);
      alert(`Results visibility ${newShowResults ? 'enabled' : 'disabled'} successfully!`);
      
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      alert('Failed to update poll settings: ' + error.message);
    }
  };

  const copyPollLink = () => {
    const link = `${window.location.origin}/poll/${pollCode}`;
    navigator.clipboard.writeText(link);
    alert('Poll link copied to clipboard!');
  };

  const handleDeletePoll = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!poll) return;

    setDeleting(true);
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`http://localhost:5000/api/polls/${poll.code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete poll');
      }

      alert('Poll deleted successfully!');
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Failed to delete poll:', error);
      alert('Failed to delete poll: ' + error.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const generateQuestionData = (question: any) => {
    if (!poll || !poll.responses) return [];

    const responses = poll.responses.flatMap(response => 
      response.answers.filter(answer => answer.questionId === question._id)
    );

    switch (question.type) {
      case 'multiple-choice':
        const choiceCounts: Record<string, number> = {};
        question.options?.forEach((option: any) => {
          choiceCounts[option.text] = 0;
        });

        responses.forEach(response => {
          if (Array.isArray(response.answer)) {
            response.answer.forEach((choice: string) => {
              const option = question.options?.find((opt: any) => opt.value === choice);
              if (option) {
                choiceCounts[option.text]++;
              }
            });
          } else {
            const option = question.options?.find((opt: any) => opt.value === response.answer);
            if (option) {
              choiceCounts[option.text]++;
            }
          }
        });

        return Object.entries(choiceCounts).map(([name, value]) => ({ name, value }));

      case 'rating':
        const ratingCounts: Record<number, number> = {};
        const minRating = question.settings?.minRating || 1;
        const maxRating = question.settings?.maxRating || 5;
        
        for (let i = minRating; i <= maxRating; i++) {
          ratingCounts[i] = 0;
        }

        responses.forEach(response => {
          if (typeof response.answer === 'number') {
            ratingCounts[response.answer]++;
          }
        });

        return Object.entries(ratingCounts).map(([name, value]) => ({ 
          name: `Rating ${name}`, 
          value 
        }));

      default:
        return [];
    }
  };

  const renderQuestionChart = (question: any, index: number) => {
    const data = generateQuestionData(question);

    if (data.length === 0) {
      return (
        <div key={question._id || index} className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {question.question}
          </h3>
          <p className="text-gray-500 text-center py-8">No responses yet</p>
        </div>
      );
    }

    return (
      <div key={question._id || index} className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {question.question}
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll results...</p>
          <p className="mt-2 text-sm text-gray-500">Poll Code: {pollCode}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Poll Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                fetchPollResults();
              }}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Poll Found</h2>
          <p className="text-gray-600 mb-6">The poll you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{poll.title || 'Untitled Poll'}</h1>
              <p className="text-gray-600">Poll Code: {poll.code || pollCode}</p>
              {poll.description && (
                <p className="text-gray-600 mt-2">{poll.description}</p>
              )}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  poll.settings?.showResults 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {poll.settings?.showResults ? 'Results Visible' : 'Results Hidden'}
                </span>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowRightIcon className="w-4 h-4" />
                Go Home
              </button>
              <button
                onClick={toggleResultsVisibility}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  poll.settings?.showResults
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-white bg-green-600 hover:bg-green-700'
                }`}
                title={`Current state: ${poll.settings?.showResults ? 'Results are visible to audience' : 'Results are hidden from audience'}`}
              >
                {poll.settings?.showResults ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    Hide Results
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    Show Results
                  </>
                )}
              </button>
              <button
                onClick={copyPollLink}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleDeletePoll}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Poll
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {poll.analytics?.totalParticipants || poll.participants?.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Responses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {poll.analytics?.totalResponses || poll.responses?.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {poll.questions?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {poll.settings?.showResults ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <EyeIcon className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Results are visible to your audience</p>
              </div>
            </div>
            
            {/* Question Results */}
            {poll.questions && poll.questions.length > 0 ? (
              poll.questions.map((question, index) => renderQuestionChart(question, index))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-gray-600">This poll doesn't have any questions yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <EyeSlashIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Results are Hidden</h3>
            <p className="text-red-700 mb-4">Your audience cannot see the poll results. Click "Show Results" to make them visible.</p>
            <button
              onClick={toggleResultsVisibility}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Show Results to Audience
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Poll</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{poll?.title}"? This action cannot be undone and all responses will be lost.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
