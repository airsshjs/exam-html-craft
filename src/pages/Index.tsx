
import React, { useState, useEffect, useCallback } from 'react';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionCard } from '@/components/exam/QuestionCard';
import { QuestionNavigation } from '@/components/exam/QuestionNavigation';
import { ExamResults } from '@/components/exam/ExamResults';
import { TestCreator } from '@/components/exam/TestCreator';
import { useExamTimer } from '@/hooks/useExamTimer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Question, ExamResult, UserAnswer } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Play, BookOpen, Plus, Library } from 'lucide-react';

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
  const [showCreator, setShowCreator] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [savedTests, setSavedTests] = useLocalStorage<{name: string, questions: Question[], timeLimit: number}[]>('savedTests', []);

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

  const startExam = (questions?: Question[], timeLimit?: number) => {
    if (questions) {
      setActiveQuestions(questions);
    }
    if (timeLimit) {
      // Update timer duration if provided
    }
    setExamStarted(true);
    setCurrentQuestion(1);
    setUserAnswers([]);
    setExamFinished(false);
    setExamResult(null);
    setShowReview(false);
    setShowCreator(false);
    resetTimer();
    startTimer();
  };

  const saveTest = (questions: Question[], testName: string, timeLimit: number) => {
    const newTest = { name: testName, questions, timeLimit };
    setSavedTests([...savedTests, newTest]);
    setShowCreator(false);
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
      const question = activeQuestions.find(q => q.id === answer.questionId);
      return question && answer.selectedOption === question.correctAnswer;
    }).length;

    const wrongAnswers = userAnswers.filter(answer => {
      const question = activeQuestions.find(q => q.id === answer.questionId);
      return question && answer.selectedOption !== null && answer.selectedOption !== question.correctAnswer;
    }).length;

    const skippedAnswers = activeQuestions.length - userAnswers.filter(a => a.selectedOption !== null).length;
    const percentage = Math.round((correctAnswers / activeQuestions.length) * 100);
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
    setShowCreator(false);
    resetTimer();
  };

  const answeredQuestions = new Set(userAnswers.filter(a => a.selectedOption !== null).map(a => a.questionId));
  const markedQuestions = new Set(userAnswers.filter(a => a.isMarkedForReview).map(a => a.questionId));
  const currentAnswer = getCurrentAnswer();

  if (showCreator) {
    return <TestCreator onBack={() => setShowCreator(false)} onSave={saveTest} />;
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Advanced Online Exam System
            </h1>
            <p className="text-xl text-muted-foreground">
              Create, manage, and take comprehensive examinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Take Test */}
            <Card className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold">Take Test</h2>
                <p className="text-muted-foreground">Start the sample exam or choose from your saved tests</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-left text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Questions: {SAMPLE_QUESTIONS.length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>30 minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>70% to pass</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Multiple choice</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => startExam()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Sample Test
                </Button>

                {savedTests.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Your Saved Tests</Label>
                    {savedTests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-xs text-muted-foreground">{test.questions.length} questions • {test.timeLimit}m</p>
                        </div>
                        <Button 
                          onClick={() => startExam(test.questions, test.timeLimit)}
                          size="sm"
                          variant="outline"
                        >
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Create Test */}
            <Card className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold">Create Test</h2>
                <p className="text-muted-foreground">Build your own custom examinations with questions</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-left text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Add unlimited questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Set custom time limits</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Organize by categories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>Multiple difficulty levels</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowCreator(true)}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Test
                </Button>

                {savedTests.length > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      <Library className="w-4 h-4 inline mr-1" />
                      {savedTests.length} test{savedTests.length !== 1 ? 's' : ''} saved
                    </p>
                  </div>
                )}
              </div>
            </Card>
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
            questions={activeQuestions}
            userAnswers={userAnswers}
            onRestart={restartExam}
            onReviewAnswers={() => setShowReview(true)}
          />
        </div>
      </div>
    );
  }

  const currentQuestionData = activeQuestions[currentQuestion - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ExamHeader
        timeLeft={formatTime}
        isTimerRunning={isRunning}
        isWarning={isWarning}
        isCritical={isCritical}
        currentQuestion={currentQuestion}
        totalQuestions={activeQuestions.length}
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
          totalQuestions={activeQuestions.length}
          onPrevious={() => setCurrentQuestion(Math.max(1, currentQuestion - 1))}
          onNext={() => setCurrentQuestion(Math.min(activeQuestions.length, currentQuestion + 1))}
          onSubmit={finishExam}
          answeredQuestions={answeredQuestions}
          markedQuestions={markedQuestions}
        />
      </div>
    </div>
  );
};

export default Index;
