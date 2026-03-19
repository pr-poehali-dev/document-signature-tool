import { useState } from "react";
import Icon from "@/components/ui/icon";
import { converterApi, ConvertResult } from "@/lib/api";

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [quality, setQuality] = useState(90);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [resultSize, setResultSize] = useState("");
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [convertError, setConvertError] = useState("");

  const isImageFormat = (fmt: string) => ["PNG", "JPG", "WEBP", "BMP", "TIFF", "SVG"].includes(fmt.toUpperCase());

  const fmtBytes = (n: number) => n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`;

  const handleConvert = async () => {
    if (!uploadedFile || !active) return;
    setConverting(true);
    setDone(false);
    setPreviewUrl(null);
    setConvertError("");
    setConvertResult(null);

    try {
      const fromFmt = active.from.includes("(") ? active.from.split("(")[0].trim() : active.from;
      const toFmt = active.to.includes(" ") ? uploadedFile.name.split(".").pop()?.toUpperCase() || active.from : active.to;
      const result = await converterApi.convert(uploadedFile, fromFmt, toFmt, quality);
      setConvertResult(result);
      setResultSize(fmtBytes(result.result_size));
      setDone(true);

      // Превью для изображений
      if (isImageFormat(toFmt) && result.file_data) {
        setPreviewUrl(`data:${result.file_mime};base64,${result.file_data}`);
      }
    } catch (e: unknown) {
      setConvertError(e instanceof Error ? e.message : "Ошибка конвертации");
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertResult) return;
    converterApi.downloadFromBase64(convertResult.file_data, convertResult.file_name, convertResult.file_mime);
  };

  const handleSelectConversion = (from: string, to: string) => {
    setActive({ from, to });
    setUploadedFile(null);
    setDone(false);
    setPreviewUrl(null);
    setShowPreview(false);
    setConvertResult(null);
    setConvertError("");
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

              {convertError && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <Icon name="AlertCircle" size={15} /> {convertError}
                </div>
              )}

              {done ? (
                <div className="animate-scale-in space-y-3">
                  {/* Result card */}
                  <div className="rounded-xl p-5" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74,222,128,0.15)' }}>
                        <Icon name="CheckCircle" size={26} className="text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-montserrat font-700 text-white mb-0.5">Конвертация завершена!</div>
                        <div className="text-xs" style={{ color: '#7A90A8' }}>
                          {uploadedFile?.name.replace(/\.[^.]+$/, "")}.{active.to.toLowerCase()} · {resultSize}
                          {category !== "documents" && ` · качество ${quality}%`}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF', fontFamily: 'monospace' }}>
                        {active.from} → {active.to}
                      </div>
                    </div>

                    {/* Сравнение размеров */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <div className="text-center">
                        <div className="text-xs mb-1" style={{ color: '#7A90A8' }}>Исходный</div>
                        <div className="font-mono-ibm text-sm font-bold text-white">
                          {uploadedFile ? (uploadedFile.size > 1048576 ? `${(uploadedFile.size/1048576).toFixed(1)} MB` : `${(uploadedFile.size/1024).toFixed(0)} KB`) : "—"}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{active.from}</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <Icon name="ArrowRight" size={18} style={{ color: '#C9A84C' }} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs mb-1" style={{ color: '#7A90A8' }}>Результат</div>
                        <div className="font-mono-ibm text-sm font-bold text-green-400">{resultSize}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#7A90A8' }}>{active.to}</div>
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleDownload}
                        className="btn-gold flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shine-effect"
                      >
                        <Icon name="Download" size={16} />
                        Скачать {active.to}
                      </button>
                      {previewUrl && (
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                          style={showPreview
                            ? { background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }
                            : { background: 'rgba(17,32,64,0.8)', color: '#7A90A8', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <Icon name={showPreview ? "EyeOff" : "Eye"} size={15} />
                          {showPreview ? "Скрыть" : "Просмотр"}
                        </button>
                      )}
                      <button
                        onClick={() => { setUploadedFile(null); setDone(false); setPreviewUrl(null); setShowPreview(false); }}
                        className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors border"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        Ещё файл
                      </button>
                    </div>
                  </div>

                  {/* Preview panel */}
                  {showPreview && previewUrl && (
                    <div className="rounded-xl overflow-hidden animate-fade-in" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(17,32,64,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icon name="Eye" size={14} style={{ color: '#C9A84C' }} />
                          Предпросмотр файла
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono-ibm px-2 py-0.5 rounded" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF' }}>{active.to}</span>
                          <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-white transition-colors">
                            <Icon name="X" size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-center p-4" style={{ background: 'rgba(10,22,40,0.6)', minHeight: '220px' }}>
                        <img
                          src={previewUrl}
                          alt="Предпросмотр"
                          className="max-w-full max-h-64 rounded-lg object-contain"
                          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Для не-изображений — заглушка просмотра */}
                  {!previewUrl && !showPreview && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="w-full py-3 rounded-xl text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all"
                      style={{ background: 'rgba(17,32,64,0.5)', border: '1px dashed rgba(255,255,255,0.08)' }}
                    >
                      <Icon name="FileSearch" size={15} />
                      Просмотр файла
                    </button>
                  )}

                  {/* Документ просмотр (не изображение) */}
                  {!previewUrl && showPreview && (
                    <div className="rounded-xl overflow-hidden animate-fade-in" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: 'rgba(17,32,64,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icon name="FileText" size={14} style={{ color: '#C9A84C' }} />
                          {uploadedFile?.name.replace(/\.[^.]+$/, "")}.{active.to.toLowerCase()}
                        </div>
                        <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-white transition-colors">
                          <Icon name="X" size={15} />
                        </button>
                      </div>
                      <div className="p-6" style={{ background: '#f5f5f0', minHeight: '200px' }}>
                        <div className="max-w-lg mx-auto space-y-2.5">
                          <div className="text-center font-bold text-base mb-4" style={{ color: '#1a1a2e', fontFamily: 'Montserrat' }}>
                            {uploadedFile?.name.replace(/\.[^.]+$/, "")}
                          </div>
                          {[100, 90, 95, 70, 85, 60, 92, 75].map((w, i) => (
                            <div key={i} className="h-2.5 rounded" style={{ background: '#c8c8c0', width: `${w}%` }} />
                          ))}
                          <div className="mt-4 pt-4 border-t border-gray-300">
                            {[80, 65, 88, 55].map((w, i) => (
                              <div key={i} className="h-2.5 rounded mb-2" style={{ background: '#c8c8c0', width: `${w}%` }} />
                            ))}
                          </div>
                          <div className="text-right text-xs mt-4" style={{ color: '#888' }}>
                            Конвертировано: {new Date().toLocaleString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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