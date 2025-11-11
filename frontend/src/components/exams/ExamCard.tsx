import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarClock, Clock, FileText, BarChart3, Users, RefreshCw, ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

// Simplified props
interface ExamCardProps {
  exam: {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    duration?: number;
    totalQuestions?: number;
    date?: string;
    status?: string;
    participants?: number;
    averageScore?: number;
  };
  userType: "teacher" | "student";
}

const ExamCard = ({ exam, userType }: ExamCardProps) => {
  const isCompleted = exam.status === "completed";
  const isActive = exam.status === "active";
  const isUpcoming = exam.status === "upcoming";
  
  // Format date if available
  const formattedDate = exam.date 
    ? new Date(exam.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "Date not set";
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="p-6">
        {/* Header with title and status */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
            {exam.subject && (
              <p className="text-sm text-gray-500">{exam.subject}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Take Exam Button - Only for students and active exams */}
            {userType === "student" && isActive && (
              <Link to={`/take-exam/${exam.id}`}>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                >
                  <PlayCircle className="h-4 w-4" />
                  Take Exam
                </Button>
              </Link>
            )}
            
            {/* Status Badge */}
            <div className={`px-2.5 py-1 rounded-full text-sm font-medium ${
              isActive ? "bg-green-100 text-green-800" : 
              isUpcoming ? "bg-blue-100 text-blue-800" : 
              "bg-gray-100 text-gray-800"
            }`}>
              {exam.status}
            </div>
          </div>
        </div>
        
        {/* Description if available */}
        {exam.description && (
          <p className="text-gray-600 mb-4 text-sm">{exam.description}</p>
        )}
        
        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-full">
              <Clock className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{exam.duration || 60} min</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-full">
              <FileText className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{exam.totalQuestions || 0}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
          </div>
          
          {exam.date && (
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded-full">
                <CalendarClock className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                <p className="text-xs text-gray-500">Scheduled</p>
              </div>
            </div>
          )}
          
          {userType === "teacher" && exam.participants && (
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{exam.participants}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
          )}
          
          {userType === "teacher" && exam.averageScore && (
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded-full">
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{exam.averageScore}%</p>
                <p className="text-xs text-gray-500">Average Score</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center">
          {userType === "teacher" ? (
            <>
              <Link to={`/exam/${exam.id}`} className="w-full">
                <Button variant="outline" className="w-full justify-between border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              {isCompleted ? (
                <div className="flex gap-3 w-full">
                  <Link to={`/exam-results/${exam.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                      View Results
                    </Button>
                  </Link>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="h-10 w-10 p-0 border-gray-200 hover:bg-gray-50 hover:border-gray-300">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Retake Exam</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="w-full">
                  {isActive ? (
                    <Link to={`/take-exam/${exam.id}`} className="w-full">
                      <Button 
                        variant="default"
                        className="w-full justify-between bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <span className="flex items-center gap-2">
                          <PlayCircle className="h-5 w-5" />
                          Take Exam Now
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/exam/${exam.id}`} className="w-full">
                      <Button 
                        variant="outline"
                        className="w-full justify-between border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        disabled={isUpcoming}
                      >
                        <span>{isUpcoming ? "Not Available Yet" : "View Exam"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamCard;
