import { useState } from "react";
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

type Page = "home" | "sign" | "stamps" | "converter" | "cabinet" | "templates" | "history" | "admin" | "login" | "register";

interface User {
  name: string;
  email: string;
  role: "user" | "admin";
}

export default function Index() {
  const [page, setPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);

  const handleAuth = (name: string, email: string, role: "user" | "admin") => {
    setUser({ name, email, role });
    setPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  const handleNavigate = (p: Page) => {
    setPage(p);
  };

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
      case "home": return <HomePage onNavigate={handleNavigate} userName={user?.name} />;
      case "sign": return <SignPage />;
      case "stamps": return <StampsPage />;
      case "converter": return <ConverterPage />;
      case "templates": return <TemplatesPage />;
      case "history": return <HistoryPage />;
      case "cabinet": return <CabinetPage userName={user?.name} userEmail={user?.email} />;
      case "admin": return user?.role === "admin" ? <AdminPage /> : <HomePage onNavigate={handleNavigate} userName={user?.name} />;
      default: return <HomePage onNavigate={handleNavigate} userName={user?.name} />;
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
