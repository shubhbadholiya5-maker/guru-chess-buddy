// Browser TTS + STT (Web Speech API)
export type Lang = "en" | "hi" | "hinglish";

const langToLocale: Record<Lang, string> = {
  en: "en-US",
  hi: "hi-IN",
  hinglish: "en-IN",
};

export function speak(text: string, lang: Lang = "en"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langToLocale[lang];
  u.rate = 1;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export type RecognitionHandle = { stop: () => void };

export function listen(opts: { lang?: Lang; onResult: (text: string, isFinal: boolean) => void; onEnd?: () => void; onError?: (e: string) => void }): RecognitionHandle | null {
  if (typeof window === "undefined") return null;
  const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) {
    opts.onError?.("Speech recognition not supported in this browser. Try Chrome.");
    return null;
  }
  const rec = new SR();
  rec.lang = langToLocale[opts.lang ?? "en"];
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (e: any) => {
    let text = "";
    let isFinal = false;
    for (let i = e.resultIndex; i < e.results.length; i++) {
      text += e.results[i][0].transcript;
      if (e.results[i].isFinal) isFinal = true;
    }
    opts.onResult(text, isFinal);
  };
  rec.onerror = (e: any) => opts.onError?.(String(e.error ?? e.message ?? "error"));
  rec.onend = () => opts.onEnd?.();
  rec.start();
  return { stop: () => rec.stop() };
}
