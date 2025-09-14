'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api, { pollApi } from '@/lib/api';
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
  QrCodeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ViewColumnsIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingViewMode, setTogglingViewMode] = useState<string | null>(null);
  const [ellipsesMenu, setEllipsesMenu] = useState<{ poll: Poll | null; show: boolean; position: { x: number; y: number } | null }>({
    poll: null,
    show: false,
    position: null
  });
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchPolls();
    }
  }, [user, authLoading, router]);

  // Handle query parameters (e.g., when redirected from edit page)
  useEffect(() => {
    if (searchParams.get('updated') === 'true' && user && !authLoading) {
      // Remove the query parameter from URL
      router.replace('/dashboard');
      // Refresh polls data
      fetchPolls();
    }
  }, [searchParams, user, authLoading, router]);

  // Refresh polls when page becomes visible (e.g., when navigating back from edit page)
  useEffect(() => {
    const handleFocus = () => {
      if (user && !authLoading) {
        fetchPolls();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, authLoading]);

  // Handle click outside to close ellipses menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ellipsesMenu.show) {
        const target = event.target as Element;
        if (!target.closest('.ellipses-menu') && !target.closest('[data-ellipses-button]')) {
          closeEllipsesMenu();
        }
      }
    };

    if (ellipsesMenu.show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [ellipsesMenu.show]);

  const fetchPolls = async (showLoading = false) => {
    console.log('fetchPolls called with showLoading:', showLoading);
    if (showLoading) {
      setLoading(true);
    }
    try {
      console.log('Fetching polls from API...');
      const response = await api.get('/polls/my-polls');
      console.log('Polls fetched successfully:', response.data.polls.length, 'polls');
      setPolls(response.data.polls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const openShareModal = async (poll: Poll) => {
    // Don't open share modal for expired polls
    if (!poll.isActive && poll.settings?.endDate && new Date(poll.settings.endDate) < new Date()) {
      return;
    }
    
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

  const handleToggleStatus = async (poll: Poll) => {
    console.log('Toggle clicked for poll:', poll.code, 'Current status:', poll.isActive);
    setToggling(poll._id);
    try {
      console.log('Calling toggle API for poll:', poll.code);
      const response = await pollApi.toggleStatus(poll.code);
      console.log('Toggle API response:', response.data);
      
      // Update the poll in the local state
      setPolls(polls.map(p => 
        p._id === poll._id 
          ? { ...p, isActive: response.data.poll.isActive, manuallyDeactivated: response.data.poll.manuallyDeactivated }
          : p
      ));
      console.log('Poll status updated in state');
    } catch (error: any) {
      console.error('Failed to toggle poll status:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.isExpiredByTime) {
        alert('Cannot activate poll that has expired by end date');
      } else {
        alert(error.response?.data?.message || 'Failed to toggle poll status');
      }
    } finally {
      setToggling(null);
    }
  };

  const handleToggleViewMode = async (poll: Poll) => {
    console.log('Toggle view mode clicked for poll:', poll.code, 'Current viewMode:', poll.viewMode);
    setTogglingViewMode(poll._id);
    try {
      console.log('Calling toggle view mode API for poll:', poll.code);
      const response = await pollApi.toggleViewMode(poll.code);
      console.log('Toggle view mode API response:', response.data);
      
      // Update the poll in the local state
      setPolls(polls.map(p => 
        p._id === poll._id 
          ? { ...p, viewMode: response.data.poll.viewMode }
          : p
      ));
      console.log('Poll view mode updated in state');
    } catch (error: any) {
      console.error('Failed to toggle poll view mode:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to toggle poll view mode');
    } finally {
      setTogglingViewMode(null);
    }
  };

  const handleClonePoll = async (poll: Poll) => {
    setCloning(poll._id);
    try {
      const response = await pollApi.clone(poll.code);
      // Add the new poll to the beginning of the list
      setPolls([response.data.poll, ...polls]);
      setEllipsesMenu({ poll: null, show: false });
      alert('Poll cloned successfully!');
    } catch (error: any) {
      console.error('Failed to clone poll:', error);
      alert(error.response?.data?.message || 'Failed to clone poll');
    } finally {
      setCloning(null);
    }
  };

  const openEllipsesMenu = (poll: Poll, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setEllipsesMenu({ 
      poll, 
      show: true, 
      position: { 
        x: rect.right - 200, // Position to the left of the button
        y: rect.bottom + 5   // Position below the button
      } 
    });
  };

  const closeEllipsesMenu = () => {
    setEllipsesMenu({ poll: null, show: false, position: null });
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
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Refresh button clicked');
                fetchPolls(true);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/create-poll"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Create New Poll
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  {polls.filter(poll => poll.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired Polls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(poll => poll.settings.endDate && new Date(poll.settings.endDate) < new Date() && !poll.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <XMarkIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Polls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(poll => !poll.isActive && (!poll.settings.endDate || new Date(poll.settings.endDate) >= new Date())).length}
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
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                      {poll.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Button clicked for poll:', poll.code);
                          handleToggleStatus(poll);
                        }}
                        disabled={toggling === poll._id}
                        className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                          poll.isActive 
                            ? (poll.settings.endDate && new Date(poll.settings.endDate) < new Date())
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' // Active but time-expired
                              : 'bg-green-100 text-green-800 hover:bg-green-200' // Active and not expired
                            : (poll.settings.endDate && new Date(poll.settings.endDate) < new Date())
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' // Inactive and time-expired
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200' // Inactive but not expired
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {toggling === poll._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        ) : (
                          poll.isActive 
                            ? (poll.settings.endDate && new Date(poll.settings.endDate) < new Date())
                              ? 'Active*' // Active but time-expired
                              : 'Active' // Active and not expired
                            : (poll.settings.endDate && new Date(poll.settings.endDate) < new Date())
                            ? 'Expired' // Inactive and time-expired
                            : 'Inactive' // Inactive but not expired
                        )}
                      </button>
                      <button
                        onClick={(e) => openEllipsesMenu(poll, e)}
                        data-ellipses-button
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </button>
                    </div>
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

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/poll/${poll.code}/results`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Results
                    </Link>
                    <Link
                      href={`/edit-poll/${poll.code}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </Link>
                    <Link
                      href={`/poll/${poll.code}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <UsersIcon className="w-4 h-4" />
                      Join
                    </Link>
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

      {/* Ellipses Menu Dropdown */}
      {ellipsesMenu.show && ellipsesMenu.poll && ellipsesMenu.position && (
        <div 
          className="ellipses-menu fixed z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
          style={{
            left: `${ellipsesMenu.position.x}px`,
            top: `${ellipsesMenu.position.y}px`,
          }}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{ellipsesMenu.poll.title}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => handleClonePoll(ellipsesMenu.poll!)}
              disabled={cloning === ellipsesMenu.poll._id}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cloning === ellipsesMenu.poll._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <DocumentDuplicateIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {cloning === ellipsesMenu.poll._id ? 'Cloning...' : 'Clone Poll'}
              </span>
            </button>
            
            <button
              onClick={() => {
                handleToggleViewMode(ellipsesMenu.poll!);
                closeEllipsesMenu();
              }}
              disabled={togglingViewMode === ellipsesMenu.poll._id}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {togglingViewMode === ellipsesMenu.poll._id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : ellipsesMenu.poll.viewMode === 'single' ? (
                <ListBulletIcon className="w-4 h-4" />
              ) : (
                <ViewColumnsIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {togglingViewMode === ellipsesMenu.poll._id 
                  ? 'Updating...' 
                  : ellipsesMenu.poll.viewMode === 'single'
                  ? 'Switch to Step by Step'
                  : 'Switch to All Questions'
                }
              </span>
            </button>
            
            <button
              onClick={() => {
                openShareModal(ellipsesMenu.poll!);
                closeEllipsesMenu();
              }}
              disabled={!ellipsesMenu.poll?.isActive && ellipsesMenu.poll?.settings?.endDate && new Date(ellipsesMenu.poll.settings.endDate) < new Date()}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                !ellipsesMenu.poll?.isActive && ellipsesMenu.poll?.settings?.endDate && new Date(ellipsesMenu.poll.settings.endDate) < new Date()
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ShareIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {!ellipsesMenu.poll?.isActive && ellipsesMenu.poll?.settings?.endDate && new Date(ellipsesMenu.poll.settings.endDate) < new Date()
                  ? 'Share Poll (Expired)'
                  : 'Share Poll'
                }
              </span>
            </button>
            
            <button
              onClick={() => {
                handleDeletePoll(ellipsesMenu.poll!);
                closeEllipsesMenu();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-700 hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Delete Poll</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
