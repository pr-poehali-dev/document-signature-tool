import { useState } from "react";
import Icon from "@/components/ui/icon";

type StampShape = "round" | "square" | "rect" | "oval";
type StampTab = "library" | "create";

const stampLibrary = [
  { id: 1, shape: "round" as StampShape, company: "ООО «Ромашка»", text: "УТВЕРЖДЕНО", inn: "ИНН 7701234567", color: "#1a3a6e" },
  { id: 2, shape: "round" as StampShape, company: "АО «Технологии»", text: "СОГЛАСОВАНО", inn: "ИНН 7709876543", color: "#8B1A1A" },
  { id: 3, shape: "rect" as StampShape, company: "", text: "КОПИЯ ВЕРНА", inn: "", color: "#1a3a6e" },
  { id: 4, shape: "rect" as StampShape, company: "", text: "ВХОДЯЩИЙ №___", inn: "", color: "#2d4a1a" },
  { id: 5, shape: "round" as StampShape, company: "ИП Иванов И.И.", text: "ОПЛАЧЕНО", inn: "ОГРНИП 321234567890", color: "#5a1a6e" },
  { id: 6, shape: "oval" as StampShape, company: "ООО «Строй Инвест»", text: "ПРОВЕРЕНО", inn: "ИНН 7712345678", color: "#1a4a3a" },
];

function StampPreview({ shape, company, text, inn, color, size = 120 }: {
  shape: StampShape; company: string; text: string; inn: string; color: string; size?: number;
}) {
  if (shape === "rect" || shape === "square") {
    const w = shape === "square" ? size : size * 1.8;
    const h = size * 0.6;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x="2" y="2" width={w - 4} height={h - 4} rx="4" ry="4" fill="none" stroke={color} strokeWidth="2.5" />
        <rect x="6" y="6" width={w - 12} height={h - 12} rx="2" ry="2" fill="none" stroke={color} strokeWidth="1" />
        <text x={w/2} y={company ? h * 0.4 : h * 0.55} textAnchor="middle" fill={color} fontSize={company ? "11" : "14"} fontWeight="bold" fontFamily="Arial">
          {text}
        </text>
        {company && <text x={w/2} y={h * 0.7} textAnchor="middle" fill={color} fontSize="9" fontFamily="Arial">{company}</text>}
      </svg>
    );
  }

  if (shape === "oval") {
    const w = size * 1.5;
    const h = size * 0.85;
    const cx = w / 2, cy = h / 2;
    const rx = cx - 4, ry = cy - 4;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth="2.5" />
        <ellipse cx={cx} cy={cy} rx={rx - 5} ry={ry - 5} fill="none" stroke={color} strokeWidth="0.8" />
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="9" fontFamily="Arial">{company}</text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill={color} fontSize="12" fontWeight="bold" fontFamily="Arial">{text}</text>
        {inn && <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize="7.5" fontFamily="Arial">{inn}</text>}
      </svg>
    );
  }

  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const textR = r - 8;
  const textLength = company.length * 5.5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={color} strokeWidth="0.8" />
      {company && (
        <path id={`arc-${size}`} d={`M ${cx - textR},${cy} A ${textR},${textR} 0 0,1 ${cx + textR},${cy}`} fill="none" />
      )}
      {company && (
        <text fill={color} fontSize="9" fontFamily="Arial" textLength={textLength}>
          <textPath href={`#arc-${size}`} startOffset="50%" textAnchor="middle">{company}</textPath>
        </text>
      )}
      <text x={cx} y={cy + 4} textAnchor="middle" fill={color} fontSize="13" fontWeight="bold" fontFamily="Arial">{text}</text>
      {inn && <text x={cx} y={cy + 16} textAnchor="middle" fill={color} fontSize="7.5" fontFamily="Arial">{inn}</text>}
    </svg>
  );
}

