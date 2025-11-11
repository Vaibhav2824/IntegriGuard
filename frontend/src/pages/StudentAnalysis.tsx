import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StudentSearchBox from "@/components/admin/StudentSearchBox";
import StudentBehaviorChart from "@/components/students/StudentBehaviorChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { AlertTriangle, CheckCircle2, Clock, Search, Users, RefreshCw, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type BehaviorData = {
  mouseMovements: number[];
  keystrokePatterns: number[];
  activityShifts: number[];
  inactivePeriods: number[];
  typingMetrics: {
    speed: number;
    averageSpeed: number;
    discrepancy: number;
    keystrokes: number[];
    intervals: number[];
  };
  suspiciousPatterns?: {
    tabSwitchCount: number;
    inactivityCount: number;
    erraticMovementScore: number;
    keystrokePatternScore: number;
    copyPasteCount: number;
  };
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
  examId?: string;
  windowSwitches?: number;
  inactiveTime?: number;
  keystrokeConsistency?: number;
};

const StudentAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [examFilter, setExamFilter] = useState<string>("all");
  const [examList, setExamList] = useState<{id: string, title: string}[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [riskFilter, setRiskFilter] = useState<string>("all");
  
  // Load data from localStorage
  useEffect(() => {
    // Check if user is teacher
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'teacher') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    // Load student data and exams
    const loadData = () => {
      try {
        setLoading(true);
        
        // Get exam data first
        const examsStr = localStorage.getItem('exams');
        if (!examsStr) {
          setExamList([]);
        } else {
          const examsObj = JSON.parse(examsStr);
          const examOptions = Object.entries(examsObj).map(([id, exam]: [string, any]) => ({
            id,
            title: exam.title
          }));
          setExamList(examOptions);
        }
        
        // Get student data
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          setAllStudents([]);
          setFilteredStudents([]);
          setLoading(false);
          return;
        }
        
        // Parse all student data from localStorage
        const userData = JSON.parse(userDataStr);
        let allStudentEntries: StudentData[] = [];
        
        // Iterate through all exams
        Object.entries(userData).forEach(([examId, students]: [string, any]) => {
          // Add each student with their exam ID
          Object.values(students).forEach((student: any) => {
            // Enhance student data with additional behavioral metrics if available
            const activityStorageKey = `exam_${examId}_student_${student.id}_activity`;
            const activityDataStr = localStorage.getItem(activityStorageKey);
            
            let enhancedBehavior = student.behavior;
            let windowSwitches = 0;
            let inactiveTime = 0;
            let keystrokeConsistency = 100;
            
            if (activityDataStr) {
              try {
                const activityData = JSON.parse(activityDataStr);
                windowSwitches = activityData.totalTabSwitches || 
                  (activityData.windowFocusEvents + activityData.windowBlurEvents);
                inactiveTime = activityData.longestInactiveTime || 0;
                keystrokeConsistency = activityData.keystrokeConsistency || 100;
                
                // Update behavior data if needed
                if (activityData.mouseMovements && activityData.mouseMovements.length) {
                  enhancedBehavior = activityData;
                }
              } catch (e) {
                console.error("Error parsing activity data:", e);
              }
            }
            
            allStudentEntries.push({
              ...student,
              examId,
              windowSwitches,
              inactiveTime,
              keystrokeConsistency,
              behavior: enhancedBehavior
            });
          });
        });
        
        setAllStudents(allStudentEntries);
        setFilteredStudents(allStudentEntries);
      } catch (error) {
        console.error("Error loading student data:", error);
        toast({
          title: "Error",
          description: "Failed to load student data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, refreshTrigger]);
  
  // Apply filters when they change
  useEffect(() => {
    let result = [...allStudents];
    
    // Apply exam filter
    if (examFilter !== "all") {
      result = result.filter(student => student.examId === examFilter);
    }
    
    // Apply risk filter
    if (riskFilter !== "all") {
      if (riskFilter === "high") {
        result = result.filter(student => student.riskScore > 50);
      } else if (riskFilter === "medium") {
        result = result.filter(student => student.riskScore > 25 && student.riskScore <= 50);
      } else if (riskFilter === "low") {
        result = result.filter(student => student.riskScore <= 25);
      }
    }
    
    setFilteredStudents(result);
  }, [examFilter, riskFilter, allStudents]);
  
  // Handle search
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // If search is empty, just apply the current filters
      let result = [...allStudents];
      
      if (examFilter !== "all") {
        result = result.filter(student => student.examId === examFilter);
      }
      
      if (riskFilter !== "all") {
        if (riskFilter === "high") {
          result = result.filter(student => student.riskScore > 50);
        } else if (riskFilter === "medium") {
          result = result.filter(student => student.riskScore > 25 && student.riskScore <= 50);
        } else if (riskFilter === "low") {
          result = result.filter(student => student.riskScore <= 25);
        }
      }
      
      setFilteredStudents(result);
      return;
    }
    
    // Search by name or email, with current filters applied
    const searchLower = searchTerm.toLowerCase();
    let filtered = allStudents.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchLower);
      const emailMatch = student.email.toLowerCase().includes(searchLower);
      return nameMatch || emailMatch;
    });
    
    // Apply exam filter
    if (examFilter !== "all") {
      filtered = filtered.filter(student => student.examId === examFilter);
    }
    
    // Apply risk filter
    if (riskFilter !== "all") {
      if (riskFilter === "high") {
        filtered = filtered.filter(student => student.riskScore > 50);
      } else if (riskFilter === "medium") {
        filtered = filtered.filter(student => student.riskScore > 25 && student.riskScore <= 50);
      } else if (riskFilter === "low") {
        filtered = filtered.filter(student => student.riskScore <= 25);
      }
    }
    
    setFilteredStudents(filtered);
  };
  
  // Handle row click
  const handleRowClick = (studentId: string) => {
    setSelectedStudent(studentId);
  };
  
  // Refresh data
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Data Refreshed",
      description: "Student behavioral analysis data has been updated.",
    });
  };
  
  // Get selected student data
  const selectedStudentData = selectedStudent
    ? filteredStudents.find(student => student.id === selectedStudent)
    : null;
  
  // Calculate statistics
  const highRiskStudents = filteredStudents.filter(student => student.riskScore > 50).length;
  const averageScore = filteredStudents.length > 0
    ? Math.round(filteredStudents.reduce((sum, student) => sum + student.score, 0) / filteredStudents.length)
    : 0;
  const averageTime = filteredStudents.length > 0
    ? Math.round(filteredStudents.reduce((sum, student) => sum + student.timeSpent, 0) / filteredStudents.length)
    : 0;
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  // Enhance formatTime function to handle ms to readable format
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms/1000)}s`;
    return `${Math.round(ms/60000)}m ${Math.round((ms % 60000)/1000)}s`;
  };
  
  // Update the risk calculation section
  const calculateRiskScore = (data: StudentData): number => {
    const baseRisk = data.riskScore || 0;
    const typingRisk = data.behavior.typingMetrics?.discrepancy 
      ? Math.min(30, (data.behavior.typingMetrics.discrepancy / 1000) * 30)
      : 0;
    const speedVarianceRisk = data.behavior.typingMetrics?.speed && data.behavior.typingMetrics?.averageSpeed
      ? Math.min(20, (Math.abs(data.behavior.typingMetrics.speed - data.behavior.typingMetrics.averageSpeed) / 100) * 20)
      : 0;

    return Math.min(100, baseRisk + typingRisk + speedVarianceRisk);
  };

  // Update the behavior flags section
  const getBehaviorFlags = (data: StudentData): string[] => {
    const flags: string[] = [...(data.behaviorFlags || [])];
    
    // Add typing-related flags
    if (data.behavior.typingMetrics?.discrepancy > 500) {
      flags.push("Irregular Typing Pattern");
    }
    if (data.behavior.typingMetrics?.speed && data.behavior.typingMetrics?.averageSpeed) {
      const speedVariance = Math.abs(data.behavior.typingMetrics.speed - data.behavior.typingMetrics.averageSpeed);
      if (speedVariance > 50) {
        flags.push("Unusual Typing Speed Changes");
      }
    }

    return flags.length > 0 ? flags : ["None"];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <RefreshCw className="animate-spin h-8 w-8 text-primary mb-4" />
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-exam-dark">Student Behavioral Analysis</h1>
              <p className="text-muted-foreground mt-1">
                Monitor student activity and detect suspicious behavior
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="flex items-center gap-2 self-start"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
          
          {/* Filter and Search */}
          <div className="mb-8 space-y-4 md:space-y-0 md:grid md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <StudentSearchBox onSearch={handleSearch} />
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="exam-filter" className="block text-sm text-muted-foreground mb-2">
                <Filter className="h-4 w-4 inline mr-1" /> Filter by Exam
              </label>
              <select
                id="exam-filter"
                className="w-full border border-input bg-background px-3 py-2 rounded-md"
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
              >
                <option value="all">All Exams</option>
                {examList.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="risk-filter" className="block text-sm text-muted-foreground mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" /> Filter by Risk
              </label>
              <select
                id="risk-filter"
                className="w-full border border-input bg-background px-3 py-2 rounded-md"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk (&gt;50)</option>
                <option value="medium">Medium Risk (26-50)</option>
                <option value="low">Low Risk (0-25)</option>
              </select>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <DashboardCard
              title="Students"
              description="Total monitored"
              icon={<Users size={24} />}
            >
              <p className="text-3xl font-bold">{filteredStudents.length}</p>
            </DashboardCard>
            
            <DashboardCard
              title="Average Score"
              description="All students"
              icon={<CheckCircle2 size={24} />}
            >
              <p className="text-3xl font-bold">{averageScore}%</p>
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
          
          {/* No data message */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
              <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No student data found</h3>
              <p className="mt-2 text-muted-foreground">
                {examFilter !== "all" 
                  ? "No students have taken this exam yet."
                  : "No student data available. Students need to take exams first."}
              </p>
            </div>
          )}
          
          {/* Student data table and behavior analysis */}
          {filteredStudents.length > 0 && (
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="behavior">Behavioral Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <ScrollArea className="max-h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Tab Switches</TableHead>
                          <TableHead>Risk Score</TableHead>
                          <TableHead>Behavior Flags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          const examTitle = examList.find(e => e.id === student.examId)?.title || 'Unknown Exam';
                          
                          return (
                            <TableRow 
                              key={student.id} 
                              className="cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => handleRowClick(student.id)}
                            >
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{examTitle}</TableCell>
                              <TableCell>{student.score}%</TableCell>
                              <TableCell>
                                <Badge variant={
                                  (student.windowSwitches || 0) > 15 
                                    ? "destructive" 
                                    : (student.windowSwitches || 0) > 8 
                                      ? "default" 
                                      : "outline"
                                }>
                                  {student.windowSwitches || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  student.riskScore > 50 
                                    ? "destructive" 
                                    : student.riskScore > 25 
                                      ? "default" 
                                      : "outline"
                                }>
                                  {student.riskScore}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {student.behaviorFlags.map((flag, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant={flag === "None" ? "outline" : "secondary"}
                                      className="text-xs"
                                    >
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="behavior" className="mt-0">
                {selectedStudentData ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle className="text-2xl">{selectedStudentData.name}</CardTitle>
                            <p className="text-muted-foreground">{selectedStudentData.email}</p>
                            <p className="text-sm mt-1">
                              Exam: {examList.find(e => e.id === selectedStudentData.examId)?.title || 'Unknown Exam'}
                            </p>
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
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Behavior Flags</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedStudentData.behaviorFlags.map((flag, index) => (
                              <Badge 
                                key={index} 
                                variant={flag === "None" ? "outline" : "destructive"}
                              >
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <StudentBehaviorChart 
                      student={{
                        ...selectedStudentData,
                        behavior: {
                          ...selectedStudentData.behavior,
                          typingMetrics: selectedStudentData.behavior.typingMetrics || {
                            speed: 0,
                            averageSpeed: 0,
                            discrepancy: 0,
                            keystrokes: [],
                            intervals: []
                          }
                        }
                      }} 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DashboardCard
                        title="Tab Switching Analysis"
                        description="Window focus events"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Tab Switches:</span>
                            <span className={`font-medium ${
                              (selectedStudentData.windowSwitches || 0) > 15
                                ? "text-red-600"
                                : (selectedStudentData.windowSwitches || 0) > 8
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}>
                              {selectedStudentData.windowSwitches || 
                                selectedStudentData.behavior.activityShifts.reduce((a, b) => a + b, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Switching Pattern:</span>
                            <Badge variant={
                              (selectedStudentData.windowSwitches || 0) > 15 
                                ? "destructive" 
                                : (selectedStudentData.windowSwitches || 0) > 8 
                                  ? "default" 
                                  : "outline"
                            }>
                              {(selectedStudentData.windowSwitches || 0) > 15 
                                ? "Suspicious" 
                                : (selectedStudentData.windowSwitches || 0) > 8 
                                  ? "Moderate" 
                                  : "Normal"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Risk Assessment:</span>
                            <span className="font-medium">
                              {(selectedStudentData.windowSwitches || 0) > 15 
                                ? "High probability of referencing external resources" 
                                : (selectedStudentData.windowSwitches || 0) > 8 
                                  ? "Possible use of external resources" 
                                  : "Normal exam behavior"}
                            </span>
                          </div>
                        </div>
                      </DashboardCard>
                      
                      <DashboardCard
                        title="Cursor Inactivity Analysis"
                        description="Periods of no mouse movement"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Longest Inactive Period:</span>
                            <span className={`font-medium ${
                              (selectedStudentData.inactiveTime || 0) > 30000
                                ? "text-red-600"
                                : (selectedStudentData.inactiveTime || 0) > 15000
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}>
                              {formatTime(selectedStudentData.inactiveTime || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Inactivity Count:</span>
                            <span className="font-medium">
                              {selectedStudentData.behavior.inactivePeriods.reduce((a, b) => a + b, 0)} periods
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Risk Assessment:</span>
                            <span className="font-medium">
                              {(selectedStudentData.inactiveTime || 0) > 30000 
                                ? "Suspicious inactivity detected" 
                                : (selectedStudentData.inactiveTime || 0) > 15000 
                                  ? "Moderate inactivity detected" 
                                  : "Normal activity patterns"}
                            </span>
                          </div>
                        </div>
                      </DashboardCard>
                      
                      <DashboardCard
                        title="Keystroke Analysis"
                        description="Typing pattern consistency"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Keystroke Consistency:</span>
                            <span className={`font-medium ${
                              (selectedStudentData.keystrokeConsistency || 100) < 70
                                ? "text-red-600"
                                : (selectedStudentData.keystrokeConsistency || 100) < 85
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}>
                              {selectedStudentData.keystrokeConsistency || 100}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Keystrokes:</span>
                            <span className="font-medium">
                              {selectedStudentData.behavior.keystrokePatterns.reduce((a, b) => a + b, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Risk Assessment:</span>
                            <span className="font-medium">
                              {(selectedStudentData.keystrokeConsistency || 100) < 70 
                                ? "Potential keystroke anomalies detected" 
                                : (selectedStudentData.keystrokeConsistency || 100) < 85 
                                  ? "Minor keystroke variations detected" 
                                  : "Consistent typing pattern"}
                            </span>
                          </div>
                        </div>
                      </DashboardCard>
                      
                      <DashboardCard
                        title="Typing Analysis"
                        description="Keystroke patterns"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Current Speed:</span>
                            <span className="font-medium">
                              {selectedStudentData.behavior.typingMetrics?.speed || 0} CPM
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Average Speed:</span>
                            <span className="font-medium">
                              {selectedStudentData.behavior.typingMetrics?.averageSpeed || 0} CPM
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Keystroke Consistency:</span>
                            <Badge variant={
                              (selectedStudentData.behavior.typingMetrics?.discrepancy || 0) > 500 
                                ? "destructive" 
                                : (selectedStudentData.behavior.typingMetrics?.discrepancy || 0) > 200 
                                  ? "default" 
                                  : "outline"
                            }>
                              {(selectedStudentData.behavior.typingMetrics?.discrepancy || 0) > 500 
                                ? "Irregular" 
                                : (selectedStudentData.behavior.typingMetrics?.discrepancy || 0) > 200 
                                  ? "Moderate" 
                                  : "Consistent"}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Risk Assessment:</span>
                            <span className="font-medium">
                              {(selectedStudentData.behavior.typingMetrics?.discrepancy || 0) > 500 
                                ? "Potential automated input detected" 
                                : (selectedStudentData.behavior.typingMetrics?.discrepancy || 0) > 200 
                                  ? "Unusual typing pattern detected" 
                                  : "Normal typing pattern"}
                            </span>
                          </div>
                        </div>
                      </DashboardCard>
                      
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
                              {formatDate(selectedStudentData.submissionTime)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Exam Status:</span>
                            <Badge variant={selectedStudentData.status === 'completed' ? 'outline' : 'secondary'}>
                              {selectedStudentData.status.charAt(0).toUpperCase() + selectedStudentData.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </DashboardCard>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Select a student from the overview table to view their behavioral analysis
                    </h3>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentAnalysis;