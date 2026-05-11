"use client";

import { useState, useRef } from "react";

const C = {
  bg: "#F8F7F3", card: "#FFFFFF", navy: "#1A3A52", navyDark: "#0F2638",
  sage: "#5A8A6A", sageLight: "#EAF2EC", gold: "#C8922A", goldLight: "#FDF4E3",
  red: "#C0392B", redLight: "#FDF0EE",
  text: "#1E1E1E", muted: "#6B7A8D", border: "#E4E0D8",
};
const F = { display: "'Fraunces','Georgia',serif", body: "'DM Sans',-apple-system,sans-serif" };

const PHARMACY = {
  name: "Pharmacie de l'Avenue",
  address: "29 avenue du Général Leclerc, 75014 Paris",
  city: "Paris",
  phone: "01 43 21 25 85",
  email: "pharma.lavenue@gmail.com",
};

// ─── HELPERS ──────────────────────────────────────────────
function detectAgeGroup(jjmmaaaa) {
  const parts = jjmmaaaa.split("/");
  if (parts.length !== 3) return null;
  const [j, m, a] = parts.map(p => parseInt(p));
  if (!j || !m || !a) return null;
  const today = new Date();
  const birth = new Date(a, m - 1, j);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  if (age >= 18 && age <= 25) return { group: "18-25", age };
  if (age >= 45 && age <= 50) return { group: "45-50", age };
  if (age >= 60 && age <= 65) return { group: "60-65", age };
  if (age >= 70 && age <= 75) return { group: "70-75", age };
  return { group: null, age };
}

function isValidDate(jjmmaaaa) {
  const parts = jjmmaaaa.split("/");
  if (parts.length !== 3) return false;
  const [j, m, a] = parts.map(p => parseInt(p));
  if (!j || !m || !a) return false;
  if (j < 1 || j > 31 || m < 1 || m > 12 || a < 1900 || a > new Date().getFullYear()) return false;
  const d = new Date(a, m - 1, j);
  return d.getDate() === j && d.getMonth() === m - 1 && d.getFullYear() === a;
}

function formatDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function generateRefNumber() {
  const date = new Date();
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BP-${Y}${M}${D}-${rand}`;
}

function capitalize(str) {
  return str.split(/[\s-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

// ═══════════════════════════════════════════════════════════
// QUESTIONS V8 — vaccins enrichis, dépistages retirés 70+
// ═══════════════════════════════════════════════════════════
const QUESTIONS = {
  "18-25": [
    // Thème 1 : Vaccination (6) — ENRICHI
    { id: "dtp_18", theme: "Vaccination", q: "Avez-vous fait votre rappel DTP (diphtérie, tétanos, polio) à 25 ans ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "coqueluche_18", theme: "Vaccination", q: "Avez-vous fait le rappel coqueluche à 25 ans ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "hpv", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre le papillomavirus (HPV) ?", opts: ["Oui, schéma complet", "Oui, partiel", "Non", "Je ne sais pas"] },
    { id: "meningo_acwy", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le méningocoque ACWY ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "meningo_b", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le méningocoque B ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "grippe_18", theme: "Vaccination", q: "Souffrez-vous d'asthme, diabète, ou autre maladie chronique nécessitant un vaccin grippe ?", opts: ["Oui et je suis vacciné(e)", "Oui mais non vacciné(e)", "Non", "Je ne sais pas"] },
    // Thème 2 : Conduites & santé sexuelle (5)
    { id: "tabac", theme: "Conduites addictives & santé sexuelle", q: "Fumez-vous ou utilisez-vous une cigarette électronique ?", opts: ["Non", "J'ai arrêté", "Oui, cigarette électronique", "Oui, je fume"] },
    { id: "alcool", theme: "Conduites addictives & santé sexuelle", q: "Quelle est votre consommation d'alcool habituelle ?", opts: ["Jamais ou rarement", "Moins de 10 verres par semaine", "Plus de 2 verres par jour", "Plus de 10 verres par semaine"] },
    { id: "substances", theme: "Conduites addictives & santé sexuelle", q: "Avez-vous consommé du cannabis ou d'autres substances cette année ?", opts: ["Non", "Oui, du cannabis", "Oui, du protoxyde d'azote", "Oui, d'autres substances"] },
    { id: "ist", theme: "Conduites addictives & santé sexuelle", q: "Avez-vous fait un dépistage des maladies sexuellement transmissibles récemment ?", opts: ["Oui, récemment", "Oui, il y a longtemps", "Non", "Non concerné(e)"] },
    { id: "contraception", theme: "Conduites addictives & santé sexuelle", q: "Utilisez-vous une contraception adaptée à votre situation ?", opts: ["Oui", "Non", "Non concerné(e)", "Je souhaite en parler"], sexeOnly: "Une femme" },
    // Thème 3 : Sommeil & bien-être mental (6)
    { id: "sommeil_qualite", theme: "Sommeil & bien-être mental", q: "Diriez-vous que vous avez des problèmes de sommeil ?", opts: ["Non", "Oui, parfois", "Oui, souvent", "Je prends des somnifères"] },
    { id: "sommeil_duree", theme: "Sommeil & bien-être mental", q: "En moyenne, combien d'heures dormez-vous par nuit ?", opts: ["Moins de 6h", "Entre 6h et 8h", "Entre 8h et 10h", "Plus de 10h"] },
    { id: "mental", theme: "Sommeil & bien-être mental", q: "Ces 2 dernières semaines, avez-vous ressenti de la nervosité ou de l'anxiété ?", opts: ["Jamais", "Plusieurs jours", "Plus de 7 jours", "Presque tous les jours"] },
    { id: "tristesse", theme: "Sommeil & bien-être mental", q: "Ces 2 dernières semaines, avez-vous éprouvé tristesse, déprime ou désespoir ?", opts: ["Jamais", "Plusieurs jours", "Plus de 7 jours", "Presque tous les jours"] },
    { id: "idees_noires", theme: "Sommeil & bien-être mental", q: "Avez-vous déjà eu des idées noires ou suicidaires ?", opts: ["Non", "Oui, des idées noires", "Oui, une tentative de suicide"] },
    { id: "violences", theme: "Sommeil & bien-être mental", q: "Avez-vous déjà été victime de violences, harcèlement ou discrimination ?", opts: ["Non", "Oui", "Je préfère ne pas répondre"] },
  ],
  "45-50": [
    // Thème 1 : Vaccination (4) — ENRICHI
    { id: "dtp_45", theme: "Vaccination", q: "Avez-vous fait votre rappel DTP (diphtérie, tétanos, polio) à 45 ans ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "coqueluche_45", theme: "Vaccination", q: "Avez-vous fait le rappel coqueluche à 45 ans ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "grippe_45", theme: "Vaccination", q: "Souffrez-vous d'asthme, diabète, surpoids, ou autre maladie chronique nécessitant un vaccin grippe ?", opts: ["Oui et je suis vacciné(e)", "Oui mais non vacciné(e)", "Non", "Je ne sais pas"] },
    { id: "covid_45", theme: "Vaccination", q: "Avez-vous reçu une dose de rappel Covid-19 ces 12 derniers mois (si à risque) ?", opts: ["Oui", "Non, à risque", "Non, pas à risque", "Je ne sais pas"] },
    // Thème 2 : Dépistages & mode de vie (6)
    { id: "colorectal", theme: "Dépistages & mode de vie", q: "Avez-vous déjà fait le test de dépistage du cancer du côlon (recommandé dès 50 ans) ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Je ne sais pas"] },
    { id: "sein", theme: "Dépistages & mode de vie", q: "Avez-vous fait une mammographie (recommandée dès 50 ans) ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Non concerné(e)"], sexeOnly: "Une femme" },
    { id: "col", theme: "Dépistages & mode de vie", q: "Avez-vous fait un frottis (dépistage du cancer du col de l'utérus) ?", opts: ["Oui, il y a moins de 5 ans", "Oui, il y a plus de 5 ans", "Non, jamais", "Non concerné(e)"], sexeOnly: "Une femme" },
    { id: "activite", theme: "Dépistages & mode de vie", q: "Combien de fois par semaine faites-vous au moins 30 min de sport ou marche rapide ?", opts: ["Jamais", "1 à 2 fois", "3 à 4 fois", "5 fois ou plus"] },
    { id: "fruits", theme: "Dépistages & mode de vie", q: "Mangez-vous des fruits et légumes tous les jours ?", opts: ["Oui, 5 portions ou plus", "Oui, 3 à 4 portions", "Oui, 1 à 2 portions", "Rarement ou jamais"] },
    { id: "tabac_45", theme: "Dépistages & mode de vie", q: "Fumez-vous ou utilisez-vous une cigarette électronique ?", opts: ["Non", "J'ai arrêté", "Oui, cigarette électronique", "Oui, je fume"] },
    // Thème 3 : Sommeil & bien-être mental (5)
    { id: "essouffle", theme: "Sommeil & bien-être mental", q: "Êtes-vous plus facilement essoufflé(e) que les personnes de votre âge ?", opts: ["Non", "Oui, un peu", "Oui, nettement"] },
    { id: "sommeil_45", theme: "Sommeil & bien-être mental", q: "Diriez-vous que vous avez des problèmes de sommeil ?", opts: ["Non", "Oui, parfois", "Oui, souvent", "Je prends des somnifères"] },
    { id: "anxiete_45", theme: "Sommeil & bien-être mental", q: "Ces 2 dernières semaines, avez-vous ressenti de la nervosité ou de l'anxiété ?", opts: ["Jamais", "Plusieurs jours", "Plus de 7 jours", "Presque tous les jours"] },
    { id: "tristesse_45", theme: "Sommeil & bien-être mental", q: "Ces 2 dernières semaines, avez-vous éprouvé tristesse, déprime ou désespoir ?", opts: ["Jamais", "Plusieurs jours", "Plus de 7 jours", "Presque tous les jours"] },
    { id: "violences_45", theme: "Sommeil & bien-être mental", q: "Avez-vous déjà été victime de violences ou de harcèlement ?", opts: ["Non", "Oui", "Je préfère ne pas répondre"] },
  ],
  "60-65": [
    // Thème 1 : Vaccination (6) — ENRICHI
    { id: "grippe", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre la grippe cette saison ?", opts: ["Oui", "Pas encore cette saison", "Non, jamais", "Je ne sais pas"] },
    { id: "covid", theme: "Vaccination", q: "Avez-vous fait votre rappel contre la Covid-19 ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "zona", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le zona (Shingrix - 2 injections) ?", opts: ["Oui, les 2 injections", "Oui, seulement la 1ère", "Non", "Je ne sais pas"] },
    { id: "pneumo", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre les pneumonies bactériennes (pneumocoque - Prevenar 20) ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "dtp_60", theme: "Vaccination", q: "Avez-vous fait un rappel DTP ces 10 dernières années (recommandé à 65 ans) ?", opts: ["Oui", "Non ou je ne sais pas"] },
    { id: "rsv_60", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le VRS (virus respiratoire syncytial) ?", opts: ["Oui", "Non", "Je ne sais pas ce que c'est"] },
    // Thème 2 : Dépistages & médicaments (5)
    { id: "colorectal_60", theme: "Dépistages & médicaments", q: "Avez-vous fait le test de dépistage du cancer du côlon (recommandé jusqu'à 74 ans) ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Je ne sais pas"] },
    { id: "mammo_60", theme: "Dépistages & médicaments", q: "Avez-vous fait une mammographie (recommandée jusqu'à 74 ans) ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Non concerné(e)"], sexeOnly: "Une femme" },
    { id: "medicaments_60", theme: "Dépistages & médicaments", q: "Combien de médicaments prenez-vous chaque jour ?", opts: ["Aucun ou 1 à 2", "3 à 4 médicaments", "5 à 6 médicaments", "7 ou plus"] },
    { id: "effets", theme: "Dépistages & médicaments", q: "Ressentez-vous des effets gênants liés à vos médicaments ?", opts: ["Non", "Parfois, mais gérable", "Oui, assez souvent", "Oui, et cela me préoccupe"] },
    { id: "chutes_60", theme: "Dépistages & médicaments", q: "Avez-vous chuté au cours des 12 derniers mois ?", opts: ["Non", "1 fois, sans me blesser", "1 fois, avec une blessure", "Plusieurs fois"] },
    // Thème 3 : Mode de vie & bien-être (5)
    { id: "activite_60", theme: "Mode de vie & bien-être", q: "Combien de fois par semaine faites-vous au moins 30 min d'activité physique ?", opts: ["Jamais", "1 à 2 fois", "3 à 4 fois", "5 à 7 fois"] },
    { id: "fruits_60", theme: "Mode de vie & bien-être", q: "Mangez-vous des fruits et légumes tous les jours ?", opts: ["Oui, 5 portions ou plus", "Oui, 1 à 4 portions", "De temps en temps", "Rarement ou jamais"] },
    { id: "memoire_60", theme: "Mode de vie & bien-être", q: "Avez-vous la sensation d'oublier des choses plus qu'avant ?", opts: ["Non", "Oui, un peu", "Oui, et cela me préoccupe"] },
    { id: "sommeil_60", theme: "Mode de vie & bien-être", q: "Diriez-vous que vous avez des problèmes de sommeil ?", opts: ["Non", "Oui, parfois", "Oui, souvent", "Je prends des somnifères"] },
    { id: "moral_60", theme: "Mode de vie & bien-être", q: "Ces 2 dernières semaines, avez-vous ressenti anxiété, tristesse ou perte d'intérêt ?", opts: ["Jamais", "Plusieurs jours", "Plus de 7 jours", "Presque tous les jours"] },
  ],
  "70-75": [
    // Thème 1 : Vaccination (7) — ENRICHI MAX
    { id: "grippe_70", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre la grippe cette saison (vaccin haute dose Efluelda) ?", opts: ["Oui", "Pas encore cette saison", "Non, jamais", "Je ne sais pas"] },
    { id: "covid_70", theme: "Vaccination", q: "Avez-vous fait votre rappel contre la Covid-19 ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "zona_70", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le zona (Shingrix - 2 injections) ?", opts: ["Oui, les 2 injections", "Oui, seulement la 1ère", "Non", "Je ne sais pas"] },
    { id: "pneumo_70", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre les pneumonies bactériennes (pneumocoque - Prevenar 20) ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "dtp_70", theme: "Vaccination", q: "Avez-vous fait un rappel DTP ces 10 dernières années ?", opts: ["Oui", "Non ou je ne sais pas"] },
    { id: "rsv_70", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le VRS (virus respiratoire syncytial, vaccin Abrysvo/Arexvy) ?", opts: ["Oui", "Non", "Je ne sais pas ce que c'est"] },
    { id: "coqueluche_70", theme: "Vaccination", q: "Avez-vous fait un rappel coqueluche récemment (important si contact avec nourrissons) ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    // Thème 2 : Médicaments & autonomie (5) — dépistages colon/mammo RETIRÉS
    { id: "medicaments_70", theme: "Médicaments & autonomie", q: "Combien de médicaments prenez-vous chaque jour ?", opts: ["1 à 4 médicaments", "5 à 6 médicaments", "7 à 9 médicaments", "10 ou plus"] },
    { id: "observance", theme: "Médicaments & autonomie", q: "Vous arrive-t-il d'oublier de prendre vos médicaments ?", opts: ["Jamais", "Rarement (1 fois/mois)", "Parfois (1 fois/semaine)", "Souvent"] },
    { id: "effets_70", theme: "Médicaments & autonomie", q: "Ressentez-vous des effets gênants liés à vos médicaments ?", opts: ["Non", "Parfois, mais gérable", "Oui, assez souvent", "Oui, et cela me préoccupe"] },
    { id: "chutes_70", theme: "Médicaments & autonomie", q: "Avez-vous chuté au cours des 6 derniers mois ?", opts: ["Non", "1 fois, sans me blesser", "1 fois, avec une blessure", "Plusieurs fois"] },
    { id: "autonomie", theme: "Médicaments & autonomie", q: "Avez-vous des difficultés pour certains gestes du quotidien (toilette, habillage, repas) ?", opts: ["Non, aucune difficulté", "Pour quelques gestes", "Pour plusieurs gestes", "J'ai besoin d'aide régulièrement"] },
    // Thème 3 : Mode de vie & bien-être (5)
    { id: "activite_70", theme: "Mode de vie & bien-être", q: "Combien de fois par semaine faites-vous au moins 30 min d'activité physique ?", opts: ["Jamais", "1 à 2 fois", "3 à 4 fois", "5 à 7 fois"] },
    { id: "fruits_70", theme: "Mode de vie & bien-être", q: "Mangez-vous des fruits et légumes tous les jours ?", opts: ["Oui, 5 portions ou plus", "Oui, 1 à 4 portions", "De temps en temps", "Rarement ou jamais"] },
    { id: "logement_70", theme: "Mode de vie & bien-être", q: "Votre logement est-il adapté pour prévenir les chutes (douche, barres, WC surélevé) ?", opts: ["Oui, bien adapté", "En partie", "Non, pas vraiment", "Je ne sais pas"] },
    { id: "memoire_70", theme: "Mode de vie & bien-être", q: "Avez-vous la sensation d'oublier des choses plus qu'avant ?", opts: ["Non", "Oui, un peu", "Oui, et cela me préoccupe"] },
    { id: "moral_70", theme: "Mode de vie & bien-être", q: "Ces 2 dernières semaines, avez-vous ressenti anxiété, tristesse ou perte d'intérêt ?", opts: ["Jamais", "Plusieurs jours", "Plus de 7 jours", "Presque tous les jours"] },
  ],
};

function getQuestionsForSexe(age, sexe) {
  return QUESTIONS[age].filter(q => !q.sexeOnly || q.sexeOnly === sexe);
}

// ═══════════════════════════════════════════════════════════
// CONSEILS PATIENT V8
// ═══════════════════════════════════════════════════════════
function getPatientAdvice(age, a, sexe, prenom) {
  const tips = [];
  if (age === "18-25") {
    if (a.dtp_18 === "Non" || a.dtp_18 === "Je ne sais pas") tips.push({ icon: "💉", title: "Rappel DTP", text: `Le rappel diphtérie-tétanos-polio est recommandé à 25 ans, puis tous les 20 ans. Votre pharmacien peut consulter votre carnet de santé et réaliser directement le rappel en officine, sans ordonnance.` });
    if (a.coqueluche_18 === "Non" || a.coqueluche_18 === "Je ne sais pas") tips.push({ icon: "🛡️", title: "Rappel coqueluche", text: `Recommandé à 25 ans, surtout si vous prévoyez d'avoir des enfants ou êtes en contact avec des nourrissons. La coqueluche peut être grave pour les bébés non encore vaccinés.` });
    if (a.hpv === "Non" || a.hpv === "Oui, partiel" || a.hpv === "Je ne sais pas") tips.push({ icon: "🛡️", title: "Vaccin HPV", text: `Le vaccin HPV protège contre des cancers graves (col, gorge, anus). Rattrapage possible jusqu'à 26 ans. Schéma : 3 doses Gardasil 9. Remboursé.` });
    if (a.meningo_acwy === "Non" || a.meningo_acwy === "Je ne sais pas") tips.push({ icon: "💉", title: "Méningocoque ACWY", text: `Recommandé chez l'adulte jeune, surtout si vie en collectivité (résidence universitaire, etc.). Une injection. Administrable en officine.` });
    if (a.meningo_b === "Non" || a.meningo_b === "Je ne sais pas") tips.push({ icon: "💉", title: "Méningocoque B", text: `Désormais recommandé chez l'adulte jeune. Schéma 2 doses. Protection contre une forme grave de méningite.` });
    if (a.grippe_18 === "Oui mais non vacciné(e)") tips.push({ icon: "💉", title: "Vaccin grippe", text: `Avec votre pathologie, le vaccin grippe annuel est fortement recommandé. Gratuit, sans ordonnance, en pharmacie.` });
    if (a.tabac === "Oui, je fume" || a.tabac === "Oui, cigarette électronique") tips.push({ icon: "🚭", title: "Tabac", text: `Arrêter à votre âge est l'une des meilleures décisions santé. Bénéfices rapides : haleine en 48h, souffle en 3 jours. Votre pharmacien peut proposer patchs/gommes adaptés. Tabac Info Service : 3989.` });
    if (a.alcool === "Plus de 2 verres par jour" || a.alcool === "Plus de 10 verres par semaine") tips.push({ icon: "💧", title: "Alcool", text: `Repères : max 10 verres/sem, pas plus de 2/jour, minimum 2 jours sans alcool. Au-delà, risque significatif. Compléments naturels : desmodium, chardon-Marie. Alcool Info Service : 0 980 980 930.` });
    if (a.substances && a.substances !== "Non") tips.push({ icon: "⚠️", title: "Substances", text: `Le cerveau se développe jusqu'à 25 ans. Impact possible sur mémoire et concentration. Drogues Info Service : 0 800 23 13 13.` });
    if (a.ist === "Non" || a.ist === "Oui, il y a longtemps") tips.push({ icon: "🔬", title: "Dépistage MST", text: `1 fois par an si vie sexuelle active, ou à chaque nouveau partenaire. Gratuit et anonyme dans les CeGIDD.` });
    if (a.contraception === "Non" || a.contraception === "Je souhaite en parler") tips.push({ icon: "💊", title: "Contraception", text: `Nombreux moyens adaptés : pilule, stérilet, implant, anneau, patch, préservatif. Votre pharmacien peut vous orienter.` });
    if (a.sommeil_qualite === "Oui, souvent" || a.sommeil_qualite === "Je prends des somnifères" || a.sommeil_duree === "Moins de 6h") tips.push({ icon: "🌙", title: "Sommeil", text: `Viser 7-9h/nuit. Éviter écrans 1h avant, chambre fraîche (18-19°C), horaires fixes. Naturel : magnésium bisglycinate 300mg le soir, valériane/passiflore.` });
    if (a.mental === "Plus de 7 jours" || a.mental === "Presque tous les jours") tips.push({ icon: "🌿", title: "Anxiété", text: `Solutions naturelles : magnésium bisglycinate (300mg/j), rhodiola, ashwagandha, respiration 5 min/j. Si persiste, consultez. 3114 (gratuit, 24/24).` });
    if (a.tristesse === "Plus de 7 jours" || a.tristesse === "Presque tous les jours") tips.push({ icon: "💙", title: "Bien-être mental", text: `Vitamine D (hiver), oméga-3, lumière naturelle, activité régulière. Parlez-en — médecin, psychologue, ou 3114.` });
    if (a.idees_noires === "Oui, des idées noires" || a.idees_noires === "Oui, une tentative de suicide") tips.push({ icon: "🆘", title: "Soutien immédiat", text: `Vous n'êtes pas seul(e). Le 3114, ligne d'écoute nationale gratuite 24/24, 7j/7. Parler change vraiment les choses.` });
    if (a.violences === "Oui") tips.push({ icon: "🤝", title: "Violences", text: `Aucune violence n'est acceptable. Ressources confidentielles : 3919 (femmes), 119 (enfance), 3018 (cyber).` });
  }
  if (age === "45-50") {
    if (a.dtp_45 === "Non" || a.dtp_45 === "Je ne sais pas") tips.push({ icon: "💉", title: "Rappel DTP", text: `Rappel diphtérie-tétanos-polio recommandé à 45 ans. Votre pharmacien peut l'administrer directement (Repevax, Boostrixtetra).` });
    if (a.coqueluche_45 === "Non" || a.coqueluche_45 === "Je ne sais pas") tips.push({ icon: "🛡️", title: "Coqueluche", text: `Rappel à 45 ans recommandé, surtout si contact avec nourrissons (grands-parents, profession santé). Souvent combiné au DTP.` });
    if (a.grippe_45 === "Oui mais non vacciné(e)") tips.push({ icon: "💉", title: "Vaccin grippe", text: `Avec votre pathologie, vaccin grippe annuel fortement recommandé. Gratuit, sans ordonnance, en pharmacie.` });
    if (a.covid_45 === "Non, à risque") tips.push({ icon: "🛡️", title: "Rappel Covid", text: `Si à risque (comorbidités), rappel annuel recommandé. Coadministrable avec la grippe en un seul passage.` });
    if (a.colorectal === "Non, jamais" || a.colorectal === "Oui, il y a longtemps" || a.colorectal === "Je ne sais pas") tips.push({ icon: "🎯", title: "Dépistage cancer du côlon", text: `Test simple à domicile, recommandé tous les 2 ans entre 50 et 74 ans. Détecte 8 cancers/10 à un stade curable. Kit gratuit en pharmacie.` });
    if ((a.sein === "Non, jamais" || a.sein === "Oui, il y a longtemps") && sexe === "Une femme") tips.push({ icon: "🎀", title: "Mammographie", text: `Recommandée tous les 2 ans à partir de 50 ans. Permet de détecter précocement un cancer du sein.` });
    if ((a.col === "Non, jamais" || a.col === "Oui, il y a plus de 5 ans") && sexe === "Une femme") tips.push({ icon: "🔬", title: "Frottis cervical", text: `Tous les 5 ans entre 25 et 65 ans. À réaliser chez médecin, gynécologue ou sage-femme.` });
    if (a.activite === "Jamais" || a.activite === "1 à 2 fois") tips.push({ icon: "🏃", title: "Activité physique", text: `OMS : 150 min/sem modérée + 2 séances renforcement musculaire/sem pour préserver muscles et os.` });
    if (a.fruits === "Rarement ou jamais" || a.fruits === "Oui, 1 à 2 portions") tips.push({ icon: "🥗", title: "Alimentation", text: `5 fruits et légumes/jour. Régime méditerranéen réduit significativement le risque cardiovasculaire.` });
    if (a.tabac_45 === "Oui, je fume" || a.tabac_45 === "Oui, cigarette électronique") tips.push({ icon: "🚭", title: "Tabac", text: `Risque cardiovasculaire élevé à 45 ans, mais se divise par 2 en moins d'un an après l'arrêt. Substituts en combinaison = plus efficace.` });
    if (a.essouffle === "Oui, un peu" || a.essouffle === "Oui, nettement") tips.push({ icon: "🫁", title: "Essoufflement", text: `Un essoufflement inhabituel mérite un avis médical, surtout si tabagisme. Bilan adapté possible (spirométrie, ECG).` });
    if (a.sommeil_45 === "Oui, souvent" || a.sommeil_45 === "Je prends des somnifères") tips.push({ icon: "🌙", title: "Sommeil", text: `Sommeil de qualité = santé cardio et cognitive. Magnésium bisglycinate 300mg le soir. Si somnifères au long cours, parlez-en — sevrage progressif possible.` });
    if (a.anxiete_45 === "Plus de 7 jours" || a.anxiete_45 === "Presque tous les jours") tips.push({ icon: "🌿", title: "Anxiété", text: `Magnésium bisglycinate, rhodiola/ashwagandha, cohérence cardiaque. Si ça dure, consultez.` });
    if (a.tristesse_45 === "Plus de 7 jours" || a.tristesse_45 === "Presque tous les jours") tips.push({ icon: "💙", title: "Bien-être mental", text: `Tristesse persistante à ne pas minimiser. Activité, vitamine D, oméga-3, et en parler. 3114 (gratuit, 24/24).` });
    if (a.violences_45 === "Oui") tips.push({ icon: "🤝", title: "Violences", text: `Aucune violence n'est acceptable. 3919, 119. Votre pharmacien et médecin sont tenus au secret professionnel.` });
  }
  if (age === "60-65") {
    if (a.grippe !== "Oui") tips.push({ icon: "💉", title: "Grippe", text: `Après 60 ans, la grippe peut être grave. Vaccin annuel automnal, réduit de 40-70% le risque d'hospitalisation. Gratuit, en pharmacie.` });
    if (a.covid !== "Oui") tips.push({ icon: "🛡️", title: "Covid-19", text: `Rappel recommandé après 60 ans. Coadministrable avec la grippe en un seul passage.` });
    if (a.zona !== "Oui, les 2 injections") tips.push({ icon: "🔥", title: "Zona", text: a.zona === "Oui, seulement la 1ère" ? `2ème dose Shingrix indispensable (à faire dans les 2 à 6 mois) pour atteindre la protection optimale.` : `1 personne sur 3 touchée après 60 ans. Vaccin Shingrix (2 injections), protection >90%.` });
    if (a.pneumo !== "Oui") tips.push({ icon: "🫁", title: "Pneumocoque", text: `Prevenar 20 protège contre 20 souches, 2ème cause d'hospitalisation hivernale après 60 ans. Une injection à vie.` });
    if (a.dtp_60 === "Non ou je ne sais pas") tips.push({ icon: "📋", title: "Rappel DTP", text: `Recommandé à 65 ans, puis tous les 10 ans. Votre pharmacien peut faire le rappel directement.` });
    if (a.rsv_60 === "Non" || a.rsv_60 === "Je ne sais pas ce que c'est") tips.push({ icon: "💉", title: "VRS", text: `Le virus respiratoire syncytial cause des bronchiolites graves chez les seniors. Vaccins Abrysvo/Arexvy recommandés. Une injection.` });
    if (a.colorectal_60 === "Non, jamais" || a.colorectal_60 === "Oui, il y a longtemps" || a.colorectal_60 === "Je ne sais pas") tips.push({ icon: "🎯", title: "Dépistage côlon", text: `Tous les 2 ans entre 50 et 74 ans. Kit gratuit en pharmacie. Détecte 8 cancers/10 à un stade curable.` });
    if ((a.mammo_60 === "Non, jamais" || a.mammo_60 === "Oui, il y a longtemps") && sexe === "Une femme") tips.push({ icon: "🎀", title: "Mammographie", text: `Tous les 2 ans jusqu'à 74 ans. Examen le plus efficace pour détecter précocement un cancer du sein.` });
    if (a.medicaments_60 === "5 à 6 médicaments" || a.medicaments_60 === "7 ou plus") tips.push({ icon: "💊", title: "Suivi médicaments", text: `Avec ${a.medicaments_60.toLowerCase()}, certains peuvent interagir. Un point avec votre pharmacien (gratuit) peut identifier des ajustements.` });
    if (a.effets === "Oui, assez souvent" || a.effets === "Oui, et cela me préoccupe") tips.push({ icon: "⚠️", title: "Effets gênants", text: `Pas "normal" de devoir s'y résigner. Médicaments souvent remplaçables ou ajustables.` });
    if (a.chutes_60 && a.chutes_60 !== "Non") tips.push({ icon: "🦴", title: "Chutes", text: `Vitamine D (800-1000 UI/j), vue à vérifier, chaussures fermées, domicile sécurisé. Kiné équilibre possible.` });
    if (a.activite_60 === "Jamais" || a.activite_60 === "1 à 2 fois") tips.push({ icon: "🏃", title: "Activité", text: `Après 60 ans : protège mémoire, équilibre, cœur, humeur. 30 min/j même fragmenté. Marche, jardinage, ménage comptent.` });
    if (a.fruits_60 === "De temps en temps" || a.fruits_60 === "Rarement ou jamais") tips.push({ icon: "🥗", title: "Alimentation", text: `Besoins en protéines, calcium et vitamine D augmentent. Poissons gras 2x/sem, légumes verts, hydratation 1,5L/j.` });
    if (a.memoire_60 === "Oui, un peu" || a.memoire_60 === "Oui, et cela me préoccupe") tips.push({ icon: "🧠", title: "Mémoire", text: `Si ça vous inquiète, parlez-en au médecin. Causes traitables possibles (B12, thyroïde, dépression). Oméga-3 et vitamine D protègent.` });
    if (a.sommeil_60 === "Oui, souvent" || a.sommeil_60 === "Je prends des somnifères") tips.push({ icon: "🌙", title: "Sommeil", text: `Normal de dormir un peu moins, pas de moins bien. Si somnifères au long cours, sevrage progressif important après 60 ans (chutes, mémoire).` });
    if (a.moral_60 === "Plus de 7 jours" || a.moral_60 === "Presque tous les jours") tips.push({ icon: "💙", title: "Bien-être mental", text: `Baisse de moral à l'approche/début retraite fréquente. Liens sociaux, projets, activité physique aident. 3114.` });
  }
  if (age === "70-75") {
    if (a.grippe_70 !== "Oui") tips.push({ icon: "💉", title: "Grippe", text: `Vaccin haute dose Efluelda recommandé après 70 ans. Réduit de 40-70% le risque d'hospitalisation. Probablement le geste préventif le plus important.` });
    if (a.covid_70 !== "Oui") tips.push({ icon: "🛡️", title: "Covid-19", text: `Rappel fortement recommandé après 70 ans pour prévenir formes graves. Coadministrable grippe.` });
    if (a.zona_70 !== "Oui, les 2 injections") tips.push({ icon: "🔥", title: "Zona", text: a.zona_70 === "Oui, seulement la 1ère" ? `2ème dose Shingrix à faire dans les 2-6 mois.` : `Particulièrement douloureux après 70 ans avec séquelles nerveuses. Shingrix 2 doses, protection >90%.` });
    if (a.pneumo_70 !== "Oui") tips.push({ icon: "🫁", title: "Pneumocoque", text: `Prevenar 20 protège contre pneumonies graves. 2ème cause d'hospitalisation hivernale après 70 ans.` });
    if (a.dtp_70 === "Non ou je ne sais pas") tips.push({ icon: "📋", title: "DTP", text: `Tous les 10 ans. Tétanos reste dangereux, surtout après blessure mineure (jardinage). En pharmacie.` });
    if (a.rsv_70 === "Non" || a.rsv_70 === "Je ne sais pas ce que c'est") tips.push({ icon: "💉", title: "VRS", text: `Le VRS cause des bronchiolites graves chez les seniors. Vaccins Abrysvo/Arexvy fortement recommandés après 70 ans. Une injection.` });
    if (a.coqueluche_70 === "Non" || a.coqueluche_70 === "Je ne sais pas") tips.push({ icon: "🛡️", title: "Coqueluche", text: `Rappel recommandé, surtout si contact avec petits-enfants. La coqueluche peut être grave pour les nourrissons.` });
    const manyMeds = a.medicaments_70 === "5 à 6 médicaments" || a.medicaments_70 === "7 à 9 médicaments" || a.medicaments_70 === "10 ou plus";
    if (manyMeds) tips.push({ icon: "💊", title: "Médicaments", text: `Avec ${a.medicaments_70.toLowerCase()}, révision avec votre pharmacien (gratuit, 30-45 min) peut améliorer votre quotidien.` });
    if (a.observance === "Parfois (1 fois/semaine)" || a.observance === "Souvent") tips.push({ icon: "📅", title: "Oublis", text: `Un semainier (pilulier) change vraiment les choses. Votre pharmacien peut vous en proposer un.` });
    if (a.effets_70 === "Oui, assez souvent" || a.effets_70 === "Oui, et cela me préoccupe") tips.push({ icon: "⚠️", title: "Effets gênants", text: `Effets méritent attention. Médicaments souvent ajustables. Parlez-en à votre pharmacien.` });
    if (a.chutes_70 && a.chutes_70 !== "Non") tips.push({ icon: "🦴", title: "Chutes", text: `Vitamine D 1000 UI/j systématique, vue, domicile sécurisé. Kiné équilibre. Important à votre âge.` });
    if (a.autonomie && a.autonomie !== "Non, aucune difficulté") tips.push({ icon: "🏠", title: "Maintien à domicile", text: `Aides existent : APA, aide à domicile, livraison médicaments, téléassistance. Anticiper plutôt qu'attendre.` });
    if (a.activite_70 === "Jamais" || a.activite_70 === "1 à 2 fois") tips.push({ icon: "🏃", title: "Activité", text: `Maintient équilibre (évite chutes), mémoire, moral. 30 min/j de marche suffit. Kiné peut proposer programme adapté.` });
    if (a.fruits_70 === "De temps en temps" || a.fruits_70 === "Rarement ou jamais") tips.push({ icon: "🥗", title: "Alimentation", text: `Risque de dénutrition après 70 ans. Protéines à chaque repas (œufs, fromage, poisson). Hydratation 1,5L/j même sans soif.` });
    if (a.logement_70 === "En partie" || a.logement_70 === "Non, pas vraiment" || a.logement_70 === "Je ne sais pas") tips.push({ icon: "🏡", title: "Logement", text: `1 chute/3 entraîne perte d'autonomie après 70 ans. Barres, douche italienne, éclairage. Soliha et ANAH financent ces travaux.` });
    if (a.memoire_70 === "Oui, un peu" || a.memoire_70 === "Oui, et cela me préoccupe") tips.push({ icon: "🧠", title: "Mémoire", text: `Causes traitables possibles (B12, thyroïde, dépression). Sommeil, activité, lien social protègent. Vitamine D et oméga-3 démontrés.` });
    if (a.moral_70 === "Plus de 7 jours" || a.moral_70 === "Presque tous les jours") tips.push({ icon: "💙", title: "Bien-être mental", text: `Jamais "normal avec l'âge". Liens sociaux, médecin, parfois ajustement de traitements. 3114 (gratuit, 24/24).` });
  }
  if (tips.length === 0) tips.push({ icon: "✨", title: "Bilan encourageant", text: `Vos réponses sont globalement rassurantes, ${prenom}. Continuez à prendre soin de vous et n'hésitez pas à solliciter votre équipe de pharmacie.` });
  return tips;
}

