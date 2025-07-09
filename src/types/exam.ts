
export interface Question {
  id: number;
  text: string;
  image?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  explanationImage?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface ExamSettings {
  duration: number;
  questionsCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  passingScore: number;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number | null;
  isMarkedForReview: boolean;
  timeSpent: number;
}

export interface ExamResult {
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  timeSpent: number;
  passed: boolean;
}
