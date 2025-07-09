
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target, RotateCcw, Download } from 'lucide-react';
import { Question, ExamResult, UserAnswer } from '@/types/exam';

interface ExamResultsProps {
  result: ExamResult;
  questions: Question[];
  userAnswers: UserAnswer[];
  onRestart: () => void;
  onReviewAnswers: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  result,
  questions,
  userAnswers,
  onRestart,
  onReviewAnswers,
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const generateCertificate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 600);

    // Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 760, 560);

    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', 400, 120);

    // Content
    ctx.font = '20px Arial';
    ctx.fillText('This certifies that you have successfully completed', 400, 200);
    ctx.fillText('the Online Exam with a score of', 400, 240);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = result.passed ? '#16a34a' : '#dc2626';
    ctx.fillText(`${result.percentage}%`, 400, 300);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = '16px Arial';
    ctx.fillText(`Time: ${formatTime(result.timeSpent)}`, 400, 360);
    ctx.fillText(`Correct Answers: ${result.correctAnswers}/${questions.length}`, 400, 390);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 400, 450);

    // Download
    const link = document.createElement('a');
    link.download = 'exam-certificate.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            result.passed ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
          }`}>
            <Trophy className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {result.passed ? 'Congratulations!' : 'Better Luck Next Time!'}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {result.passed 
              ? 'You have successfully completed the exam.'
              : 'You can retake the exam to improve your score.'
            }
          </p>

          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-semibold">{result.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-semibold">{formatTime(result.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <Badge 
            variant={result.passed ? "default" : "destructive"}
            className="text-base px-4 py-2"
          >
            {result.passed ? 'PASSED' : 'FAILED'}
          </Badge>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Correct Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.correctAnswers}</div>
            <div className="text-sm text-muted-foreground">
              {((result.correctAnswers / questions.length) * 100).toFixed(1)}% accuracy
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Wrong Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.wrongAnswers}</div>
            <div className="text-sm text-muted-foreground">
              {((result.wrongAnswers / questions.length) * 100).toFixed(1)}% incorrect
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Time Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(result.timeSpent)}</div>
            <div className="text-sm text-muted-foreground">
              Avg: {formatTime(Math.floor(result.timeSpent / questions.length))} per question
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onReviewAnswers} variant="outline" className="flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Review Answers</span>
        </Button>
        
        <Button onClick={onRestart} className="flex items-center space-x-2">
          <RotateCcw className="w-4 h-4" />
          <span>Retake Exam</span>
        </Button>
        
        {result.passed && (
          <Button onClick={generateCertificate} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Certificate</span>
          </Button>
        )}
      </div>
    </div>
  );
};
