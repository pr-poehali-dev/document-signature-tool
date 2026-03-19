import { useState } from "react";
import Icon from "@/components/ui/icon";

const users = [
  { id: 1, name: "Иван Петров", email: "ivan@company.ru", role: "admin", docs: 47, status: "active", joined: "10 янв 2026" },
  { id: 2, name: "Мария Сидорова", email: "maria@firm.ru", role: "user", docs: 23, status: "active", joined: "15 янв 2026" },
  { id: 3, name: "Алексей Козлов", email: "alexey@biz.ru", role: "user", docs: 8, status: "active", joined: "1 фев 2026" },
  { id: 4, name: "Наталья Иванова", email: "natalia@corp.ru", role: "user", docs: 31, status: "blocked", joined: "20 янв 2026" },
  { id: 5, name: "Дмитрий Новиков", email: "dmitry@trade.ru", role: "user", docs: 15, status: "active", joined: "5 мар 2026" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchUser, setSearchUser] = useState("");

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const systemStats = [
    { label: "Всего пользователей", value: "156", icon: "Users", color: "#4A9EFF" },
    { label: "Документов сегодня", value: "48", icon: "FileText", color: "#C9A84C" },
    { label: "Конвертаций", value: "127", icon: "ArrowLeftRight", color: "#4ADE80" },
    { label: "Место на диске", value: "2.4 GB", icon: "HardDrive", color: "#A78BFA" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-700 text-xl text-white mb-1">Панель администратора</h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Управление пользователями, системой и аналитика</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Система работает</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {systemStats.map((stat, i) => (
          <div key={i} className="stat-card rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                <Icon name={stat.icon} size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="font-montserrat font-700 text-xl text-white">{stat.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg mb-5 w-fit" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
        {[
          { id: "overview", label: "Обзор", icon: "LayoutDashboard" },
          { id: "users", label: "Пользователи", icon: "Users" },
          { id: "system", label: "Система", icon: "Settings2" },
          { id: "logs", label: "Логи", icon: "Terminal" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-4 animate-fade-in">
          <div className="col-span-2 glass-card rounded-lg p-5">
            <h3 className="font-montserrat font-600 text-sm text-white mb-4">Активность за неделю</h3>
            <div className="flex items-end gap-2 h-32">
              {[45, 72, 38, 91, 67, 83, 48].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t transition-all" style={{ height: `${(val / 100) * 120}px`, background: `linear-gradient(to top, #A07830, #C9A84C)`, opacity: i === 6 ? 1 : 0.6 }} />
                  <span className="text-xs" style={{ color: '#7A90A8' }}>
                    {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-lg p-5">
            <h3 className="font-montserrat font-600 text-sm text-white mb-4">Форматы файлов</h3>
            <div className="space-y-3">
              {[
                { format: "PDF", count: 847, pct: 70 },
                { format: "DOCX", count: 234, pct: 19 },
                { format: "XLSX", count: 98, pct: 8 },
                { format: "Другие", count: 27, pct: 3 },
              ].map((f) => (
                <div key={f.format}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{f.format}</span>
                    <span style={{ color: '#C9A84C' }}>{f.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${f.pct}%`, background: 'linear-gradient(90deg, #A07830, #C9A84C)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Поиск пользователей..."
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
              />
            </div>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ml-auto">
              <Icon name="UserPlus" size={14} /> Добавить пользователя
            </button>
          </div>
          <div className="glass-card rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                  {["Пользователь", "Роль", "Документов", "Статус", "Дата входа", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-white/3 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-montserrat font-bold" style={{ background: 'linear-gradient(135deg, #C9A84C40, #A0783040)', color: '#C9A84C' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-xs" style={{ color: '#7A90A8' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={user.role === 'admin' ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' } : { background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', border: '1px solid rgba(74,158,255,0.2)' }}>
                        {user.role === 'admin' ? '★ Админ' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{user.docs}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'active' ? 'status-badge-active' : ''}`}
                        style={user.status === 'blocked' ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' } : {}}>
                        {user.status === 'active' ? '● Активен' : '✕ Заблокирован'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#7A90A8' }}>{user.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-slate-500 hover:text-white transition-colors"><Icon name="Edit2" size={14} /></button>
                        <button className="text-slate-500 hover:text-red-400 transition-colors"><Icon name="Ban" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System */}
      {activeTab === "system" && (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          {[
            { title: "Хранилище файлов", value: "2.4 GB / 50 GB", pct: 5, icon: "HardDrive" },
            { title: "Нагрузка сервера", value: "12%", pct: 12, icon: "Cpu" },
            { title: "Активные сессии", value: "23", pct: 23, icon: "Activity" },
            { title: "Ошибки за 24ч", value: "0", pct: 0, icon: "AlertCircle" },
          ].map((s) => (
            <div key={s.title} className="glass-card rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon name={s.icon} size={18} style={{ color: '#C9A84C' }} />
                <span className="font-medium text-white text-sm">{s.title}</span>
              </div>
              <div className="font-montserrat font-700 text-2xl text-white mb-3">{s.value}</div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(s.pct, 2)}%`, background: s.pct > 80 ? '#ef4444' : 'linear-gradient(90deg, #A07830, #C9A84C)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs */}
      {activeTab === "logs" && (
        <div className="glass-card rounded-lg p-4 animate-fade-in">
          <div className="font-mono-ibm text-xs space-y-1.5">
            {[
              { time: "14:32:15", level: "INFO", msg: "Документ подписан: Договор №145 (user_id: 1)" },
              { time: "14:31:02", level: "INFO", msg: "Конвертация PDF→DOCX завершена (file_id: 892)" },
              { time: "14:28:44", level: "WARN", msg: "Попытка загрузки файла > 50MB ограничена" },
              { time: "14:25:11", level: "INFO", msg: "Новый пользователь зарегистрирован: dmitry@trade.ru" },
              { time: "14:20:33", level: "INFO", msg: "Печать создана и сохранена в библиотеку (user_id: 2)" },
              { time: "14:15:08", level: "ERROR", msg: "Ошибка конвертации: неверный формат файла HEIC" },
              { time: "14:10:55", level: "INFO", msg: "Система: плановая очистка временных файлов" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#7A90A8' }}>{log.time}</span>
                <span style={{ color: log.level === 'ERROR' ? '#f87171' : log.level === 'WARN' ? '#F59E0B' : '#4ade80', minWidth: '45px' }}>{log.level}</span>
                <span style={{ color: '#b0c0d0' }}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
