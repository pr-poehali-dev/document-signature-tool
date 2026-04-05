import { useState } from "react";
import Icon from "@/components/ui/icon";

const GEN_DOC_URL = 'https://functions.poehali.dev/e8c63c5a-2c2d-4c52-ae65-d37e3de6d82e';

interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  pages: number;
  desc: string;
  icon: string;
  fields: TemplateField[];
}

const templates: Template[] = [
  {
    id: 1, name: "Договор поставки", category: "Договоры", pages: 4,
    desc: "Стандартный договор поставки товаров с приложениями", icon: "Truck",
    fields: [
      { key: 'contract_num', label: 'Номер договора', placeholder: '123' },
      { key: 'contract_date', label: 'Дата договора', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'supplier', label: 'Поставщик (полное наименование)', placeholder: 'ООО «Поставщик»' },
      { key: 'supplier_inn', label: 'ИНН поставщика', placeholder: '7701234567' },
      { key: 'buyer', label: 'Покупатель (полное наименование)', placeholder: 'ООО «Покупатель»' },
      { key: 'buyer_inn', label: 'ИНН покупателя', placeholder: '7709876543' },
      { key: 'goods', label: 'Наименование товара', placeholder: 'Запасные части к оборудованию' },
      { key: 'amount', label: 'Сумма договора (руб.)', placeholder: '500 000,00' },
      { key: 'delivery_days', label: 'Срок поставки (дней)', placeholder: '30' },
    ],
  },
  {
    id: 2, name: "Договор аренды помещения", category: "Договоры", pages: 6,
    desc: "Аренда коммерческой или жилой недвижимости", icon: "Building2",
    fields: [
      { key: 'contract_num', label: 'Номер договора', placeholder: '45' },
      { key: 'contract_date', label: 'Дата договора', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'landlord', label: 'Арендодатель', placeholder: 'ООО «Владелец»' },
      { key: 'tenant', label: 'Арендатор', placeholder: 'ООО «Арендатор»' },
      { key: 'address', label: 'Адрес помещения', placeholder: 'г. Москва, ул. Примерная, д. 1, оф. 10' },
      { key: 'area', label: 'Площадь (кв.м)', placeholder: '50' },
      { key: 'rent', label: 'Арендная плата в месяц (руб.)', placeholder: '80 000,00' },
      { key: 'period_from', label: 'Аренда с', placeholder: '01.01.2025', type: 'date' },
      { key: 'period_to', label: 'Аренда по', placeholder: '31.12.2025', type: 'date' },
    ],
  },
  {
    id: 3, name: "Трудовой договор", category: "Кадры", pages: 5,
    desc: "Трудовой договор с сотрудником", icon: "UserCheck",
    fields: [
      { key: 'contract_num', label: 'Номер договора', placeholder: '12' },
      { key: 'contract_date', label: 'Дата заключения', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'employer', label: 'Работодатель', placeholder: 'ООО «Компания»' },
      { key: 'employee', label: 'Работник (ФИО)', placeholder: 'Иванов Иван Иванович' },
      { key: 'position', label: 'Должность', placeholder: 'Менеджер по продажам' },
      { key: 'salary', label: 'Оклад (руб.)', placeholder: '80 000' },
      { key: 'start_date', label: 'Дата начала работы', placeholder: '01.01.2025', type: 'date' },
      { key: 'schedule', label: 'Режим работы', placeholder: '5/2, 09:00–18:00' },
    ],
  },
  {
    id: 4, name: "Акт выполненных работ", category: "Акты", pages: 2,
    desc: "Акт приёмки работ или услуг", icon: "FileCheck",
    fields: [
      { key: 'act_num', label: 'Номер акта', placeholder: '7' },
      { key: 'act_date', label: 'Дата акта', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'contractor', label: 'Исполнитель', placeholder: 'ООО «Исполнитель»' },
      { key: 'customer', label: 'Заказчик', placeholder: 'ООО «Заказчик»' },
      { key: 'contract_num', label: 'Номер договора', placeholder: '123' },
      { key: 'contract_date', label: 'Дата договора', placeholder: '01.01.2025', type: 'date' },
      { key: 'work_desc', label: 'Описание работ/услуг', placeholder: 'Разработка сайта' },
      { key: 'amount', label: 'Стоимость (руб.)', placeholder: '150 000,00' },
    ],
  },
  {
    id: 5, name: "Счёт на оплату", category: "Финансы", pages: 1,
    desc: "Счёт для выставления клиентам", icon: "Receipt",
    fields: [
      { key: 'invoice_num', label: 'Номер счёта', placeholder: '42' },
      { key: 'invoice_date', label: 'Дата счёта', placeholder: '01.01.2025', type: 'date' },
      { key: 'seller', label: 'Продавец/Исполнитель', placeholder: 'ООО «Компания»' },
      { key: 'seller_inn', label: 'ИНН продавца', placeholder: '7701234567' },
      { key: 'seller_bank', label: 'Банк продавца', placeholder: 'АО «Сбербанк»' },
      { key: 'seller_account', label: 'Расчётный счёт', placeholder: '40702810000000000000' },
      { key: 'seller_bik', label: 'БИК банка', placeholder: '044525225' },
      { key: 'buyer', label: 'Покупатель/Плательщик', placeholder: 'ООО «Клиент»' },
      { key: 'item_name', label: 'Наименование товара/услуги', placeholder: 'Консультационные услуги' },
      { key: 'qty', label: 'Количество', placeholder: '1' },
      { key: 'price', label: 'Цена за единицу (руб.)', placeholder: '50 000,00' },
      { key: 'total', label: 'Итого (руб.)', placeholder: '50 000,00' },
    ],
  },
  {
    id: 6, name: "Коммерческое предложение", category: "Продажи", pages: 3,
    desc: "Профессиональное КП с прайс-листом", icon: "BarChart2",
    fields: [
      { key: 'offer_date', label: 'Дата КП', placeholder: '01.01.2025', type: 'date' },
      { key: 'sender', label: 'Отправитель (компания)', placeholder: 'ООО «Ваша компания»' },
      { key: 'recipient', label: 'Получатель (имя/компания)', placeholder: 'Иван Иванович' },
      { key: 'product', label: 'Продукт / услуга', placeholder: 'Разработка корпоративного сайта' },
      { key: 'price', label: 'Цена (руб.)', placeholder: '200 000' },
      { key: 'benefits', label: 'Преимущества (через запятую)', placeholder: 'высокое качество, гарантия 1 год, поддержка 24/7' },
      { key: 'valid_days', label: 'Действует (дней)', placeholder: '30' },
      { key: 'contact', label: 'Контакты', placeholder: '+7 (999) 123-45-67, email@example.com' },
    ],
  },
  {
    id: 7, name: "Доверенность", category: "Юридические", pages: 2,
    desc: "Доверенность на совершение действий", icon: "Scroll",
    fields: [
      { key: 'poa_date', label: 'Дата выдачи', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'principal', label: 'Доверитель (ФИО)', placeholder: 'Иванов Иван Иванович' },
      { key: 'principal_passport', label: 'Паспорт доверителя', placeholder: '45 00 123456, выдан...' },
      { key: 'attorney', label: 'Поверенный (ФИО)', placeholder: 'Петров Пётр Петрович' },
      { key: 'attorney_passport', label: 'Паспорт поверенного', placeholder: '45 01 654321, выдан...' },
      { key: 'powers', label: 'Полномочия', placeholder: 'Представлять интересы в налоговых органах, подписывать документы' },
      { key: 'valid_until', label: 'Действует до', placeholder: '31.12.2025', type: 'date' },
    ],
  },
  {
    id: 8, name: "Соглашение о конфиденциальности", category: "Юридические", pages: 3,
    desc: "NDA для сотрудников и партнёров", icon: "Lock",
    fields: [
      { key: 'contract_num', label: 'Номер соглашения', placeholder: '3' },
      { key: 'contract_date', label: 'Дата', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'party1', label: 'Сторона 1', placeholder: 'ООО «Компания»' },
      { key: 'party2', label: 'Сторона 2 (сотрудник или партнёр)', placeholder: 'Иванов Иван Иванович' },
      { key: 'subject', label: 'Предмет конфиденциальности', placeholder: 'коммерческая информация, клиентская база, ноу-хау' },
      { key: 'period_years', label: 'Срок действия (лет)', placeholder: '3' },
    ],
  },
  {
    id: 9, name: "Приказ по организации", category: "Кадры", pages: 2,
    desc: "Приказ руководителя предприятия", icon: "FileWarning",
    fields: [
      { key: 'company', label: 'Наименование организации', placeholder: 'ООО «Компания»' },
      { key: 'order_num', label: 'Номер приказа', placeholder: '15' },
      { key: 'order_date', label: 'Дата приказа', placeholder: '01.01.2025', type: 'date' },
      { key: 'city', label: 'Город', placeholder: 'г. Москва' },
      { key: 'subject', label: 'Тема приказа', placeholder: 'переводе сотрудников на дистанционную работу' },
      { key: 'order_text', label: 'Текст приказа', placeholder: '1. Перевести сотрудников отдела ... на дистанционный режим работы с 01.01.2025.\n2. ...' },
      { key: 'responsible', label: 'Ответственный', placeholder: 'Начальник отдела кадров Сидорова М.А.' },
      { key: 'director_position', label: 'Должность руководителя', placeholder: 'Генеральный директор' },
      { key: 'director', label: 'ФИО руководителя', placeholder: 'Иванов И.И.' },
    ],
  },
];

