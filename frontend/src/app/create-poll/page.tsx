'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '@/lib/api';
import { Question } from '@/types';
import { 
  PlusIcon, 
  TrashIcon, 
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface PollFormData {
  title: string;
  description: string;
  questions: Question[];
  settings: {
    allowAnonymous: boolean;
    showResults: boolean;
    allowMultipleSubmissions: boolean;
    endDate?: string;
  };
}

export default function CreatePollPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PollFormData>({
    defaultValues: {
      title: '',
      description: '',
      questions: [{
        type: 'multiple-choice',
        question: '',
        options: [{ text: '', value: '' }, { text: '', value: '' }],
        required: true,
        settings: {
          allowMultiple: false,
          minRating: 1,
          maxRating: 5,
          maxWords: 3
        }
      }],
      settings: {
        allowAnonymous: true,
        showResults: true,
        allowMultipleSubmissions: false
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  const questions = watch('questions');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      type,
      question: '',
      options: type === 'multiple-choice' || type === 'ranking' 
        ? [{ text: '', value: '' }, { text: '', value: '' }] 
        : undefined,
      required: true,
      settings: {
        allowMultiple: false,
        minRating: 1,
        maxRating: 5,
        maxWords: 3
      }
    };
    append(newQuestion);
  };

  const onSubmit = async (data: PollFormData) => {
    setIsSubmitting(true);
    try {
      // Filter out empty options for multiple choice and ranking questions
      const processedData = {
        ...data,
        // Remove description if it's empty
        description: data.description?.trim() || undefined,
        // Remove endDate if it's empty
        settings: {
          ...data.settings,
          endDate: data.settings.endDate?.trim() || undefined
        },
        questions: data.questions.map(question => ({
          ...question,
          options: question.options?.filter(option => 
            option.text.trim() !== '' && option.value.trim() !== ''
          )
        }))
      };

      // Validate that multiple choice and ranking questions have at least 2 options
      for (const question of processedData.questions) {
        if ((question.type === 'multiple-choice' || question.type === 'ranking') && 
            (!question.options || question.options.length < 2)) {
          alert(`${question.type} questions must have at least 2 options`);
          setIsSubmitting(false);
          return;
        }
      }

      console.log('Sending poll data:', processedData);
      const response = await api.post('/polls', processedData);
      const poll = response.data.poll;
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to create poll:', error);
      alert(error.response?.data?.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const questionTypes = [
    { type: 'multiple-choice', label: 'Multiple Choice', description: 'Single or multiple selection' },
    { type: 'rating', label: 'Rating Scale', description: '1-5 or custom scale' },
    { type: 'open-ended', label: 'Open Text', description: 'Free text response' },
    { type: 'word-cloud', label: 'Word Cloud', description: 'Collect words or phrases' },
    { type: 'ranking', label: 'Ranking', description: 'Order items by preference' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
                Event Org
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <EyeIcon className="w-4 h-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Poll Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Poll Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Enter poll title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Enter poll description (optional)"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              <div className="flex space-x-2">
                {questionTypes.map((qType) => (
                  <button
                    key={qType.type}
                    type="button"
                    onClick={() => addQuestion(qType.type as Question['type'])}
                    className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    {qType.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Question {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Question Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        {...register(`questions.${index}.type`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                      >
                        {questionTypes.map((qType) => (
                          <option key={qType.type} value={qType.type}>
                            {qType.label} - {qType.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <input
                        {...register(`questions.${index}.question`, { required: 'Question text is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="Enter your question"
                      />
                    </div>

                    {/* Options for multiple choice and ranking */}
                    {(questions[index]?.type === 'multiple-choice' || questions[index]?.type === 'ranking') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options <span className="text-red-500">*</span>
                          <span className="text-sm text-gray-500 ml-2">(At least 2 options required)</span>
                        </label>
                        <div className="space-y-2">
                          {questions[index]?.options?.map((_, optionIndex) => (
                            <div key={optionIndex} className="flex space-x-2">
                              <input
                                {...register(`questions.${index}.options.${optionIndex}.text`)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                                placeholder={`Option ${optionIndex + 1} text`}
                                required
                              />
                              <input
                                {...register(`questions.${index}.options.${optionIndex}.value`)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                                placeholder="Value"
                                required
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const currentOptions = questions[index]?.options || [];
                              setValue(`questions.${index}.options`, [
                                ...currentOptions,
                                { text: '', value: '' }
                              ]);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Settings for different question types */}
                    {questions[index]?.type === 'multiple-choice' && (
                      <div>
                        <label className="flex items-center text-gray-900">
                          <input
                            type="checkbox"
                            {...register(`questions.${index}.settings.allowMultiple`)}
                            className="mr-2"
                          />
                          Allow multiple selections
                        </label>
                      </div>
                    )}

                    {questions[index]?.type === 'rating' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Rating
                          </label>
                          <input
                            type="number"
                            {...register(`questions.${index}.settings.minRating`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Rating
                          </label>
                          <input
                            type="number"
                            {...register(`questions.${index}.settings.maxRating`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {questions[index]?.type === 'word-cloud' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Words per Response
                        </label>
                          <input
                            type="number"
                            {...register(`questions.${index}.settings.maxWords`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                          />
                      </div>
                    )}

                    {/* Required checkbox */}
                    <div>
                      <label className="flex items-center text-gray-900">
                        <input
                          type="checkbox"
                          {...register(`questions.${index}.required`)}
                          className="mr-2"
                        />
                        Required question
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Poll Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('settings.allowAnonymous')}
                  className="mr-3"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Allow anonymous participation
                  </label>
                  <p className="text-sm text-gray-500">
                    Participants can join without providing their email
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('settings.showResults')}
                  className="mr-3"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Show results to participants
                  </label>
                  <p className="text-sm text-gray-500">
                    Participants can see live results as they come in
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('settings.allowMultipleSubmissions')}
                  className="mr-3"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Allow multiple submissions
                  </label>
                  <p className="text-sm text-gray-500">
                    Participants can submit responses multiple times
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  {...register('settings.endDate')}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Create Poll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
