
import React, { useState, useEffect, useCallback } from 'react';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { QuestionNavigation } from '@/components/exam/QuestionNavigation';
import { ExamResults } from '@/components/exam/ExamResults';
import { useExamTimer } from '@/hooks/useExamTimer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Question, ExamResult, UserAnswer } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Play, BookOpen } from 'lucide-react';

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=200&fit=crop",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    explanation: "Paris is the capital and most populous city of France.",
    explanationImage: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=200&fit=crop",
    difficulty: 'easy',
    category: 'Geography'
  },
  {
    id: 2,
    text: "Which programming language is known for its use in data science and machine learning?",
    options: ["Java", "Python", "C++", "JavaScript"],
    correctAnswer: 1,
    explanation: "Python is widely used in data science and machine learning due to its extensive libraries and ease of use.",
    difficulty: 'medium',
    category: 'Technology'
  },
  {
    id: 3,
    text: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    explanation: "Binary search has O(log n) time complexity because it divides the search space in half with each iteration.",
    difficulty: 'hard',
    category: 'Computer Science'
  },
  {
    id: 4,
    text: "Which planet is known as the Red Planet?",
    image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=200&fit=crop",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    explanation: "Mars is called the Red Planet due to iron oxide (rust) on its surface.",
    difficulty: 'easy',
    category: 'Science'
  },
  {
    id: 5,
    text: "What is the main purpose of a database index?",
    options: ["Store data", "Encrypt data", "Speed up queries", "Backup data"],
    correctAnswer: 2,
    explanation: "Database indexes are used to speed up query performance by creating efficient data structures.",
    difficulty: 'medium',
    category: 'Database'
  }
];

const Index = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useLocalStorage<UserAnswer[]>('examAnswers', []);
  const [examFinished, setExamFinished] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [showReview, setShowReview] = useState(false);

  const EXAM_DURATION = 30 * 60; // 30 minutes

  const handleTimeUp = useCallback(() => {
    finishExam();
  }, []);

  const { timeLeft, isRunning, startTimer, pauseTimer, resetTimer, formatTime, isWarning, isCritical } = useExamTimer(EXAM_DURATION, handleTimeUp);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const startExam = () => {
    setExamStarted(true);
    setCurrentQuestion(1);
    setUserAnswers([]);
    setExamFinished(false);
    setExamResult(null);
    setShowReview(false);
    resetTimer();
    startTimer();
  };

  const getCurrentAnswer = () => {
    return userAnswers.find(a => a.questionId === currentQuestion);
  };

  const updateUserAnswer = (selectedOption: number) => {
    setUserAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion);
      const newAnswer: UserAnswer = {
        questionId: currentQuestion,
        selectedOption,
        isMarkedForReview: existing >= 0 ? prev[existing].isMarkedForReview : false,
        timeSpent: 0
      };

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });
  };

  const toggleMarkForReview = () => {
    setUserAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === currentQuestion);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          isMarkedForReview: !updated[existing].isMarkedForReview
        };
        return updated;
      } else {
        return [...prev, {
          questionId: currentQuestion,
          selectedOption: null,
          isMarkedForReview: true,
          timeSpent: 0
        }];
      }
    });
  };

  const finishExam = () => {
    pauseTimer();
    
    const correctAnswers = userAnswers.filter(answer => {
      const question = SAMPLE_QUESTIONS.find(q => q.id === answer.questionId);
      return question && answer.selectedOption === question.correctAnswer;
    }).length;

    const wrongAnswers = userAnswers.filter(answer => {
      const question = SAMPLE_QUESTIONS.find(q => q.id === answer.questionId);
      return question && answer.selectedOption !== null && answer.selectedOption !== question.correctAnswer;
    }).length;

    const skippedAnswers = SAMPLE_QUESTIONS.length - userAnswers.filter(a => a.selectedOption !== null).length;
    const percentage = Math.round((correctAnswers / SAMPLE_QUESTIONS.length) * 100);
    const timeSpent = EXAM_DURATION - timeLeft;

    const result: ExamResult = {
      score: correctAnswers,
      percentage,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      timeSpent,
      passed: percentage >= 70
    };

    setExamResult(result);
    setExamFinished(true);
  };

  const restartExam = () => {
    setExamStarted(false);
    setCurrentQuestion(1);
    setUserAnswers([]);
    setExamFinished(false);
    setExamResult(null);
    setShowReview(false);
    resetTimer();
  };

  const answeredQuestions = new Set(userAnswers.filter(a => a.selectedOption !== null).map(a => a.questionId));
  const markedQuestions = new Set(userAnswers.filter(a => a.isMarkedForReview).map(a => a.questionId));
  const currentAnswer = getCurrentAnswer();

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Advanced Online Exam System
            </h1>
            <p className="text-xl text-muted-foreground">
              Test your knowledge with our comprehensive examination platform
            </p>
          </div>

          <div className="bg-card rounded-2xl border p-8 space-y-6">
            <h2 className="text-2xl font-semibold">Exam Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Total Questions: {SAMPLE_QUESTIONS.length}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Time Limit: 30 minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Passing Score: 70%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Multiple choice questions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Mark questions for review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Auto-submit when time expires</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startExam}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Exam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (examFinished && examResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <div className="container mx-auto py-8">
          <ExamResults
            result={examResult}
            questions={SAMPLE_QUESTIONS}
            userAnswers={userAnswers}
            onRestart={restartExam}
            onReviewAnswers={() => setShowReview(true)}
          />
        </div>
      </div>
    );
  }

  const currentQuestionData = SAMPLE_QUESTIONS[currentQuestion - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ExamHeader
        timeLeft={formatTime}
        isTimerRunning={isRunning}
        isWarning={isWarning}
        isCritical={isCritical}
        currentQuestion={currentQuestion}
        totalQuestions={SAMPLE_QUESTIONS.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleTimer={isRunning ? pauseTimer : startTimer}
        onOpenSettings={() => {}}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <QuestionCard
          question={currentQuestionData}
          selectedOption={currentAnswer?.selectedOption ?? null}
          isMarkedForReview={currentAnswer?.isMarkedForReview ?? false}
          onSelectOption={updateUserAnswer}
          onToggleReview={toggleMarkForReview}
        />

        <QuestionNavigation
          currentQuestion={currentQuestion}
          totalQuestions={SAMPLE_QUESTIONS.length}
          onPrevious={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
          onNext={() => setCurrentQuestion(Math.min(SAMPLE_QUESTIONS.length, currentQuestion + 1))}
          onSubmit={finishExam}
          answeredQuestions={answeredQuestions}
          markedQuestions={markedQuestions}
        />
      </div>
    </div>
  );
};

export default Index;
