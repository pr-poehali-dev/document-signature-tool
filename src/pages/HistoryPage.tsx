import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { documentsApi, Document } from "@/lib/api";

const actionLabels: Record<string, { label: string; color: string; icon: string }> = {
  signed:    { label: "Подписан",      color: "#4ade80", icon: "PenLine" },
  converted: { label: "Конвертирован", color: "#4A9EFF", icon: "ArrowLeftRight" },
  stamped:   { label: "Запечатан",     color: "#C9A84C", icon: "Stamp" },
  uploaded:  { label: "Загружен",      color: "#A78BFA", icon: "Upload" },
};

function fmtSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    documentsApi.list()
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter(doc =>
    (filter === "all" || doc.action === filter || doc.status === filter) &&
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (doc: Document) => {
    const res = await documentsApi.download(doc.id).catch(() => null);
    if (res?.url) window.open(res.url, '_blank');
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-700 text-xl text-white mb-1">История документов</h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Все обработанные документы с подробной информацией</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
          {[
            { id: "all", label: "Все" },
            { id: "signed", label: "Подписанные" },
            { id: "converted", label: "Конвертированные" },
            { id: "uploaded", label: "Загруженные" },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              style={filter === f.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
            style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
          />
        </div>
        <div className="text-sm ml-auto" style={{ color: '#7A90A8' }}>{filtered.length} документов</div>
      </div>

      <div className="glass-card rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
                {["Документ", "Формат", "Действие", "Дата", "Размер", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const actionInfo = actionLabels[doc.action] || actionLabels['uploaded'];
                return (
                  <tr key={doc.id} className="border-b transition-colors hover:bg-white/3" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,76,0.08)' }}>
                          <Icon name="FileText" size={15} style={{ color: '#C9A84C' }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{doc.name}</div>
                          {doc.has_signature && (
                            <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#4ade80' }}>
                              <Icon name="ShieldCheck" size={11} /> Подпись верифицирована
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono-ibm px-2 py-0.5 rounded" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', border: '1px solid rgba(74,158,255,0.15)' }}>
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Icon name={actionInfo.icon} size={12} style={{ color: actionInfo.color }} />
                        <span style={{ color: actionInfo.color }}>{actionInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#7A90A8' }}>{fmtDate(doc.created_at)}</td>
                    <td className="px-4 py-3 text-xs font-mono-ibm" style={{ color: '#7A90A8' }}>{fmtSize(doc.file_size)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDownload(doc)} className="text-slate-500 hover:text-white transition-colors">
                          <Icon name="Download" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#7A90A8' }}>
            <Icon name="FileSearch" size={40} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Документы не найдены</div>
          </div>
        )}
      </div>
    </div>
  );
}
