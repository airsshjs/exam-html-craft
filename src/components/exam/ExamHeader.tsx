
import React from 'react';
import { Clock, Settings, Moon, Sun, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamHeaderProps {
  timeLeft: string;
  isTimerRunning: boolean;
  isWarning: boolean;
  isCritical: boolean;
  currentQuestion: number;
  totalQuestions: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleTimer: () => void;
  onOpenSettings: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  timeLeft,
  isTimerRunning,
  isWarning,
  isCritical,
  currentQuestion,
  totalQuestions,
  darkMode,
  onToggleDarkMode,
  onToggleTimer,
  onOpenSettings,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Online Exam System
            </h1>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestion} of {totalQuestions}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
              isCritical ? 'bg-destructive/10 border-destructive text-destructive' :
              isWarning ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600' :
              'bg-muted'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{timeLeft}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleTimer}
                className="h-6 w-6 p-0"
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onOpenSettings}>
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onToggleDarkMode}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
