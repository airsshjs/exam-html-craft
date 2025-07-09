
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  answeredQuestions: Set<number>;
  markedQuestions: Set<number>;
}

export const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  answeredQuestions,
  markedQuestions,
}) => {
  const isLastQuestion = currentQuestion === totalQuestions;
  const canSubmit = answeredQuestions.size > 0;

  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
      {/* Question Grid */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-medium mb-3 text-sm text-muted-foreground">Question Overview</h3>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`w-8 h-8 rounded text-xs font-medium border transition-colors ${
                num === currentQuestion
                  ? 'bg-primary text-primary-foreground border-primary'
                  : answeredQuestions.has(num)
                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                  : markedQuestions.has(num)
                  ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                  : 'bg-muted hover:bg-muted/80 border-border'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500/20 border border-green-500/20 rounded"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/20 rounded"></div>
            <span>Marked</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-muted border border-border rounded"></div>
            <span>Not Visited</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onPrevious}
          disabled={currentQuestion === 1}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-3">
          {isLastQuestion ? (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              <Send className="w-4 h-4" />
              <span>Submit Exam</span>
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
