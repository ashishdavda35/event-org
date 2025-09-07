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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
  UsersIcon,
  ChartBarIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  EnvelopeIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function PollResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const pollCode = params.code as string;

  useEffect(() => {
    fetchPollResults();
  }, [pollCode]);

  const fetchPollResults = async () => {
    try {
      console.log('Fetching poll results for code:', pollCode);
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/poll-results?code=${pollCode}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
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

  const toggleResultsVisibility = async () => {
    if (!poll || !poll.settings) {
      console.error('Cannot toggle: poll or settings not available', { poll, settings: poll?.settings });
      alert('Poll data not loaded properly. Please refresh the page.');
      return;
    }
    
    try {
      console.log('Toggling results visibility...', {
        currentShowResults: poll.settings.showResults,
        pollCode,
        pollTitle: poll.title
      });
      
      // First login as admin to get token
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@eventorg.com',
          password: 'admin123'
        })
      });

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error('Login failed:', errorText);
        throw new Error('Login failed: ' + errorText);
      }

      const loginData = await loginResponse.json();
      const { token } = loginData;
      console.log('Login successful, token obtained');

      // Update poll settings
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
        const errorData = await updateResponse.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update settings');
      }

      const updateData = await updateResponse.json();
      console.log('Update successful:', updateData.poll.settings);

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
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update poll settings: ' + error.message);
    }
  };

  const exportResults = async () => {
    try {
      console.log('Exporting results...');
      
      // First login as admin to get token
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@eventorg.com',
          password: 'admin123'
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const loginData = await loginResponse.json();
      const { token } = loginData;

      // Export results
      const response = await fetch(`http://localhost:5000/api/polls/${pollCode}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `poll-${pollCode}-results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Results exported successfully');
    } catch (error) {
      console.error('Failed to export results:', error);
      alert('Failed to export results. Please try again.');
    }
  };

  const generateQRCode = async () => {
    try {
      const pollLink = `${window.location.origin}/poll/${pollCode}`;
      const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pollLink)}`;
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const copyPollLink = async () => {
    try {
      const link = `${window.location.origin}/poll/${pollCode}`;
      await navigator.clipboard.writeText(link);
      setShareFeedback('Poll link copied to clipboard!');
      setTimeout(() => setShareFeedback(''), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setShareFeedback('Failed to copy link. Please try again.');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  const copyResultsLink = async () => {
    try {
      const link = `${window.location.origin}/poll/${pollCode}/results`;
      await navigator.clipboard.writeText(link);
      setShareFeedback('Results link copied to clipboard!');
      setTimeout(() => setShareFeedback(''), 3000);
    } catch (error) {
      console.error('Failed to copy results link:', error);
      setShareFeedback('Failed to copy results link. Please try again.');
      setTimeout(() => setShareFeedback(''), 3000);
    }
  };

  const shareToWhatsApp = () => {
    const text = `Check out the poll results for "${poll?.title || 'Untitled Poll'}"!`;
    const url = `${window.location.origin}/poll/${pollCode}/results`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToLinkedIn = () => {
    const title = `Poll Results: ${poll?.title || 'Untitled Poll'}`;
    const summary = `Check out the live poll results and analytics.`;
    const url = `${window.location.origin}/poll/${pollCode}/results`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };


  const shareViaEmail = () => {
    const subject = `Poll Results: ${poll?.title || 'Untitled Poll'}`;
    const body = `Check out the poll results for "${poll?.title || 'Untitled Poll'}":\n\n${window.location.origin}/poll/${pollCode}/results\n\nPoll Code: ${pollCode}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  const openShareModal = () => {
    setShowShareModal(true);
    generateQRCode();
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setShareFeedback('');
    setQrCodeUrl('');
  };

  const handleDeletePoll = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!poll) return;

    setDeleting(true);
    try {
      console.log('Deleting poll...');
      
      // First login as admin to get token
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@eventorg.com',
          password: 'admin123'
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const loginData = await loginResponse.json();
      const { token } = loginData;

      // Delete poll
      const response = await fetch(`http://localhost:5000/api/polls/${poll.code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete poll');
      }

      console.log('Poll deleted successfully');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to delete poll:', error);
      alert(error.message || 'Failed to delete poll');
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

      case 'word-cloud':
        const wordCounts: Record<string, number> = {};
        console.log('Processing word cloud responses:', responses);
        
        responses.forEach(response => {
          console.log('Word cloud response:', response);
          if (typeof response.answer === 'string' && response.answer.trim()) {
            // Handle both comma-separated and space-separated words
            const words = response.answer.split(/[,\s]+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
            console.log('Extracted words:', words);
            words.forEach(word => {
              if (word && word.length > 0) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
              }
            });
          }
        });

        const result = Object.entries(wordCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20)
          .map(([name, value]) => ({ name, value }));
        
        console.log('Word cloud result:', result);
        return result;

      case 'ranking':
        // For ranking questions, we need to calculate average positions
        const rankingData: Record<string, { total: number, count: number, average: number }> = {};
        
        // Initialize with all options
        question.options?.forEach((option: any) => {
          rankingData[option.text] = { total: 0, count: 0, average: 0 };
        });

        responses.forEach(response => {
          if (Array.isArray(response.answer)) {
            response.answer.forEach((optionIndex: number, position: number) => {
              const option = question.options?.[optionIndex];
              if (option) {
                rankingData[option.text].total += position + 1; // position + 1 because ranking starts from 1
                rankingData[option.text].count += 1;
              }
            });
          }
        });

        // Calculate averages and convert to chart data
        return Object.entries(rankingData)
          .map(([name, data]) => ({
            name,
            value: data.count > 0 ? (data.total / data.count).toFixed(1) : 0,
            count: data.count
          }))
          .sort((a, b) => parseFloat(a.value) - parseFloat(b.value)); // Sort by average ranking (lower is better)

      case 'open-ended':
        // For open-ended questions, we'll show a list of responses
        return responses.map((response, index) => ({
          name: `Response ${index + 1}`,
          value: response.answer || '',
          response: response.answer || ''
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
        
        {question.type === 'open-ended' ? (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {data.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                      #{idx + 1}
                    </span>
                    <p className="text-gray-700 flex-1 whitespace-pre-wrap">{item.response}</p>
                  </div>
                </div>
              ))}
            </div>
            {data.length === 0 && (
              <p className="text-gray-500 text-center py-8">No responses yet</p>
            )}
          </div>
        ) : question.type === 'word-cloud' ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Word frequency (most mentioned words)
            </div>
            {data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.value} mention{item.value !== 1 ? 's' : ''}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (item.value / Math.max(...data.map(d => d.value))) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No word cloud data available</p>
            )}
          </div>
        ) : question.type === 'ranking' ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Average ranking (lower number = more preferred)
            </div>
            <div className="space-y-2">
              {data.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-600">#{idx + 1}</span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Avg: {item.value}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} response{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {question.type === 'rating' || question.type === 'multiple-choice' ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
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
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
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
          <div className="space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={!poll?.settings}
                style={{ 
                  opacity: !poll?.settings ? 0.5 : 1,
                  cursor: !poll?.settings ? 'not-allowed' : 'pointer'
                }}
                title={`Current state: ${poll?.settings?.showResults ? 'Results are visible' : 'Results are hidden'}`}
              >
                {poll?.settings?.showResults ? (
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
                onClick={openShareModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={exportResults}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export CSV
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

        {/* Question Results */}
        <div className="space-y-6">
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
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Share Poll Results</h3>
              <button
                onClick={closeShareModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Share Feedback */}
            {shareFeedback && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {shareFeedback}
              </div>
            )}

            <div className="space-y-6">
              {/* Quick Copy Links */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Quick Copy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={copyPollLink}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Poll Link</div>
                      <div className="text-sm text-gray-500">Copy voting link</div>
                    </div>
                  </button>
                  <button
                    onClick={copyResultsLink}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Results Link</div>
                      <div className="text-sm text-gray-500">Copy results link</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Social Media Sharing */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Share on Social Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={shareToWhatsApp}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded"></div>
                    <span className="font-medium text-gray-900">WhatsApp</span>
                  </button>
                  <button
                    onClick={shareToLinkedIn}
                    className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-5 h-5 bg-blue-600 rounded"></div>
                    <span className="font-medium text-gray-900">LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Email Sharing */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Email</h4>
                <button
                  onClick={shareViaEmail}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                >
                  <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Share via Email</span>
                </button>
              </div>

              {/* QR Code */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">QR Code</h4>
                <div className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for poll" 
                      className="w-24 h-24 border border-gray-200 rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 border border-gray-200 rounded flex items-center justify-center">
                      <QrCodeIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Scan this QR code to access the poll directly
                    </p>
                    <p className="text-xs text-gray-500">
                      Poll Code: <span className="font-mono font-medium">{pollCode}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Poll Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Poll Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Title:</span> {poll?.title || 'Untitled Poll'}</p>
                  <p><span className="font-medium">Code:</span> {pollCode}</p>
                  <p><span className="font-medium">Participants:</span> {poll?.analytics?.totalParticipants || poll?.participants?.length || 0}</p>
                  <p><span className="font-medium">Responses:</span> {poll?.analytics?.totalResponses || poll?.responses?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeShareModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
