import { useState } from "react";
import Icon from "@/components/ui/icon";

type ConvertCategory = "documents" | "images" | "compress";

interface ConvertOption {
  from: string;
  to: string[];
  icon: string;
  color: string;
}

const conversions: Record<ConvertCategory, ConvertOption[]> = {
  documents: [
    { from: "PDF", to: ["DOCX", "XLSX", "PNG", "JPG", "TXT"], icon: "FileText", color: "#FF6B6B" },
    { from: "DOCX", to: ["PDF", "TXT", "PNG"], icon: "FileType", color: "#4A9EFF" },
    { from: "XLSX", to: ["PDF", "CSV", "PNG"], icon: "Table", color: "#4ADE80" },
    { from: "PPT", to: ["PDF", "PNG", "JPG"], icon: "Presentation", color: "#F59E0B" },
    { from: "TXT", to: ["PDF", "DOCX"], icon: "FileText2", color: "#A78BFA" },
  ],
  images: [
    { from: "PNG", to: ["JPG", "WEBP", "PDF", "SVG", "BMP", "TIFF"], icon: "Image", color: "#4ADE80" },
    { from: "JPG", to: ["PNG", "WEBP", "PDF", "BMP", "TIFF"], icon: "Image", color: "#4A9EFF" },
    { from: "WEBP", to: ["PNG", "JPG", "PDF"], icon: "Image", color: "#A78BFA" },
    { from: "SVG", to: ["PNG", "JPG", "PDF", "WEBP"], icon: "Layers", color: "#F59E0B" },
    { from: "HEIC", to: ["JPG", "PNG", "PDF"], icon: "Smartphone", color: "#FF6B6B" },
  ],
  compress: [
    { from: "Фото (PNG/JPG)", to: ["Сжать до нужного размера"], icon: "Image", color: "#4ADE80" },
    { from: "Видео (MP4/AVI)", to: ["Сжать без потерь качества"], icon: "Video", color: "#4A9EFF" },
    { from: "Аудио (MP3/WAV)", to: ["Оптимизировать битрейт"], icon: "Music", color: "#A78BFA" },
    { from: "PDF документ", to: ["Уменьшить размер файла"], icon: "FileText", color: "#FF6B6B" },
  ],
};

interface ActiveConversion {
  from: string;
  to: string;
}

