
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StudentBehaviorChart from "@/components/students/StudentBehaviorChart";
import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type BehaviorData = {
  mouseMovements: number[];
  keystrokePatterns: number[];
  activityShifts: number[];
  inactivePeriods: number[];
};

type StudentData = {
  id: string;
  name: string;
  email: string;
  score: number;
  timeSpent: number;
  submissionTime: string;
  riskScore: number;
  behaviorFlags: string[];
  status: string;
  behavior: BehaviorData;
};

type ExamData = {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  totalQuestions: number;
  averageScore: number;
  passingScore: number;
  date: string;
  status: string;
  participants: number;
};

// Fallback data in case nothing is in localStorage
const fallbackExam: ExamData = {
  id: "1",
  title: "No Data Available",
  subject: "Sample",
  description: "No exam data found. Please create exams first.",
  duration: 60,
  totalQuestions: 0,
  averageScore: 0,
  passingScore: 60,
  date: new Date().toISOString().split('T')[0],
  status: "pending",
  participants: 0,
};

const fallbackStudent: StudentData = {
  id: "0",
  name: "No Students",
  email: "no-data@example.com",
  score: 0,
  timeSpent: 0,
  submissionTime: new Date().toISOString(),
  riskScore: 0,
  behaviorFlags: ["None"],
  status: "pending",
  behavior: {
    mouseMovements: [0],
    keystrokePatterns: [0],
    activityShifts: [0],
    inactivePeriods: [0],
  }
};

