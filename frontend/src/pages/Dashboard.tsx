import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Clock, BarChart3, Plus, Users, CalendarDays, PlayCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ExamCard from "@/components/exams/ExamCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Simplified Exam interface
interface Exam {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  duration?: number;
  totalQuestions?: number;
  date?: string;
  status?: "upcoming" | "active" | "completed";
  participants?: number;
  averageScore?: number;
  passingScore?: number;
  [key: string]: any;
}

const Dashboard = () => {
  const [userType, setUserType] = useState<"teacher" | "student">("student");
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  
  useEffect(() => {
    // Get user role from localStorage
    const storedRole = localStorage.getItem('userRole');
    if (storedRole === 'teacher' || storedRole === 'student') {
      setUserType(storedRole);
    } else {
      localStorage.setItem('userRole', 'student');
      setUserType('student');
    }
    
    // Load exam data
    try {
      const examsStr = localStorage.getItem('exams');
      if (examsStr) {
        const examsObj = JSON.parse(examsStr);
        const examsArray = Array.isArray(examsObj) ? examsObj : Object.values(examsObj);
        setExams(examsArray);
      } else {
        // Add mock exam data if none exists
        const mockExams: Exam[] = [
          {
            id: "1",
            title: "Midterm Examination",
            subject: "Mathematics",
            description: "Covers chapters 1-5 of the textbook",
            duration: 90,
            totalQuestions: 5,
            date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
            status: "active",
            participants: 25,
            averageScore: 78
          }
        ];
        localStorage.setItem('exams', JSON.stringify(mockExams));
        setExams(mockExams);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      toast({
        title: "Error",
        description: "Failed to load exams data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Role toggle for demo purposes
  const handleRoleToggle = (role: "teacher" | "student") => {
    localStorage.setItem('userRole', role);
    setUserType(role);
    toast({
      title: "Role Updated",
      description: `You are now viewing the dashboard as a ${role}.`,
    });
  };

  // Filter exams based on active tab
  const filteredExams = activeTab === 'all' 
    ? exams 
    : exams.filter((exam) => exam && exam.status === activeTab);
    
  // Get active exams for quick access
  const activeExams = exams.filter(exam => exam.status === "active");

  const handleStartExam = () => {
    setIsInstructionsOpen(true);
  };

  const handleProceedToExam = () => {
    // Implement the logic to proceed to the exam
    console.log("Proceeding to exam");
    setIsInstructionsOpen(false);
    window.location.href = "http://localhost:8080/take-exam/1";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      {/* Mobile action button */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden">
        <Link to={userType === "teacher" ? "/create-exam" : "/dashboard"}>
          <Button size="icon" className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg">
            <Plus size={24} />
          </Button>
        </Link>
      </div>
      
      <main className="flex-grow py-16 bg-gradient-to-b from-slate-50 to-gray-100">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Main Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Your InteGriGuard Dashboard
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Safe Exam Monitoring for {userType === "teacher" ? "educators" : "students"}
            </p>
            
            {/* Direct Take Exam Button - In header */}
            {userType === "student" && (
              <div className="mt-6">
                <Button 
                  onClick={handleStartExam}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium px-6 py-3 rounded-lg shadow-sm"
                >
                  <PlayCircle className="h-5 w-5" />
                  Take Exam Now
                </Button>
              </div>
            )}
          </div>
          
          {/* User Type Selector & Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <Tabs value={userType} onValueChange={(v) => handleRoleToggle(v as "teacher" | "student")} className="w-full md:w-auto">
              <TabsList className="h-10 w-full md:w-auto bg-white border shadow-sm p-1 rounded-lg">
                <TabsTrigger value="teacher" className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Teacher
                </TabsTrigger>
                <TabsTrigger value="student" className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Student
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-3">
              {userType === "teacher" ? (
                <Link to="/create-exam">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white">
                    <Plus size={16} className="mr-2" /> Create Exam
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={handleStartExam}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                >
                  <PlayCircle size={16} className="mr-2" /> Take Exam
                </Button>
              )}
              
              <Link to="/demo">
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  Get a Demo
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Quick Take Exam Section - Only for students */}
          {userType === "student" && activeExams.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-2">Ready to take an exam?</h2>
                  <p className="text-emerald-100 max-w-xl">
                    You have {activeExams.length} active {activeExams.length === 1 ? 'exam' : 'exams'} available. 
                    Start now to test your knowledge and track your progress.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button 
                    onClick={handleStartExam}
                    variant="secondary" 
                    className="w-full md:w-auto bg-white hover:bg-gray-100 text-emerald-700 border-0 shadow-sm"
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Take Exam Now
                  </Button>
                  
                  {activeExams.length > 2 && (
                    <Link to="/dashboard?tab=active" className="flex-1 md:flex-auto" onClick={() => setActiveTab("active")}>
                      <Button 
                        variant="outline" 
                        className="w-full md:w-auto bg-emerald-700/20 hover:bg-emerald-700/30 text-white border-emerald-500"
                      >
                        View All Exams
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-1">
                      {userType === "teacher" ? "Total Exams" : "Completed"}
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {userType === "teacher" ? exams.length || 0 : 5}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-1">
                      {userType === "teacher" ? "Active Students" : "Performance"}
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {userType === "teacher" ? "42" : "82%"}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-1">
                      {userType === "teacher" ? "Average Score" : "Upcoming"}
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {userType === "teacher" ? "78%" : "2"}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-500 mb-1">
                      {userType === "teacher" ? "Upcoming" : "Subjects"}
                    </span>
                    <span className="text-2xl font-bold text-slate-900">
                      {userType === "teacher" ? "3" : "4"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Exams Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 pb-4 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {userType === "teacher" ? "Your Exams" : "Available Exams"}
                    </h2>
                    
                    {/* Filter Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                      <TabsList className="h-9 w-full sm:w-auto bg-slate-100 p-1 rounded-md">
                        <TabsTrigger value="all" className="text-sm rounded data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="active" className="text-sm rounded data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                          Active
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="text-sm rounded data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
                          Upcoming
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Exams Grid */}
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : filteredExams.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredExams.map((exam) => (
                        <ExamCard 
                          key={exam.id} 
                          exam={exam}
                          userType={userType} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                      <div className="bg-gray-100 p-3 rounded-full mb-4">
                        <FileText size={24} className="text-slate-500" />
                      </div>
                      <h3 className="text-base font-medium text-slate-900 mb-2">No Exams Found</h3>
                      <p className="text-slate-500 mb-6 max-w-md">
                        {userType === "teacher"
                          ? "You haven't created any exams yet. Get started by creating your first exam."
                          : activeTab === 'all'
                            ? "There are no exams available for you at the moment."
                            : `No ${activeTab} exams available right now.`}
                      </p>
                      {userType === "teacher" ? (
                        <Link to="/create-exam">
                          <Button className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white">
                            <Plus size={16} className="mr-2" />
                            Create Exam
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          onClick={handleStartExam}
                          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                        >
                          <PlayCircle size={16} className="mr-2" />
                          Take Available Exam
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {userType === "teacher" ? (
                <>
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 pb-4 border-b border-slate-100">
                      <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-3">
                        <Link to="/create-exam" className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-10 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                            <Plus size={16} className="text-emerald-600" />
                            Create Exam
                          </Button>
                        </Link>
                        <Link to="/student-analysis" className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-10 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                            <Users size={16} className="text-emerald-600" />
                            Student Analysis
                          </Button>
                        </Link>
                        <Link to="/dashboard" className="w-full">
                          <Button variant="outline" className="w-full justify-start gap-2 h-10 border-slate-200 hover:bg-slate-50 hover:border-slate-300">
                            <BarChart3 size={16} className="text-emerald-600" />
                            View Reports
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Upcoming Events */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 pb-4 border-b border-slate-100">
                      <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <CalendarDays size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">Advanced Calculus</h4>
                            <p className="text-sm text-slate-500">Tomorrow, 10:00 AM</p>
                            <p className="text-sm text-slate-500 mt-1">25 students registered</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <CalendarDays size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">Physics 101</h4>
                            <p className="text-sm text-slate-500">Apr 23, 2:30 PM</p>
                            <p className="text-sm text-slate-500 mt-1">18 students registered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Take Exam Button - Sidebar */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <PlayCircle size={20} className="text-emerald-600 mr-2" />
                        Take an Exam
                      </h2>
                      <p className="text-slate-600 text-sm mb-4">
                        Click the button below to start your exam immediately.
                      </p>
                      <Button 
                        onClick={handleStartExam}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Start Exam Now
                      </Button>
                    </div>
                  </div>
                  
                  {/* Active Exams Quick Access */}
                  {activeExams.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="p-6 pb-4 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                          <PlayCircle size={18} className="text-emerald-600 mr-2" />
                          Available Exams
                        </h2>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-3">
                          {activeExams.map(exam => (
                            <Button 
                              key={exam.id}
                              onClick={handleStartExam}
                              variant="outline" 
                              className="w-full justify-between h-auto py-3 px-4 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-left"
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium text-slate-900">{exam.title}</span>
                                {exam.subject && <span className="text-xs text-slate-500">{exam.subject}</span>}
                              </div>
                              <div className="bg-emerald-600 rounded-full p-1.5">
                                <PlayCircle className="h-4 w-4 text-white" />
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Performance */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 pb-4 border-b border-slate-100">
                      <h2 className="text-lg font-semibold text-slate-900">Performance</h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Overall</span>
                            <span className="font-medium text-slate-900">82%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full" style={{ width: "82%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Mathematics</span>
                            <span className="font-medium text-slate-900">90%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full" style={{ width: "90%" }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500">Physics</span>
                            <span className="font-medium text-slate-900">75%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-700 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 pb-4 border-b border-slate-100">
                      <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 bg-emerald-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <FileText size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">Completed Mathematics</h4>
                            <p className="text-sm text-slate-500">2 days ago</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 bg-emerald-100 h-10 w-10 rounded-full flex items-center justify-center">
                            <BookOpen size={16} className="text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">Registered for Physics</h4>
                            <p className="text-sm text-slate-500">5 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Exam Instructions Dialog */}
      <Dialog open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-emerald-600" />
              Exam Instructions
            </DialogTitle>
            <DialogDescription>
              Please read the following instructions before starting your exam.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Exam Rules:</h3>
              <ul className="text-sm text-slate-500 space-y-1 list-disc pl-5">
                <li>Do not leave the exam window or switch tabs during the exam.</li>
                <li>Your camera and microphone will be active during the entire exam.</li>
                <li>Ensure you have a stable internet connection.</li>
                <li>Complete all questions within the allocated time.</li>
                <li>You cannot return to previous questions once submitted.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Risk Score System:</h3>
              <p className="text-sm text-slate-500">
                The exam uses a risk score system to monitor potential academic dishonesty:
              </p>
              <ul className="text-sm text-slate-500 space-y-1 list-disc pl-5">
                <li><span className="font-medium text-green-600">0-40%:</span> Low risk - normal exam behavior</li>
                <li><span className="font-medium text-amber-500">41-70%:</span> Moderate risk - some suspicious activity detected</li>
                <li><span className="font-medium text-red-600">71-100%:</span> High risk - significant suspicious activity detected</li>
              </ul>
              <p className="text-sm text-slate-500 mt-2">
                Actions that increase your risk score include: switching tabs, leaving the exam window, 
                extended periods of inactivity, and unusual typing patterns.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstructionsOpen(false)} className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Cancel
            </Button>
            <Button onClick={handleProceedToExam} className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white">
              Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;