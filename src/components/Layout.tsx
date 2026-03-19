import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "sign" | "stamps" | "converter" | "cabinet" | "templates" | "history" | "admin" | "login" | "register";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
  userRole?: "user" | "admin";
  userName?: string;
  onLogout: () => void;
}

const navItems = [
  { id: "home", label: "Главная", icon: "LayoutDashboard" },
  { id: "sign", label: "Подписание", icon: "PenLine" },
  { id: "stamps", label: "Печати", icon: "Stamp" },
  { id: "converter", label: "Конвертер", icon: "ArrowLeftRight" },
  { id: "templates", label: "Шаблоны", icon: "FileText" },
  { id: "history", label: "История", icon: "ClockIcon" },
  { id: "cabinet", label: "Кабинет", icon: "UserCircle" },
];

export default function Layout({ children, currentPage, onNavigate, isAuthenticated, userRole, userName, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060F1E' }}>
      {/* Sidebar */}
      <aside className={`sidebar-nav flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 relative`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
            <Icon name="Shield" size={18} className="text-navy" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <div className="font-montserrat font-700 text-sm tracking-wide text-white">ДокуСайн</div>
              <div className="text-xs" style={{ color: '#C9A84C' }}>Профессиональная платформа</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-ibm transition-all duration-200 ${
                currentPage === item.id
                  ? 'nav-item-active font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name={item.icon} size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}

          {userRole === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-ibm transition-all duration-200 ${
                currentPage === "admin"
                  ? 'nav-item-active font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon name="Settings2" size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>Администратор</span>}
            </button>
          )}
        </nav>

        {/* User info */}
        <div className="border-t border-white/5 p-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-montserrat font-bold" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' }}>
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{userName}</div>
                  <div className="text-xs" style={{ color: '#7A90A8' }}>{userRole === 'admin' ? 'Администратор' : 'Пользователь'}</div>
                </div>
              )}
              {sidebarOpen && (
                <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Icon name="LogOut" size={15} />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onNavigate("login")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon name="LogIn" size={16} />
              {sidebarOpen && <span>Войти</span>}
            </button>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full border flex items-center justify-center transition-all hover:scale-110"
          style={{ background: '#112040', borderColor: 'rgba(201,168,76,0.3)', color: '#C9A84C' }}
        >
          <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={12} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b" style={{ background: 'rgba(6,15,30,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(201,168,76,0.1)' }}>
          <div className="text-sm font-ibm" style={{ color: '#7A90A8' }}>
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-gold-light transition-colors">
              <Icon name="Bell" size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: '#C9A84C' }} />
            </button>
            <div className="text-xs font-mono-ibm px-2 py-1 rounded" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
              v1.0
            </div>
          </div>
        </header>

        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}