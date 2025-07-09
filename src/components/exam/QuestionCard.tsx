
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, FlagOff } from 'lucide-react';
import { Question } from '@/types/exam';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  isMarkedForReview: boolean;
  onSelectOption: (option: number) => void;
  onToggleReview: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isMarkedForReview,
  onSelectOption,
  onToggleReview,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Badge variant="secondary">{question.category}</Badge>
          </div>
          
          <Button
            variant={isMarkedForReview ? "default" : "outline"}
            size="sm"
            onClick={onToggleReview}
            className="flex items-center space-x-1"
          >
            {isMarkedForReview ? <Flag className="w-4 h-4" /> : <FlagOff className="w-4 h-4" />}
            <span>{isMarkedForReview ? 'Marked' : 'Mark for Review'}</span>
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium leading-relaxed mb-4">{question.text}</h2>
          {question.image && (
            <div className="mb-4">
              <img
                src={question.image}
                alt="Question illustration"
                className="max-w-full h-auto rounded-lg border"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onSelectOption(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:border-primary/50 ${
                selectedOption === index
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === index
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground'
                }`}>
                  <span className="text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
