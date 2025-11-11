import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X, Shield, User, Home, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    setIsLoggedIn(!!userEmail);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-gradient-to-r from-slate-900/95 to-gray-900/95 backdrop-blur-sm shadow-sm py-2" 
        : location.pathname === "/" 
          ? "bg-gradient-to-r from-slate-900/90 to-gray-900/90 backdrop-blur-sm py-4" 
          : "bg-gradient-to-r from-slate-900 to-gray-900 py-3"
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-1.5 rounded-md shadow-sm transition-all duration-300 group-hover:from-emerald-700 group-hover:to-teal-800">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white transition-colors">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-400">Inte</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">Gri</span>
              <span className="text-white">Guard</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 
                ${isActive('/') 
                  ? 'text-emerald-400 bg-slate-800/70 border-b-2 border-emerald-500' 
                  : 'text-gray-200 hover:text-emerald-300 hover:bg-slate-800/40 border-b-2 border-transparent'
                }`
              }
            >
              <Home size={16} className={isActive('/') ? "text-emerald-400" : "text-gray-400"} />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md transition-all duration-200 
                ${isActive('/dashboard') 
                  ? 'text-emerald-400 bg-slate-800/70 border-b-2 border-emerald-500' 
                  : 'text-gray-200 hover:text-emerald-300 hover:bg-slate-800/40 border-b-2 border-transparent'
                }`
              }
            >
              <LayoutDashboard size={16} className={isActive('/dashboard') ? "text-emerald-400" : "text-gray-400"} />
              <span>Dashboard</span>
            </Link>
            
            {isLoggedIn ? (
              <Button 
                className="ml-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium text-sm px-5 py-2 h-9 rounded-md shadow-sm transition-all duration-300"
                onClick={() => {
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userName');
                  localStorage.removeItem('userRole');
                  window.location.href = '/';
                }}
              >
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button 
                  className="ml-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium text-sm px-5 py-2 h-9 rounded-md shadow-sm transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-emerald-400 hover:bg-slate-800/30"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-slate-900 to-gray-900 border-t border-slate-800 mt-2 animate-in slide-in-from-top duration-300 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-1">
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-sm font-medium p-3 rounded-md transition-all ${
                isActive('/') ? 'bg-slate-800/70 text-emerald-400 border-l-2 border-emerald-500' : 'text-gray-200 hover:bg-slate-800/40 hover:text-emerald-300 border-l-2 border-transparent'
              }`}
            >
              <Home size={18} className={isActive('/') ? "text-emerald-400" : "text-gray-400"} />
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 text-sm font-medium p-3 rounded-md transition-all ${
                isActive('/dashboard') ? 'bg-slate-800/70 text-emerald-400 border-l-2 border-emerald-500' : 'text-gray-200 hover:bg-slate-800/40 hover:text-emerald-300 border-l-2 border-transparent'
              }`}
            >
              <LayoutDashboard size={18} className={isActive('/dashboard') ? "text-emerald-400" : "text-gray-400"} />
              Dashboard
            </Link>
            
            {isLoggedIn ? (
              <button
                onClick={() => {
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userName');
                  localStorage.removeItem('userRole');
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 text-sm font-medium p-3 rounded-md text-gray-200 hover:bg-slate-800/40 hover:text-emerald-300 border-l-2 border-transparent"
              >
                <User size={18} className="text-gray-400" />
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-sm font-medium p-3 rounded-md text-gray-200 hover:bg-slate-800/40 hover:text-emerald-300 border-l-2 border-transparent"
              >
                <User size={18} className="text-gray-400" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