const categories = ["Все", "Договоры", "Кадры", "Акты", "Финансы", "Продажи", "Юридические"];

function formatDateForField(val: string): string {
  if (!val) return val;
  // convert YYYY-MM-DD → DD.MM.YYYY
  const m = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}.${m[2]}.${m[1]}`;
  return val;
}

function downloadBase64(b64: string, filename: string, mime: string) {
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function TemplatesPage() {
  const [selectedCat, setSelectedCat] = useState("Все");
  const [search, setSearch] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const filtered = templates.filter(t =>
    (selectedCat === "Все" || t.category === selectedCat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const openForm = (t: Template) => {
    setActiveTemplate(t);
    setFields({});
    setError("");
  };

  const closeForm = () => {
    setActiveTemplate(null);
    setError("");
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!activeTemplate) return;
    setGenerating(true);
    setError("");
    try {
      const normalizedFields: Record<string, string> = {};
      for (const [k, v] of Object.entries(fields)) {
        const fieldDef = activeTemplate.fields.find(f => f.key === k);
        normalizedFields[k] = fieldDef?.type === 'date' ? formatDateForField(v) : v;
      }
      const res = await fetch(`${GEN_DOC_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: activeTemplate.id, fields: normalizedFields }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка генерации');
      downloadBase64(data.file_data, data.file_name, data.mime);
      closeForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-montserrat font-700 text-xl text-white mb-1">Шаблоны документов</h1>
          <p className="text-sm" style={{ color: '#7A90A8' }}>Заполните поля и скачайте готовый DOCX-документ</p>
        </div>
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
                <button
                  onClick={() => setPreviewTemplate(previewTemplate?.id === t.id ? null : t)}
                  className="text-xs px-3 py-1.5 rounded font-medium transition-all text-slate-400 hover:text-white border"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  Поля
                </button>
                <button
                  onClick={() => openForm(t)}
                  className="btn-gold text-xs px-3 py-1.5 rounded font-medium flex items-center gap-1"
                >
                  <Icon name="Download" size={12} /> Создать
                </button>
              </div>
            </div>

            {/* Inline preview of fields */}
            {previewTemplate?.id === t.id && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
                <div className="text-xs font-medium mb-2" style={{ color: '#C9A84C' }}>Поля шаблона:</div>
                <div className="space-y-1">
                  {t.fields.map(f => (
                    <div key={f.key} className="text-xs" style={{ color: '#7A90A8' }}>• {f.label}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: '#7A90A8' }}>
          <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm">Шаблоны не найдены</div>
        </div>
      )}

      {/* Modal */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-2xl rounded-xl overflow-hidden" style={{ background: '#0D1F3C', border: '1px solid rgba(201,168,76,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <Icon name={activeTemplate.icon} size={18} style={{ color: '#C9A84C' }} />
                </div>
                <div>
                  <div className="font-montserrat font-600 text-white text-sm">{activeTemplate.name}</div>
                  <div className="text-xs" style={{ color: '#7A90A8' }}>Заполните поля — поля можно оставить пустыми</div>
                </div>
              </div>
              <button onClick={closeForm} className="text-slate-500 hover:text-white transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Fields */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {activeTemplate.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1.5 text-slate-300">{f.label}</label>
                  {f.key === 'order_text' ? (
                    <textarea
                      value={fields[f.key] || ''}
                      onChange={(e) => handleFieldChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none resize-none"
                      style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                    />
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : 'text'}
                      value={fields[f.key] || ''}
                      onChange={(e) => handleFieldChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                      style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <Icon name="AlertCircle" size={15} /> {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}>
              <button onClick={closeForm} className="px-5 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                Отмена
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="btn-gold flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating
                  ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Создаём документ...</>
                  : <><Icon name="Download" size={16} /> Скачать DOCX</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
