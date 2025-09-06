'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Poll } from '@/types';
import QRCode from 'qrcode';
import { 
  PlusIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ClockIcon,
  EyeIcon,
  ShareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  LinkIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ poll: Poll | null; show: boolean }>({
    poll: null,
    show: false
  });
  const [deleting, setDeleting] = useState(false);
  const [shareModal, setShareModal] = useState<{ poll: Poll | null; show: boolean }>({
    poll: null,
    show: false
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchPolls();
    }
  }, [user, authLoading, router]);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/polls/my-polls');
      setPolls(response.data.polls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const openShareModal = async (poll: Poll) => {
    const link = `${window.location.origin}/poll/${poll.code}`;
    setShareUrl(link);
    setShareModal({ poll, show: true });
    
    // Generate QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(link, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const copyPollLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareViaEmail = () => {
    const subject = `Join my poll: ${shareModal.poll?.title}`;
    const body = `Hi! I've created a poll and would love for you to participate. Click the link below to join:\n\n${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaWhatsApp = () => {
    const text = `Join my poll: ${shareModal.poll?.title}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };


  const closeShareModal = () => {
    setShareModal({ poll: null, show: false });
    setCopySuccess(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePoll = (poll: Poll) => {
    setDeleteConfirm({ poll, show: true });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.poll) return;

    setDeleting(true);
    try {
      await api.delete(`/polls/${deleteConfirm.poll.code}`);
      setPolls(polls.filter(p => p._id !== deleteConfirm.poll!._id));
      setDeleteConfirm({ poll: null, show: false });
    } catch (error: any) {
      console.error('Failed to delete poll:', error);
      alert(error.response?.data?.message || 'Failed to delete poll');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ poll: null, show: false });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Event Org
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/issues" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Issues
              </Link>
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => {
                  // Handle logout
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Polls</h1>
            <p className="text-gray-600 mt-2">Create and manage your interactive polls</p>
          </div>
          <Link
            href="/create-poll"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Poll
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Polls</p>
                <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.reduce((sum, poll) => sum + poll.analytics.totalParticipants, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Polls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(poll => poll.settings.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.reduce((sum, poll) => sum + poll.analytics.totalResponses, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Polls List */}
        {polls.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
            <p className="text-gray-600 mb-6">Create your first poll to get started</p>
            <Link
              href="/create-poll"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create Your First Poll
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div key={poll._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {poll.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      poll.settings.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {poll.settings.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {poll.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {poll.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Code: {poll.code}</span>
                    <span>{poll.questions.length} questions</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{poll.analytics.totalParticipants} participants</span>
                    <span>{poll.analytics.totalResponses} responses</span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Created {formatDate(poll.createdAt)}
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/poll/${poll.code}/results`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Results
                    </Link>
                    <button
                      onClick={() => openShareModal(poll)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <ShareIcon className="w-4 h-4" />
                      Share Link
                    </button>
                    <Link
                      href={`/poll/${poll.code}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <UsersIcon className="w-4 h-4" />
                      Join Poll
                    </Link>
                    <button
                      onClick={() => handleDeletePoll(poll)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.poll && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Poll</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{deleteConfirm.poll.title}"? This action cannot be undone.
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

      {/* Share Modal */}
      {shareModal.show && shareModal.poll && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Share Poll</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Poll: <span className="font-medium">{shareModal.poll.title}</span></p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-gray-50"
                  />
                  <button
                    onClick={copyPollLink}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      copySuccess
                        ? 'bg-green-100 text-green-800'
                        : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <CheckIcon className="w-4 h-4 inline mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 inline mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Share via:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={shareViaEmail}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    📧 Email
                  </button>
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>

              {qrCodeDataUrl && (
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">QR Code:</p>
                  <div className="inline-block p-2 bg-white border rounded-lg">
                    <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Scan to join the poll</p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>Participants can join using the poll code: <span className="font-mono font-medium">{shareModal.poll.code}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
