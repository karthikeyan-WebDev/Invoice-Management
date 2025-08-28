
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

return (
  <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl border-b border-purple-500/20 sticky top-0 z-40 backdrop-blur-lg">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Enhanced Page Info */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            {/* Page Icon */}
            <div className="text-3xl bg-gradient-to-br from-purple-400 to-pink-400 p-3 rounded-xl shadow-lg">
              {pageInfo.icon}
            </div>
            {/* Page Details */}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent tracking-tight">
                {pageInfo.title}
              </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-purple-200/80">
                    {pageInfo.subtitle}
                  </p>
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-purple-200/60">
                    {date} • {time}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mobile title */}
            <div className="md:hidden flex items-center space-x-3">
              <div className="text-2xl">{pageInfo.icon}</div>
              <h1 className="text-xl font-bold text-white">
                FreelancePro
              </h1>
            </div>
          </div>

          {/* Right Section - Professional Actions */}
          <div className="flex items-center space-x-4">
            {/* Revenue Indicator */}
            <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-xl border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-sm">
                <span className="text-green-300 font-medium">Revenue</span>
                <span className="text-white ml-2 font-bold">Active</span>
              </div>
            </div>

            {/* Smart Notifications */}
            {/* <button className="relative p-3 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-bounce"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            </button> */}

            {/* Professional Status */}
            <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-200">Available</span>
            </div>

            {/* Enhanced User Profile Dropdown */}
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
                <div className="absolute right-0 mt-3 w-64 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 py-3 z-50">
                  <div className="px-5 py-4 border-b border-purple-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">F</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Email</p>
                        <p className="text-xs text-purple-300">Jesh@gmail.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-3 w-full px-5 py-3 text-sm text-purple-100 hover:bg-purple-500/20 hover:text-white transition-all duration-200 group"
                    >
                      <div className="p-1 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span>Professional Profile</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 w-full px-5 py-3 text-sm text-purple-100 hover:bg-purple-500/20 hover:text-white transition-all duration-200 group">
                      <div className="p-1 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span>Business Settings</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 w-full px-5 py-3 text-sm text-purple-100 hover:bg-purple-500/20 hover:text-white transition-all duration-200 group">
                      <div className="p-1 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span>Help Center</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-purple-500/20 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-3 w-full px-5 py-3 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 group"
                    >
                      <div className="p-1 bg-red-500/20 rounded-lg group-hover:bg-red-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span>Sign Out</span>
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