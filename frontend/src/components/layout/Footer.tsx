import { BookOpen, Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-exam-dark to-exam-dark/95 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-5">
              <div className="bg-white p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-exam-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                InteGriGuard
              </span>
            </div>
            <p className="text-gray-300 mb-5 max-w-md">
              The ultimate exam management platform for educators and students. Create, distribute, and analyze exams with confidence and integrity.
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-5 flex items-center">
              <span className="bg-exam-primary h-5 w-1 rounded mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-exam-primary group-hover:w-2 transition-all duration-300"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-exam-primary group-hover:w-2 transition-all duration-300"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-exam" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-exam-primary group-hover:w-2 transition-all duration-300"></span>
                  Create Exam
                </Link>
              </li>
              <li>
                <Link to="/student-analysis" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="h-1 w-1 rounded-full bg-exam-primary group-hover:w-2 transition-all duration-300"></span>
                  Student Analysis
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-5 flex items-center">
              <span className="bg-exam-primary h-5 w-1 rounded mr-2"></span>
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="h-5 w-5 text-exam-primary mt-0.5" />
                <span className="text-gray-300">support@integriguard.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="h-5 w-5 text-exam-primary mt-0.5" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-exam-primary mt-0.5" />
                <span className="text-gray-300">123 Education Ave, Learning City, CA 94321</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12">
          <Button variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white">
            Subscribe to our Newsletter
          </Button>
        </div>
        
        <Separator className="my-8 bg-white/10" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            © {currentYear} InteGriGuard. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center">
          <span>Made with</span>
          <Heart className="h-3 w-3 mx-1 text-red-500" />
          <span>by InteGriGuard Team</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
