import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { 
  CheckCircle, 
  Shield, 
  Layout, 
  Users, 
  Clock, 
  LineChart
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-r from-slate-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <div className="lg:col-span-3 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-400">Inte</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">Gri</span>
                <span className="text-white">Guard</span>
              </h1>
              <p className="text-xl md:text-2xl font-light text-gray-300 mb-4">
                Secure Online Examination Platform
              </p>
              <p className="text-base md:text-lg text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0">
                Our AI-powered proctoring system ensures academic integrity while providing a seamless experience for both educators and students.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md font-medium px-8 transition-all duration-300" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
            <div className="hidden lg:block lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-md border border-white/10 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Advanced Proctoring</h3>
                      <p className="text-sm text-gray-400">AI-powered monitoring</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center">
                      <Clock className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Real-time Analysis</h3>
                      <p className="text-sm text-gray-400">Instant risk assessment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Academic Integrity</h3>
                      <p className="text-sm text-gray-400">Ensuring fair assessment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium text-sm tracking-wide">FEATURES</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-4">
              Secure Exam Platform
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines AI technology with intuitive design for a secure testing environment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
                <Layout className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Builder</h3>
              <p className="text-gray-600 text-sm">
                Create assessments with our drag-and-drop interface supporting multiple question types.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Proctoring</h3>
              <p className="text-gray-600 text-sm">
                Our technology monitors student behavior to detect suspicious activities in real-time.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Grading</h3>
              <p className="text-gray-600 text-sm">
                Save time with our intelligent assessment system that automatically grades objective questions.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Monitoring</h3>
              <p className="text-gray-600 text-sm">
                Track student progress and receive instant alerts for suspicious behavior.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
              <p className="text-gray-600 text-sm">
                Share exam templates and build departmental question banks with your team.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-md flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Gain insights into student performance and identify knowledge gaps.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium text-sm tracking-wide">TESTIMONIALS</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
              What Our Users Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-700 font-bold text-sm">JD</div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Dr. Jane Davis</h4>
                  <p className="text-xs text-gray-500">University Professor</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "InteGriGuard has transformed how we conduct remote examinations. The proctoring system is robust yet unobtrusive."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-700 font-bold text-sm">MT</div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Mark Thompson</h4>
                  <p className="text-xs text-gray-500">School Administrator</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "The implementation was seamless, and our faculty adapted quickly. The automated grading features have saved our teachers countless hours."
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-700 font-bold text-sm">SL</div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Sarah Lee</h4>
                  <p className="text-xs text-gray-500">Education Director</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                "The security features give us confidence in the integrity of our assessments, while the user-friendly interface makes it accessible."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Assessment Process?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of educational institutions who trust InteGriGuard for secure examination management.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md font-medium px-8 transition-all duration-300" asChild>
            <Link to="/login">Start Your Journey</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;