import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type ExamSubmissionFormProps = {
  examId: string;
  onSubmit: (answers: Record<string, string>) => void;
  totalQuestions: number;
};

const ExamSubmissionForm = ({ examId, onSubmit, totalQuestions }: ExamSubmissionFormProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Get or set the exam start time
    if (!localStorage.getItem('examStartTime')) {
      localStorage.setItem('examStartTime', Date.now().toString());
    }
    
    // Store user info for tracking
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (!userEmail || !userName) {
      toast({
        title: "User information missing",
        description: "Please log in again to take this exam.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [navigate]);

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Submit the exam
  const handleSubmit = () => {
    // Add timestamp
    const submissionTime = new Date().toISOString();
    localStorage.setItem('examSubmissionTime', submissionTime);
    
    // Calculate time spent
    const startTime = localStorage.getItem('examStartTime');
    const timeSpent = startTime ? Date.now() - parseInt(startTime, 10) : 0;
    localStorage.setItem('examTimeSpent', timeSpent.toString());
    
    // Call the onSubmit function from props
    onSubmit(answers);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div key={index} className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Question {index + 1}</h3>
            <textarea 
              className="w-full p-2 border rounded-md" 
              rows={3}
              placeholder="Enter your answer here..."
              value={answers[`q${index + 1}`] || ''}
              onChange={(e) => handleAnswerChange(`q${index + 1}`, e.target.value)}
            />
          </div>
        ))}
      </div>
      
      <Button 
        onClick={handleSubmit}
        className="w-full"
      >
        Submit Exam
      </Button>
    </div>
  );
};

export default ExamSubmissionForm;