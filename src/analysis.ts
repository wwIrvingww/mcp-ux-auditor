import * as cheerio from "cheerio";

export type UxReport = {
  totals: {
    headings: { h1: number; h2: number; h3: number };
    links: number;
    buttons: number;
    inputs: number;
    forms: number;
    images: number;
  };
  cognitiveLoad: {
    interactiveElements: number; // links + buttons + inputs
    suggestion?: string;
  };
  visualHierarchy: {
    hasSingleH1: boolean;
    suggestion?: string;
  };
  primaryActionFlow: {
    hasPrimaryCTA: boolean;
    primaryCTAText?: string;
    suggestion?: string;
  };
};

export function analyzeHtml(html: string): UxReport {
  const $ = cheerio.load(html);

  const h1 = $("h1").length;
  const h2 = $("h2").length;
  const h3 = $("h3").length;

  const links = $("a[href]").length;
  const buttons = $("button").length + $("a[role='button']").length + $("*[data-cta='true']").length;
  const inputs = $("input, select, textarea").length;
  const forms = $("form").length;
  const images = $("img").length;

  const interactiveElements = links + buttons + inputs;

  const cognitiveSuggestion =
    interactiveElements > 30
      ? "Demasiados elementos interactivos en una sola vista; considera reducir o agrupar."
      : interactiveElements < 3
      ? "Muy pocos elementos interactivos; revisa si la tarea principal es clara."
      : undefined;

  const hasSingleH1 = h1 === 1;
  const vhSuggestion = !hasSingleH1
    ? "Debe haber exactamente un <h1> para una jerarquía visual clara."
    : undefined;

  // Heurística simple para CTA
  const primaryCandidates = $("button, a[role='button'], a[data-cta='true']").map((_, el) => $(el).text().trim()).get();
  const ctaTexts = ["comprar", "continuar", "pagar", "enviar", "registrar", "empezar", "comenzar", "suscribirse", "contactar"];
  const cta = primaryCandidates.find(t => ctaTexts.some(k => t.toLowerCase().includes(k))) || primaryCandidates[0];
  const hasPrimaryCTA = !!cta;

  const pafSuggestion = !hasPrimaryCTA
    ? "No se detecta una acción principal clara (CTA). Añade un botón/acción destacado."
    : undefined;

  return {
    totals: { headings: { h1, h2, h3 }, links, buttons, inputs, forms, images },
    cognitiveLoad: { interactiveElements, suggestion: cognitiveSuggestion },
    visualHierarchy: { hasSingleH1, suggestion: vhSuggestion },
    primaryActionFlow: { hasPrimaryCTA, primaryCTAText: cta, suggestion: pafSuggestion }
  };
}