// ═══════════════════════════════════════════════════════════
// RECOMMANDATIONS PHARMACIEN V8
// ═══════════════════════════════════════════════════════════
function getPharmacistReco(age, a, sexe) {
  const items = [];
  if (age === "18-25") {
    if (a.dtp_18 === "Non" || a.dtp_18 === "Je ne sais pas") items.push({ theme: "Vaccination", priority: true, label: "Rappel DTP à 25 ans", detail: "Repevax® ou Boostrixtetra® en officine. Administration sans ordonnance par pharmacien." });
    if (a.coqueluche_18 === "Non" || a.coqueluche_18 === "Je ne sais pas") items.push({ theme: "Vaccination", priority: true, label: "Rappel coqueluche", detail: "Boostrixtetra® (combiné DTP-coqueluche). Particulièrement important si projet parental ou contact nourrissons." });
    if (a.hpv === "Non" || a.hpv === "Oui, partiel" || a.hpv === "Je ne sais pas") items.push({ theme: "Vaccination", priority: true, label: "Vaccin HPV", detail: "Rattrapage jusqu'à 26 ans. Schéma 3 doses (M0, M2, M6) Gardasil 9®. Remboursé. Administration officine sur prescription pharmacien." });
    if (a.meningo_acwy === "Non" || a.meningo_acwy === "Je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Méningocoque ACWY", detail: "Recommandé chez adulte jeune. Nimenrix® ou Menveo®. Une injection." });
    if (a.meningo_b === "Non" || a.meningo_b === "Je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Méningocoque B", detail: "Bexsero® - schéma 2 doses. Désormais recommandé chez l'adulte jeune." });
    if (a.grippe_18 === "Oui mais non vacciné(e)") items.push({ theme: "Vaccination", priority: true, label: "Vaccin grippe", detail: "Patient avec comorbidité non vacciné. Influvac Tetra® ou Vaxigrip Tetra®. Remboursé 100%." });
    if (a.tabac === "Oui, je fume") items.push({ theme: "Conduites addictives & santé sexuelle", priority: true, label: "Sevrage tabagique", detail: "Évaluation Fagerström. Substituts en combinaison (patch 21mg/24h + gommes 2mg). Prescription pharmacien possible." });
    if (a.alcool === "Plus de 2 verres par jour" || a.alcool === "Plus de 10 verres par semaine") items.push({ theme: "Conduites addictives & santé sexuelle", priority: true, label: "Consommation alcool à risque", detail: "Dépassement repères OMS. Entretien motivationnel. Orienter CSAPA si dépendance." });
    if (a.substances && a.substances !== "Non") items.push({ theme: "Conduites addictives & santé sexuelle", priority: true, label: "Consommation substances", detail: `${a.substances}. Évaluer fréquence, polyconsommation. Orientation CSAPA ou Consultation Jeunes Consommateurs.` });
    if (a.ist === "Non") items.push({ theme: "Conduites addictives & santé sexuelle", priority: false, label: "Dépistage MST à orienter", detail: "Orienter CeGIDD ou TROD HIV/VHC en officine. Bilan VIH, VHB, VHC, syphilis, chlamydia, gonocoque." });
    if (a.contraception === "Non" && sexe === "Une femme") items.push({ theme: "Conduites addictives & santé sexuelle", priority: false, label: "Absence de contraception", detail: "Contraception d'urgence dispo sans ordonnance. Orienter gynécologue pour solution long terme." });
    if (a.sommeil_qualite === "Oui, souvent" || a.sommeil_qualite === "Je prends des somnifères" || a.sommeil_duree === "Moins de 6h") items.push({ theme: "Sommeil & bien-être mental", priority: false, label: "Troubles du sommeil", detail: "Hygiène de sommeil à renforcer. Magnésium bisglycinate 300mg. Si BZD, évaluer dépendance et sevrage." });
    if (a.mental === "Plus de 7 jours" || a.mental === "Presque tous les jours" || a.tristesse === "Plus de 7 jours" || a.tristesse === "Presque tous les jours") items.push({ theme: "Sommeil & bien-être mental", priority: true, label: "Détresse psychologique (GAD-2/PHQ-2)", detail: "Symptômes anxio-dépressifs significatifs. Orienter médecin traitant rapidement. Évaluer IS." });
    if (a.idees_noires === "Oui, des idées noires" || a.idees_noires === "Oui, une tentative de suicide") items.push({ theme: "Sommeil & bien-être mental", priority: true, label: "Idées suicidaires — URGENT", detail: "Orientation immédiate : 3114, médecin traitant en urgence, ou SAU si crise. Ne pas laisser repartir sans relais." });
    if (a.violences === "Oui") items.push({ theme: "Sommeil & bien-être mental", priority: true, label: "Antécédent de violences", detail: "Entretien confidentiel. Orienter 3919, 119, 3018 selon contexte. Réseau pluridisciplinaire." });
  }
  if (age === "45-50") {
    if (a.dtp_45 === "Non" || a.dtp_45 === "Je ne sais pas") items.push({ theme: "Vaccination", priority: true, label: "Rappel DTP à 45 ans", detail: "Repevax® ou Boostrixtetra®. Administration officine sans ordonnance." });
    if (a.coqueluche_45 === "Non" || a.coqueluche_45 === "Je ne sais pas") items.push({ theme: "Vaccination", priority: true, label: "Rappel coqueluche", detail: "Boostrixtetra® (combiné DTP-coqueluche). Important si contact nourrissons ou profession santé." });
    if (a.grippe_45 === "Oui mais non vacciné(e)") items.push({ theme: "Vaccination", priority: true, label: "Vaccin grippe", detail: "Patient avec comorbidité non vacciné. Vaxigrip Tetra®, Influvac Tetra®. Remboursé." });
    if (a.covid_45 === "Non, à risque") items.push({ theme: "Vaccination", priority: true, label: "Rappel Covid", detail: "Patient à risque sans rappel. Comirnaty® ou Spikevax®. Coadministrable grippe." });
    if (a.colorectal === "Non, jamais" || a.colorectal === "Oui, il y a longtemps" || a.colorectal === "Je ne sais pas") items.push({ theme: "Dépistages & mode de vie", priority: true, label: "Kit dépistage colorectal", detail: "Patient éligible dès 50 ans. Kit immunologique au comptoir avec explications. Sans ordonnance." });
    if ((a.sein === "Non, jamais" || a.sein === "Oui, il y a longtemps") && sexe === "Une femme") items.push({ theme: "Dépistages & mode de vie", priority: true, label: "Mammographie", detail: "Dépistage organisé non réalisé. Orienter CPAM ou médecin traitant. 100% pris en charge." });
    if ((a.col === "Non, jamais" || a.col === "Oui, il y a plus de 5 ans") && sexe === "Une femme") items.push({ theme: "Dépistages & mode de vie", priority: false, label: "Frottis cervical", detail: "Dépistage en retard. Orienter médecin/gynécologue/sage-femme. Tous les 5 ans entre 25 et 65 ans." });
    if (a.activite === "Jamais" || a.activite === "1 à 2 fois") items.push({ theme: "Dépistages & mode de vie", priority: false, label: "Activité physique insuffisante", detail: "OMS : 150 min/sem + 2 séances renforcement. Conseils hygiéno-diététiques." });
    if (a.fruits === "Rarement ou jamais" || a.fruits === "Oui, 1 à 2 portions") items.push({ theme: "Dépistages & mode de vie", priority: false, label: "Apports F&L insuffisants", detail: "PNNS 5/jour. Alimentation méditerranéenne." });
    if (a.tabac_45 === "Oui, je fume") items.push({ theme: "Dépistages & mode de vie", priority: true, label: "Sevrage tabagique", detail: "Risque cardiovasculaire majeur à 45 ans. Substituts en combinaison. Prescription pharmacien possible." });
    if (a.essouffle === "Oui, un peu" || a.essouffle === "Oui, nettement") items.push({ theme: "Sommeil & bien-être mental", priority: true, label: "Dyspnée d'effort", detail: "À explorer. Orienter médecin traitant : ECG, spirométrie, DLCO. Évaluer FdR cardiovasculaires." });
    if (a.sommeil_45 === "Oui, souvent" || a.sommeil_45 === "Je prends des somnifères") items.push({ theme: "Sommeil & bien-être mental", priority: false, label: "Troubles du sommeil", detail: "Si BZD chronique après 50 ans : risque cognitif et chutes. Sevrage progressif accompagné. Magnésium, mélatonine en alternative." });
    if (a.anxiete_45 === "Plus de 7 jours" || a.anxiete_45 === "Presque tous les jours" || a.tristesse_45 === "Plus de 7 jours" || a.tristesse_45 === "Presque tous les jours") items.push({ theme: "Sommeil & bien-être mental", priority: true, label: "Symptômes anxio-dépressifs", detail: "GAD-2/PHQ-2 positif. Orienter médecin traitant. Évaluer IS systématiquement." });
    if (a.violences_45 === "Oui") items.push({ theme: "Sommeil & bien-être mental", priority: true, label: "Antécédent de violences", detail: "Entretien confidentiel. 3919, médecin traitant, association locale. Documenter si certificat demandé." });
  }
  if (age === "60-65") {
    if (a.grippe !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Vaccin grippe", detail: "Patient 60+ non vacciné. Influvac Tetra®, Vaxigrip Tetra®, Efluelda® (65+). Remboursé 100%." });
    if (a.covid !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Rappel Covid-19", detail: "Coadministration grippe possible. Comirnaty® ou Spikevax®." });
    if (a.zona !== "Oui, les 2 injections") items.push({ theme: "Vaccination", priority: true, label: a.zona === "Oui, seulement la 1ère" ? "Zona Shingrix® — 2ème dose" : "Zona Shingrix® — À initier", detail: a.zona === "Oui, seulement la 1ère" ? "1ère dose effectuée. 2ème dose à 2-6 mois. Schéma incomplet = protection insuffisante." : "Schéma 2 doses (J0 et M2-6). Protection >90%. Remboursé pour 65+." });
    if (a.pneumo !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Pneumocoque Prevenar 20®", detail: "1 injection à vie après 65 ans. Coadministrable grippe. Remboursé sur prescription." });
    if (a.dtp_60 === "Non ou je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Rappel DTP", detail: "Tous les 10 ans après 65 ans. Vérifier carnet. Administration officine." });
    if (a.rsv_60 === "Non" || a.rsv_60 === "Je ne sais pas ce que c'est") items.push({ theme: "Vaccination", priority: true, label: "VRS Abrysvo® ou Arexvy®", detail: "Recommandation HAS 2024. Une injection. Prévention bronchiolites graves seniors. Coadministrable autres vaccins." });
    if (a.colorectal_60 === "Non, jamais" || a.colorectal_60 === "Oui, il y a longtemps" || a.colorectal_60 === "Je ne sais pas") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Kit dépistage colorectal", detail: "Patient éligible. Remise immédiate au comptoir. Sans ordonnance." });
    if ((a.mammo_60 === "Non, jamais" || a.mammo_60 === "Oui, il y a longtemps") && sexe === "Une femme") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Mammographie", detail: "Dépistage en retard. Orienter CPAM ou médecin traitant. Tous les 2 ans jusqu'à 74 ans." });
    if (a.medicaments_60 === "5 à 6 médicaments" || a.medicaments_60 === "7 ou plus") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Polymédication — BPM", detail: `${a.medicaments_60}. Patient éligible BPM (65+, 5+ médicaments chroniques). Analyse interactions, médicaments inappropriés (Beers/Laroche), déprescription.` });
    if (a.effets === "Oui, assez souvent" || a.effets === "Oui, et cela me préoccupe") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Effets indésirables", detail: "Évaluer nature, fréquence, médicament suspect. Pharmacovigilance. Orienter médecin." });
    if (a.chutes_60 && a.chutes_60 !== "Non") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Chute — Évaluation", detail: `${a.chutes_60}. Vérifier traitements à risque (BZD, antihypertenseurs, hypoglycémiants). Doser vit D. Orienter kiné.` });
    if (a.activite_60 === "Jamais" || a.activite_60 === "1 à 2 fois") items.push({ theme: "Mode de vie & bien-être", priority: false, label: "Activité physique insuffisante", detail: "OMS 150 min/sem. Renforcement musculaire 2x/sem (sarcopénie). APA possible sur prescription." });
    if (a.fruits_60 === "De temps en temps" || a.fruits_60 === "Rarement ou jamais") items.push({ theme: "Mode de vie & bien-être", priority: false, label: "Apports alimentaires", detail: "Protéines 1-1,2 g/kg/j après 60 ans. Calcium, vit D. Évaluer dénutrition. Orienter diététicien." });
    if (a.memoire_60 === "Oui, et cela me préoccupe") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Plainte mnésique", detail: "Orienter médecin traitant : MMSE, B12, TSH, vit D. Vérifier anticholinergiques, BZD." });
    if (a.sommeil_60 === "Je prends des somnifères") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "BZD au long cours", detail: "Risques majorés après 60 ans : chutes, troubles cognitifs. Sevrage progressif (-25% / 2 sem). Mélatonine LP 2mg en relais." });
    if (a.moral_60 === "Plus de 7 jours" || a.moral_60 === "Presque tous les jours") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Symptômes dépressifs", detail: "À dépister à l'approche/début retraite. Orienter médecin. Doser vit D. Évaluer IS." });
  }
  if (age === "70-75") {
    if (a.grippe_70 !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Grippe — Prioritaire", detail: "Vaccin haute dose Efluelda® recommandé. Administration officine sans ordonnance. Remboursée 100%." });
    if (a.covid_70 !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Rappel Covid-19", detail: "Coadministration grippe. Très important après 70 ans." });
    if (a.zona_70 !== "Oui, les 2 injections") items.push({ theme: "Vaccination", priority: true, label: a.zona_70 === "Oui, seulement la 1ère" ? "Zona Shingrix® — 2ème dose" : "Zona Shingrix® — À initier", detail: a.zona_70 === "Oui, seulement la 1ère" ? "2ème dose à 2-6 mois. Schéma incomplet." : "Schéma 2 doses. Séquelles neurologiques fréquentes sans vaccination. Très fortement recommandé." });
    if (a.pneumo_70 !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Pneumocoque Prevenar 20®", detail: "1 injection à vie. 2ème cause d'hospitalisation hivernale. Coadministrable grippe." });
    if (a.dtp_70 === "Non ou je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Rappel DTP", detail: "Tous les 10 ans. Vérifier carnet et administrer si nécessaire." });
    if (a.rsv_70 === "Non" || a.rsv_70 === "Je ne sais pas ce que c'est") items.push({ theme: "Vaccination", priority: true, label: "VRS Abrysvo® ou Arexvy®", detail: "Recommandation HAS 2024. Très important après 70 ans (formes graves de bronchiolite). Une injection. Coadministrable autres vaccins." });
    if (a.coqueluche_70 === "Non" || a.coqueluche_70 === "Je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Rappel coqueluche", detail: "Boostrixtetra®. Important si contact petits-enfants (stratégie cocoon)." });
    const manyMeds = a.medicaments_70 === "5 à 6 médicaments" || a.medicaments_70 === "7 à 9 médicaments" || a.medicaments_70 === "10 ou plus";
    if (manyMeds) items.push({ theme: "Médicaments & autonomie", priority: true, label: "Polymédication — BPM fortement recommandé", detail: `${a.medicaments_70}. Vérifier médicaments inappropriés après 70 ans : BZD, anticholinergiques, AINS chroniques. Cascade médicamenteuse. Déprescription.` });
    if (a.observance === "Parfois (1 fois/semaine)" || a.observance === "Souvent") items.push({ theme: "Médicaments & autonomie", priority: true, label: "Observance — PDA à proposer", detail: "Oublis impactant efficacité. Service Préparation Doses à Administrer." });
    if (a.effets_70 === "Oui, assez souvent" || a.effets_70 === "Oui, et cela me préoccupe") items.push({ theme: "Médicaments & autonomie", priority: true, label: "Effets indésirables", detail: "Évaluer nature, fréquence, médicament suspect. Pharmacovigilance. Orienter médecin." });
    if (a.chutes_70 && a.chutes_70 !== "Non") items.push({ theme: "Médicaments & autonomie", priority: true, label: "Chute — Évaluation prioritaire", detail: `${a.chutes_70}. Vérifier traitements à risque. Vit D 1000 UI/j systématique. Kiné équilibre.` });
    if (a.autonomie && a.autonomie !== "Non, aucune difficulté") items.push({ theme: "Médicaments & autonomie", priority: false, label: "Perte d'autonomie", detail: `${a.autonomie}. Informer APA, aide à domicile, livraison médicaments. Orienter CCAS.` });
    if (a.activite_70 === "Jamais" || a.activite_70 === "1 à 2 fois") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Sédentarité — Risque sarcopénie/chutes", detail: "APA sur prescription si ALD. Kiné équilibre/renforcement. Programme PIED si disponible." });
    if (a.fruits_70 === "De temps en temps" || a.fruits_70 === "Rarement ou jamais") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Risque dénutrition", detail: "Évaluer dénutrition (poids, IMC, MNA). Protéines 1,2 g/kg/j, CNO si pertinent. Vit D 1000 UI/j." });
    if (a.logement_70 === "En partie" || a.logement_70 === "Non, pas vraiment" || a.logement_70 === "Je ne sais pas") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Logement non sécurisé", detail: "Soliha, ANAH, caisse de retraite (financement adaptations). Ergothérapeute à domicile pertinent." });
    if (a.memoire_70 === "Oui, et cela me préoccupe") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Plainte mnésique", detail: "MMSE, MoCA, B12, TSH, vit D, iono. Vérifier anticholinergiques, BZD. Consultation mémoire si significative." });
    if (a.moral_70 === "Plus de 7 jours" || a.moral_70 === "Presque tous les jours") items.push({ theme: "Mode de vie & bien-être", priority: true, label: "Symptômes dépressifs", detail: "Dépression sous-diagnostiquée chez sujet âgé. Doser vit D. Évaluer iatrogénie. IS systématiquement." });
  }
  if (items.length === 0) items.push({ theme: "Bilan", priority: false, label: "Aucune action particulière", detail: "Bilan globalement rassurant. Maintenir vigilance dépistages organisés et mise à jour vaccinale." });
  return items;
}

