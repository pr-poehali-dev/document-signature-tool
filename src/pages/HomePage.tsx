import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { documentsApi, Document, User } from "@/lib/api";

type PageType = "home" | "sign" | "stamps" | "converter" | "cabinet" | "templates" | "history" | "admin" | "login" | "register";

interface HomePageProps {
  onNavigate: (page: PageType) => void;
  user?: User | null;
}

const quickActions: { id: PageType; label: string; desc: string; icon: string; color: string }[] = [
  { id: "sign", label: "Подписать документ", desc: "Загрузите файл и добавьте подпись", icon: "PenLine", color: "#C9A84C" },
  { id: "stamps", label: "Создать печать", desc: "Конструктор печатей и штампов", icon: "Stamp", color: "#4A9EFF" },
  { id: "converter", label: "Конвертировать", desc: "PDF, Word, Excel, изображения", icon: "ArrowLeftRight", color: "#4ADE80" },
  { id: "templates", label: "Шаблоны", desc: "Готовые шаблоны документов", icon: "FileText", color: "#A78BFA" },
];

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return `Сегодня, ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffH < 48) return `Вчера, ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function HomePage({ onNavigate, user }: HomePageProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [stats, setStats] = useState({ total: 0, signed: 0, stamped: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      documentsApi.list().catch(() => [] as Document[]),
      documentsApi.stats().catch(() => ({ total: 0, signed: 0, stamped: 0 })),
    ]).then(([docList, st]) => {
      setDocs(docList.slice(0, 5));
      setStats(st);
    }).finally(() => setLoading(false));
  }, [user]);

  const statCards = [
    { label: "Документов", value: String(stats.total), icon: "FileCheck" },
    { label: "Подписанных", value: String(stats.signed), icon: "PenLine" },
    { label: "С печатью", value: String(stats.stamped), icon: "Stamp" },
    { label: "В обработке", value: String(Math.max(0, stats.total - stats.signed)), icon: "Clock" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-montserrat font-700 text-2xl text-white mb-1">
            Добро пожаловать{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Управляйте документами профессионально и безопасно</p>
        </div>
        <button onClick={() => onNavigate("sign")} className="btn-gold px-5 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 shine-effect">
          <Icon name="Plus" size={16} /> Новый документ
        </button>
      </div>

      <div className="divider-gold" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card rounded-lg p-4 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(201,168,76,0.12)' }}>
              <Icon name={stat.icon} size={20} style={{ color: '#C9A84C' }} />
            </div>
            {loading ? (
              <div className="h-7 w-16 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
            ) : (
              <div className="font-montserrat font-700 text-xl text-white">{stat.value}</div>
            )}
            <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-montserrat font-600 text-sm uppercase tracking-widest mb-3" style={{ color: '#7A90A8' }}>Быстрые действия</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button key={action.id} onClick={() => onNavigate(action.id)}
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-montserrat font-600 text-sm uppercase tracking-widest" style={{ color: '#7A90A8' }}>Последние документы</h2>
          <button onClick={() => onNavigate("history")} className="text-xs" style={{ color: '#C9A84C' }}>Вся история →</button>
        </div>
        <div className="glass-card rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#7A90A8' }}>
              <Icon name="FileText" size={36} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm mb-3">Документов пока нет</div>
              <button onClick={() => onNavigate("sign")} className="btn-gold px-4 py-2 rounded-lg text-xs font-semibold">
                Загрузить первый документ
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                  {["Документ", "Формат", "Статус", "Дата", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-white/3 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
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
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'signed' ? 'status-badge-active' : 'status-badge-pending'}`}>
                        {doc.status === 'signed' ? '✓ Подписан' : '⏳ Ожидает'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#7A90A8' }}>{fmtDate(doc.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={async () => {
                        const res = await documentsApi.download(doc.id).catch(() => null);
                        if (res?.url) window.open(res.url, '_blank');
                      }} className="text-slate-500 hover:text-white transition-colors">
                        <Icon name="Download" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
