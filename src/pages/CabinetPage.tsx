import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authApi, User } from "@/lib/api";

interface CabinetPageProps {
  user?: User | null;
  onUserUpdate?: (user: User) => void;
}

export default function CabinetPage({ user, onUserUpdate }: CabinetPageProps) {
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [position, setPosition] = useState(user?.position || "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      await authApi.updateProfile({ name, company, phone, position });
      if (onUserUpdate && user) onUserUpdate({ ...user, name, company, phone, position });
      setSaveMsg("Данные сохранены!");
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (!newPw || !oldPw) { setPwMsg("Заполните все поля"); return; }
    if (newPw !== confirmPw) { setPwMsg("Пароли не совпадают"); return; }
    if (newPw.length < 6) { setPwMsg("Пароль не менее 6 символов"); return; }
    setPwLoading(true);
    setPwMsg("");
    try {
      await authApi.changePassword(oldPw, newPw);
      setPwMsg("Пароль успешно изменён!");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (e: unknown) {
      setPwMsg(e instanceof Error ? e.message : "Ошибка смены пароля");
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMsg(""), 4000);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-montserrat font-700 text-xl text-white mb-1">Личный кабинет</h1>
        <p className="text-sm" style={{ color: '#7A90A8' }}>Управление профилем и безопасностью</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Profile card */}
        <div className="col-span-1">
          <div className="glass-card rounded-xl p-5 text-center mb-4">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-montserrat font-800"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' }}>
              {(user?.name || "U").charAt(0)}
            </div>
            <div className="font-montserrat font-600 text-white mb-0.5">{user?.name || "—"}</div>
            <div className="text-xs mb-3" style={{ color: '#7A90A8' }}>{user?.email}</div>
            <div className="text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Icon name="Crown" size={12} />
              {user?.role === 'admin' ? 'Администратор' : 'Pro аккаунт'}
            </div>
          </div>
          {user?.company && (
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(17,32,64,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Icon name="Building2" size={13} className="inline mr-1.5" style={{ color: '#C9A84C' }} />
              <span className="text-slate-300">{user.company}</span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="col-span-3">
          <div className="flex gap-1 p-1 rounded-lg mb-5 w-fit" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
            {[
              { id: "profile", label: "Профиль", icon: "User" },
              { id: "security", label: "Безопасность", icon: "Shield" },
              { id: "subscription", label: "Подписка", icon: "Crown" },
              { id: "notifications", label: "Уведомления", icon: "Bell" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
                style={tab === t.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}>
                <Icon name={t.icon} size={14} /> {t.label}
              </button>
            ))}
          </div>

          {tab === "profile" && (
            <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-montserrat font-600 text-white">Личные данные</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Полное имя", value: name, setter: setName },
                  { label: "Организация", value: company, setter: setCompany },
                  { label: "Телефон", value: phone, setter: setPhone },
                  { label: "Должность", value: position, setter: setPosition },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                    <input type="text" value={value} onChange={(e) => setter(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                      style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.2)'} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                <input type="email" value={email} disabled
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none opacity-50 cursor-not-allowed"
                  style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#7A90A8' }} />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
                  {saving ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Сохранение...</> : <><Icon name="Save" size={15} />Сохранить изменения</>}
                </button>
                {saveMsg && <span className="text-sm" style={{ color: saveMsg.includes("Ошибка") ? '#f87171' : '#4ade80' }}>{saveMsg}</span>}
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-montserrat font-600 text-white mb-4">Изменение пароля</h3>
                <div className="space-y-3">
                  {[
                    { label: "Текущий пароль", val: oldPw, set: setOldPw },
                    { label: "Новый пароль", val: newPw, set: setNewPw },
                    { label: "Подтвердите новый пароль", val: confirmPw, set: setConfirmPw },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                      <input type="password" value={val} onChange={(e) => set(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                        style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.5)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.2)'} />
                    </div>
                  ))}
                  {pwMsg && <div className="text-sm" style={{ color: pwMsg.includes("успешно") ? '#4ade80' : '#f87171' }}>{pwMsg}</div>}
                  <button onClick={handleChangePassword} disabled={pwLoading}
                    className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 mt-2 disabled:opacity-60">
                    {pwLoading ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Изменение...</> : "Изменить пароль"}
                  </button>
                </div>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-montserrat font-600 text-white mb-4">Двухфакторная аутентификация</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">SMS-верификация</div>
                    <div className="text-xs" style={{ color: '#7A90A8' }}>Дополнительная защита при входе</div>
                  </div>
                  <button className="btn-gold px-4 py-2 rounded-lg text-xs font-semibold">Подключить</button>
                </div>
              </div>
            </div>
          )}

          {tab === "subscription" && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              {[
                { name: "Базовый", price: "Бесплатно", features: ["До 10 документов/мес", "Базовые печати", "Конвертация PDF↔DOCX"], current: false },
                { name: "Pro", price: "990 ₽/мес", features: ["Неограниченные документы", "Все виды печатей", "Все форматы конвертации", "Приоритетная поддержка", "Аналитика"], current: true },
              ].map((plan) => (
                <div key={plan.name} className="rounded-xl p-5" style={{
                  background: plan.current ? 'rgba(201,168,76,0.06)' : 'rgba(17,32,64,0.7)',
                  border: plan.current ? '2px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.07)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-montserrat font-700 text-lg text-white">{plan.name}</span>
                    {plan.current && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}>Активен</span>}
                  </div>
                  <div className="font-montserrat font-700 text-xl mb-4" style={{ color: '#C9A84C' }}>{plan.price}</div>
                  <div className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Icon name="Check" size={13} className="text-green-400 flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  {!plan.current && <button className="btn-gold w-full py-2.5 rounded-lg text-sm font-semibold">Перейти на Pro</button>}
                </div>
              ))}
            </div>
          )}

          {tab === "notifications" && (
            <div className="glass-card rounded-xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-montserrat font-600 text-white">Настройки уведомлений</h3>
              {[
                { label: "Документ подписан", desc: "Уведомление при подписании" },
                { label: "Конвертация завершена", desc: "Когда файл готов к скачиванию" },
                { label: "Новые шаблоны", desc: "Добавлены новые шаблоны документов" },
                { label: "Безопасность", desc: "Вход с нового устройства" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{item.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:transition-all peer-checked:bg-amber-600" style={{ background: '#2A4060' }} />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
