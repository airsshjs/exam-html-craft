import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, ArrowLeft, Save } from 'lucide-react';
import { Question } from '@/types/exam';

interface TestCreatorProps {
  onBack: () => void;
  onSave: (questions: Question[], testName: string, timeLimit: number) => void;
}

export const TestCreator = ({ onBack, onSave }: TestCreatorProps) => {
  const [testName, setTestName] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'easy',
    category: ''
  });

  const addQuestion = () => {
    if (currentQuestion.text && currentQuestion.options?.every(opt => opt.trim())) {
      const newQuestion: Question = {
        id: questions.length + 1,
        text: currentQuestion.text,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer || 0,
        explanation: currentQuestion.explanation || '',
        difficulty: currentQuestion.difficulty as 'easy' | 'medium' | 'hard',
        category: currentQuestion.category || 'General'
      };
      
      setQuestions([...questions, newQuestion]);
      setCurrentQuestion({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'easy',
        category: ''
      });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || ['', '', '', ''])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSave = () => {
    if (testName && questions.length > 0) {
      onSave(questions, testName, timeLimit);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create New Test</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Settings */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    min="1"
                    max="180"
                  />
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">Questions: {questions.length}</p>
                  <Button 
                    onClick={handleSave} 
                    className="w-full mt-2"
                    disabled={!testName || questions.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Test
                  </Button>
                </div>
              </div>
            </Card>

            {/* Questions List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Questions ({questions.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {questions.map((q, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{q.text}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">{q.difficulty}</Badge>
                        <Badge variant="outline" className="text-xs">{q.category}</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeQuestion(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Question Creator */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Add Question</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    value={currentQuestion.text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty</Label>
                    <Select 
                      value={currentQuestion.difficulty} 
                      onValueChange={(value: 'easy' | 'medium' | 'hard') => setCurrentQuestion({ ...currentQuestion, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={currentQuestion.category}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, category: e.target.value })}
                      placeholder="e.g., Math, Science, History"
                    />
                  </div>
                </div>

                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                          className="text-primary"
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Select the radio button next to the correct answer</p>
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={currentQuestion.explanation}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                    placeholder="Explain why this is the correct answer..."
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={addQuestion}
                  disabled={!currentQuestion.text || !currentQuestion.options?.every(opt => opt.trim())}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};