// ═══════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════
function GS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;}body{margin:0;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fade{animation:fadeUp 0.3s ease-out}
      button:active{transform:scale(0.97)}
      input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
    `}</style>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.body, color: C.text, display: "flex", justifyContent: "center", padding: "20px 16px 56px" }}>
      <GS /><div style={{ width: "100%", maxWidth: 460 }}>{children}</div>
    </div>
  );
}

function Tag() {
  return (
    <div style={{ textAlign: "center", marginBottom: 22 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px", borderRadius: 99, background: C.navy, color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.sage }} />{PHARMACY.name}
      </span>
    </div>
  );
}

function PrimaryBtn({ label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: "100%", padding: "17px", background: disabled ? C.border : C.navy, color: disabled ? C.muted : "#fff", border: "none", borderRadius: 13, fontSize: 15, fontWeight: 700, fontFamily: F.body, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s" }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = C.navyDark)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = C.navy)}>
      {label}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick}
      style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, fontFamily: F.body, cursor: "pointer", padding: "6px 0", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
      ← Retour
    </button>
  );
}

function ChoiceBtn({ label, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: "17px 20px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 13, cursor: "pointer", textAlign: "left", fontFamily: F.body, fontSize: 15, fontWeight: 600, color: C.navy, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s", width: "100%" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.transform = "translateX(4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
      {label} <span style={{ color: C.sage, fontSize: 18 }}>→</span>
    </button>
  );
}

function Welcome({ onStart }) {
  return (
    <div className="fade" style={{ paddingTop: 12 }}>
      <Tag />
      <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: C.navy, lineHeight: 1.1, margin: "0 0 12px", letterSpacing: -0.5 }}>
        Votre bilan<br /><em style={{ color: C.sage }}>santé personnalisé</em>
      </h1>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, margin: "0 0 22px" }}>
        Répondez à quelques questions pour recevoir des recommandations adaptées à votre profil. Rapide, confidentiel, gratuit.
      </p>
      <div style={{ display: "flex", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 26 }}>
        {[["~5 min", "Durée"], ["Gratuit", "Accès"], ["🔒", "Confidentiel"]].map(([v, l], i) => (
          <div key={l} style={{ flex: 1, textAlign: "center", padding: "14px 8px", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.navy }}>{v}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <PrimaryBtn label="Commencer →" onClick={onStart} />
      <p style={{ textAlign: "center", fontSize: 10.5, color: C.muted, marginTop: 14, lineHeight: 1.5 }}>
        Vos données sont traitées dans le respect du RGPD<br />et transmises uniquement à votre pharmacie.
      </p>
    </div>
  );
}

function StepIdentite({ initial, onNext, onBack }) {
  const [nom, setNom] = useState(initial.nom || "");
  const [prenom, setPrenom] = useState(initial.prenom || "");
  const [date, setDate] = useState(initial.dateNaissance || "");
  const prenomRef = useRef(null);
  const dateRef = useRef(null);

  const detection = date.length === 10 ? detectAgeGroup(date) : null;
  const dateValid = isValidDate(date);
  const ageEligible = detection && detection.group;
  const formValid = nom.trim() && prenom.trim() && dateValid && ageEligible;

  const handleSubmit = () => {
    if (!formValid) return;
    onNext({ nom: capitalize(nom.trim()), prenom: capitalize(prenom.trim()), dateNaissance: date, ageGroup: detection.group });
  };

  return (
    <div className="fade" style={{ paddingTop: 12 }}>
      <Tag />
      <BackBtn onClick={onBack} />
      <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, margin: "0 0 6px" }}>Votre <em style={{ color: C.sage }}>identité</em></h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Pour personnaliser votre bilan.</p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Nom</label>
        <input type="text" value={nom} onChange={e => setNom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && nom.trim() && prenomRef.current?.focus()}
          placeholder="Votre nom de famille" autoFocus
          style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${nom ? C.navy : C.border}`, borderRadius: 11, fontSize: 15, fontFamily: F.body, color: C.text, background: C.card, transition: "border 0.2s", outline: "none" }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Prénom</label>
        <input ref={prenomRef} type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && prenom.trim() && dateRef.current?.focus()}
          placeholder="Votre prénom"
          style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${prenom ? C.navy : C.border}`, borderRadius: 11, fontSize: 15, fontFamily: F.body, color: C.text, background: C.card, transition: "border 0.2s", outline: "none" }}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" }}>Date de naissance</label>
        <input ref={dateRef} type="text" value={date}
          onChange={e => setDate(formatDateInput(e.target.value))}
          onKeyDown={e => e.key === "Enter" && formValid && handleSubmit()}
          placeholder="JJ/MM/AAAA" inputMode="numeric" maxLength={10}
          style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${ageEligible ? C.sage : (date.length === 10 && !ageEligible) ? C.red : (date ? C.navy : C.border)}`, borderRadius: 11, fontSize: 17, fontFamily: F.display, color: C.navy, background: C.card, transition: "border 0.2s", outline: "none", textAlign: "center", letterSpacing: 3 }}
        />
        {date.length === 10 && !dateValid && (
          <p style={{ marginTop: 8, fontSize: 12, color: C.red, lineHeight: 1.5 }}>Date invalide. Format attendu : JJ/MM/AAAA.</p>
        )}
        {dateValid && !ageEligible && (
          <div style={{ marginTop: 8, padding: "10px 14px", background: C.redLight, border: `1px solid ${C.red}`, borderRadius: 10, fontSize: 12.5, color: C.red, lineHeight: 1.5 }}>
            Votre âge ({detection.age} ans) n'est pas couvert par ce bilan de prévention.<br />
            <span style={{ fontSize: 11.5, opacity: 0.85 }}>Le dispositif est destiné aux 18–25, 45–50, 60–65 ou 70–75 ans.</span>
          </div>
        )}
        {ageEligible && (
          <div style={{ marginTop: 8, padding: "8px 14px", background: C.sageLight, border: `1px solid ${C.sage}`, borderRadius: 10, fontSize: 12.5, color: C.sage, fontWeight: 600 }}>
            ✓ Tranche {detection.group} ans — questionnaire adapté
          </div>
        )}
      </div>

      <PrimaryBtn label="Continuer →" onClick={handleSubmit} disabled={!formValid} />
    </div>
  );
}

