import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit2, Trash2, Download, Upload, Eye, FileText, Image, CheckCircle, AlertCircle, Moon, Sun, Sparkles, Zap, BookOpen, Clock, Users, Award, TrendingUp, BarChart3, PieChart, Target, Layers, Globe } from "lucide-react";

interface Question {
  id: string;
  question: string;
  questionImageUrl?: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  explanationImageUrl?: string;
}

interface ExamData {
  title: string;
  description: string;
  timeLimit: number;
  questions: Question[];
}

const Index = () => {
  const [examData, setExamData] = useState<ExamData>({
    title: "",
    description: "",
    timeLimit: 60,
    questions: []
  });

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      questionImageUrl: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      explanationImageUrl: ""
    };
    setEditingQuestion(newQuestion);
    setIsEditDialogOpen(true);
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
    setIsEditDialogOpen(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive"
      });
      return;
    }

    if (editingQuestion.options.some(opt => !opt.trim())) {
      toast({
        title: "Error",
        description: "All options must be filled",
        variant: "destructive"
      });
      return;
    }

    setExamData(prev => {
      const existingIndex = prev.questions.findIndex(q => q.id === editingQuestion.id);
      if (existingIndex >= 0) {
        const updated = [...prev.questions];
        updated[existingIndex] = editingQuestion;
        return { ...prev, questions: updated };
      } else {
        return { ...prev, questions: [...prev.questions, editingQuestion] };
      }
    });

    setIsEditDialogOpen(false);
    setEditingQuestion(null);
    toast({
      title: "Success",
      description: "Question saved successfully"
    });
  };

  const deleteQuestion = (id: string) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    toast({
      title: "Success",
      description: "Question deleted successfully"
    });
  };

  const parseBulkImport = (text: string): Question[] => {
    const questions: Question[] = [];
    const sections = text.split(/---+/).filter(section => section.trim());

    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      let questionText = "";
      let questionImageUrl = "";
      const options: string[] = [];
      let correctAnswer = 0;
      let explanation = "";
      let explanationImageUrl = "";

      let currentLine = 0;

      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if (line && !line.match(/^[a-d]\)/) && !line.startsWith('http') && !line.includes('image:') && !line.includes('img:')) {
          questionText = line.replace(/^\d+\.\s*/, "");
          currentLine++;
          break;
        }
        currentLine++;
      }

      // Check for question image
      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if (line.startsWith('http') || line.includes('image:') || line.includes('img:')) {
          if (!line.toLowerCase().includes('explanation')) {
            questionImageUrl = line.replace(/^(image:|img:)\s*/i, '');
            currentLine++;
            break;
          }
        }
        if (line.match(/^[a-d]\)/)) {
          break;
        }
        currentLine++;
      }

      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if (line.match(/^[a-d]\)/)) {
          const optionText = line.substring(2).trim();
          const isBold = line.includes('**') || optionText.startsWith('**') || optionText.endsWith('**');
          
          if (isBold) {
            correctAnswer = options.length;
            options.push(optionText.replace(/\*\*/g, ''));
          } else {
            options.push(optionText);
          }
          currentLine++;
        } else if (line.startsWith('👉') || line.toLowerCase().includes('explanation')) {
          explanation = line.replace(/^👉\s*/, '').replace(/^explanation:\s*/i, '');
          currentLine++;
          break;
        } else {
          currentLine++;
        }
      }

      while (currentLine < lines.length) {
        const line = lines[currentLine].trim();
        if ((line.startsWith('http') || line.includes('image:') || line.includes('img:')) && line.toLowerCase().includes('explanation')) {
          explanationImageUrl = line.replace(/^(image:|img:)\s*/i, '');
          break;
        }
        currentLine++;
      }

      if (questionText && options.length >= 2) {
        questions.push({
          id: `bulk_${Date.now()}_${index}`,
          question: questionText,
          questionImageUrl,
          options: options.length < 4 ? [...options, ...Array(4 - options.length).fill("")] : options.slice(0, 4),
          correctAnswer,
          explanation,
          explanationImageUrl
        });
      }
    });

    return questions;
  };

  const handleBulkImportPreview = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "Error",
        description: "Please enter questions to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const parsed = parseBulkImport(bulkImportText);
      if (parsed.length === 0) {
        toast({
          title: "Error",
          description: "No valid questions found. Please check the format.",
          variant: "destructive"
        });
        return;
      }
      setPreviewQuestions(parsed);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse questions. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const confirmBulkImport = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, ...previewQuestions]
    }));
    setBulkImportText("");
    setPreviewQuestions([]);
    setShowPreview(false);
    setIsBulkImportOpen(false);
    toast({
      title: "Success",
      description: `${previewQuestions.length} questions imported successfully`
    });
  };

  const generateHTMLExam = (): string => {
    const questionsJSON = JSON.stringify(examData.questions);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${examData.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
            animation: slideIn 0.8s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 15px;
            font-weight: 300;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.95;
            position: relative;
            z-index: 2;
        }
        
        .timer {
            background: rgba(255,255,255,0.2);
            padding: 20px;
            border-radius: 15px;
            margin-top: 25px;
            font-size: 1.8em;
            font-weight: bold;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px;
        }
        
        .start-screen, .exam-screen, .results-screen {
            text-align: center;
        }
        
        .start-screen h2 {
            color: #333;
            margin-bottom: 25px;
            font-size: 2.5em;
            font-weight: 300;
        }
        
        .exam-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            text-align: left;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .exam-info h3 {
            color: #495057;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .info-item {
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
            border-left: 5px solid #007bff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: transform 0.2s ease;
        }
        
        .info-item:hover {
            transform: translateX(5px);
        }
        
        .question-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 35px;
            border-radius: 20px;
            margin: 30px 0;
            text-align: left;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }
        
        .question-number {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.1em;
            box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }
        
        .question-text {
            font-size: 1.3em;
            color: #333;
            margin: 25px 0;
            line-height: 1.7;
            font-weight: 500;
        }
        
        .question-image {
            max-width: 100%;
            height: auto;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        
        .question-image:hover {
            transform: scale(1.02);
        }
        
        .options {
            margin: 30px 0;
        }
        
        .option {
            background: white;
            border: 3px solid #e9ecef;
            border-radius: 15px;
            padding: 20px;
            margin: 15px 0;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .option::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.5s ease;
        }
        
        .option:hover::before {
            left: 100%;
        }
        
        .option:hover {
            border-color: #007bff;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,123,255,0.2);
        }
        
        .option.selected {
            border-color: #007bff;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,123,255,0.3);
        }
        
        .option.correct {
            border-color: #28a745;
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        }
        
        .option.incorrect {
            border-color: #dc3545;
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        }
        
        .option-letter {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            font-weight: bold;
            font-size: 1.1em;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        }
        
        .option.selected .option-letter {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
        
        .option.correct .option-letter {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        }
        
        .option.incorrect .option-letter {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
        
        .explanation {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 2px solid #ffc107;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            border-left: 6px solid #ffc107;
            box-shadow: 0 5px 15px rgba(255,193,7,0.2);
        }
        
        .explanation h4 {
            color: #856404;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .explanation-image {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin-top: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 40px 0;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        .btn {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 1.1em;
            font-weight: 600;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 5px 15px rgba(0,123,255,0.3);
            position: relative;
            overflow: hidden;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }
        
        .btn:hover::before {
            left: 100%;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0,123,255,0.4);
        }
        
        .btn:active {
            transform: translateY(-1px);
        }
        
        .btn:disabled {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .btn:disabled:hover {
            transform: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
            box-shadow: 0 5px 15px rgba(40,167,69,0.3);
        }
        
        .btn-success:hover {
            box-shadow: 0 10px 25px rgba(40,167,69,0.4);
        }
        
        .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            box-shadow: 0 5px 15px rgba(108,117,125,0.3);
        }
        
        .btn-secondary:hover {
            box-shadow: 0 10px 25px rgba(108,117,125,0.4);
        }
        
        .results-summary {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 35px;
            border-radius: 20px;
            margin: 30px 0;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .score {
            font-size: 4em;
            font-weight: bold;
            margin: 30px 0;
            text-shadow: 0 3px 10px rgba(0,0,0,0.2);
            animation: scoreAnimation 1s ease-out;
        }
        
        @keyframes scoreAnimation {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .score.excellent { 
            color: #28a745;
            background: linear-gradient(135deg, #28a745, #20c997);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .score.good { 
            color: #17a2b8;
            background: linear-gradient(135deg, #17a2b8, #20c997);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .score.average { 
            color: #ffc107;
            background: linear-gradient(135deg, #ffc107, #fd7e14);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .score.poor { 
            color: #dc3545;
            background: linear-gradient(135deg, #dc3545, #e83e8c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hidden {
            display: none;
        }
        
        .progress-bar {
            background: #e9ecef;
            height: 10px;
            border-radius: 10px;
            margin: 25px 0;
            overflow: hidden;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .progress-fill {
            background: linear-gradient(90deg, #007bff, #00f2fe);
            height: 100%;
            transition: width 0.5s ease;
            box-shadow: 0 2px 10px rgba(0,123,255,0.3);
        }
        
        .interactive-pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
            }
            70% {
                box-shadow: 0 0 0 20px rgba(0, 123, 255, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
            }
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header {
                padding: 25px;
            }
            
            .header h1 {
                font-size: 2.2em;
            }
            
            .content {
                padding: 25px;
            }
            
            .navigation {
                flex-direction: column;
                gap: 15px;
            }
            
            .btn {
                width: 100%;
                text-align: center;
            }
            
            .question-container {
                padding: 25px;
            }
            
            .option {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${examData.title}</h1>
            <p>${examData.description}</p>
            <div class="timer hidden" id="timer">
                Time Remaining: <span id="time-display">${examData.timeLimit}:00</span>
            </div>
        </div>
        
        <div class="content">
            <div class="start-screen" id="start-screen">
                <h2>Welcome to the Exam</h2>
                <div class="exam-info">
                    <h3>📋 Exam Information</h3>
                    <div class="info-item">
                        <strong>📚 Total Questions:</strong> ${examData.questions.length}
                    </div>
                    <div class="info-item">
                        <strong>⏰ Time Limit:</strong> ${examData.timeLimit} minutes
                    </div>
                    <div class="info-item">
                        <strong>📖 Instructions:</strong> 
                        <ul style="margin-top: 15px; padding-left: 25px; line-height: 1.6;">
                            <li>Read each question carefully</li>
                            <li>Select the best answer for each question</li>
                            <li>You can navigate between questions</li>
                            <li>Submit your exam before time runs out</li>
                            <li>Review your answers in the final results</li>
                        </ul>
                    </div>
                </div>
                <button class="btn interactive-pulse" onclick="startExam()">🚀 Start Exam</button>
            </div>
            
            <div class="exam-screen hidden" id="exam-screen">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                </div>
                
                <div class="question-container" id="question-container">
                </div>
                
                <div class="navigation">
                    <button class="btn btn-secondary" id="prev-btn" onclick="previousQuestion()" disabled>← Previous</button>
                    <span id="question-info" style="font-weight: bold; color: #495057;">Question 1 of ${examData.questions.length}</span>
                    <button class="btn" id="next-btn" onclick="nextQuestion()">Next →</button>
                    <button class="btn btn-success hidden" id="submit-btn" onclick="submitExam()">✅ Submit Exam</button>
                </div>
            </div>
            
            <div class="results-screen hidden" id="results-screen">
                <h2>🎉 Exam Results</h2>
                <div class="results-summary">
                    <div class="score" id="final-score">0%</div>
                    <div id="score-details"></div>
                </div>
                <div id="detailed-results"></div>
                <button class="btn interactive-pulse" onclick="restartExam()">🔄 Retake Exam</button>
            </div>
        </div>
    </div>

    <script>
        const questions = ${questionsJSON};
        let currentQuestion = 0;
        let userAnswers = {};
        let timeRemaining = ${examData.timeLimit} * 60;
        let timerInterval;
        let examStarted = false;

        function startExam() {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('exam-screen').classList.remove('hidden');
            document.getElementById('timer').classList.remove('hidden');
            examStarted = true;
            startTimer();
            loadQuestion();
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    submitExam();
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const timeDisplay = document.getElementById('time-display');
            timeDisplay.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            
            // Add urgency styling when time is low
            if (timeRemaining <= 300) { // 5 minutes
                timeDisplay.style.color = '#dc3545';
                timeDisplay.style.animation = 'pulse 1s infinite';
            }
        }

        function loadQuestion() {
            const question = questions[currentQuestion];
            const container = document.getElementById('question-container');
            
            let questionImageHtml = '';
            if (question.questionImageUrl) {
                questionImageHtml = \`<img src="\${question.questionImageUrl}" alt="Question Image" class="question-image">\`;
            }
            
            let explanationHtml = '';
            if (question.explanation) {
                explanationHtml = \`
                    <div class="explanation hidden" id="explanation-\${currentQuestion}">
                        <h4>💡 Explanation:</h4>
                        <p>\${question.explanation}</p>
                        \${question.explanationImageUrl ? \`<img src="\${question.explanationImageUrl}" alt="Explanation" class="explanation-image">\` : ''}
                    </div>
                \`;
            }
            
            container.innerHTML = \`
                <div class="question-header">
                    <div class="question-number">Question \${currentQuestion + 1}</div>
                </div>
                <div class="question-text">\${question.question}</div>
                \${questionImageHtml}
                <div class="options">
                    \${question.options.map((option, index) => \`
                        <div class="option" onclick="selectAnswer(\${index})" id="option-\${index}">
                            <div class="option-letter">\${String.fromCharCode(65 + index)}</div>
                            <span>\${option}</span>
                        </div>
                    \`).join('')}
                </div>
                \${explanationHtml}
            \`;
            
            if (userAnswers[currentQuestion] !== undefined) {
                document.getElementById(\`option-\${userAnswers[currentQuestion]}\`).classList.add('selected');
            }
            
            updateNavigation();
            updateProgress();
        }

        function selectAnswer(optionIndex) {
            // Add selection animation
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
                opt.style.transform = 'scale(1)';
            });
            
            const selectedOption = document.getElementById(\`option-\${optionIndex}\`);
            selectedOption.classList.add('selected');
            selectedOption.style.transform = 'scale(1.02)';
            
            userAnswers[currentQuestion] = optionIndex;
            updateNavigation();
            
            // Add a subtle success feedback
            setTimeout(() => {
                selectedOption.style.transform = 'translateY(-2px)';
            }, 100);
        }

        function nextQuestion() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                loadQuestion();
                // Scroll to top smoothly
                document.querySelector('.question-container').scrollIntoView({ behavior: 'smooth' });
            }
        }

        function previousQuestion() {
            if (currentQuestion > 0) {
                currentQuestion--;
                loadQuestion();
                // Scroll to top smoothly
                document.querySelector('.question-container').scrollIntoView({ behavior: 'smooth' });
            }
        }

        function updateNavigation() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const submitBtn = document.getElementById('submit-btn');
            const questionInfo = document.getElementById('question-info');
            
            prevBtn.disabled = currentQuestion === 0;
            
            if (currentQuestion === questions.length - 1) {
                nextBtn.classList.add('hidden');
                submitBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                submitBtn.classList.add('hidden');
            }
            
            questionInfo.textContent = \`Question \${currentQuestion + 1} of \${questions.length}\`;
        }

        function updateProgress() {
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            const progressFill = document.getElementById('progress-fill');
            progressFill.style.width = progress + '%';
            
            // Add completion milestones
            if (progress === 25) {
                showMilestone('🎯 25% Complete!');
            } else if (progress === 50) {
                showMilestone('💪 Halfway There!');
            } else if (progress === 75) {
                showMilestone('🔥 Almost Done!');
            }
        }

        function showMilestone(message) {
            const milestone = document.createElement('div');
            milestone.textContent = message;
            milestone.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                font-weight: bold;
                box-shadow: 0 10px 30px rgba(40,167,69,0.3);
                z-index: 1000;
                animation: slideInRight 0.5s ease-out;
            \`;
            
            document.body.appendChild(milestone);
            
            setTimeout(() => {
                milestone.style.animation = 'slideOutRight 0.5s ease-out';
                setTimeout(() => milestone.remove(), 500);
            }, 3000);
        }

        function submitExam() {
            clearInterval(timerInterval);
            calculateResults();
            showResults();
        }

        function calculateResults() {
            let correct = 0;
            const totalQuestions = questions.length;
            
            for (let i = 0; i < totalQuestions; i++) {
                if (userAnswers[i] === questions[i].correctAnswer) {
                    correct++;
                }
            }
            
            const percentage = Math.round((correct / totalQuestions) * 100);
            
            const scoreElement = document.getElementById('final-score');
            scoreElement.textContent = percentage + '%';
            
            if (percentage >= 90) scoreElement.className = 'score excellent';
            else if (percentage >= 75) scoreElement.className = 'score good';
            else if (percentage >= 60) scoreElement.className = 'score average';
            else scoreElement.className = 'score poor';
            
            document.getElementById('score-details').innerHTML = \`
                <p style="font-size: 1.2em; margin: 10px 0;"><strong>✅ Correct Answers:</strong> \${correct} out of \${totalQuestions}</p>
                <p style="font-size: 1.2em; margin: 10px 0;"><strong>📊 Percentage:</strong> \${percentage}%</p>
                <p style="font-size: 1.2em; margin: 10px 0;"><strong>🏆 Grade:</strong> \${getGrade(percentage)}</p>
            \`;
            
            generateDetailedResults();
        }

        function getGrade(percentage) {
            if (percentage >= 90) return 'A+ (Excellent!)';
            if (percentage >= 80) return 'A (Great Job!)';
            if (percentage >= 70) return 'B (Good Work!)';
            if (percentage >= 60) return 'C (Keep Improving!)';
            if (percentage >= 50) return 'D (Need More Practice)';
            return 'F (Study More Required)';
        }

        function generateDetailedResults() {
            const detailedResults = document.getElementById('detailed-results');
            let html = '<h3 style="margin: 30px 0 20px 0; color: #495057;">📝 Detailed Review</h3>';
            
            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                let questionImageHtml = '';
                if (question.questionImageUrl) {
                    questionImageHtml = \`<img src="\${question.questionImageUrl}" alt="Question Image" class="question-image" style="max-width: 100%; margin: 15px 0;">\`;
                }
                
                html += \`
                    <div class="question-container" style="margin: 20px 0;">
                        <div class="question-header">
                            <div class="question-number">Question \${index + 1}</div>
                            <div style="color: \${isCorrect ? '#28a745' : '#dc3545'}; font-weight: bold; font-size: 1.1em;">
                                \${isCorrect ? '✅ Correct' : '❌ Incorrect'}
                            </div>
                        </div>
                        <div class="question-text">\${question.question}</div>
                        \${questionImageHtml}
                        <div class="options">
                            \${question.options.map((option, optIndex) => {
                                let className = 'option';
                                if (optIndex === question.correctAnswer) className += ' correct';
                                else if (optIndex === userAnswer && userAnswer !== question.correctAnswer) className += ' incorrect';
                                
                                let label = '';
                                if (optIndex === userAnswer) label += ' (Your Answer)';
                                if (optIndex === question.correctAnswer) label += ' (Correct Answer)';
                                
                                return \`
                                    <div class="\${className}" style="cursor: default;">
                                        <div class="option-letter">\${String.fromCharCode(65 + optIndex)}</div>
                                        <span>\${option}\${label}</span>
                                    </div>
                                \`;
                            }).join('')}
                        </div>
                        \${question.explanation ? \`
                            <div class="explanation">
                                <h4>💡 Explanation:</h4>
                                <p>\${question.explanation}</p>
                                \${question.explanationImageUrl ? \`<img src="\${question.explanationImageUrl}" alt="Explanation" class="explanation-image">\` : ''}
                            </div>
                        \` : ''}
                    </div>
                \`;
            });
            
            detailedResults.innerHTML = html;
        }

        function showResults() {
            document.getElementById('exam-screen').classList.add('hidden');
            document.getElementById('results-screen').classList.remove('hidden');
            document.getElementById('timer').classList.add('hidden');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function restartExam() {
            currentQuestion = 0;
            userAnswers = {};
            timeRemaining = ${examData.timeLimit} * 60;
            examStarted = false;
            
            document.getElementById('results-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            document.getElementById('timer').classList.add('hidden');
            
            clearInterval(timerInterval);
            
            // Reset timer display
            document.getElementById('time-display').textContent = '${examData.timeLimit}:00';
            document.getElementById('time-display').style.color = '';
            document.getElementById('time-display').style.animation = '';
        }

        // Prevent accidental page leaving
        window.addEventListener('beforeunload', function(e) {
            if (examStarted && !document.getElementById('results-screen').classList.contains('hidden')) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
            }
        });

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`;
  };

  const exportExam = () => {
    if (!examData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter exam title before exporting",
        variant: "destructive"
      });
      return;
    }

    if (examData.questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question before exporting",
        variant: "destructive"
      });
      return;
    }

    try {
      const htmlContent = generateHTMLExam();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const exportFileDefaultName = `${examData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_exam.html`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "HTML exam exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export exam. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCompletionPercentage = () => {
    if (examData.questions.length === 0) return 0;
    const filledFields = [
      examData.title.trim() ? 1 : 0,
      examData.description.trim() ? 1 : 0,
      examData.questions.length > 0 ? 1 : 0
    ].reduce((sum, val) => sum + val, 0);
    return Math.round((filledFields / 3) * 100);
  };

  const getStatCards = () => [
    {
      title: "Total Questions",
      value: examData.questions.length,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Estimated Duration",
      value: `${examData.timeLimit} min`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Completion Rate",
      value: `${getCompletionPercentage()}%`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Ready to Export",
      value: examData.title && examData.questions.length > 0 ? "Yes" : "No",
      icon: Award,
      color: examData.title && examData.questions.length > 0 ? "text-emerald-600" : "text-red-600",
      bgColor: examData.title && examData.questions.length > 0 ? "bg-emerald-50" : "bg-red-50"
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Dark Mode Toggle */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
              <Sun className="h-4 w-4 text-yellow-500" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-blue-400 animate-ping">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
              ExamCraft Pro
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium animate-fade-in">
            Create professional, interactive HTML exams with advanced features
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-sm hover-scale">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="text-sm hover-scale">
              <Globe className="h-3 w-3 mr-1" />
              Cross-Platform
            </Badge>
            <Badge variant="secondary" className="text-sm hover-scale">
              <Layers className="h-3 w-3 mr-1" />
              Professional
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getStatCards().map((stat, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover-scale cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} transition-transform duration-300 hover:scale-110`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Setup Progress</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{getCompletionPercentage()}%</span>
            </div>
            <Progress value={getCompletionPercentage()} className="h-3 transition-all duration-500" />
          </CardContent>
        </Card>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white dark:bg-gray-800 shadow-lg border-0 rounded-xl">
            <TabsTrigger value="setup" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 rounded-lg">
              <FileText className="h-4 w-4" />
              Exam Setup
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 rounded-lg">
              <BookOpen className="h-4 w-4" />
              Questions ({examData.questions.length})
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300 rounded-lg">
              <Download className="h-4 w-4" />
              Export & Deploy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exam Configuration
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Set up your exam details and parameters for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Exam Title *</Label>
                      <Input
                        id="title"
                        value={examData.title}
                        onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter a compelling exam title"
                        className="mt-1 h-12 transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeLimit" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={examData.timeLimit}
                        onChange={(e) => setExamData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                        min="1"
                        max="480"
                        className="mt-1 h-12 transition-all duration-300 focus:scale-105"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={examData.description}
                      onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide detailed instructions and context for your exam"
                      rows={6}
                      className="mt-1 resize-none transition-all duration-300 focus:scale-105"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Question Bank</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your exam questions with ease</p>
                </div>
                <div className="flex gap-3">
                  <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 h-11 hover-scale">
                        <Upload className="w-4 h-4" />
                        Bulk Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Bulk Import Questions
                        </DialogTitle>
                        <DialogDescription>
                          Import multiple questions at once using our smart format parser
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!showPreview ? (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Format Example
                            </h4>
                            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded border">
{`1. By the time we reached the station, the train ___.
Image: https://example.com/question-image.jpg
a) leave
b) **had left**
c) has left
d) was leaving
👉 Explanation: Past perfect ("had left") is used for an action completed before another past action.
Explanation Image: https://example.com/explanation-image.jpg

---

2. She ___ in Delhi for five years before she moved to Mumbai.
a) is living
b) **had lived**
c) lives
d) has lived
👉 Explanation: Past perfect shows the earlier past action before "moved."

---`}
                            </pre>
                          </div>
                          
                          <div>
                            <Label htmlFor="bulkText" className="text-sm font-semibold">Paste your questions here:</Label>
                            <Textarea
                              id="bulkText"
                              value={bulkImportText}
                              onChange={(e) => setBulkImportText(e.target.value)}
                              placeholder="Paste your questions in the format shown above..."
                              rows={20}
                              className="font-mono text-sm mt-2"
                            />
                          </div>
                          
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleBulkImportPreview} className="gap-2">
                              <Eye className="w-4 h-4" />
                              Preview Questions
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-lg">Preview ({previewQuestions.length} questions found)</h4>
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                              Back to Edit
                            </Button>
                          </div>
                          
                          <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                            {previewQuestions.map((question, index) => (
                              <Card key={question.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                      <Badge variant="secondary" className="mt-1">{index + 1}</Badge>
                                      <p className="font-medium text-gray-900 dark:text-white">{question.question}</p>
                                    </div>
                                    
                                    {question.questionImageUrl && (
                                      <div className="ml-8 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div className="flex items-center gap-2">
                                          <Image className="w-4 h-4 text-gray-600" />
                                          <span className="text-sm text-blue-600 underline break-all">{question.questionImageUrl}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-1 gap-2 ml-8">
                                      {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                                          optIndex === question.correctAnswer 
                                            ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                            : 'bg-gray-50 dark:bg-gray-800'
                                        }`}>
                                          {optIndex === question.correctAnswer && <CheckCircle className="w-4 h-4 text-green-600" />}
                                          <span className="font-medium text-sm">{String.fromCharCode(97 + optIndex)})</span>
                                          <span className="text-sm">{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    {question.explanation && (
                                      <div className="ml-8 mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-l-blue-400">
                                        <div className="flex items-start gap-2">
                                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {question.explanationImageUrl && (
                                      <div className="ml-8 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <div className="flex items-center gap-2">
                                          <Image className="w-4 h-4 text-gray-600" />
                                          <span className="text-sm text-blue-600 underline break-all">{question.explanationImageUrl}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={confirmBulkImport} className="gap-2">
                              <Plus className="w-4 h-4" />
                              Import {previewQuestions.length} Questions
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button onClick={addNewQuestion} className="gap-2 h-11 hover-scale">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>
              </div>

              {examData.questions.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-all duration-300">
                  <CardContent className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 hover-scale">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No questions yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Start building your exam by adding questions manually or use our bulk import feature for faster setup
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={addNewQuestion} className="gap-2 hover-scale">
                        <Plus className="w-4 h-4" />
                        Add First Question
                      </Button>
                      <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="gap-2 hover-scale">
                        <Upload className="w-4 h-4" />
                        Bulk Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {examData.questions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover-scale">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Badge variant="outline" className="text-lg px-3 py-1 font-bold">
                              {index + 1}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white mb-3 leading-relaxed">
                                {question.question}
                              </p>
                              
                              {question.questionImageUrl && (
                                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    <span className="text-sm text-blue-600 underline break-all">
                                      {question.questionImageUrl}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className={`p-3 rounded-lg border-2 transition-all ${
                                    optIndex === question.correctAnswer 
                                      ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                  }`}>
                                    <div className="flex items-center gap-2">
                                      {optIndex === question.correctAnswer && (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      )}
                                      <span className="font-bold text-sm">
                                        {String.fromCharCode(97 + optIndex)})
                                      </span>
                                      <span className="text-sm">{option}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {question.explanation && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-l-blue-400">
                                  <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Explanation:</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{question.explanation}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {question.explanationImageUrl && (
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    <span className="text-sm text-blue-600 underline break-all">
                                      {question.explanationImageUrl}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => editQuestion(question)} className="gap-1 hover-scale">
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover-scale">
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteQuestion(question.id)} className="bg-red-600 hover:bg-red-700">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="export">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export & Deploy
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Generate your professional HTML exam file
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Exam Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Title:</span>
                          <p className="font-medium text-right max-w-[200px] truncate" title={examData.title}>
                            {examData.title || "Not set"}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                          <p className="font-medium">{examData.questions.length}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
                          <p className="font-medium">{examData.timeLimit} minutes</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <Badge variant={examData.title && examData.questions.length > 0 ? "default" : "secondary"} className="gap-1">
                            {examData.title && examData.questions.length > 0 ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Ready
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Incomplete
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Export Features
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Interactive question navigation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Real-time timer with auto-submit
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Question & explanation images
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Detailed results with explanations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Mobile-responsive design
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Professional animations & effects
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center space-y-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 hover-scale">
                        <Download className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Export?</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Generate a standalone HTML file that works anywhere
                      </p>
                    </div>

                    <Button 
                      onClick={exportExam}
                      disabled={!examData.title.trim() || examData.questions.length === 0}
                      size="lg"
                      className="w-full max-w-sm h-14 text-lg gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover-scale"
                    >
                      <Download className="w-5 h-5" />
                      Export HTML Exam
                    </Button>

                    {(!examData.title.trim() || examData.questions.length === 0) && (
                      <p className="text-sm text-red-500 text-center">
                        Please complete exam setup and add questions before exporting
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Question Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5" />
                {editingQuestion?.id.includes('bulk_') || !examData.questions.find(q => q.id === editingQuestion?.id) 
                  ? 'Add New Question' : 'Edit Question'}
              </DialogTitle>
              <DialogDescription>
                Create engaging questions with multiple choice options, images, and detailed explanations
              </DialogDescription>
            </DialogHeader>
            
            {editingQuestion && (
              <div className="space-y-6 py-4">
                <div>
                  <Label htmlFor="questionText" className="text-sm font-semibold">Question Text *</Label>
                  <Textarea
                    id="questionText"
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, question: e.target.value } : null)}
                    placeholder="Enter your question here..."
                    rows={4}
                    className="mt-2 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="questionImage" className="text-sm font-semibold">Question Image URL (Optional)</Label>
                  <Input
                    id="questionImage"
                    value={editingQuestion.questionImageUrl || ""}
                    onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, questionImageUrl: e.target.value } : null)}
                    placeholder="https://example.com/question-image.jpg"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Add an image to accompany your question</p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Answer Options *</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {editingQuestion.options.map((option, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === editingQuestion.correctAnswer ? "default" : "outline"} className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </Badge>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...editingQuestion.options];
                              newOptions[index] = e.target.value;
                              setEditingQuestion(prev => prev ? { ...prev, options: newOptions } : null);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          <Button
                            variant={index === editingQuestion.correctAnswer ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditingQuestion(prev => prev ? { ...prev, correctAnswer: index } : null)}
                            className="gap-1 hover-scale"
                          >
                            {index === editingQuestion.correctAnswer ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Correct
                              </>
                            ) : (
                              "Mark Correct"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="explanation" className="text-sm font-semibold">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      value={editingQuestion.explanation || ""}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, explanation: e.target.value } : null)}
                      placeholder="Provide an explanation for the correct answer"
                      rows={4}
                      className="mt-2 resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="explanationImage" className="text-sm font-semibold">Explanation Image URL (Optional)</Label>
                    <Input
                      id="explanationImage"
                      value={editingQuestion.explanationImageUrl || ""}
                      onChange={(e) => setEditingQuestion(prev => prev ? { ...prev, explanationImageUrl: e.target.value } : null)}
                      placeholder="https://example.com/explanation-image.jpg"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Add an image to help explain the answer</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveQuestion} className="gap-2 hover-scale">
                    <CheckCircle className="w-4 h-4" />
                    Save Question
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