export default function ConverterPage() {
  const [category, setCategory] = useState<ConvertCategory>("documents");
  const [active, setActive] = useState<ActiveConversion | null>(null);
  const [targetFormat, setTargetFormat] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [quality, setQuality] = useState(90);

  const handleConvert = () => {
    if (!uploadedFile && !active) return;
    setConverting(true);
    setDone(false);
    setTimeout(() => { setConverting(false); setDone(true); }, 2200);
  };

  const handleSelectConversion = (from: string, to: string) => {
    setActive({ from, to });
    setTargetFormat(to);
    setUploadedFile(null);
    setDone(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-montserrat font-700 text-xl text-white mb-1">Конвертер форматов</h1>
        <p className="text-sm" style={{ color: '#7A90A8' }}>Конвертируйте и сжимайте файлы без потери качества</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
        {([
          { id: "documents", label: "Документы", icon: "FileText" },
          { id: "images", label: "Изображения", icon: "Image" },
          { id: "compress", label: "Сжатие", icon: "Minimize2" },
        ] as { id: ConvertCategory; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setCategory(tab.id); setActive(null); setDone(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all"
            style={category === tab.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Conversion options */}
        <div className="col-span-2 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#7A90A8' }}>Выберите конвертацию</h3>
          {conversions[category].map((conv) => (
            <div key={conv.from} className="glass-card rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${conv.color}20` }}>
                  <Icon name={conv.icon} size={16} style={{ color: conv.color }} />
                </div>
                <span className="font-mono-ibm text-sm font-medium text-white">{conv.from}</span>
                <Icon name="ArrowRight" size={14} className="text-slate-500" />
              </div>
              <div className="flex flex-wrap gap-1.5 pl-11">
                {conv.to.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSelectConversion(conv.from, t)}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                    style={active?.from === conv.from && active?.to === t
                      ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' }
                      : { background: `${conv.color}15`, color: conv.color, border: `1px solid ${conv.color}30` }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Conversion area */}
        <div className="col-span-3 space-y-4">
          {!active ? (
            <div className="glass-card rounded-xl flex flex-col items-center justify-center text-center" style={{ minHeight: '300px' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <Icon name="ArrowLeftRight" size={28} style={{ color: '#C9A84C' }} />
              </div>
              <div className="font-montserrat font-600 text-white mb-2">Выберите формат конвертации</div>
              <div className="text-sm" style={{ color: '#7A90A8' }}>Кликните на нужный формат слева</div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Header */}
              <div className="glass-card rounded-lg p-4 flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono-ibm font-bold text-lg" style={{ color: '#4A9EFF' }}>{active.from}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-0.5" style={{ background: 'rgba(201,168,76,0.4)' }} />
                    <Icon name="ArrowRight" size={16} style={{ color: '#C9A84C' }} />
                    <div className="w-8 h-0.5" style={{ background: 'rgba(201,168,76,0.4)' }} />
                  </div>
                  <span className="font-mono-ibm font-bold text-lg" style={{ color: '#C9A84C' }}>{active.to}</span>
                </div>
                <div className="ml-auto text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                  Без потери качества
                </div>
              </div>

              {/* Quality slider for images/compress */}
              {(category === "images" || category === "compress") && (
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-300">Качество</span>
                    <span className="font-mono-ibm text-sm font-bold" style={{ color: '#C9A84C' }}>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#7A90A8' }}>
                    <span>Максимальное сжатие</span>
                    <span>Лучшее качество</span>
                  </div>
                </div>
              )}

              {/* Upload */}
              <div
                className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
                style={{ borderColor: uploadedFile ? 'rgba(74,222,128,0.4)' : 'rgba(201,168,76,0.3)', background: uploadedFile ? 'rgba(74,222,128,0.04)' : 'rgba(201,168,76,0.03)' }}
                onClick={() => document.getElementById('convInput')?.click()}
              >
                <input id="convInput" type="file" className="hidden" onChange={(e) => { setUploadedFile(e.target.files?.[0] || null); setDone(false); }} />
                {uploadedFile ? (
                  <div>
                    <Icon name="FileCheck" size={36} className="mx-auto mb-2 text-green-400" />
                    <div className="font-medium text-white">{uploadedFile.name}</div>
                    <div className="text-sm mt-1" style={{ color: '#7A90A8' }}>{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                ) : (
                  <div>
                    <Icon name="Upload" size={36} className="mx-auto mb-2" style={{ color: '#C9A84C' }} />
                    <div className="text-sm font-medium text-white">Загрузите файл формата {active.from}</div>
                    <div className="text-xs mt-1" style={{ color: '#7A90A8' }}>Нажмите или перетащите файл</div>
                  </div>
                )}
              </div>

              {done ? (
                <div className="text-center p-6 rounded-xl animate-scale-in" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <Icon name="CheckCircle" size={36} className="mx-auto mb-3 text-green-400" />
                  <div className="font-montserrat font-700 text-white mb-1">Готово!</div>
                  <div className="text-sm mb-4" style={{ color: '#7A90A8' }}>
                    Файл конвертирован из {active.from} в {active.to}
                    {category !== "documents" && ` (качество ${quality}%)`}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <Icon name="Download" size={16} /> Скачать {active.to}
                    </button>
                    <button onClick={() => { setUploadedFile(null); setDone(false); }} className="px-4 py-2.5 rounded-lg text-sm text-slate-300 border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      Ещё файл
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleConvert}
                  disabled={!uploadedFile || converting}
                  className="btn-gold w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {converting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Конвертирование...
                    </>
                  ) : (
                    <>
                      <Icon name="Zap" size={16} />
                      Конвертировать в {active.to}
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "Zap", text: "Быстрая конвертация" },
              { icon: "Shield", text: "Без потери качества" },
              { icon: "Lock", text: "Файлы удаляются после скачивания" },
              { icon: "Globe", text: "Поддержка кириллицы в PDF" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(17,32,64,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Icon name={f.icon} size={14} style={{ color: '#C9A84C' }} />
                <span className="text-slate-400">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