const ExamResults = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [examData, setExamData] = useState<ExamData>(fallbackExam);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) return;
    
    // Load exam data
    const loadExamData = () => {
      try {
        const examsStr = localStorage.getItem('exams');
        if (!examsStr) {
          toast({
            title: "No Exam Data",
            description: "No exams found in database. Using sample data.",
            variant: "destructive",
          });
          return;
        }
        
        const exams = JSON.parse(examsStr);
        const exam = exams[id];
        
        if (!exam) {
          toast({
            title: "Exam Not Found",
            description: `Exam with ID ${id} not found.`,
            variant: "destructive",
          });
          return;
        }
        
        setExamData(exam);
      } catch (error) {
        console.error("Error loading exam data:", error);
        toast({
          title: "Error",
          description: "Failed to load exam data. Using sample data.",
          variant: "destructive",
        });
      }
    };
    
    // Load student data
    const loadStudentData = () => {
      try {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          toast({
            title: "No Student Data",
            description: "No student data found. Using sample data.",
          });
          return;
        }
        
        const userData = JSON.parse(userDataStr);
        const examStudents = userData[id] || {};
        
        // Convert object to array
        const studentsArray = Object.values(examStudents) as StudentData[];
        
        if (studentsArray.length === 0) {
          toast({
            title: "No Students",
            description: "No students have taken this exam yet.",
          });
          setStudents([fallbackStudent]);
        } else {
          setStudents(studentsArray);
          
          // Update exam data with student count and average score
          if (examData.id !== fallbackExam.id) {
            const avgScore = Math.round(
              studentsArray.reduce((sum, student) => sum + student.score, 0) / studentsArray.length
            );
            
            setExamData(prev => ({
              ...prev,
              participants: studentsArray.length,
              averageScore: avgScore
            }));
          }
        }
      } catch (error) {
        console.error("Error loading student data:", error);
        toast({
          title: "Error",
          description: "Failed to load student data. Using sample data.",
          variant: "destructive",
        });
        setStudents([fallbackStudent]);
      } finally {
        setLoading(false);
      }
    };
    
    loadExamData();
    loadStudentData();
  }, [id]);
  
  const highRiskStudents = students.filter(student => student.riskScore > 50).length;
  const averageTime = students.length > 0 
    ? Math.round(students.reduce((acc, student) => acc + student.timeSpent, 0) / students.length) 
    : 0;
  
  const handleRowClick = (studentId: string) => {
    setSelectedStudent(studentId);
    setActiveTab("behavior");
  };
  
  const selectedStudentData = selectedStudent 
    ? students.find(student => student.id === selectedStudent) 
    : null;
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading exam results...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-exam-dark">{examData.title} Results</h1>
            <p className="text-muted-foreground mt-1">
              Exam ID: {id} • {examData.subject} • {examData.date}
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Participants"
              description="Total students"
              icon={<Users size={24} />}
            >
              <p className="text-3xl font-bold">{examData.participants}</p>
            </DashboardCard>
            
            <DashboardCard
              title="Average Score"
              description="All students"
              icon={<CheckCircle2 size={24} />}
            >
              <p className="text-3xl font-bold">{examData.averageScore}%</p>
            </DashboardCard>
            
            <DashboardCard
              title="Average Time"
              description="Minutes spent"
              icon={<Clock size={24} />}
            >
              <p className="text-3xl font-bold">{averageTime} min</p>
            </DashboardCard>
            
            <DashboardCard
              title="High Risk Activity"
              description="Students flagged"
              icon={<AlertTriangle size={24} />}
              className={highRiskStudents > 0 ? "border-orange-400" : ""}
            >
              <p className="text-3xl font-bold">{highRiskStudents}</p>
            </DashboardCard>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="behavior">Behavioral Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Behavior Flags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleRowClick(student.id)}
                      >
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.score}%</TableCell>
                        <TableCell>{student.timeSpent} min</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.riskScore > 50 
                              ? "bg-red-100 text-red-800" 
                              : student.riskScore > 25 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-green-100 text-green-800"
                          }`}>
                            {student.riskScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.behaviorFlags.join(", ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="behavior" className="mt-0">
              {selectedStudentData ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStudentData.name}</h2>
                      <p className="text-muted-foreground">{selectedStudentData.email}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3 flex flex-col items-center">
                      <span className="text-sm font-medium text-muted-foreground">Risk Score</span>
                      <span className={`text-2xl font-bold ${
                        selectedStudentData.riskScore > 50 
                          ? "text-red-600" 
                          : selectedStudentData.riskScore > 25 
                            ? "text-yellow-600" 
                            : "text-green-600"
                      }`}>
                        {selectedStudentData.riskScore}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Behavior Flags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudentData.behaviorFlags.map((flag, index) => (
                        <span 
                          key={index} 
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            flag === "None" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <StudentBehaviorChart student={selectedStudentData} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard
                      title="Exam Performance"
                      description="Summary"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Score:</span>
                          <span className="font-medium">{selectedStudentData.score}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Time Spent:</span>
                          <span className="font-medium">{selectedStudentData.timeSpent} minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Submission Time:</span>
                          <span className="font-medium">
                            {new Date(selectedStudentData.submissionTime).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </DashboardCard>
                    
                    <DashboardCard
                      title="Behavior Analysis"
                      description="Key metrics"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Mouse Movement Volatility:</span>
                          <span className={`font-medium ${
                            Math.max(...selectedStudentData.behavior.mouseMovements) - 
                            Math.min(...selectedStudentData.behavior.mouseMovements) > 40
                              ? "text-red-600"
                              : "text-green-600"
                          }`}>
                            {Math.max(...selectedStudentData.behavior.mouseMovements) - 
                             Math.min(...selectedStudentData.behavior.mouseMovements)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Activity Shifts:</span>
                          <span className={`font-medium ${
                            selectedStudentData.behavior.activityShifts.reduce((a, b) => a + b, 0) > 80
                              ? "text-red-600"
                              : "text-green-600"
                          }`}>
                            {selectedStudentData.behavior.activityShifts.reduce((a, b) => a + b, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Inactive Periods:</span>
                          <span className={`font-medium ${
                            selectedStudentData.behavior.inactivePeriods.reduce((a, b) => a + b, 0) > 15
                              ? "text-red-600"
                              : "text-green-600"
                          }`}>
                            {selectedStudentData.behavior.inactivePeriods.reduce((a, b) => a + b, 0)}
                          </span>
                        </div>
                      </div>
                    </DashboardCard>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Select a student from the overview table to view their behavioral analysis
                  </h3>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExamResults;