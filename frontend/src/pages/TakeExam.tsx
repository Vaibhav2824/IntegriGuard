import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileUp, AlertTriangle, Clock, ChevronsLeft, ChevronsRight, Camera, Mic, CheckCircle, ShieldAlert, ArrowLeft } from "lucide-react";

// Mock data
const mockExam = {
  id: "1",
  title: "Midterm Examination",
  subject: "Mathematics",
  description: "Covers chapters 1-5 of the textbook",
  duration: 90, // in minutes
  totalQuestions: 5,
  questions: [
    {
      id: "q1",
      type: "multiple-choice",
      text: "What is the value of π (pi) rounded to two decimal places?",
      options: ["3.10", "3.14", "3.16", "3.18"],
      answer: "3.14",
    },
    {
      id: "q2",
      type: "multiple-choice",
      text: "If f(x) = 2x² + 3x - 5, what is f(2)?",
      options: ["7", "9", "11", "13"],
      answer: "9",
    },
    {
      id: "q3",
      type: "text",
      text: "Explain the Pythagorean theorem and provide an example.",
    },
    {
      id: "q4",
      type: "multiple-choice",
      text: "What is the derivative of x³?",
      options: ["x²", "2x²", "3x²", "3x"],
      answer: "3x²",
    },
    {
      id: "q5",
      type: "multiple-choice",
      text: "Solve the system of equations: 2x + y = 7 and 3x - 2y = 1.",
    },
  ],
};

type UserAnswer = {
  questionId: string;
  answer?: string;
  file?: File;
};

// Format time from seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Simplified media state type
type MediaState = {
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
};

// Risk weights for different behaviors
const RISK_WEIGHTS = {
  TAB_SWITCH: 15,
  INACTIVITY: 3,
  TYPING_SPEED: 5,
  MOUSE_BOUNDARY: 4  // New risk weight for mouse boundary violations
};

// Maximum allowed tab switches before termination warning
const MAX_TAB_SWITCHES = 2;
// Maximum allowed tab switches before auto-submission
const TERMINATION_TAB_SWITCHES = 3;
// Maximum risk score before auto-termination
const MAX_RISK_SCORE = 80;

// Maximum allowed typing speed (words per minute)
const MAX_TYPING_SPEED = 50;