function StepSexe({ onNext, onBack }) {
  return (
    <div className="fade" style={{ paddingTop: 12 }}>
      <Tag />
      <BackBtn onClick={onBack} />
      <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, margin: "0 0 6px" }}>Vous êtes <em style={{ color: C.sage }}>?</em></h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Certaines recommandations varient selon le sexe.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["Une femme", "Un homme"].map(opt => <ChoiceBtn key={opt} label={opt} onClick={() => onNext(opt)} />)}
      </div>
    </div>
  );
}

function StepQuestions({ ageGroup, sexe, onSubmit, onBack }) {
  const questions = getQuestionsForSexe(ageGroup, sexe);
  const [answers, setAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const answered = Object.keys(answers).length;
  const allDone = answered === questions.length && consent;
  const themes = [...new Set(questions.map(q => q.theme))];

  return (
    <div className="fade" style={{ paddingTop: 12 }}>
      <Tag />
      <BackBtn onClick={onBack} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>Bilan <em style={{ color: C.sage }}>santé</em></h2>
        <span style={{ fontSize: 11, fontWeight: 700, color: answered === questions.length ? C.sage : C.muted }}>{answered}/{questions.length}</span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 99, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(answered / questions.length) * 100}%`, background: C.sage, transition: "width 0.3s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {themes.map(theme => (
          <div key={theme}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 12, height: 1, background: C.sage }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, textTransform: "uppercase", letterSpacing: 1.4 }}>{theme}</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {questions.filter(q => q.theme === theme).map(q => (
                <div key={q.id} style={{ background: C.card, border: `1.5px solid ${answers[q.id] ? C.sage : C.border}`, borderRadius: 13, padding: "13px 14px", transition: "border 0.2s" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 600, color: C.navy, lineHeight: 1.4 }}>{q.q}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {q.opts.map(opt => {
                      const active = answers[q.id] === opt;
                      return (
                        <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                          style={{ padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${active ? C.navy : "#EAEAE4"}`, background: active ? C.navy : "#FAFAF7", color: active ? "#fff" : C.text, cursor: "pointer", textAlign: "left", fontSize: 13, fontFamily: F.body, fontWeight: active ? 600 : 400, display: "flex", alignItems: "center", gap: 9, transition: "all 0.12s", lineHeight: 1.35 }}>
                          <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${active ? "#fff" : C.border}`, background: active ? "#fff" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.navy }} />}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22, padding: "14px", background: C.card, border: `1.5px solid ${consent ? C.sage : C.border}`, borderRadius: 12, transition: "border 0.2s" }}>
        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
          <div onClick={() => setConsent(!consent)}
            style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${consent ? C.sage : C.border}`, background: consent ? C.sage : "#fff", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            {consent && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
            J'accepte que mes réponses soient transmises de façon confidentielle à l'équipe de la <strong style={{ color: C.navy }}>{PHARMACY.name}</strong>.
          </span>
        </label>
      </div>

      <div style={{ marginTop: 14 }}>
        <PrimaryBtn
          label={allDone ? "Valider mon bilan ✓" : answered < questions.length ? `Plus que ${questions.length - answered} réponse${questions.length - answered > 1 ? "s" : ""}` : "Cochez le consentement"}
          onClick={() => allDone && onSubmit(answers)}
          disabled={!allDone}
        />
      </div>
    </div>
  );
}

