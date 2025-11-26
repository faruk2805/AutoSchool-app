// components/Sidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ user, onLogout, role = "instruktor" }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Menu items za instruktora (uključene vožnje)
  const instructorMenuItems = [
    { id: "pocetna", label: "Početna", icon: "🏠", href: "/instructor" },
    { id: "kandidati", label: "Kandidati", icon: "👥", href: "/instructor/kandidati" },
    { id: "testovi", label: "Testovi", icon: "📝", href: "/instructor/testovi" },
    { id: "vozilo", label: "Vozilo", icon: "🚗", href: "/instructor/vozilo" },
    { id: "voznje", label: "Vožnje", icon: "🛣️", href: "/instructor/voznje" },
  ];

  // Tema i boje za instruktora
  const colors = {
    gradient: "from-[#3D9DF6] to-[#27AE60]",
    shadow: "[#3D9DF6]",
    textGradient: "from-[#3D9DF6] to-[#27AE60]",
  };

  const isActive = (href) => {
    if (href === "/instructor") return pathname === href;
    return pathname.startsWith(href);
  };

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "I";
  };

  return (
    <div
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-[#1A1C25] transition-all duration-300 flex flex-col border-r border-[#2A2D3A] shadow-2xl shadow-${colors.shadow}/10`}
    >
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-[#2A2D3A] flex items-center justify-between bg-gradient-to-r from-[#1A1C25] to-[#232634]">
        {isSidebarOpen && (
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg shadow-${colors.shadow}/30`}
            >
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <div>
              <h1
                className={`text-xl font-bold text-white bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}
              >
                Instruktor
              </h1>
              <p className="text-xs text-[#7A7F96] mt-1">Instruktor Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl hover:bg-[#232634] transition-all duration-200 text-[#B0B3C1] hover:text-white border border-[#2A2D3A] hover:border-[#3D9DF6]/30 hover:shadow-lg hover:shadow-[#3D9DF6]/20"
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Navigacija */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {instructorMenuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group ${
                  isActive(item.href)
                    ? `bg-gradient-to-r ${colors.gradient} text-white shadow-2xl shadow-${colors.shadow}/40 border border-${colors.shadow}/50`
                    : "hover:bg-[#232634] text-[#B0B3C1] hover:text-white border border-transparent hover:border-[#2A2D3A] hover:shadow-lg hover:shadow-[#3D9DF6]/10"
                }`}
              >
                <span
                  className={`text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isActive(item.href) ? "scale-110" : ""
                  }`}
                >
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <span className="font-medium text-sm truncate transition-all duration-300">
                    {item.label}
                  </span>
                )}
                {isActive(item.href) && isSidebarOpen && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Info i odjava */}
      <div className="p-4 border-t border-[#2A2D3A] bg-gradient-to-t from-[#1A1C25] to-[#232634]">
        <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-[#232634] border border-[#2A2D3A] shadow-lg shadow-black/20">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg shadow-${colors.shadow}/30 flex-shrink-0`}
          >
            <span className="text-white font-bold text-lg">{getInitials()}</span>
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || user?.email || "Instruktor"}
              </p>
              <p className="text-xs text-[#7A7F96] mt-1">Instruktor</p>
              {user?.licenseNumber && (
                <p className="text-xs text-[#7A7F96] mt-1">{user.licenseNumber}</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group hover:bg-gradient-to-r hover:from-[#E63946] hover:to-[#FF6B6B] text-[#B0B3C1] hover:text-white border border-[#2A2D3A] hover:border-transparent hover:shadow-lg hover:shadow-[#E63946]/30"
        >
          <span className="text-xl transition-transform duration-300 group-hover:scale-110">
            🚪
          </span>
          {isSidebarOpen && (
            <span className="font-medium text-sm transition-all duration-300">
              Odjava
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
