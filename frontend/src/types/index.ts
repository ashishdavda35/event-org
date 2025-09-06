export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PollSettings {
  allowAnonymous: boolean;
  showResults: boolean;
  allowMultipleSubmissions: boolean;
  isActive: boolean;
  endDate?: string;
}

export interface QuestionSettings {
  allowMultiple: boolean;
  minRating: number;
  maxRating: number;
  maxWords: number;
}

export interface Question {
  _id?: string;
  type: 'multiple-choice' | 'rating' | 'open-ended' | 'word-cloud' | 'ranking';
  question: string;
  options?: Array<{
    text: string;
    value: string;
  }>;
  required: boolean;
  settings: QuestionSettings;
}

export interface Poll {
  _id: string;
  title: string;
  description?: string;
  code: string;
  creator: User;
  questions: Question[];
  settings: PollSettings;
  participants: Array<{
    _id: string;
    name: string;
    email?: string;
    joinedAt: string;
  }>;
  responses: Array<{
    participantId: string;
    participantName: string;
    answers: Array<{
      questionId: string;
      answer: any;
      submittedAt: string;
    }>;
  }>;
  analytics: {
    totalParticipants: number;
    totalResponses: number;
    averageResponseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PollResponse {
  participantName: string;
  participantEmail?: string;
  answers: Array<{
    questionId: string;
    answer: any;
  }>;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface PollContextType {
  currentPoll: Poll | null;
  setCurrentPoll: (poll: Poll | null) => void;
  joinPoll: (code: string, participantName: string, participantEmail?: string) => Promise<void>;
  submitResponse: (response: PollResponse) => Promise<void>;
  loading: boolean;
}