function Sending() {
  return (
    <div style={{ paddingTop: 130, textAlign: "center" }} className="fade">
      <div style={{ width: 42, height: 42, margin: "0 auto 22px", border: `3px solid ${C.border}`, borderTop: `3px solid ${C.sage}`, borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <h2 style={{ fontFamily: F.display, fontSize: 20, color: C.navy, fontWeight: 700, margin: "0 0 6px" }}>Génération du compte-rendu...</h2>
      <p style={{ color: C.muted, fontSize: 13 }}>Transmission à votre pharmacie</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RÉSULTATS — Conseils SEULEMENT, pas de PDF, pas d'historique
// ═══════════════════════════════════════════════════════════
function Results({ data }) {
  const { prenom, ageGroup, sexe, answers, refNumber, dateStr, timeStr } = data;
  const tips = getPatientAdvice(ageGroup, answers, sexe, prenom);

  return (
    <div className="fade" style={{ paddingTop: 12 }}>
      <Tag />

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 60, height: 60, margin: "0 auto 14px", borderRadius: "50%", background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✓</div>
        <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, margin: "0 0 6px", lineHeight: 1.1 }}>Merci, {prenom} !</h1>
        <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Votre bilan a été transmis à votre pharmacie.
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ height: 1, flex: 1, background: C.border }} />
          <span style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700 }}>Vos recommandations</span>
          <div style={{ height: 1, flex: 1, background: C.border }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ padding: "13px 15px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, display: "flex", gap: 11 }}>
              <span style={{ fontSize: 19, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{tip.icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{tip.title}</div>
                <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6 }}>{tip.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 14px", background: C.goldLight, border: `1px solid #E8C97A`, borderRadius: 11, textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 12, color: C.navy, lineHeight: 1.55 }}>
          Votre équipe de pharmacie a reçu votre bilan et sera disponible pour vous lors de votre prochain passage.
        </p>
        <p style={{ margin: "5px 0 0", fontSize: 10, color: C.muted }}>{dateStr} à {timeStr} — {PHARMACY.name}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT — Envoi à /api/send-mail avec tous les data dérivés
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState("welcome");
  const [identite, setIdentite] = useState({ nom: "", prenom: "", dateNaissance: "", ageGroup: "" });
  const [sexe, setSexe] = useState("");
  const [submitData, setSubmitData] = useState(null);

  const handleSubmit = async (ans) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const refNumber = generateRefNumber();

    const tips = getPatientAdvice(identite.ageGroup, ans, sexe, identite.prenom);
    const recos = getPharmacistReco(identite.ageGroup, ans, sexe);
    const questionsLib = getQuestionsForSexe(identite.ageGroup, sexe);
    const themes = [...new Set(questionsLib.map(q => q.theme))];
    const priorityRecos = recos.filter(r => r.priority);

    const payload = {
      ...identite, sexe, answers: ans, refNumber, dateStr, timeStr,
      themes, recos, priorityRecos, tips, questionsLib,
    };

    setSubmitData(payload);
    setStep("sending");

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      console.log("Mail envoyé :", json);
    } catch (err) {
      console.error("Erreur envoi mail :", err);
    }

    setTimeout(() => setStep("results"), 1500);
  };

  return (
    <Shell>
      {step === "welcome" && <Welcome onStart={() => setStep("identite")} />}
      {step === "identite" && <StepIdentite initial={identite} onNext={data => { setIdentite(data); setStep("sexe"); }} onBack={() => setStep("welcome")} />}
      {step === "sexe" && <StepSexe onNext={v => { setSexe(v); setStep("questions"); }} onBack={() => setStep("identite")} />}
      {step === "questions" && <StepQuestions ageGroup={identite.ageGroup} sexe={sexe} onSubmit={handleSubmit} onBack={() => setStep("sexe")} />}
      {step === "sending" && <Sending />}
      {step === "results" && submitData && <Results data={submitData} />}
    </Shell>
  );
}
