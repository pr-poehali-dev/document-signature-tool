import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { documentsApi, User, Stamp } from "@/lib/api";

type SignMode = "draw" | "upload" | "text";
type Step = "upload" | "sign" | "preview" | "done";

interface SignPageProps {
  user?: User | null;
}

export default function SignPage({ user }: SignPageProps) {
  const [step, setStep] = useState<Step>("upload");
  const [signMode, setSignMode] = useState<SignMode>("draw");
  const [docName, setDocName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [signX, setSignX] = useState(120);
  const [signY, setSignY] = useState(320);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [stampX, setStampX] = useState(300);
  const [stampY, setStampY] = useState(380);
  const [showStamp, setShowStamp] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('selected_stamp');
    if (saved) {
      try {
        const stamp = JSON.parse(saved) as Stamp;
        setSelectedStamp(stamp);
        setShowStamp(true);
        localStorage.removeItem('selected_stamp');
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (signMode === "draw" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) { ctx.strokeStyle = "#1a1a2e"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; }
    }
  }, [signMode, step]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPos.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos;
    setHasSignature(true);
  };
  const stopDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  const getSignatureData = (): string => {
    if (signMode === "draw" && canvasRef.current) return canvasRef.current.toDataURL();
    if (signMode === "text" && signatureText) return `text:${signatureText}`;
    return "";
  };

  const handleUploadAndContinue = async () => {
    if (!uploadedFile) return;
    setUploading(true);
    setError("");
    try {
      const res = await documentsApi.upload(uploadedFile, docName || uploadedFile.name.replace(/\.[^.]+$/, ""));
      setDocId(res.id);
      setStep("sign");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAndDownload = async () => {
    if (!docId) return;
    setSaving(true);
    setError("");
    try {
      const sigData = getSignatureData();
      await documentsApi.sign(docId, sigData, signX, signY, false);
      const dlRes = await documentsApi.download(docId);
      setDownloadUrl(dlRes.url);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const steps = ["upload", "sign", "preview", "done"];
  const stepLabels = ["Загрузка", "Подпись", "Просмотр", "Готово"];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-montserrat font-700 text-xl text-white mb-1">Подписание документа</h1>
        <p className="text-sm" style={{ color: '#7A90A8' }}>Загрузите файл, добавьте подпись и скачайте готовый документ</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === s ? 'text-navy font-semibold' : ''}`}
              style={step === s ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border"
                style={{ borderColor: step === s ? 'transparent' : 'rgba(255,255,255,0.15)', background: step === s ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                {i + 1}
              </span>
              {stepLabels[i]}
            </div>
            {i < 3 && <div className="w-8 h-px mx-1" style={{ background: 'rgba(201,168,76,0.2)' }} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <Icon name="AlertCircle" size={15} /> {error}
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">

          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4 animate-fade-in">
              {selectedStamp && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(74,158,255,0.08)', border: '1px solid rgba(74,158,255,0.25)' }}>
                  <Icon name="Stamp" size={16} style={{ color: '#4A9EFF' }} />
                  <span className="text-sm text-slate-300 flex-1">Печать <strong className="text-white">«{selectedStamp.name || selectedStamp.text}»</strong> будет добавлена в документ</span>
                  <button onClick={() => { setSelectedStamp(null); setShowStamp(false); }} className="text-slate-500 hover:text-red-400 transition-colors"><Icon name="X" size={14} /></button>
                </div>
              )}
              <div className="rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all"
                style={{ borderColor: uploadedFile ? 'rgba(74,222,128,0.4)' : 'rgba(201,168,76,0.3)', background: uploadedFile ? 'rgba(74,222,128,0.04)' : 'rgba(201,168,76,0.03)' }}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { setUploadedFile(f); if (!docName) setDocName(f.name.replace(/\.[^.]+$/, "")); } }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput')?.click()}>
                <input id="fileInput" type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUploadedFile(f); if (!docName) setDocName(f.name.replace(/\.[^.]+$/, "")); } }} />
                {uploadedFile ? (
                  <div>
                    <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <Icon name="FileCheck" size={32} className="text-green-400" />
                    </div>
                    <div className="font-montserrat font-600 text-white text-lg">{uploadedFile.name}</div>
                    <div className="text-sm mt-1" style={{ color: '#7A90A8' }}>{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <Icon name="Upload" size={32} style={{ color: '#C9A84C' }} />
                    </div>
                    <div className="font-montserrat font-600 text-white text-base mb-2">Перетащите файл или нажмите</div>
                    <div className="text-sm" style={{ color: '#7A90A8' }}>PDF, Word, Excel, изображения</div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Название документа</label>
                <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)}
                  placeholder="Например: Договор аренды №12"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 outline-none"
                  style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)' }} />
              </div>
              {!user && <div className="text-xs p-3 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>⚠ Войдите в аккаунт чтобы сохранить документ в историю</div>}
              <button onClick={handleUploadAndContinue} disabled={!uploadedFile || uploading}
                className="btn-gold w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {uploading ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Загрузка...</> : "Далее — Добавить подпись"}
              </button>
            </div>
          )}

          {/* Step 2: Sign */}
          {step === "sign" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.15)' }}>
                {([
                  { id: "draw", label: "Нарисовать", icon: "Pen" },
                  { id: "upload", label: "Загрузить", icon: "Upload" },
                  { id: "text", label: "Текстом", icon: "Type" },
                ] as { id: SignMode; label: string; icon: string }[]).map((m) => (
                  <button key={m.id} onClick={() => setSignMode(m.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all"
                    style={signMode === m.id ? { background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A1628' } : { color: '#7A90A8' }}>
                    <Icon name={m.icon} size={15} /> {m.label}
                  </button>
                ))}
              </div>

              {signMode === "draw" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Нарисуйте подпись мышью или пальцем</span>
                    <button onClick={clearCanvas} className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors">
                      <Icon name="Trash2" size={13} /> Очистить
                    </button>
                  </div>
                  <canvas ref={canvasRef} width={500} height={160} className="canvas-area w-full rounded-lg"
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                  {!hasSignature && <div className="text-center text-xs mt-2" style={{ color: '#7A90A8' }}>↑ Кликните и ведите мышью для подписи</div>}
                </div>
              )}

              {signMode === "upload" && (
                <div className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer"
                  style={{ borderColor: 'rgba(201,168,76,0.3)' }}
                  onClick={() => document.getElementById('sigInput')?.click()}>
                  <input id="sigInput" type="file" className="hidden" accept=".png,.jpg,.jpeg,.svg" />
                  <Icon name="Image" size={32} className="mx-auto mb-3" style={{ color: '#C9A84C' }} />
                  <div className="text-sm text-slate-300">Загрузите изображение подписи</div>
                  <div className="text-xs mt-1" style={{ color: '#7A90A8' }}>PNG, JPG с прозрачным фоном</div>
                </div>
              )}

              {signMode === "text" && (
                <div className="space-y-3">
                  <input type="text" value={signatureText} onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Введите ФИО..."
                    className="w-full px-4 py-2.5 rounded-lg text-white placeholder-slate-500 outline-none"
                    style={{ background: 'rgba(17,32,64,0.8)', border: '1px solid rgba(201,168,76,0.2)', fontFamily: 'cursive', fontSize: '18px' }} />
                  {signatureText && (
                    <div className="p-4 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.97)', fontFamily: 'cursive', fontSize: '28px', color: '#1a1a2e' }}>
                      {signatureText}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep("upload")} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  ← Назад
                </button>
                <button onClick={() => setStep("preview")}
                  disabled={signMode === "draw" && !hasSignature}
                  className="btn-gold flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                  Разместить подпись →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === "preview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-sm text-slate-400 mb-3">Перетащите подпись {showStamp && selectedStamp ? 'и печать ' : ''}на нужное место в документе</div>
              <div className="relative rounded-lg overflow-hidden" style={{ background: '#f5f5f0', minHeight: '500px', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div className="p-8 space-y-3" style={{ color: '#1a1a2e' }}>
                  <div className="text-center font-bold text-xl mb-6" style={{ fontFamily: 'Montserrat' }}>{docName || "ДОКУМЕНТ"}</div>
                  {[100, 90, 95, 70, 85, 60, 92, 75].map((w, i) => (
                    <div key={i} className="h-3 rounded" style={{ background: '#d0d0c8', width: `${w}%` }} />
                  ))}
                </div>
                {/* Подпись */}
                <div className="absolute cursor-move select-none" style={{ left: signX, top: signY }}
                  onMouseDown={(e) => {
                    const sx = e.clientX - signX, sy = e.clientY - signY;
                    const onMove = (ev: MouseEvent) => { setSignX(ev.clientX - sx); setSignY(ev.clientY - sy); };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}>
                  <div className="px-3 py-1 rounded border-2 border-dashed" style={{ borderColor: 'rgba(201,168,76,0.6)', background: 'rgba(201,168,76,0.05)' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: '22px', color: '#1a1a2e' }}>
                      {signatureText || "Подпись"}
                    </div>
                  </div>
                </div>
                {/* Печать */}
                {showStamp && selectedStamp && (
                  <div className="absolute cursor-move select-none" style={{ left: stampX, top: stampY }}
                    onMouseDown={(e) => {
                      const sx = e.clientX - stampX, sy = e.clientY - stampY;
                      const onMove = (ev: MouseEvent) => { setStampX(ev.clientX - sx); setStampY(ev.clientY - sy); };
                      const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                      window.addEventListener('mousemove', onMove);
                      window.addEventListener('mouseup', onUp);
                    }}>
                    <div className="rounded border-2 border-dashed p-1" style={{ borderColor: 'rgba(74,158,255,0.5)', background: 'rgba(74,158,255,0.03)' }}>
                      {selectedStamp.image_url ? (
                        <img src={selectedStamp.image_url} alt="Печать" style={{ width: 90, height: 90, objectFit: 'contain', opacity: 0.85 }} />
                      ) : (
                        <div style={{ opacity: 0.85 }}>
                          <svg width="90" height="90" viewBox="0 0 90 90">
                            <circle cx="45" cy="45" r="41" fill="none" stroke={selectedStamp.color} strokeWidth="2.5" />
                            <circle cx="45" cy="45" r="35" fill="none" stroke={selectedStamp.color} strokeWidth="0.8" />
                            <text x="45" y="49" textAnchor="middle" fill={selectedStamp.color} fontSize="11" fontWeight="bold" fontFamily="Arial">{selectedStamp.text}</text>
                            {selectedStamp.company && <text x="45" y="61" textAnchor="middle" fill={selectedStamp.color} fontSize="7" fontFamily="Arial">{selectedStamp.company}</text>}
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("sign")} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  ← Назад
                </button>
                <button onClick={handleSaveAndDownload} disabled={saving}
                  className="btn-gold flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Сохранение...</> : "Сохранить и скачать →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <div className="text-center py-12 animate-scale-in">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)' }}>
                <Icon name="CheckCircle" size={40} className="text-green-400" />
              </div>
              <h2 className="font-montserrat font-700 text-xl text-white mb-2">Документ подписан!</h2>
              <p className="text-sm mb-6" style={{ color: '#7A90A8' }}>«{docName}» успешно подписан и сохранён</p>
              <div className="flex gap-3 justify-center">
                {downloadUrl ? (
                  <a href={downloadUrl} target="_blank" rel="noreferrer"
                    className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <Icon name="Download" size={16} /> Скачать документ
                  </a>
                ) : null}
                <button onClick={() => { setStep("upload"); setUploadedFile(null); setDocName(""); setHasSignature(false); setDocId(null); setDownloadUrl(null); }}
                  className="px-6 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  Новый документ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-2 space-y-4">
          <div className="glass-card rounded-lg p-4">
            <h3 className="font-montserrat font-600 text-sm text-white mb-3 flex items-center gap-2">
              <Icon name="Info" size={15} style={{ color: '#C9A84C' }} /> Поддерживаемые форматы
            </h3>
            {[
              { ext: "PDF", desc: "Adobe PDF" },
              { ext: "DOCX", desc: "Microsoft Word" },
              { ext: "XLSX", desc: "Microsoft Excel" },
              { ext: "PNG/JPG", desc: "Изображения" },
            ].map((f) => (
              <div key={f.ext} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-xs font-mono-ibm px-2 py-0.5 rounded" style={{ background: 'rgba(74,158,255,0.1)', color: '#4A9EFF' }}>{f.ext}</span>
                <span className="text-xs text-slate-400">{f.desc}</span>
              </div>
            ))}
          </div>
          <div className="glass-card rounded-lg p-4">
            <h3 className="font-montserrat font-600 text-sm text-white mb-3 flex items-center gap-2">
              <Icon name="Shield" size={15} style={{ color: '#C9A84C' }} /> Безопасность
            </h3>
            <div className="space-y-2 text-xs" style={{ color: '#7A90A8' }}>
              {["Шифрование 256-bit AES", "Криптографическая метка времени", "Хэш-верификация документа", "Уникальный ID подписания"].map(t => (
                <div key={t} className="flex items-start gap-2">
                  <Icon name="Check" size={13} className="text-green-400 mt-0.5 flex-shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}