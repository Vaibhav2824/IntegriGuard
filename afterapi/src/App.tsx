
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import TakeExam from "./pages/TakeExam";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ExamResults from "./pages/ExamResults";
import StudentAnalysis from "./pages/StudentAnalysis";

const queryClient = new QueryClient();

// Basic auth guard
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const userEmail = localStorage.getItem('userEmail');
  
  if (!userEmail) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Role-based route
const RoleRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode,
  allowedRoles: string[]
}) => {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Initialize exam data if not exists
  useEffect(() => {
    if (!localStorage.getItem('exams')) {
      // Sample exam data
      const sampleExams = {
        "1": {
          id: "1",
          title: "Midterm Examination",
          subject: "Mathematics",
          description: "Covers chapters 1-5 of the textbook",
          duration: 90,
          totalQuestions: 25,
          averageScore: 78,
          passingScore: 60,
          date: "2023-11-04",
          status: "completed",
          participants: 5,
        }
      };
      
      localStorage.setItem('exams', JSON.stringify(sampleExams));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthRoute>
                  <Dashboard />
                </AuthRoute>
              } 
            />
            <Route 
              path="/create-exam" 
              element={
                <AuthRoute>
                  <RoleRoute allowedRoles={['teacher']}>
                    <CreateExam />
                  </RoleRoute>
                </AuthRoute>
              } 
            />
            <Route 
              path="/take-exam/:id" 
              element={
                <AuthRoute>
                  <RoleRoute allowedRoles={['student']}>
                    <TakeExam />
                  </RoleRoute>
                </AuthRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/exam/:id/results" 
              element={
                <AuthRoute>
                  <RoleRoute allowedRoles={['teacher']}>
                    <ExamResults />
                  </RoleRoute>
                </AuthRoute>
              } 
            />
            <Route 
              path="/student-analysis" 
              element={
                <AuthRoute>
                  <RoleRoute allowedRoles={['teacher']}>
                    <StudentAnalysis />
                  </RoleRoute>
                </AuthRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;