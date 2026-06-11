"use client";
import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; resultIndex: number; }
interface SpeechRecognitionErrorEvent extends Event { error: string; message: string; }
interface SpeechRecognition extends EventTarget { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; abort(): void; onresult: ((event: SpeechRecognitionEvent) => void) | null; onerror: ((event: SpeechRecognitionErrorEvent) => void) | null; onend: (() => void) | null; }

interface Props { onSubmit: (text: string) => void; loading: boolean; }

const InputArea = forwardRef<{ getText: () => string }, Props>(function InputArea({ onSubmit, loading }, ref) {
  const [text, setText] = useState("");
  useImperativeHandle(ref, () => ({ getText: () => text }), [text]);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef("");

  const getRecognition = useCallback((): SpeechRecognition | null => {
    const Ctor = (window as unknown as Record<string,unknown>).SpeechRecognition || (window as unknown as Record<string,unknown>).webkitSpeechRecognition;
    if (!Ctor) return null;
    return new (Ctor as new () => SpeechRecognition)();
  }, []);

  const startRecording = useCallback(() => {
    const r = getRecognition(); if (!r) { alert("请使用 Chrome 或 Edge 浏览器"); return; }
    r.continuous = true; r.interimResults = true; r.lang = "zh-CN";
    finalTranscriptRef.current = text;
    r.onresult = (e: SpeechRecognitionEvent) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) finalTranscriptRef.current += t; else interim += t; } setText(finalTranscriptRef.current + interim); };
    r.onerror = (e: SpeechRecognitionErrorEvent) => { console.error(e.error); if (e.error === "not-allowed") alert("请允许麦克风权限"); stopRecording(); };
    r.onend = () => {};
    recognitionRef.current = r; r.start(); setRecording(true); setRecordingSeconds(0);
    timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
  }, [text, getRecognition]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop(); recognitionRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
  }, []);

  const handleSubmit = () => { const t = text.trim(); if (!t || loading) return; onSubmit(t); };
  const handleMicClick = () => recording ? stopRecording() : startRecording();
  const formatTime = (s: number) => { const m = Math.floor(s/60); return m + ":" + String(s%60).padStart(2,"0"); };

  return (
    <div className="py-8">
      <div className={`bg-slate-50 border rounded-xl p-6 transition-colors ${recording ? "border-red-300 bg-red-50/30" : "border-slate-200 focus-within:border-blue-300 focus-within:bg-white"}`}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder={recording ? "正在聆听…" : "今天做了什么？学了什么？遇到了什么问题？明天准备做什么？\n\n越详细，AI 理解越准确……"} className="w-full min-h-[260px] bg-transparent text-base text-slate-700 placeholder:text-slate-400 resize-none outline-none" disabled={loading} />
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-400">{recording ? <span className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />录音中 {formatTime(recordingSeconds)}</span> : "Ctrl+Enter 提交"}</span>
          <div className="flex gap-3">
            <button onClick={handleMicClick} className={`px-5 py-2.5 text-sm rounded-lg border ${recording ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"}`}>{recording ? "⏹ 停止录音" : "🎙️ 语音录入"}</button>
            <button onClick={handleSubmit} disabled={loading || !text.trim()} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">{loading ? "分析中…" : "⚡ 提交分析"}</button>
          </div>
        </div>
      </div>
      {recording && <p className="mt-3 text-sm text-slate-400 text-center">正在将语音转为文字，说完后点击「停止录音」</p>}
    </div>
  );
});

export default InputArea;
