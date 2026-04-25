/**
 * FEATURE 71: Multilingual UI
 * Basic localization utility for the MediAssistant.
 */

export const TRANSLATIONS = {
  en: {
    welcome: "Welcome to MediAssistant",
    clinical_reasoning: "Clinical Reasoning",
    start_session: "Start Session",
  },
  es: {
    welcome: "Bienvenido a MediAssistant",
    clinical_reasoning: "Razonamiento Clínico",
    start_session: "Iniciar Sesión",
  },
  fr: {
    welcome: "Bienvenue sur MediAssistant",
    clinical_reasoning: "Raisonnement Clinique",
    start_session: "Démarrer la Session",
  },
  // Add more as needed
};

export function getTranslation(key: keyof typeof TRANSLATIONS.en, lang: string = "en") {
  const dict = (TRANSLATIONS as any)[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key];
}
