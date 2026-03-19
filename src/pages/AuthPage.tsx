import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, User } from "@/lib/api";

type AuthMode = "login" | "register";

interface AuthPageProps {
  mode: AuthMode;
  onAuth: (user: User) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export default function AuthPage({ mode, onAuth, onSwitchMode }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Заполните все поля"); return; }
    if (mode === "register" && !name) { setError("Введите имя"); return; }
    if (mode === "register" && password.length < 6) { setError("Пароль не менее 6 символов"); return; }

    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await authApi.login(email.trim().toLowerCase(), password);
      } else {
        result = await authApi.register(name.trim(), email.trim().toLowerCase(), password, company.trim());
      }
      onAuth(result.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#060F1E' }}>
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #112040 0%, #0A1628 60%, #060F1E 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #C9A84C, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #C9A84C, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
              <Icon name="Shield" size={22} style={{ color: '#0A1628' }} />
            </div>
            <div>
              <div className="font-montserrat font-700 text-lg text-white tracking-wide">ДокуСайн</div>
              <div className="text-xs" style={{ color: '#C9A84C' }}>Профессиональная платформа</div>
            </div>
          </div>
          <h1 className="font-montserrat font-800 text-4xl text-white leading-tight mb-6">
            Подписывайте<br />
            <span style={{ background: 'linear-gradient(135deg,#C9A84C,#E2C87A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>документы</span><br />
            профессионально
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7A90A8' }}>
            Электронные подписи, печати, конвертация форматов — всё в одном защищённом пространстве
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: "Shield", text: "256-bit шифрование данных" },
            { icon: "CheckCircle", text: "Юридически значимые подписи" },
            { icon: "Zap", text: "Конвертация без потери качества" },
            { icon: "Globe", text: "Полная поддержка кириллицы" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <Icon name={f.icon} size={16} style={{ color: '#C9A84C' }} />
              </div>
              <span className="text-sm text-slate-300">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-scale-in">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
              <Icon name="Shield" size={18} style={{ color: '#0A1628' }} />
            </div>
            <div className="font-montserrat font-700 text-white">ДокуСайн</div>
          </div>

          <h2 className="font-montserrat font-700 text-2xl text-white mb-2">
            {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#7A90A8' }}>
            {mode === "login" ? "Войдите в свой аккаунт ДокуСайн" : "Зарегистрируйтесь бесплатно"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Полное имя *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Петров"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Организация</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ООО «Название»"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@company.ru"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Пароль *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.6)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.2)'}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <Icon name="AlertCircle" size={15} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                {mode === "login" ? "Вход..." : "Регистрация..."}</>
              ) : (
                mode === "login" ? "Войти в систему" : "Создать аккаунт"
              )}
            </button>
          </form>

          <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)' }} />

          <div className="text-center text-sm" style={{ color: '#7A90A8' }}>
            {mode === "login" ? (
              <>Нет аккаунта?{" "}
                <button onClick={() => onSwitchMode("register")} className="font-medium" style={{ color: '#C9A84C' }}>Зарегистрироваться</button>
              </>
            ) : (
              <>Уже есть аккаунт?{" "}
                <button onClick={() => onSwitchMode("login")} className="font-medium" style={{ color: '#C9A84C' }}>Войти</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
