import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import SignPage from "@/pages/SignPage";
import StampsPage from "@/pages/StampsPage";
import ConverterPage from "@/pages/ConverterPage";
import TemplatesPage from "@/pages/TemplatesPage";
import HistoryPage from "@/pages/HistoryPage";
import CabinetPage from "@/pages/CabinetPage";
import AdminPage from "@/pages/AdminPage";
import { authApi, User } from "@/lib/api";

type Page = "home" | "sign" | "stamps" | "converter" | "cabinet" | "templates" | "history" | "admin" | "login" | "register";

export default function Index() {
  const [page, setPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Восстанавливаем сессию при загрузке
  useEffect(() => {
    authApi.me().then((u) => {
      if (u) {
        setUser(u);
        setPage("home");
      }
      setAuthChecked(true);
    });
  }, []);

  const handleAuth = (u: User) => {
    setUser(u);
    setPage("home");
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setPage("login");
  };

  const handleNavigate = (p: Page) => setPage(p);

  // Пока проверяем сессию — показываем заглушку
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060F1E' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm font-ibm" style={{ color: '#7A90A8' }}>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (page === "login" || page === "register") {
    return (
      <AuthPage
        mode={page === "login" ? "login" : "register"}
        onAuth={handleAuth}
        onSwitchMode={(mode) => setPage(mode)}
      />
    );
  }

  const renderPage = () => {
    switch (page) {
      case "home":      return <HomePage onNavigate={handleNavigate} user={user} />;
      case "sign":      return <SignPage user={user} />;
      case "stamps":    return <StampsPage user={user} onNavigate={handleNavigate} />;
      case "converter": return <ConverterPage />;
      case "templates": return <TemplatesPage />;
      case "history":   return <HistoryPage />;
      case "cabinet":   return <CabinetPage user={user} onUserUpdate={setUser} />;
      case "admin":     return user?.role === "admin" ? <AdminPage /> : <HomePage onNavigate={handleNavigate} user={user} />;
      default:          return <HomePage onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <Layout
      currentPage={page}
      onNavigate={handleNavigate}
      isAuthenticated={!!user}
      userRole={user?.role}
      userName={user?.name}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}