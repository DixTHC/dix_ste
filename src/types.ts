export type QuestionType = 'single' | 'multiple' | 'scale' | 'boolean' | 'text';

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required?: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  yesLabel?: string;
  noLabel?: string;
  placeholder?: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  importedAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean | null;
  skipped?: boolean;
  markedForLater?: boolean;
}

export interface Session {
  id: string;
  questionnaireId: string;
  questionnaireTitle: string;
  startedAt: string;
  completedAt?: string;
  answers: Answer[];
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface ExportData {
  sessionId: string;
  questionnaireId: string;
  questionnaireTitle: string;
  exportedAt: string;
  status: string;
  summary: {
    total: number;
    answered: number;
    skipped: number;
    pending: number;
  };
  answers: Answer[];
}

export interface MarkdownDoc {
  id: string;
  title: string;
  content: string;
  tasks: string[];
  milestones: string[];
  dates: string[];
  createdAt: string;
}

export type Page = 'home' | 'questionnaires' | 'history' | 'downloads' | 'settings';

export type FilterMode = 'all' | 'pending' | 'marked';
