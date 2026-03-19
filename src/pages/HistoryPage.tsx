import { useState } from "react";
import Icon from "@/components/ui/icon";

const historyItems = [
  { id: 1, name: "Договор поставки №145", type: "PDF", action: "signed", date: "19 мар 2026, 14:32", size: "245 KB", signed: true },
  { id: 2, name: "Акт выполненных работ", type: "DOCX", action: "signed", date: "19 мар 2026, 11:15", size: "112 KB", signed: false },
  { id: 3, name: "Коммерческое предложение", type: "PDF", action: "converted", date: "18 мар 2026, 16:48", size: "1.2 MB", signed: true },
  { id: 4, name: "Устав организации 2025", type: "PDF", action: "signed", date: "18 мар 2026, 09:20", size: "890 KB", signed: true },
  { id: 5, name: "Счёт №87 на оплату", type: "XLSX", action: "converted", date: "17 мар 2026, 15:10", size: "78 KB", signed: false },
  { id: 6, name: "Трудовой договор — Петров", type: "DOCX", action: "signed", date: "17 мар 2026, 10:05", size: "134 KB", signed: true },
  { id: 7, name: "Акт приёма-передачи", type: "PDF", action: "stamped", date: "16 мар 2026, 17:30", size: "56 KB", signed: true },
  { id: 8, name: "Договор аренды офиса", type: "PDF", action: "signed", date: "15 мар 2026, 13:22", size: "412 KB", signed: true },
];

const actionLabels: Record<string, { label: string; color: string; icon: string }> = {
  signed: { label: "Подписан", color: "#4ade80", icon: "PenLine" },
  converted: { label: "Конвертирован", color: "#4A9EFF", icon: "ArrowLeftRight" },
  stamped: { label: "Запечатан", color: "#C9A84C", icon: "Stamp" },
};

export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = historyItems.filter(item =>
    (filter === "all" || item.action === filter) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-700 text-xl text-white mb-1">История документов</h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Все обработанные документы с подробной информацией</p>
        </div>
        <button className="px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white border transition-colors flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Icon name="Download" size={15} /> Экспорт истории
        </button>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
          {[
            { id: "all", label: "Все" },
            { id: "signed", label: "Подписанные" },
            { id: "converted", label: "Конвертированные" },
            { id: "stamped", label: "С печатью" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              style={filter === f.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
            style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
          />
        </div>
        <div className="text-sm ml-auto" style={{ color: '#7A90A8' }}>
          {filtered.length} документов
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
              {["Документ", "Формат", "Действие", "Дата", "Размер", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: '#7A90A8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const actionInfo = actionLabels[item.action];
              return (
                <tr
                  key={item.id}
                  className="border-b transition-colors cursor-pointer hover:bg-white/3"
                  style={{ borderColor: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.04}s` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,76,0.08)' }}>
                        <Icon name="FileText" size={15} style={{ color: '#C9A84C' }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        {item.signed && (
                          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#4ade80' }}>
                            <Icon name="ShieldCheck" size={11} />
                            Подпись верифицирована
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono-ibm px-2 py-0.5 rounded" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', border: '1px solid rgba(74,158,255,0.15)' }}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Icon name={actionInfo.icon} size={12} style={{ color: actionInfo.color }} />
                      <span style={{ color: actionInfo.color }}>{actionInfo.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#7A90A8' }}>{item.date}</td>
                  <td className="px-4 py-3 text-xs font-mono-ibm" style={{ color: '#7A90A8' }}>{item.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <Icon name="Download" size={15} />
                      </button>
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <Icon name="Eye" size={15} />
                      </button>
                      <button className="text-slate-500 hover:text-red-400 transition-colors">
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#7A90A8' }}>
            <Icon name="FileSearch" size={40} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Документы не найдены</div>
          </div>
        )}
      </div>
    </div>
  );
}
