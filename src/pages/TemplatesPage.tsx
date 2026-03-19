import { useState } from "react";
import Icon from "@/components/ui/icon";

const templates = [
  { id: 1, name: "Договор поставки", category: "Договоры", pages: 4, desc: "Стандартный договор поставки товаров с приложениями", icon: "Truck" },
  { id: 2, name: "Договор аренды помещения", category: "Договоры", pages: 6, desc: "Аренда коммерческой или жилой недвижимости", icon: "Building2" },
  { id: 3, name: "Трудовой договор", category: "Кадры", pages: 5, desc: "Трудовой договор с сотрудником", icon: "UserCheck" },
  { id: 4, name: "Акт выполненных работ", category: "Акты", pages: 2, desc: "Акт приёмки работ или услуг", icon: "FileCheck" },
  { id: 5, name: "Счёт на оплату", category: "Финансы", pages: 1, desc: "Счёт для выставления клиентам", icon: "Receipt" },
  { id: 6, name: "Коммерческое предложение", category: "Продажи", pages: 3, desc: "Профессиональное КП с прайс-листом", icon: "BarChart2" },
  { id: 7, name: "Доверенность", category: "Юридические", pages: 2, desc: "Доверенность на совершение действий", icon: "Scroll" },
  { id: 8, name: "Соглашение о конфиденциальности", category: "Юридические", pages: 3, desc: "NDA для сотрудников и партнёров", icon: "Lock" },
  { id: 9, name: "Приказ по организации", category: "Кадры", pages: 2, desc: "Приказ руководителя предприятия", icon: "FileWarning" },
];

const categories = ["Все", "Договоры", "Кадры", "Акты", "Финансы", "Продажи", "Юридические"];

export default function TemplatesPage() {
  const [selectedCat, setSelectedCat] = useState("Все");
  const [search, setSearch] = useState("");

  const filtered = templates.filter(t =>
    (selectedCat === "Все" || t.category === selectedCat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-700 text-xl text-white mb-1">Шаблоны документов</h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Готовые профессиональные шаблоны для бизнеса</p>
        </div>
        <button className="btn-gold px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Icon name="Plus" size={15} /> Загрузить свой шаблон
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск шаблонов..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
          style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={selectedCat === cat
              ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' }
              : { background: 'rgba(17,32,64,0.8)', color: '#7A90A8', border: '1px solid rgba(201,168,76,0.15)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <div key={t.id} className="glass-card-hover rounded-lg p-5 animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <Icon name={t.icon} size={20} style={{ color: '#C9A84C' }} />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', border: '1px solid rgba(74,158,255,0.2)' }}>
                {t.category}
              </span>
            </div>

            <h3 className="font-montserrat font-600 text-sm text-white mb-1">{t.name}</h3>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: '#7A90A8' }}>{t.desc}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs" style={{ color: '#7A90A8' }}>
                <Icon name="FileText" size={12} />
                {t.pages} {t.pages === 1 ? 'страница' : t.pages < 5 ? 'страницы' : 'страниц'}
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded font-medium transition-all text-slate-400 hover:text-white border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  Просмотр
                </button>
                <button className="btn-gold text-xs px-3 py-1.5 rounded font-medium">
                  Использовать
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: '#7A90A8' }}>
          <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">Шаблоны не найдены</div>
        </div>
      )}
    </div>
  );
}
