
import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const activeItem = location.pathname; 
  
  const menuItems = [
    { path: "/clients", label: "Clients", icon: "👥", color: "from-emerald-500 to-teal-600" },
    { path: "/invoices", label: "Invoices", icon: "📄", color: "from-violet-500 to-purple-600" },
    { path: "/payments", label: "Payments", icon: "💳", color: "from-amber-500 to-orange-600" },
    { path: "/profile", label: "Profile", icon: "👤", color: "from-rose-500 to-pink-600" }
  ];

  return (
    <aside className="w-72 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl min-h-screen relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <div className="relative p-8 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl">💼</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Freelance Invoice 
            </h2>
            <p className="text-xs text-gray-400 font-medium">Invoice Manager</p>
          </div>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-6 relative">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = activeItem === item.path;
            return (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`
                    w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-white/10 text-white shadow-2xl backdrop-blur-sm border border-white/20 transform scale-[1.02]' 
                      : 'text-gray-300 hover:bg-white/5 hover:text-white hover:transform hover:scale-[1.01] hover:shadow-lg'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Active item glow effect */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-2xl`}></div>
                  )}
                  
                  {/* Icon container */}
                  <div className={`
                    relative w-11 h-11 rounded-xl flex items-center justify-center mr-4 transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} shadow-lg` 
                      : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                    }
                  `}>
                    <span className={`text-lg transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                  </div>
                  
                  {/* Label */}
                  <span className="font-semibold tracking-wide flex-1 text-left">
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 bg-gradient-to-r ${item.color} rounded-full animate-pulse`}></div>
                      <div className="w-1 h-4 bg-gradient-to-b from-white/50 to-transparent rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Hover arrow */}
                  {!isActive && (
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="w-1 h-4 bg-gradient-to-b from-gray-400 to-transparent rounded-full"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}