const TakeExam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Core exam state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(mockExam.duration * 60);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isTimeWarningOpen, setIsTimeWarningOpen] = useState(false);
  const [isTabWarningOpen, setIsTabWarningOpen] = useState(false);
  const [isFullscreenWarningOpen, setIsFullscreenWarningOpen] = useState(false);
  const [examStartTime] = useState<number>(Date.now());
  const [studentId] = useState<string>(localStorage.getItem('userId') || localStorage.getItem('userEmail') || 'unknown');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Monitoring state
  const [tabSwitches, setTabSwitches] = useState(0);
  const [inactiveTime, setInactiveTime] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [riskScore, setRiskScore] = useState(0);
  const [mediaState, setMediaState] = useState<MediaState>({
    isCameraOn: false,
    isMicrophoneOn: false
  });
  
  // Add typing monitoring state
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingCharCount, setTypingCharCount] = useState(0);
  const [suspiciousTypingCount, setSuspiciousTypingCount] = useState(0);
  
  // Add mouse boundary violation tracking
  const [mouseBoundaryViolations, setMouseBoundaryViolations] = useState(0);
  
  // References for debouncing and counting - moved outside the effect
  const lastBoundaryWarningRef = useRef<number | null>(null);
  const boundaryApproachCountRef = useRef<number>(0);
  
  // Media refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Reference to the container element for fullscreen
  const examContainerRef = useRef<HTMLDivElement>(null);
  
  // Add a new state for the submission confirmation dialog
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] = useState(false);
  
  // Add a state to track if we're in the process of submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add a new state to track the final score for the confirmation dialog
  const [finalScore, setFinalScore] = useState(0);
  
  // Add a new state to track if we're in the submission process
  const [isExitingForSubmission, setIsExitingForSubmission] = useState(false);
  
  // Initialize user answers and exam start time
  useEffect(() => {
    const initialAnswers = mockExam.questions.map((q) => ({
      questionId: q.id,
      answer: "",
    }));
    setUserAnswers(initialAnswers);
    
    // Store exam info in localStorage
    localStorage.setItem('currentExamId', id || '1');
    localStorage.setItem('examStartTime', examStartTime.toString());
    localStorage.setItem('currentQuestionIndex', '0');
    
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        
        // Show warning when 5 minutes left
        if (prev === 300) {
          setIsTimeWarningOpen(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    // Request fullscreen mode when exam starts
    requestFullscreen();
    
    return () => {
      clearInterval(timer);
      // Clean up localStorage
        localStorage.removeItem('examStartTime');
      localStorage.removeItem('currentQuestionIndex');
      
      // Stop media streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, examStartTime, studentId]);
  
  // Track tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };

    // Handle Alt+Tab and other keyboard shortcuts for switching
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Alt+Tab (Alt key + Tab key)
      if (e.altKey && e.key === 'Tab') {
        handleTabSwitch();
      }
      
      // Also detect Windows key (Meta key) as it's often used to switch applications
      if (e.key === 'Meta') {
        handleTabSwitch();
      }
    };
    
    // Common function to handle tab switching
    const handleTabSwitch = () => {
      const newTabSwitches = tabSwitches + 1;
      setTabSwitches(newTabSwitches);
      
      // Handle tab switch warnings and termination
      if (newTabSwitches === MAX_TAB_SWITCHES) {
        // Show warning dialog
        setIsTabWarningOpen(true);
        toast({
          title: "Final Warning",
          description: "Switching tabs again will result in automatic exam submission.",
          variant: "destructive",
        });
      } else if (newTabSwitches >= TERMINATION_TAB_SWITCHES) {
        // Auto-submit exam after exceeding max tab switches
        toast({
          title: "Exam Terminated",
          description: "Your exam has been automatically submitted due to suspicious behavior.",
          variant: "destructive",
        });
        handleSubmit(true); // Pass true to indicate forced termination
      } else if (newTabSwitches > 1) {
        // Second warning as toast
        toast({
          title: "Warning",
          description: "Switching tabs during an exam is considered suspicious behavior.",
          variant: "destructive",
        });
      } else if (newTabSwitches === 1) {
        // First warning as toast
        toast({
          title: "First Warning",
          description: "Switching tabs is not allowed during the exam. This action has been recorded.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabSwitches, toast]);
  
  // Track user activity and inactivity
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;
      
      // If inactive for more than 10 seconds, count it as inactivity
      if (timeSinceLastActivity > 10000) {
        setInactiveTime(prev => prev + 1);
      }
      
      setLastActivityTime(now);
      clearTimeout(inactivityTimer);
      
      // Set up new timer
      inactivityTimer = setTimeout(() => {
        setInactiveTime(prev => prev + 1);
      }, 10000);
    };

    // Set up event listeners
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keypress', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('scroll', resetActivity);

    // Initial timer
    inactivityTimer = setTimeout(() => {
      setInactiveTime(prev => prev + 1);
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keypress', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('scroll', resetActivity);
      clearTimeout(inactivityTimer);
    };
  }, [lastActivityTime]);
  
  // Calculate risk score
  useEffect(() => {
    const calculateRisk = () => {
      let score = 0;
      
      // Tab switching risk
      score += tabSwitches * RISK_WEIGHTS.TAB_SWITCH;
      
      // Inactivity risk
      score += inactiveTime * RISK_WEIGHTS.INACTIVITY;
      
      // Typing speed risk
      score += suspiciousTypingCount * RISK_WEIGHTS.TYPING_SPEED;
      
      // Mouse boundary violations
      score += mouseBoundaryViolations * RISK_WEIGHTS.MOUSE_BOUNDARY;
      
      // Normalize score to 0-100 range
      const normalizedScore = Math.min(Math.round(score), 100);
      
      setRiskScore(normalizedScore);
      
      // Auto-terminate if risk score exceeds threshold
      if (normalizedScore >= MAX_RISK_SCORE) {
        toast({
          title: "Exam Terminated",
          description: "Your exam has been automatically submitted due to high risk score.",
          variant: "destructive",
        });
        handleSubmit(true); // Pass true to indicate forced termination
      }
    };
    
    // Update risk score every 5 seconds
    const riskInterval = setInterval(calculateRisk, 5000);
    
    // Initial calculation
    calculateRisk();
    
    return () => clearInterval(riskInterval);
  }, [tabSwitches, inactiveTime, suspiciousTypingCount, mouseBoundaryViolations]);
  
  // Add mouse boundary detection with improved parameters
  useEffect(() => {
    // Track when mouse approaches screen boundaries
    const handleMouseMove = (e: MouseEvent) => {
      const boundaryThreshold = 5; // Reduced from 10 to 5 pixels from edge
      const isNearBoundary = 
        e.clientX <= boundaryThreshold || // left edge
        e.clientY <= boundaryThreshold || // top edge
        e.clientX >= window.innerWidth - boundaryThreshold || // right edge
        e.clientY >= window.innerHeight - boundaryThreshold; // bottom edge
      
      // Only trigger if in fullscreen mode
      if (isNearBoundary && isFullscreen) {
        // Use a debounce mechanism to avoid multiple warnings for the same boundary approach
        const now = Date.now();
        if (!lastBoundaryWarningRef.current || now - lastBoundaryWarningRef.current > 5000) { // Only warn once every 5 seconds
          lastBoundaryWarningRef.current = now;
          
          // Increment violation count - but less aggressively
          // Only count every third boundary approach as a violation
          setMouseBoundaryViolations(prev => {
            // Increment internal counter
            boundaryApproachCountRef.current += 1;
            
            // Only increment violation count every 3 approaches
            if (boundaryApproachCountRef.current >= 3) {
              boundaryApproachCountRef.current = 0;
              return prev + 1;
            }
            return prev;
          });
          
          // Show warning toast - less intrusive
          toast({
            title: "Mouse Warning",
            description: "Please keep your cursor within the exam area.",
            variant: "default", // Changed from destructive to default for less alarming appearance
            duration: 2000, // Reduced from 3000 to 2000ms
          });
        }
      }
    };
    
    // Only add the listener if in fullscreen mode
    if (isFullscreen) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFullscreen, toast]);
  
  // Initialize camera and microphone
  const initializeMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaStreamRef.current = stream;
      
      setMediaState({
        isCameraOn: true,
        isMicrophoneOn: true
      });
      
      toast({
        title: "Media Connected",
        description: "Camera and microphone are now active.",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Media Access Error",
        description: "Please enable camera and microphone access to continue the exam.",
        variant: "destructive",
      });
    }
  };
  
  // Initialize media on component mount
  useEffect(() => {
    initializeMediaDevices();
  }, []);
  
  const currentQuestion = mockExam.questions[currentQuestionIndex];
  
  // Update the handleAnswerChange function to monitor typing speed
  const handleAnswerChange = (answer: string) => {
    const now = Date.now();
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex].answer = answer;
    setUserAnswers(newAnswers);
    
    // Only monitor typing speed for text questions
    if (currentQuestion.type === "text") {
      // If this is the first keystroke or there was a pause, reset the typing timer
      if (typingStartTime === null || now - typingStartTime > 5000) {
        setTypingStartTime(now);
        setTypingCharCount(answer.length);
        return;
      }
      
      // Calculate typing speed
      const timeElapsed = (now - typingStartTime) / 1000 / 60; // in minutes
      const charTyped = answer.length - typingCharCount;
      
      // Approximate words (5 characters = 1 word)
      const wordsTyped = charTyped / 5;
      
      // Words per minute
      const currentSpeed = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
      
      // Update typing speed
      setTypingSpeed(currentSpeed);
      
      // Check if typing speed is suspiciously fast
      if (currentSpeed > MAX_TYPING_SPEED && charTyped > 20) {
        // Increment suspicious typing count
        setSuspiciousTypingCount(prev => prev + 1);
        
        // Show warning
        toast({
          title: "Unusual Typing Speed Detected",
          description: "Your typing speed appears unusually fast. This may be flagged as suspicious behavior.",
          variant: "destructive",
        });
        
        // Reset typing monitor
        setTypingStartTime(now);
        setTypingCharCount(answer.length);
      }
      
      // Periodically reset the typing monitor to get fresh measurements
      if (timeElapsed > 0.5) { // Reset every 30 seconds
        setTypingStartTime(now);
        setTypingCharCount(answer.length);
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex].file = e.target.files[0];
      setUserAnswers(newAnswers);
    }
  };
  
  const handleNavigation = (direction: "next" | "prev") => {
    if (direction === "next" && currentQuestionIndex < mockExam.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      localStorage.setItem('currentQuestionIndex', newIndex.toString());
    } else if (direction === "prev" && currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      localStorage.setItem('currentQuestionIndex', newIndex.toString());
    }
  };
  
  const handleSubmit = (isForced = false) => {
    // If forced termination, skip the confirmation dialog
    if (isForced) {
      submitExam(true);
      return;
    }
    
    // Check for unanswered questions
    const unansweredCount = userAnswers.filter(
      (a) => !a.answer && !a.file
    ).length;
    
    if (unansweredCount > 0 && !isSubmitDialogOpen && tabSwitches <= MAX_TAB_SWITCHES) {
      setIsSubmitDialogOpen(true);
      return;
    }
    
    // Directly call submitExam
    submitExam(false);
  };
  
  // Update the submitExam function to ensure it works in fullscreen mode
  const submitExam = (wasTerminated = false) => {
    // Calculate score (in a real app this would compare against correct answers)
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100%
    
    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - examStartTime) / 60000); // in minutes
    
    try {
      // Save exam data first
      const userEmail = localStorage.getItem('userEmail') || 'unknown@example.com';
      const userName = localStorage.getItem('userName') || 'Unknown Student';
      
      // Get existing user data
      const userDataStr = localStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      
      // If this exam's data doesn't exist yet, create it
      if (!userData[id!]) {
        userData[id!] = {};
      }
      
      // Update or create user data for this exam
      userData[id!][userEmail] = {
        id: Date.now().toString(),
        name: userName,
        email: userEmail,
        score: score,
        timeSpent: timeSpent,
        submissionTime: new Date().toISOString(),
        riskScore: riskScore,
        status: wasTerminated ? 'terminated' : 'completed',
        tabSwitches: tabSwitches,
        wasTerminated: wasTerminated
      };
      
      // Save updated data back to localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('examSubmitted', 'true');
      
      // Clean up localStorage
      localStorage.removeItem('examStartTime');
      localStorage.removeItem('currentQuestionIndex');
      localStorage.removeItem('currentExamId');
      
      // If terminated, exit fullscreen and redirect immediately
      if (wasTerminated) {
        if (document.fullscreenElement) {
          try {
            document.exitFullscreen()
              .finally(() => {
                // Redirect to dashboard after a short delay
                setTimeout(() => navigate("/dashboard"), 1000);
              });
          } catch (error) {
            console.error("Error exiting fullscreen:", error);
            // Redirect anyway
            setTimeout(() => navigate("/dashboard"), 1000);
          }
        } else {
          // Redirect to dashboard if not in fullscreen
          setTimeout(() => navigate("/dashboard"), 1000);
        }
      } else {
        // For normal submission, show the confirmation dialog
        setIsSubmitConfirmationOpen(true);
      }
    } catch (error) {
      console.error("Error saving exam data:", error);
      toast({
        title: "Submission Error",
        description: "There was a problem submitting your exam. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / mockExam.questions.length) * 100;

  // Function to prevent copy/paste/cut
  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
      toast({
      title: "Action Blocked",
      description: "Copy and paste are not allowed during the exam.",
        variant: "destructive",
      });
    return false;
  };
  
  // Function to render media status indicators
  const renderMediaStatus = () => (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${mediaState.isCameraOn ? 'text-green-500' : 'text-red-500'}`}>
        <Camera className="h-4 w-4" />
      </div>
      <div className={`flex items-center ${mediaState.isMicrophoneOn ? 'text-green-500' : 'text-red-500'}`}>
        <Mic className="h-4 w-4" />
      </div>
    </div>
  );

  // Get risk level color
  const getRiskColor = () => {
    if (riskScore > 70) return "text-red-600";
    if (riskScore > 40) return "text-amber-500";
    return "text-green-600";
  };
  
  // Get risk level text
  const getRiskLevelText = () => {
    if (riskScore > 70) return "High Risk";
    if (riskScore > 40) return "Moderate Risk";
    return "Low Risk";
  };
  
  // Get risk level background color
  const getRiskBgColor = () => {
    if (riskScore > 70) return "bg-red-500";
    if (riskScore > 40) return "bg-amber-500";
    return "bg-green-500";
  };
  
  // Function to request fullscreen
  const requestFullscreen = () => {
    if (examContainerRef.current) {
      try {
        // Most browsers require fullscreen to be triggered by a user gesture
        // So we'll add a button for users to click to enter fullscreen
        if (examContainerRef.current.requestFullscreen) {
          examContainerRef.current.requestFullscreen()
            .then(() => {
              setIsFullscreen(true);
              toast({
                title: "Fullscreen Mode Activated",
                description: "Your exam is now in fullscreen mode. Do not exit this mode.",
              });
            })
            .catch(err => {
              console.error("Error attempting to enable fullscreen:", err);
              // Show fullscreen warning dialog instead of just a toast
              setIsFullscreenWarningOpen(true);
            });
        } else if ((examContainerRef.current as any).webkitRequestFullscreen) {
          (examContainerRef.current as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if ((examContainerRef.current as any).msRequestFullscreen) {
          (examContainerRef.current as any).msRequestFullscreen();
          setIsFullscreen(true);
        } else {
          // Browser doesn't support fullscreen API
          setIsFullscreenWarningOpen(true);
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
        setIsFullscreenWarningOpen(true);
      }
    }
  };
  
  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If exited fullscreen without permission and not during submission, show warning
      if (!isCurrentlyFullscreen && isFullscreen && !isExitingForSubmission) {
        setIsFullscreenWarningOpen(true);
        
        // Increase risk score for exiting fullscreen
        setTabSwitches(prev => prev + 1); // Count as a tab switch for risk calculation
        
        toast({
          title: "Warning: Fullscreen Exited",
          description: "Exiting fullscreen mode during an exam is not allowed and may result in termination.",
          variant: "destructive",
        });
      }
    };
    
    // Handle escape key specifically
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        // Show a small toast warning when ESC is pressed
        toast({
          title: "Warning: Escape Key Detected",
          description: "Exiting fullscreen is not allowed during the exam.",
          variant: "destructive",
          duration: 3000, // Show for 3 seconds
        });
        
        // Don't try to prevent default as it won't work for ESC in fullscreen
        // Just warn the user and let the fullscreenchange event handle the rest
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isFullscreen, toast, isExitingForSubmission]);
  
  // Add a helper function to handle exiting fullscreen and navigation
  const exitFullscreenAndNavigate = () => {
    // Set a flag to prevent multiple navigation attempts
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Set flag to indicate we're exiting fullscreen for navigation
    setIsExitingForSubmission(true);
    
    // Exit fullscreen if needed
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen()
          .then(() => {
            setTimeout(() => navigate("/dashboard"), 300);
          })
          .catch(() => {
            // Navigate anyway if fullscreen exit fails
            setTimeout(() => navigate("/dashboard"), 300);
          });
      } catch (error) {
        console.error("Error exiting fullscreen:", error);
        // Navigate anyway
        setTimeout(() => navigate("/dashboard"), 300);
      }
    } else {
      // Not in fullscreen, just navigate
      navigate("/dashboard");
    }
  };
  
  return (
    <div ref={examContainerRef} className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with exam title and timer */}
      <header className="bg-white shadow-sm py-3 px-6 sticky top-0 z-10 border-b">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            <div>
                <h1 className="text-lg font-bold text-exam-primary">{mockExam.title}</h1>
                <p className="text-xs text-muted-foreground">{mockExam.subject}</p>
        </div>
      </div>
      
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md">
                <Clock className="h-4 w-4 text-exam-primary" />
                <span className={`font-mono text-base ${timeLeft < 300 ? "text-red-500 font-bold" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button
                onClick={() => {
                  if (isSubmitting) return; // Prevent multiple clicks
                  
                  setIsSubmitting(true);
                  // Set flag to indicate we're exiting fullscreen for submission
                  setIsExitingForSubmission(true);
                  
                  // Calculate score and save data
                  const score = Math.floor(Math.random() * 40) + 60;
                  setFinalScore(score); // Store score for the confirmation dialog
                  
                  // Save exam data
                  const userEmail = localStorage.getItem('userEmail') || 'unknown@example.com';
                  const userName = localStorage.getItem('userName') || 'Unknown Student';
                  const timeSpent = Math.floor((Date.now() - examStartTime) / 60000);
                  
                  try {
                    // Get existing user data
                    const userDataStr = localStorage.getItem('userData');
                    const userData = userDataStr ? JSON.parse(userDataStr) : {};
                    
                    // If this exam's data doesn't exist yet, create it
                    if (!userData[id!]) {
                      userData[id!] = {};
                    }
                    
                    // Update or create user data for this exam
                    userData[id!][userEmail] = {
                      id: Date.now().toString(),
                      name: userName,
                      email: userEmail,
                      score: score,
                      timeSpent: timeSpent,
                      submissionTime: new Date().toISOString(),
                      riskScore: riskScore,
                      status: 'completed',
                      tabSwitches: tabSwitches,
                      wasTerminated: false
                    };
                    
                    // Save updated data back to localStorage
                    localStorage.setItem('userData', JSON.stringify(userData));
                    localStorage.setItem('examSubmitted', 'true');
                    
                    // Clean up localStorage
                    localStorage.removeItem('examStartTime');
                    localStorage.removeItem('currentQuestionIndex');
                    localStorage.removeItem('currentExamId');
                    
                    // Show success toast
                    toast({
                      title: "Exam Submitted Successfully",
                      description: `Your exam has been submitted with a score of ${score}%.`,
                      variant: "default",
                    });
                    
                    // Exit fullscreen and navigate directly to dashboard
                    if (document.fullscreenElement) {
                      try {
                        document.exitFullscreen()
                          .then(() => {
                            setTimeout(() => navigate("/dashboard"), 500);
                          })
                          .catch(() => {
                            setTimeout(() => navigate("/dashboard"), 500);
                          });
                      } catch (error) {
                        console.error("Error exiting fullscreen:", error);
                        setTimeout(() => navigate("/dashboard"), 500);
                      }
                    } else {
                      // Not in fullscreen, just navigate
                      setTimeout(() => navigate("/dashboard"), 500);
                    }
                  } catch (error) {
                    console.error("Error saving exam data:", error);
                    setIsSubmitting(false);
                    toast({
                      title: "Submission Error",
                      description: "There was a problem submitting your exam. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-exam-primary hover:bg-exam-primary/90 h-9"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </Button>
            </div>
          </div>
            </div>
      </header>
      
      <div className="flex-1 py-6 px-4">
        <div className="container mx-auto max-w-5xl flex gap-6">
          {/* Main content area */}
          <div className="flex-1">
            {/* Progress indicator */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Question {currentQuestionIndex + 1} of {mockExam.questions.length}</span>
                <span className="text-muted-foreground">{progressPercentage.toFixed(0)}% Complete</span>
          </div>
              <Progress value={progressPercentage} className="h-1.5" />
        </div>
            
            {/* Question card */}
            <Card className="mb-6 shadow-sm border-gray-200">
              <CardHeader className="pb-3">
              <CardTitle className="text-xl">Question {currentQuestionIndex + 1}</CardTitle>
              <CardDescription>
                {currentQuestion.type === "multiple-choice" ? "Select the best answer" :
                 currentQuestion.type === "text" ? "Provide a written response" :
                 "Upload your solution file"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-lg font-medium">{currentQuestion.text}</div>
                
                {currentQuestion.type === "multiple-choice" && (
                  <RadioGroup
                    value={userAnswers[currentQuestionIndex]?.answer || ""}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {currentQuestion.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50 border border-gray-100">
                        <RadioGroupItem value={option} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion.type === "text" && (
                  <Textarea
                    placeholder="Enter your answer here..."
                    className="min-h-32"
                    value={userAnswers[currentQuestionIndex]?.answer || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                      onCopy={preventCopyPaste}
                      onPaste={preventCopyPaste}
                      onCut={preventCopyPaste}
                  />
                )}
                
                {currentQuestion.type === "file-upload" && (
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      Upload your solution file (PDF, DOC, or image)
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="mx-auto max-w-xs"
                    />
                    {userAnswers[currentQuestionIndex]?.file && (
                        <p className="mt-2 text-sm text-green-600 flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                        File uploaded: {userAnswers[currentQuestionIndex]?.file?.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
              <CardFooter className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => handleNavigation("prev")}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1"
              >
                <ChevronsLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => handleNavigation("next")}
                disabled={currentQuestionIndex === mockExam.questions.length - 1}
                  className="flex items-center gap-1 bg-exam-primary hover:bg-exam-primary/90"
              >
                Next
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Question navigator */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium mb-3">Question Navigator</h3>
            <div className="flex flex-wrap gap-2">
              {mockExam.questions.map((_, idx) => (
                <Button
                  key={idx}
                  variant={idx === currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                    className={`w-9 h-9 ${
                    userAnswers[idx]?.answer || userAnswers[idx]?.file
                      ? "border-green-500"
                      : ""
                    } ${idx === currentQuestionIndex ? "bg-exam-primary hover:bg-exam-primary/90" : ""}`}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    localStorage.setItem('currentQuestionIndex', idx.toString());
                  }}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>
          
          {/* Sidebar with status and camera */}
          <div className="w-72 space-y-4">
            {/* Camera preview */}
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg shadow-inner bg-gray-900"
                  style={{ aspectRatio: '16/9' }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                  {renderMediaStatus()}
                </div>
              </div>
            </div>

            {/* Exam status box */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="text-center">
                <h3 className="font-semibold mb-3 text-sm">Exam Status</h3>
                
                {/* Risk score */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-1">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Risk Score</span>
                  </div>
                  <div className={`text-xl font-bold ${getRiskColor()}`}>
                    {riskScore}%
                  </div>
                  <div className="text-xs font-medium mt-1">
                    Status: {getRiskLevelText()}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full transition-all duration-300 ${getRiskBgColor()}`}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                </div>
                
                {/* Answered questions count */}
                <div className="text-sm text-gray-600">
                  <span>Answered: </span>
                  <span className="font-medium">
                    {mockExam.questions.length - userAnswers.filter(a => !a.answer && !a.file).length}/{mockExam.questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit confirmation dialog */}
      <Dialog 
        open={isSubmitDialogOpen} 
        onOpenChange={(open) => {
          setIsSubmitDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam?
              {userAnswers.filter(a => !a.answer && !a.file).length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span>You have unanswered questions.</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Continue Exam
            </Button>
            <Button 
              onClick={() => {
                setIsSubmitDialogOpen(false);
                submitExam(false);
              }} 
              className="bg-exam-primary hover:bg-exam-primary/90"
            >
              Submit Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Submission Confirmation Dialog */}
      <Dialog 
        open={isSubmitConfirmationOpen} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            // Only handle close if not already submitting
            exitFullscreenAndNavigate();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Exam Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              <p className="mb-4">Your exam has been submitted and your responses have been recorded.</p>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Score:</div>
                  <div className="font-medium">{finalScore}%</div>
                  <div className="text-muted-foreground">Time Spent:</div>
                  <div className="font-medium">{Math.floor((Date.now() - examStartTime) / 60000)} minutes</div>
                  <div className="text-muted-foreground">Questions Answered:</div>
                  <div className="font-medium">
                    {mockExam.questions.length - userAnswers.filter(a => !a.answer && !a.file).length}/{mockExam.questions.length}
                  </div>
                </div>
              </div>
              <p>Click the button below to return to the dashboard.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={exitFullscreenAndNavigate} 
              className="w-full bg-exam-primary hover:bg-exam-primary/90"
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Time warning dialog */}
      <Dialog open={isTimeWarningOpen} onOpenChange={setIsTimeWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-500 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Warning
            </DialogTitle>
            <DialogDescription>
              You have only 5 minutes remaining to complete your exam.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsTimeWarningOpen(false)} className="bg-exam-primary hover:bg-exam-primary/90">
              Continue Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tab switching warning dialog */}
      <Dialog open={isTabWarningOpen} onOpenChange={setIsTabWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Final Warning
            </DialogTitle>
            <DialogDescription>
              <p className="mb-2">You have switched tabs multiple times during this exam, which is considered suspicious behavior.</p>
              <p className="font-medium">If you switch tabs again, your exam will be automatically terminated and submitted.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsTabWarningOpen(false)} className="bg-exam-primary hover:bg-exam-primary/90">
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Termination dialog - add a button to force navigation */}
      <Dialog 
        open={tabSwitches >= TERMINATION_TAB_SWITCHES || riskScore >= MAX_RISK_SCORE} 
        onOpenChange={() => {}}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Exam Terminated
            </DialogTitle>
            <DialogDescription>
              <p className="mb-2">Your exam has been automatically terminated due to suspicious behavior.</p>
              <p className="font-medium">
                {tabSwitches >= TERMINATION_TAB_SWITCHES ? 
                  "You have exceeded the allowed number of tab switches." : 
                  "Your risk score has exceeded the allowed threshold."}
              </p>
              <p className="mt-2">You are being redirected to the dashboard.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => {
                // Force exit fullscreen and redirect
                if (document.fullscreenElement) {
                  try {
                    document.exitFullscreen();
                  } catch (error) {
                    console.error("Error exiting fullscreen:", error);
                  }
                }
                // Navigate regardless of fullscreen exit success
                navigate("/dashboard");
              }}
              className="bg-exam-primary hover:bg-exam-primary/90"
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen warning/request dialog */}
      <Dialog 
        open={isFullscreenWarningOpen} 
        onOpenChange={(open) => {
          // If user tries to close without entering fullscreen, keep dialog open
          if (!open && !isFullscreen) {
            setIsFullscreenWarningOpen(true);
            toast({
              title: "Fullscreen Required",
              description: "You must enter fullscreen mode to take this exam.",
              variant: "destructive",
            });
          } else {
            setIsFullscreenWarningOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isFullscreen ? "text-red-600" : "text-exam-primary"}`}>
              {isFullscreen ? (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  Fullscreen Warning
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  Fullscreen Required
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isFullscreen ? (
                <>
                  <p className="mb-2">You have exited fullscreen mode, which is required for this exam.</p>
                  <p className="font-medium">Please return to fullscreen mode to continue your exam. Repeated attempts to exit fullscreen may result in exam termination.</p>
                </>
              ) : (
                <>
                  <p className="mb-2">This exam must be taken in fullscreen mode to ensure academic integrity.</p>
                  <p className="font-medium">Please click the button below to enter fullscreen mode and begin your exam.</p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => {
                requestFullscreen();
                // Only close the dialog if we successfully entered fullscreen
                // The fullscreenchange event will handle this
              }} 
              className="bg-exam-primary hover:bg-exam-primary/90"
            >
              {isFullscreen ? "Return to Fullscreen" : "Enter Fullscreen & Start Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TakeExam;
