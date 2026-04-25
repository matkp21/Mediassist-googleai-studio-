/**
 * FEATURE 72: TTS (Text-to-Speech)
 * Basic implementation using Web Speech API for the browser.
 */
export function speakText(text: string, lang: string = "en-US") {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("TTS not supported in this environment.");
    return;
  }

  // Cancel existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