export default function StampsPage() {
  const [activeTab, setActiveTab] = useState<StampTab>("library");
  const [selectedStamp, setSelectedStamp] = useState<number | null>(null);
  const [newStamp, setNewStamp] = useState({ shape: "round" as StampShape, company: "ООО «Ваша компания»", text: "УТВЕРЖДЕНО", inn: "ИНН 0000000000", color: "#1a3a6e" });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-montserrat font-700 text-xl text-white mb-1">Печати и штампы</h1>
        <p className="text-sm" style={{ color: '#7A90A8' }}>Готовые шаблоны или создайте свою печать в конструкторе</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
        {([
          { id: "library", label: "Библиотека печатей", icon: "BookOpen" },
          { id: "create", label: "Создать печать", icon: "Plus" },
        ] as { id: StampTab; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all"
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Library */}
      {activeTab === "library" && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            {stampLibrary.map((stamp) => (
              <div
                key={stamp.id}
                onClick={() => setSelectedStamp(selectedStamp === stamp.id ? null : stamp.id)}
                className="glass-card-hover rounded-lg p-5 text-center cursor-pointer transition-all"
                style={selectedStamp === stamp.id ? { borderColor: 'rgba(201,168,76,0.6)', background: 'rgba(201,168,76,0.05)' } : {}}
              >
                <div className="flex justify-center mb-4" style={{ opacity: 0.75 }}>
                  <StampPreview {...stamp} size={100} />
                </div>
                <div className="text-sm font-medium text-white mb-0.5">
                  {stamp.text}
                </div>
                {stamp.company && <div className="text-xs" style={{ color: '#7A90A8' }}>{stamp.company}</div>}
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 py-1.5 rounded text-xs btn-gold shine-effect">
                    Применить
                  </button>
                  <button className="px-3 py-1.5 rounded text-xs border text-slate-400 hover:text-white transition-colors" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Icon name="Download" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
            <div className="flex items-center gap-3">
              <Icon name="Lightbulb" size={18} style={{ color: '#C9A84C' }} />
              <div className="text-sm text-slate-300">Нажмите на печать, чтобы выбрать её, затем нажмите <strong className="text-white">«Применить»</strong> для добавления в документ</div>
            </div>
          </div>
        </div>
      )}

      {/* Create */}
      {activeTab === "create" && (
        <div className="grid grid-cols-5 gap-6 animate-fade-in">
          <div className="col-span-3 space-y-4">
            <div className="glass-card rounded-lg p-5">
              <h3 className="font-montserrat font-600 text-sm text-white mb-4">Форма печати</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {([
                  { id: "round", label: "Круглая" },
                  { id: "oval", label: "Овальная" },
                  { id: "rect", label: "Прямоугольная" },
                  { id: "square", label: "Квадратная" },
                ] as { id: StampShape; label: string }[]).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setNewStamp(p => ({ ...p, shape: s.id }))}
                    className="py-2 rounded text-xs font-medium transition-all"
                    style={newStamp.shape === s.id
                      ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' }
                      : { background: 'rgba(17,32,64,0.8)', color: '#7A90A8', border: '1px solid rgba(201,168,76,0.15)' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {[
                { key: "text", label: "Текст печати (главный)", placeholder: "УТВЕРЖДЕНО" },
                { key: "company", label: "Название организации", placeholder: "ООО «Название»" },
                { key: "inn", label: "ИНН / ОГРН", placeholder: "ИНН 0000000000" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="mb-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                  <input
                    type="text"
                    value={newStamp[key as keyof typeof newStamp] as string}
                    onChange={(e) => setNewStamp(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-all"
                    style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(201,168,76,0.2)' }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Цвет печати</label>
                <div className="flex gap-2">
                  {["#1a3a6e", "#8B1A1A", "#2d4a1a", "#5a1a6e", "#1a4a3a", "#3a2a0a"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewStamp(p => ({ ...p, color: c }))}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{ background: c, border: `3px solid ${newStamp.color === c ? '#C9A84C' : 'transparent'}`, transform: newStamp.color === c ? 'scale(1.2)' : 'scale(1)' }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newStamp.color}
                    onChange={(e) => setNewStamp(p => ({ ...p, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-2"
                    style={{ borderColor: 'rgba(201,168,76,0.3)' }}
                    title="Выбрать цвет"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-gold flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                <Icon name="Download" size={16} /> Скачать PNG
              </button>
              <button className="px-5 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                Сохранить в библиотеку
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="col-span-2">
            <div className="glass-card rounded-lg p-6 text-center sticky top-4">
              <h3 className="font-montserrat font-600 text-sm text-white mb-6">Предпросмотр</h3>
              <div className="flex justify-center items-center" style={{ minHeight: '160px', opacity: 0.8 }}>
                <StampPreview {...newStamp} size={140} />
              </div>
              <div className="divider-gold my-4" />
              <div className="text-xs" style={{ color: '#7A90A8' }}>Так будет выглядеть печать в документе</div>

              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.97)', minHeight: '80px', position: 'relative' }}>
                <div className="space-y-1.5">
                  <div className="h-2 rounded" style={{ background: '#d0d0c8', width: '100%' }} />
                  <div className="h-2 rounded" style={{ background: '#d0d0c8', width: '80%' }} />
                  <div className="h-2 rounded" style={{ background: '#d0d0c8', width: '90%' }} />
                </div>
                <div className="absolute right-4 bottom-3" style={{ opacity: 0.6 }}>
                  <StampPreview {...newStamp} size={60} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
