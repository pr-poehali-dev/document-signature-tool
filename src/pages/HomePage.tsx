import Icon from "@/components/ui/icon";

type PageType = "home" | "sign" | "stamps" | "converter" | "cabinet" | "templates" | "history" | "admin" | "login" | "register";

interface HomePageProps {
  onNavigate: (page: PageType) => void;
  userName?: string;
}

const stats = [
  { label: "Документов подписано", value: "2 847", icon: "FileCheck", trend: "+12%" },
  { label: "Печатей создано", value: "341", icon: "Stamp", trend: "+8%" },
  { label: "Файлов конвертировано", value: "1 204", icon: "ArrowLeftRight", trend: "+24%" },
  { label: "Активных пользователей", value: "156", icon: "Users", trend: "+5%" },
];

const quickActions: { id: PageType; label: string; desc: string; icon: string; color: string }[] = [
  { id: "sign", label: "Подписать документ", desc: "Загрузите файл и добавьте подпись", icon: "PenLine", color: "#C9A84C" },
  { id: "stamps", label: "Создать печать", desc: "Конструктор печатей и штампов", icon: "Stamp", color: "#4A9EFF" },
  { id: "converter", label: "Конвертировать", desc: "PDF, Word, Excel, изображения", icon: "ArrowLeftRight", color: "#4ADE80" },
  { id: "templates", label: "Шаблоны", desc: "Готовые шаблоны документов", icon: "FileText", color: "#A78BFA" },
];

const recentDocs = [
  { name: "Договор поставки №145", type: "PDF", status: "signed", date: "Сегодня, 14:32" },
  { name: "Акт выполненных работ", type: "DOCX", status: "pending", date: "Сегодня, 11:15" },
  { name: "Коммерческое предложение", type: "PDF", status: "signed", date: "Вчера, 16:48" },
  { name: "Устав организации 2025", type: "PDF", status: "signed", date: "18 мар, 09:20" },
];

export default function HomePage({ onNavigate, userName }: HomePageProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Hero greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-montserrat font-700 text-2xl text-white mb-1">
            Добро пожаловать{userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Управляйте документами профессионально и безопасно</p>
        </div>
        <button
          onClick={() => onNavigate("sign")}
          className="btn-gold px-5 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 shine-effect"
        >
          <Icon name="Plus" size={16} />
          Новый документ
        </button>
      </div>

      <div className="divider-gold" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card rounded-lg p-4 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.12)' }}>
                <Icon name={stat.icon} size={20} style={{ color: '#C9A84C' }} />
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                {stat.trend}
              </span>
            </div>
            <div className="font-montserrat font-700 text-xl text-white">{stat.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-montserrat font-600 text-sm uppercase tracking-widest mb-3" style={{ color: '#7A90A8' }}>Быстрые действия</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="glass-card-hover rounded-lg p-4 text-left animate-fade-in shine-effect"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${action.color}20` }}>
                <Icon name={action.icon} size={20} style={{ color: action.color }} />
              </div>
              <div className="font-montserrat font-600 text-sm text-white mb-1">{action.label}</div>
              <div className="text-xs leading-relaxed" style={{ color: '#7A90A8' }}>{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-montserrat font-600 text-sm uppercase tracking-widest" style={{ color: '#7A90A8' }}>Последние документы</h2>
          <button onClick={() => onNavigate("history")} className="text-xs transition-colors" style={{ color: '#C9A84C' }}>
            Вся история →
          </button>
        </div>
        <div className="glass-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>Документ</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>Формат</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>Статус</th>
                <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>Дата</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recentDocs.map((doc, i) => (
                <tr key={i} className="border-b hover:bg-white/3 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                        <Icon name="FileText" size={15} style={{ color: '#C9A84C' }} />
                      </div>
                      <span className="text-sm text-white font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono-ibm px-2 py-0.5 rounded" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', border: '1px solid rgba(74,158,255,0.2)' }}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'signed' ? 'status-badge-active' : 'status-badge-pending'}`}>
                      {doc.status === 'signed' ? '✓ Подписан' : '⏳ Ожидает'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#7A90A8' }}>{doc.date}</td>
                  <td className="px-4 py-3">
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <Icon name="Download" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security info */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: "Shield", title: "256-bit шифрование", desc: "Все документы защищены" },
          { icon: "CheckCircle", title: "Валидация подписей", desc: "Криптографическая проверка" },
          { icon: "Lock", title: "Конфиденциальность", desc: "Данные не передаются третьим лицам" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-lg" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}>
            <Icon name={item.icon} size={20} style={{ color: '#C9A84C' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-white">{item.title}</div>
              <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}