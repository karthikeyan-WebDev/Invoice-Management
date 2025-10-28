
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

// Get page title and icon based on current route
const getPageInfo = () => {
  const path = location.pathname;
  switch (path) {
    case "/clients":
      return { 
        title: "Client Page", 
        subtitle: "Manage client details",
        icon: "👥"
      };
    case "/invoices":
      return { 
        title: "Invoice Page", 
        subtitle: "Create & track invoices",
        icon: "📄"
      };   
    case "/payments":
      return { 
        title: "Payment Page", 
        subtitle: "Monitor payment status",
        icon: "💰"
      };
    case "/profile":
      return { 
        title: " Profile Page", 
        subtitle: "Your freelance identity",
        icon: "⚡"
      };
    default:
      return { 
        title: "Freelance Hub", 
        subtitle: "Your business command center",
        icon: "🚀"
      };
  }
};

// Get current time and date
const getCurrentDateTime = () => {
  const now = new Date();
  const time = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  const date = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  return { time, date };
};

const pageInfo = getPageInfo();
const { time, date } = getCurrentDateTime();

// Get gradient color based on current route
const getGradientColor = () => {
  const path = location.pathname;
  switch (path) {
    case "/clients":
      return "emerald-400 to-teal-400";
    case "/invoices":
      return "violet-400 to-purple-400";
    case "/payments":
      return "amber-400 to-orange-400";
    case "/profile":
      return "rose-400 to-pink-400";
    default:
      return "blue-400 to-purple-400";
  }
};

return (
  <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-b border-gray-700/50 sticky top-0 z-40 backdrop-blur-sm">
    <div className="px-6 py-4 relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="flex items-center justify-between relative">
        {/* Left Section - Enhanced Page Info */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            {/* Page Icon */}
            <div className={`text-3xl bg-gradient-to-br from-${getGradientColor()} p-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300`}>
              {pageInfo.icon}
            </div>
            {/* Page Details */}
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight group">
                {pageInfo.title}
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"></div>
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-gray-300">
                  {pageInfo.subtitle}
                </p>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-400">
                  {date} • {time}
                </p>
              </div>
            </div>
          </div>
          </div>

            {/* Right Section - Enhanced Actions */}
          <div className="flex items-center space-x-5">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-white">Freelance</p>
                  <p className="text-xs text-purple-200">Professional Mode</p>
                </div>
                
                <svg 
                  className={`w-4 h-4 text-purple-200 transition-all duration-300 group-hover:text-white ${
                    showDropdown ? 'rotate-180 scale-110' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enhanced Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-3 z-50">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-10">
                    <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  </div>
                  
                  <div className="px-5 py-4 border-b border-gray-700/50 relative">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center transform hover:scale-105 transition-all duration-300">
                          <span className="text-white font-bold">F</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Email</p>
                        <p className="text-xs text-blue-300">Jesh@gmail.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2 relative">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-3 w-full px-5 py-3 text-sm text-gray-300 hover:bg-blue-500/10 hover:text-white transition-all duration-200 group"
                    >
                      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transform group-hover:scale-110 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span>Professional Profile</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <div className="w-4 h-0.5 bg-blue-500/50 rounded-full"></div>
                      </div>
                    </button>
                    
                  </div>
                  
                  <div className="border-t border-gray-700/50 pt-2 relative">
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-3 w-full px-5 py-3 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transform group-hover:scale-110 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span>Sign Out</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <div className="w-4 h-0.5 bg-red-500/50 rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
}