// components/Sidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: "pocetna", label: "Početna", icon: "🏠", href: "/admin" },
    { id: "korisnici", label: "Kandidati", icon: "👥", href: "/admin/kandidati" },
    { id: "instruktori", label: "Instruktori", icon: "👨‍🏫", href: "/admin/instruktori" },
    { id: "testovi", label: "Testovi", icon: "📝", href: "/admin/testovi" },
    { id: "administracija", label: "Administracija", icon: "⚙️", href: "/admin/administracija" },
    { id: "vozilo", label: "Vozila", icon: "🚗", href: "/admin/vozila" },
    { id: "finansije", label: "Finansije", icon: "💰", href: "/admin/finansije" },
    { id: "voznje", label: "Vožnje", icon: "🛣️", href: "/admin/voznje" },
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1A1C25] transition-all duration-300 flex flex-col border-r border-[#2A2D3A] shadow-2xl shadow-[#6C63FF]/10`}>
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-[#2A2D3A] flex items-center justify-between bg-gradient-to-r from-[#1A1C25] to-[#232634]">
        {isSidebarOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-xl flex items-center justify-center shadow-lg shadow-[#6C63FF]/30">
              <span className="text-white font-bold text-lg">AŠ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] bg-clip-text text-transparent">
                AutoŠkola
              </h1>
              <p className="text-xs text-[#7A7F96] mt-1">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl hover:bg-[#232634] transition-all duration-200 text-[#B0B3C1] hover:text-white border border-[#2A2D3A] hover:border-[#6C63FF]/30 hover:shadow-lg hover:shadow-[#6C63FF]/20"
        >
          {isSidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white shadow-2xl shadow-[#6C63FF]/40 border border-[#6C63FF]/50"
                    : "hover:bg-[#232634] text-[#B0B3C1] hover:text-white border border-transparent hover:border-[#2A2D3A] hover:shadow-lg hover:shadow-[#6C63FF]/10"
                }`}
              >
                <span className={`text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive(item.href) ? "scale-110" : ""
                }`}>
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

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[#2A2D3A] bg-gradient-to-t from-[#1A1C25] to-[#232634]">
        <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-[#232634] border border-[#2A2D3A] shadow-lg shadow-black/20">
          <div className="w-12 h-12 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-xl flex items-center justify-center shadow-lg shadow-[#6C63FF]/30 flex-shrink-0">
            <span className="text-white font-bold text-lg">
              {(user?.name || user?.email)?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || user?.email || "Administrator"}
              </p>
              <p className="text-xs text-[#7A7F96] mt-1">Super Admin</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 group hover:bg-gradient-to-r hover:from-[#E63946] hover:to-[#FF6B6B] text-[#B0B3C1] hover:text-white border border-[#2A2D3A] hover:border-transparent hover:shadow-lg hover:shadow-[#E63946]/30"
        >
          <span className="text-xl transition-transform duration-300 group-hover:scale-110">🚪</span>
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