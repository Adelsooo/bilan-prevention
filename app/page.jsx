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
// QUESTIONS (identiques V5)
// ═══════════════════════════════════════════════════════════
const QUESTIONS = {
  "18-25": [
    { id: "tabac", theme: "Conduites addictives", q: "Fumez-vous ou utilisez-vous une cigarette électronique ?", opts: ["Non", "J'ai arrêté", "Oui, cigarette électronique", "Oui, je fume"] },
    { id: "alcool", theme: "Conduites addictives", q: "Quelle est votre consommation d'alcool habituelle ?", opts: ["Jamais ou rarement", "Moins de 10 verres par semaine", "Plus de 2 verres par jour", "Plus de 10 verres par semaine"] },
    { id: "binge", theme: "Conduites addictives", q: "Vous arrive-t-il de boire rapidement pour être ivre ?", opts: ["Non, jamais", "Rarement", "Parfois", "Oui, souvent"] },
    { id: "substances", theme: "Conduites addictives", q: "Avez-vous consommé du cannabis ou d'autres substances cette année ?", opts: ["Non", "Oui, du cannabis", "Oui, du protoxyde d'azote (gaz hilarant)", "Oui, d'autres substances"] },
    { id: "jeux", theme: "Conduites addictives", q: "Pariez-vous de l'argent sur des jeux ou des paris sportifs ?", opts: ["Non", "Rarement", "De temps en temps", "Oui, souvent"] },
    { id: "vaccins_base", theme: "Vaccination & santé sexuelle", q: "Pensez-vous être à jour de vos vaccins obligatoires ?", opts: ["Oui, je pense", "Non", "Je ne sais pas"] },
    { id: "hpv", theme: "Vaccination & santé sexuelle", q: "Avez-vous reçu le vaccin contre le papillomavirus (HPV) ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "ist", theme: "Vaccination & santé sexuelle", q: "Avez-vous fait un dépistage des maladies sexuellement transmissibles récemment ?", opts: ["Oui, récemment", "Oui, il y a longtemps", "Non", "Non concerné(e)"] },
    { id: "contraception", theme: "Vaccination & santé sexuelle", q: "Utilisez-vous une contraception adaptée à votre situation ?", opts: ["Oui", "Non", "Non concerné(e)", "Je souhaite en parler"], sexeOnly: "Une femme" },
    { id: "mental", theme: "Vaccination & santé sexuelle", q: "Ces dernières semaines, avez-vous souvent ressenti de la nervosité ou de l'anxiété ?", opts: ["Non, ça va bien", "Parfois", "Assez souvent", "Presque tous les jours"] },
  ],
  "45-50": [
    { id: "vaccins", theme: "Vaccination & dépistages", q: "Pensez-vous être à jour de vos vaccins (tétanos, diphtérie) ?", opts: ["Oui, je pense", "Non", "Je ne sais pas"] },
    { id: "colorectal", theme: "Vaccination & dépistages", q: "Avez-vous déjà fait le test de dépistage du cancer du côlon ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Je ne sais pas"] },
    { id: "sein", theme: "Vaccination & dépistages", q: "Avez-vous fait une mammographie (radiographie du sein) ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Non concerné(e)"], sexeOnly: "Une femme" },
    { id: "col", theme: "Vaccination & dépistages", q: "Avez-vous fait un frottis (dépistage du cancer du col de l'utérus) ?", opts: ["Oui, il y a moins de 5 ans", "Oui, il y a plus de 5 ans", "Non, jamais", "Non concerné(e)"], sexeOnly: "Une femme" },
    { id: "prise_sang", theme: "Vaccination & dépistages", q: "À quand remonte votre dernière prise de sang ?", opts: ["Moins de 6 mois", "Entre 6 mois et 1 an", "Plus d'un an", "Je ne sais pas"] },
    { id: "activite", theme: "Activité physique & alimentation", q: "Combien de fois par semaine faites-vous au moins 30 min de sport ou de marche rapide ?", opts: ["Jamais", "1 à 2 fois", "3 à 4 fois", "5 fois ou plus"] },
    { id: "sedentarite", theme: "Activité physique & alimentation", q: "Combien d'heures par jour restez-vous assis(e) (travail, canapé, voiture) ?", opts: ["Moins de 2 heures", "2 à 4 heures", "4 à 7 heures", "Plus de 7 heures"] },
    { id: "fruits", theme: "Activité physique & alimentation", q: "Mangez-vous des fruits et légumes tous les jours ?", opts: ["Oui, 5 portions ou plus", "Oui, 3 à 4 portions", "Oui, 1 à 2 portions", "Rarement ou jamais"] },
    { id: "gras_sucre", theme: "Activité physique & alimentation", q: "À quelle fréquence consommez-vous charcuterie, sodas, fast-food ou pâtisseries ?", opts: ["Rarement ou jamais", "1 fois par semaine", "Plusieurs fois par semaine", "Tous les jours"] },
    { id: "tabac_45", theme: "Activité physique & alimentation", q: "Fumez-vous ou utilisez-vous une cigarette électronique ?", opts: ["Non", "J'ai arrêté", "Oui, cigarette électronique", "Oui, je fume"] },
  ],
  "60-65": [
    { id: "grippe", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre la grippe cette saison ?", opts: ["Oui", "Pas encore cette saison", "Non, jamais", "Je ne sais pas"] },
    { id: "covid", theme: "Vaccination", q: "Avez-vous fait votre rappel contre la Covid-19 ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "zona", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le zona (maladie qui provoque de vives douleurs) ?", opts: ["Oui, les 2 injections", "Oui, seulement la 1ère injection", "Non", "Je ne sais pas"] },
    { id: "pneumo", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre les pneumonies bactériennes (pneumocoque) ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "dtp_60", theme: "Vaccination", q: "Avez-vous fait un rappel de vaccin contre le tétanos ces 10 dernières années ?", opts: ["Oui", "Non ou je ne sais pas"] },
    { id: "colorectal_60", theme: "Dépistages & médicaments", q: "Avez-vous déjà fait le test de dépistage du cancer du côlon ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Je ne sais pas"] },
    { id: "mammo_60", theme: "Dépistages & médicaments", q: "Avez-vous fait une mammographie (radiographie du sein) ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Non concerné(e)"], sexeOnly: "Une femme" },
    { id: "medicaments_60", theme: "Dépistages & médicaments", q: "Combien de médicaments prenez-vous chaque jour ?", opts: ["Aucun ou 1 à 2", "3 à 4 médicaments", "5 à 6 médicaments", "7 ou plus"] },
    { id: "effets", theme: "Dépistages & médicaments", q: "Ressentez-vous des effets gênants liés à vos médicaments ?", opts: ["Non", "Parfois, mais gérable", "Oui, assez souvent", "Oui, et cela me préoccupe"] },
    { id: "chutes_60", theme: "Dépistages & médicaments", q: "Avez-vous chuté au cours des 12 derniers mois ?", opts: ["Non", "1 fois, sans me blesser", "1 fois, avec une blessure", "Plusieurs fois"] },
  ],
  "70-75": [
    { id: "grippe_70", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre la grippe cette saison ?", opts: ["Oui", "Pas encore cette saison", "Non, jamais", "Je ne sais pas"] },
    { id: "covid_70", theme: "Vaccination", q: "Avez-vous fait votre rappel contre la Covid-19 ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "zona_70", theme: "Vaccination", q: "Avez-vous été vacciné(e) contre le zona (maladie qui provoque de vives douleurs) ?", opts: ["Oui, les 2 injections", "Oui, seulement la 1ère injection", "Non", "Je ne sais pas"] },
    { id: "pneumo_70", theme: "Vaccination", q: "Avez-vous reçu le vaccin contre les pneumonies bactériennes (pneumocoque) ?", opts: ["Oui", "Non", "Je ne sais pas"] },
    { id: "dtp_70", theme: "Vaccination", q: "Avez-vous fait un rappel de vaccin contre le tétanos ces 10 dernières années ?", opts: ["Oui", "Non ou je ne sais pas"] },
    { id: "medicaments_70", theme: "Médicaments & autonomie", q: "Combien de médicaments prenez-vous chaque jour ?", opts: ["1 à 4 médicaments", "5 à 6 médicaments", "7 à 9 médicaments", "10 ou plus"] },
    { id: "observance", theme: "Médicaments & autonomie", q: "Vous arrive-t-il d'oublier de prendre vos médicaments ?", opts: ["Jamais", "Rarement (1 fois/mois environ)", "Parfois (1 fois/semaine)", "Souvent"] },
    { id: "colorectal_70", theme: "Médicaments & autonomie", q: "Avez-vous déjà fait le test de dépistage du cancer du côlon ?", opts: ["Oui, il y a moins de 2 ans", "Oui, il y a longtemps", "Non, jamais", "Je ne sais pas"] },
    { id: "chutes_70", theme: "Médicaments & autonomie", q: "Avez-vous chuté au cours des 6 derniers mois ?", opts: ["Non", "1 fois, sans me blesser", "1 fois, avec une blessure", "Plusieurs fois"] },
    { id: "autonomie", theme: "Médicaments & autonomie", q: "Avez-vous des difficultés pour certains gestes du quotidien (toilette, habillage, repas) ?", opts: ["Non, aucune difficulté", "Pour quelques gestes", "Pour plusieurs gestes", "J'ai besoin d'aide régulièrement"] },
  ],
};

function getQuestionsForSexe(age, sexe) {
  return QUESTIONS[age].filter(q => !q.sexeOnly || q.sexeOnly === sexe);
}

// ═══════════════════════════════════════════════════════════
// CONSEILS PATIENT (identiques V5 — déjà enrichis)
// ═══════════════════════════════════════════════════════════
function getPatientAdvice(age, a, sexe, prenom) {
  const tips = [];
  if (age === "18-25") {
    if (a.tabac === "Oui, je fume" || a.tabac === "Oui, cigarette électronique") tips.push({ icon: "🚭", title: "Tabac", text: `Arrêter le tabac à votre âge, ${prenom}, est l'une des meilleures décisions santé que vous puissiez prendre. Les bénéfices sont rapides : meilleure haleine en 48h, meilleur souffle en 3 jours, peau qui se régénère en quelques semaines. Votre pharmacien peut vous proposer des patchs, gommes ou comprimés adaptés. La méthode la plus efficace combine substituts + accompagnement. Tabac Info Service : 3989.` });
    if (a.alcool === "Plus de 2 verres par jour" || a.alcool === "Plus de 10 verres par semaine" || a.binge === "Souvent" || a.binge === "Parfois") tips.push({ icon: "💧", title: "Alcool", text: `Les repères officiels : maximum 10 verres par semaine, pas plus de 2 par jour, avec au minimum 2 jours sans alcool. Au-delà, le risque pour la santé augmente significativement (foie, cœur, cerveau). Si vous voulez réduire, votre pharmacien peut vous orienter et conseiller des compléments soutenant le foie (desmodium, chardon-Marie). Alcool Info Service : 0 980 980 930.` });
    if (a.substances && a.substances !== "Non") tips.push({ icon: "⚠️", title: "Substances", text: `Le cerveau continue à se développer jusqu'à 25 ans. Les substances psychoactives, même occasionnelles, peuvent avoir un impact durable sur la mémoire et la concentration. Un échange confidentiel et sans jugement est toujours possible. Drogues Info Service : 0 800 23 13 13 (gratuit, anonyme, 7j/7).` });
    if (a.jeux === "Oui, souvent" || a.jeux === "De temps en temps") tips.push({ icon: "🎲", title: "Jeux et paris", text: `Les jeux d'argent peuvent créer une dépendance progressive. Les signaux à surveiller : difficulté à arrêter, mensonges sur les sommes jouées, jouer pour récupérer ses pertes. Joueurs Info Service : 09 74 75 13 13 (gratuit, anonyme).` });
    if (a.vaccins_base === "Non" || a.vaccins_base === "Je ne sais pas") tips.push({ icon: "💉", title: "Vaccins", text: `À votre âge, plusieurs rappels sont recommandés : DTP tous les 20 ans, méningocoque selon votre profil. Votre pharmacien peut consulter votre carnet de santé et réaliser directement les rappels nécessaires en officine, sans ordonnance.` });
    if (a.hpv === "Non" || a.hpv === "Je ne sais pas") tips.push({ icon: "🛡️", title: "Vaccin HPV", text: `Le vaccin HPV protège contre des cancers graves (col de l'utérus, gorge, anus). Recommandé jusqu'à 19 ans, avec un rattrapage possible jusqu'à 26 ans. Il fait partie des vaccins les plus efficaces qui existent (>90% de protection).` });
    if (a.ist === "Non" || a.ist === "Oui, il y a longtemps") tips.push({ icon: "🔬", title: "Dépistage MST", text: `Un dépistage régulier (1 fois par an si vie sexuelle active, ou à chaque nouveau partenaire) est important. Le VIH, la chlamydia ou la gonorrhée peuvent être asymptomatiques pendant des mois. Gratuit et anonyme dans les CeGIDD.` });
    if (a.contraception === "Non" || a.contraception === "Je souhaite en parler") tips.push({ icon: "💊", title: "Contraception", text: `Il existe de nombreux moyens adaptés à chaque situation : pilule, stérilet, implant, anneau, patch, préservatif... Votre pharmacien peut vous informer et vous orienter vers la solution la mieux adaptée à votre profil.` });
    if (a.mental === "Assez souvent" || a.mental === "Presque tous les jours") tips.push({ icon: "🌿", title: "Bien-être mental", text: `Une anxiété qui dure mérite attention. Solutions naturelles : magnésium bisglycinate (300 mg/j), plantes adaptogènes (rhodiola, ashwagandha), respiration abdominale 5 min/j. Si les symptômes persistent, parlez-en à un professionnel. Numéro national : 3114 (gratuit, 24h/24).` });
  }
  if (age === "45-50") {
    if (a.vaccins === "Non" || a.vaccins === "Je ne sais pas") tips.push({ icon: "💉", title: "Vaccins", text: `Le rappel tétanos-diphtérie est recommandé tous les 20 ans. Si vous avez du diabète, du surpoids ou une pathologie respiratoire, le vaccin contre la grippe est aussi conseillé. Votre pharmacien peut les administrer directement, sans ordonnance.` });
    if (a.colorectal === "Non, jamais" || a.colorectal === "Oui, il y a longtemps" || a.colorectal === "Je ne sais pas") tips.push({ icon: "🎯", title: "Dépistage cancer du côlon", text: `Test simple à la maison en 5 minutes, recommandé tous les 2 ans entre 50 et 74 ans. Détecte 8 cancers du côlon sur 10 à un stade où la guérison est possible. Kit gratuit à la pharmacie, sans ordonnance.` });
    if ((a.sein === "Non, jamais" || a.sein === "Oui, il y a longtemps") && sexe === "Une femme") tips.push({ icon: "🎀", title: "Mammographie", text: `Recommandée tous les 2 ans pour les femmes à partir de 50 ans. Permet de détecter les cancers du sein à un stade très précoce. Si vous n'avez pas reçu de convocation, contactez votre Caisse d'Assurance Maladie.` });
    if ((a.col === "Non, jamais" || a.col === "Oui, il y a plus de 5 ans") && sexe === "Une femme") tips.push({ icon: "🔬", title: "Frottis cervical", text: `Recommandé tous les 5 ans entre 25 et 65 ans pour prévenir le cancer du col de l'utérus. À réaliser chez votre médecin, gynécologue ou sage-femme.` });
    if (a.prise_sang === "Plus d'un an" || a.prise_sang === "Je ne sais pas") tips.push({ icon: "🩸", title: "Bilan sanguin", text: `Un bilan annuel est recommandé à votre âge pour détecter tôt diabète, hypercholestérolémie ou problème thyroïdien — qui peuvent évoluer silencieusement pendant des années. Parlez-en à votre médecin traitant.` });
    if (a.activite === "Jamais" || a.activite === "1 à 2 fois") tips.push({ icon: "🏃", title: "Activité physique", text: `L'OMS recommande 150 min/semaine d'activité modérée. La marche rapide compte ! Ajoutez 2 séances de renforcement musculaire/semaine pour préserver muscles et os qui se fragilisent à votre âge.` });
    if (a.sedentarite === "4 à 7 heures" || a.sedentarite === "Plus de 7 heures") tips.push({ icon: "🪑", title: "Sédentarité", text: `Rester assis longtemps augmente le risque cardiovasculaire indépendamment de l'activité physique. Levez-vous 2-3 minutes toutes les 30 minutes — petite marche, étirements, ou simplement debout au téléphone.` });
    if (a.fruits === "Rarement ou jamais" || a.fruits === "Oui, 1 à 2 portions") tips.push({ icon: "🥗", title: "Alimentation", text: `5 fruits et légumes par jour reste la référence. Privilégiez légumes verts (épinards, brocolis) riches en folates, et fruits rouges très antioxydants. Le régime méditerranéen réduit significativement le risque cardiovasculaire.` });
    if (a.gras_sucre === "Plusieurs fois par semaine" || a.gras_sucre === "Tous les jours") tips.push({ icon: "🍔", title: "Aliments ultra-transformés", text: `Les aliments ultra-transformés (charcuterie, sodas, fast-food) augmentent le risque cardiovasculaire et de diabète. Pas besoin de tout supprimer — augmentez le fait-maison avec des produits frais, un repas à la fois.` });
    if (a.tabac_45 === "Oui, je fume" || a.tabac_45 === "Oui, cigarette électronique") tips.push({ icon: "🚭", title: "Tabac", text: `À 45 ans, le risque cardiovasculaire lié au tabac est élevé — mais bonne nouvelle : il se divise par deux en moins d'un an après l'arrêt. Substituts en combinaison (patch + gommes) = méthode la plus efficace. Tabac Info Service : 3989.` });
  }
  if (age === "60-65") {
    if (a.grippe !== "Oui") tips.push({ icon: "💉", title: "Grippe — Vaccin recommandé", text: `Après 60 ans, la grippe peut entraîner des complications graves. Ce vaccin, à renouveler chaque automne, réduit de 40 à 70% le risque d'hospitalisation. Gratuit et administrable directement en pharmacie.` });
    if (a.covid !== "Oui") tips.push({ icon: "🛡️", title: "Covid-19 — Rappel", text: `Un rappel régulier reste recommandé après 60 ans. Peut être fait en même temps que la grippe, lors d'un seul passage en pharmacie.` });
    if (a.zona !== "Oui, les 2 injections") tips.push({ icon: "🔥", title: "Zona", text: a.zona === "Oui, seulement la 1ère injection" ? `Vous avez fait la 1ère injection. La 2ème dose est indispensable (à faire dans les 2 à 6 mois) pour atteindre la protection optimale (>90%).` : `Le zona touche 1 personne sur 3 après 60 ans. Maladie très douloureuse pouvant laisser des séquelles. Le vaccin Shingrix (2 injections espacées de 2 à 6 mois) offre une protection >90%.` });
    if (a.pneumo !== "Oui") tips.push({ icon: "🫁", title: "Pneumonies bactériennes", text: `Le vaccin Prevenar 20® protège contre 20 souches de pneumocoques — 2ème cause d'hospitalisation hivernale après 60 ans. Une seule injection à vie. Coadministrable avec la grippe.` });
    if (a.dtp_60 === "Non ou je ne sais pas") tips.push({ icon: "📋", title: "Rappel tétanos", text: `Après 65 ans, rappel DTP recommandé tous les 10 ans. Le tétanos reste grave et touche principalement les seniors non à jour. Votre pharmacien peut faire le rappel.` });
    if (a.colorectal_60 === "Non, jamais" || a.colorectal_60 === "Oui, il y a longtemps" || a.colorectal_60 === "Je ne sais pas") tips.push({ icon: "🎯", title: "Dépistage cancer du côlon", text: `Test à la maison (5 min), recommandé tous les 2 ans entre 50 et 74 ans. Détecte 8 cancers sur 10 à un stade où la guérison est possible dans plus de 90% des cas. Kit gratuit en pharmacie.` });
    if ((a.mammo_60 === "Non, jamais" || a.mammo_60 === "Oui, il y a longtemps") && sexe === "Une femme") tips.push({ icon: "🎀", title: "Mammographie", text: `Recommandée tous les 2 ans jusqu'à 74 ans. Reste l'examen le plus efficace pour détecter précocement un cancer du sein.` });
    if (a.medicaments_60 === "5 à 6 médicaments" || a.medicaments_60 === "7 ou plus") tips.push({ icon: "💊", title: "Suivi de vos médicaments", text: `Avec ${a.medicaments_60.toLowerCase()}, certains peuvent interagir ou devenir moins adaptés avec l'âge. Un point approfondi avec votre pharmacien (gratuit, en espace confidentiel) peut identifier des ajustements possibles.` });
    if (a.effets === "Oui, assez souvent" || a.effets === "Oui, et cela me préoccupe") tips.push({ icon: "⚠️", title: "Effets gênants", text: `Les effets gênants méritent attention — ce n'est pas "normal" de devoir s'y résigner. Souvent, des médicaments peuvent être remplacés ou leurs doses ajustées pour améliorer votre confort.` });
    if (a.chutes_60 && a.chutes_60 !== "Non") tips.push({ icon: "🦴", title: "Prévention des chutes", text: `Une chute mérite attention. Vitamine D (800-1000 UI/j — manque très fréquent), vue à vérifier, chaussures fermées antidérapantes, sécuriser le domicile. Un kinésithérapeute peut proposer un programme d'équilibre.` });
  }
  if (age === "70-75") {
    if (a.grippe_70 !== "Oui") tips.push({ icon: "💉", title: "Grippe — Priorité absolue", text: `Après 70 ans, la grippe peut être très grave. Ce vaccin annuel réduit de 40 à 70% le risque d'hospitalisation. Gratuit, sans ordonnance, directement en pharmacie. C'est probablement le geste de prévention le plus important à votre âge.` });
    if (a.covid_70 !== "Oui") tips.push({ icon: "🛡️", title: "Covid-19 — Rappel", text: `Un rappel régulier est fortement recommandé après 70 ans pour prévenir les formes graves. Peut être fait avec la grippe lors du même passage.` });
    if (a.zona_70 !== "Oui, les 2 injections") tips.push({ icon: "🔥", title: "Zona", text: a.zona_70 === "Oui, seulement la 1ère injection" ? `Vous avez fait la 1ère injection. La 2ème (à faire dans les 2 à 6 mois) est indispensable pour vous protéger pleinement.` : `Le zona est particulièrement douloureux après 70 ans et peut laisser des séquelles nerveuses durables. Le vaccin Shingrix (2 injections) protège efficacement à plus de 90%.` });
    if (a.pneumo_70 !== "Oui") tips.push({ icon: "🫁", title: "Pneumonies bactériennes", text: `Le vaccin Prevenar 20® protège contre des pneumonies graves, particulièrement dangereuses après 70 ans. Une seule injection à vie.` });
    if (a.dtp_70 === "Non ou je ne sais pas") tips.push({ icon: "📋", title: "Rappel tétanos", text: `Rappel tous les 10 ans recommandé. Le tétanos reste dangereux, surtout après une blessure mineure (jardinage). Administrable en pharmacie.` });
    if (a.medicaments_70 === "5 à 6 médicaments" || a.medicaments_70 === "7 à 9 médicaments" || a.medicaments_70 === "10 ou plus") tips.push({ icon: "💊", title: "Suivi de vos médicaments", text: `Avec ${a.medicaments_70.toLowerCase()}, une révision complète avec votre pharmacien (gratuit, 30-45 min en espace confidentiel) peut vraiment améliorer votre quotidien. Certains médicaments deviennent moins adaptés après 70 ans.` });
    if (a.observance === "Parfois (1 fois/semaine)" || a.observance === "Souvent") tips.push({ icon: "📅", title: "Oublis", text: `Un semainier (pilulier hebdomadaire) change vraiment les choses. Votre pharmacien peut vous en proposer un, voire le préparer pour vous chaque semaine.` });
    if (a.colorectal_70 === "Non, jamais" || a.colorectal_70 === "Oui, il y a longtemps" || a.colorectal_70 === "Je ne sais pas") tips.push({ icon: "🎯", title: "Dépistage cancer du côlon", text: `Recommandé jusqu'à 74 ans. Test à la maison, kit gratuit en pharmacie. Détecte les cancers très tôt, à un stade où ils se soignent dans plus de 90% des cas.` });
    if (a.chutes_70 && a.chutes_70 !== "Non") tips.push({ icon: "🦴", title: "Prévention des chutes", text: `Après une chute, consultez votre médecin. Vitamine D systématique (1000 UI/j), vérification de la vue, sécurisation du domicile. Un kinésithérapeute peut proposer un programme d'équilibre adapté.` });
    if (a.autonomie && a.autonomie !== "Non, aucune difficulté") tips.push({ icon: "🏠", title: "Maintien à domicile", text: `Des aides existent : APA (financement aide à domicile), portage de repas, livraison médicaments, téléassistance. Votre pharmacien peut vous orienter. Important d'anticiper plutôt que d'attendre.` });
  }
  if (tips.length === 0) tips.push({ icon: "✨", title: "Bilan encourageant", text: `Vos réponses sont globalement rassurantes, ${prenom}. Continuez à prendre soin de vous et n'hésitez pas à solliciter votre équipe de pharmacie pour tout conseil de prévention.` });
  return tips;
}

// ═══════════════════════════════════════════════════════════
// RECOMMANDATIONS PHARMACIEN (identiques V5)
// ═══════════════════════════════════════════════════════════
function getPharmacistReco(age, a, sexe) {
  const items = [];
  if (age === "18-25") {
    if (a.tabac === "Oui, je fume") items.push({ theme: "Conduites addictives", priority: true, label: "Sevrage tabagique", detail: "Patient fumeur actif. Évaluation Fagerström. Substituts nicotiniques en combinaison (patch 21mg/24h + gommes 2mg). Prescription possible par pharmacien. Suivi à 1 mois." });
    if (a.alcool === "Plus de 2 verres par jour" || a.alcool === "Plus de 10 verres par semaine" || a.binge === "Souvent" || a.binge === "Parfois") items.push({ theme: "Conduites addictives", priority: true, label: "Consommation d'alcool à risque", detail: "Dépassement repères OMS. Entretien motivationnel bref. Objectifs progressifs (2 jours sans alcool/sem). Orienter CSAPA si dépendance suspectée." });
    if (a.substances && a.substances !== "Non") items.push({ theme: "Conduites addictives", priority: true, label: "Consommation de substances", detail: `${a.substances}. Entretien confidentiel. Évaluer fréquence, contexte, polyconsommation. Orientation CSAPA ou Consultation Jeunes Consommateurs si usage régulier.` });
    if (a.jeux === "Oui, souvent") items.push({ theme: "Conduites addictives", priority: false, label: "Pratique de jeux fréquente", detail: "Évaluer caractère pathologique. Orientation Joueurs Info Service : 09 74 75 13 13." });
    if (a.vaccins_base === "Non" || a.vaccins_base === "Je ne sais pas") items.push({ theme: "Vaccination & santé sexuelle", priority: true, label: "Statut DTP à vérifier", detail: "Demander carnet vaccinal. Si rappel >20 ans : administration officine sans ordonnance (Repevax®, Boostrixtetra®). Vérifier méningocoque ACWY." });
    if (a.hpv === "Non" || a.hpv === "Je ne sais pas") items.push({ theme: "Vaccination & santé sexuelle", priority: true, label: "Vaccin HPV à proposer", detail: "Rattrapage jusqu'à 26 ans. Schéma 3 doses (M0, M2, M6) Gardasil 9®. Remboursé. Administration officine sur prescription pharmacien." });
    if (a.ist === "Non") items.push({ theme: "Vaccination & santé sexuelle", priority: false, label: "Dépistage MST à orienter", detail: "Pas de dépistage récent. Orienter CeGIDD ou TROD HIV/VHC en officine. Bilan : VIH, VHB, VHC, syphilis, chlamydia, gonocoque." });
    if (a.contraception === "Non" && sexe === "Une femme") items.push({ theme: "Vaccination & santé sexuelle", priority: false, label: "Absence de contraception", detail: "Contraception d'urgence disponible sans ordonnance. Orienter consultation gynécologique pour solution adaptée long terme." });
    if (a.mental === "Assez souvent" || a.mental === "Presque tous les jours") items.push({ theme: "Vaccination & santé sexuelle", priority: true, label: "Détresse psychologique", detail: "Symptômes anxieux/dépressifs fréquents. Orienter médecin traitant rapidement. Magnésium bisglycinate 300mg/j à court terme. Si idées noires : 3114 immédiatement." });
  }
  if (age === "45-50") {
    if (a.vaccins === "Non" || a.vaccins === "Je ne sais pas") items.push({ theme: "Vaccination & dépistages", priority: true, label: "Rappel DTP à vérifier", detail: "Vérifier carnet. Si >20 ans : Repevax® ou Boostrixtetra® en officine. Évaluer indication grippe selon comorbidités." });
    if (a.colorectal === "Non, jamais" || a.colorectal === "Oui, il y a longtemps" || a.colorectal === "Je ne sais pas") items.push({ theme: "Vaccination & dépistages", priority: true, label: "Kit dépistage colorectal — À remettre", detail: "Patient éligible (50-74 ans). Kit immunologique au comptoir avec explications. Sans ordonnance." });
    if ((a.sein === "Non, jamais" || a.sein === "Oui, il y a longtemps") && sexe === "Une femme") items.push({ theme: "Vaccination & dépistages", priority: true, label: "Mammographie — À orienter", detail: "Dépistage organisé non réalisé. Orienter CPAM (convocation) ou médecin traitant. Pris en charge à 100%." });
    if ((a.col === "Non, jamais" || a.col === "Oui, il y a plus de 5 ans") && sexe === "Une femme") items.push({ theme: "Vaccination & dépistages", priority: false, label: "Frottis cervical — À orienter", detail: "Dépistage en retard. Orienter médecin/gynécologue/sage-femme. Tous les 5 ans entre 25 et 65 ans." });
    if (a.prise_sang === "Plus d'un an" || a.prise_sang === "Je ne sais pas") items.push({ theme: "Vaccination & dépistages", priority: false, label: "Bilan sanguin annuel", detail: "Pas de bilan récent. Orienter médecin traitant : NFS, glycémie à jeun, bilan lipidique, TSH, créatinine." });
    if (a.activite === "Jamais" || a.activite === "1 à 2 fois") items.push({ theme: "Activité physique & alimentation", priority: false, label: "Activité physique insuffisante", detail: "OMS : 150 min/semaine modérée + 2 séances renforcement. Conseils hygiéno-diététiques à renforcer." });
    if (a.sedentarite === "4 à 7 heures" || a.sedentarite === "Plus de 7 heures") items.push({ theme: "Activité physique & alimentation", priority: false, label: "Sédentarité importante", detail: "Risque cardiovasculaire indépendant de l'AP. Conseiller pauses actives toutes les 30 min." });
    if (a.fruits === "Rarement ou jamais" || a.fruits === "Oui, 1 à 2 portions") items.push({ theme: "Activité physique & alimentation", priority: false, label: "Apports F&L insuffisants", detail: "PNNS 5/jour. Évoquer alimentation méditerranéenne. Multivitamines possibles à court terme." });
    if (a.tabac_45 === "Oui, je fume") items.push({ theme: "Activité physique & alimentation", priority: true, label: "Sevrage tabagique", detail: "Risque cardiovasculaire majeur à 45 ans. Substituts en combinaison (patch + formes orales). Prescription pharmacien possible. Suivi mensuel." });
  }
  if (age === "60-65") {
    if (a.grippe !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Vaccination grippe — À réaliser", detail: "Patient 60+ non vacciné. Administration officine sans ordonnance (Influvac Tetra®, Vaxigrip Tetra®, Efluelda® si 65+). Remboursée 100%." });
    if (a.covid !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Rappel Covid-19 — À réaliser", detail: "Rappel non effectué. Officine. Coadministration grippe possible (sites différents). Comirnaty® ou Spikevax®." });
    if (a.zona !== "Oui, les 2 injections") items.push({ theme: "Vaccination", priority: true, label: a.zona === "Oui, seulement la 1ère injection" ? "Zona Shingrix® — 2ème dose" : "Zona Shingrix® — Schéma à initier", detail: a.zona === "Oui, seulement la 1ère injection" ? "1ère dose effectuée. 2ème dose à 2-6 mois. Schéma incomplet = protection insuffisante." : "Schéma 2 doses (J0 et M2-6). Protection >90%. Remboursé pour 65+." });
    if (a.pneumo !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Pneumocoque Prevenar 20®", detail: "Non vacciné. 1 injection à vie après 65 ans. Coadministrable grippe. Remboursé sur prescription." });
    if (a.dtp_60 === "Non ou je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Rappel DTP", detail: "Tous les 10 ans après 65 ans. Vérifier carnet. Administration officine si nécessaire." });
    if (a.colorectal_60 === "Non, jamais" || a.colorectal_60 === "Oui, il y a longtemps" || a.colorectal_60 === "Je ne sais pas") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Kit dépistage colorectal", detail: "Patient éligible. Remise immédiate au comptoir. Sans ordonnance." });
    if ((a.mammo_60 === "Non, jamais" || a.mammo_60 === "Oui, il y a longtemps") && sexe === "Une femme") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Mammographie — À orienter", detail: "Dépistage en retard. Orienter CPAM ou médecin traitant. Tous les 2 ans jusqu'à 74 ans." });
    if (a.medicaments_60 === "5 à 6 médicaments" || a.medicaments_60 === "7 ou plus") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Polymédication — Bilan partagé", detail: `${a.medicaments_60} déclarés. Patient éligible BPM (65+, 5+ médicaments chroniques). Analyse interactions, vérification médicaments inappropriés (Beers/Laroche), déprescription si pertinente.` });
    if (a.effets === "Oui, assez souvent" || a.effets === "Oui, et cela me préoccupe") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Effets indésirables", detail: "Effets gênants déclarés. Évaluer nature, fréquence, médicament suspect. Pharmacovigilance si nécessaire. Orienter médecin." });
    if (a.chutes_60 && a.chutes_60 !== "Non") items.push({ theme: "Dépistages & médicaments", priority: true, label: "Chute — Évaluation", detail: `${a.chutes_60}. Vérifier traitements à risque (BZD, antihypertenseurs, hypoglycémiants). Doser vit D. Orienter kiné.` });
  }
  if (age === "70-75") {
    if (a.grippe_70 !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Grippe — Prioritaire", detail: "Patient 70+ non vacciné. Vaccin haute dose Efluelda® recommandé. Administration officine sans ordonnance. Remboursée 100%." });
    if (a.covid_70 !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Rappel Covid-19", detail: "Rappel non effectué. Officine. Coadministration grippe possible. Très important après 70 ans." });
    if (a.zona_70 !== "Oui, les 2 injections") items.push({ theme: "Vaccination", priority: true, label: a.zona_70 === "Oui, seulement la 1ère injection" ? "Zona Shingrix® — 2ème dose" : "Zona Shingrix® — À initier", detail: a.zona_70 === "Oui, seulement la 1ère injection" ? "2ème dose à 2-6 mois. Schéma incomplet." : "Schéma 2 doses. Séquelles neurologiques fréquentes sans vaccination après 70 ans. Très fortement recommandé." });
    if (a.pneumo_70 !== "Oui") items.push({ theme: "Vaccination", priority: true, label: "Pneumocoque Prevenar 20®", detail: "Non vacciné. 1 injection à vie. 2ème cause d'hospitalisation hivernale après 70 ans. Coadministrable grippe." });
    if (a.dtp_70 === "Non ou je ne sais pas") items.push({ theme: "Vaccination", priority: false, label: "Rappel DTP", detail: "Tous les 10 ans. Vérifier carnet et administrer si nécessaire." });
    if (a.colorectal_70 === "Non, jamais" || a.colorectal_70 === "Oui, il y a longtemps" || a.colorectal_70 === "Je ne sais pas") items.push({ theme: "Médicaments & autonomie", priority: true, label: "Kit dépistage colorectal", detail: "Recommandé jusqu'à 74 ans. Kit immunologique au comptoir, sans ordonnance." });
    const manyMeds = a.medicaments_70 === "5 à 6 médicaments" || a.medicaments_70 === "7 à 9 médicaments" || a.medicaments_70 === "10 ou plus";
    if (manyMeds) items.push({ theme: "Médicaments & autonomie", priority: true, label: "Polymédication — BPM fortement recommandé", detail: `${a.medicaments_70} déclarés. Vérifier médicaments inappropriés après 70 ans : BZD longue durée, anticholinergiques, AINS au long cours. Évaluer cascade médicamenteuse. Déprescription à envisager.` });
    if (a.observance === "Parfois (1 fois/semaine)" || a.observance === "Souvent") items.push({ theme: "Médicaments & autonomie", priority: true, label: "Observance — PDA à proposer", detail: "Oublis fréquents impactant efficacité thérapeutique. Service Préparation des Doses à Administrer à proposer." });
    if (a.chutes_70 && a.chutes_70 !== "Non") items.push({ theme: "Médicaments & autonomie", priority: true, label: "Chute — Évaluation prioritaire", detail: `${a.chutes_70}. Vérifier traitements à risque (BZD, antihypertenseurs, hypoglycémiants, anticholinergiques). Vit D 1000 UI/j systématique. Orienter kiné (équilibre).` });
    if (a.autonomie && a.autonomie !== "Non, aucune difficulté") items.push({ theme: "Médicaments & autonomie", priority: false, label: "Perte d'autonomie", detail: `${a.autonomie}. Informer APA, aide à domicile, livraison médicaments, portage repas. Orienter CCAS local.` });
  }
  return items;
}

// ═══════════════════════════════════════════════════════════
// PDF — 2 pages
// ═══════════════════════════════════════════════════════════
function generatePDFContent(data) {
  const { prenom, nom, dateNaissance, sexe, ageGroup, answers, refNumber, dateStr, timeStr, themes, recos, priorityRecos } = data;
  const synthese = (() => {
    const parTheme = {};
    recos.forEach(r => { parTheme[r.theme] = (parTheme[r.theme] || 0) + 1; });
    const parts = Object.entries(parTheme).map(([t, n]) => `${n} action${n > 1 ? "s" : ""} en ${t.toLowerCase()}`);
    return parts.length === 0 ? "Aucune action particulière identifiée." : `Patient présentant ${parts.join(", ")}.`;
  })();

  return `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Bilan Prévention - ${refNumber}</title>
<style>
@page { size: A4; margin: 16mm; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif; }
body { color: #1E1E1E; font-size: 10pt; line-height: 1.5; }
.page { min-height: calc(297mm - 32mm); display: flex; flex-direction: column; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.hdr { border-bottom: 2px solid #1A3A52; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; }
.hdr-left h1 { font-size: 17pt; color: #1A3A52; font-family: 'Georgia', serif; margin-bottom: 2px; font-weight: 700; }
.hdr-left .sub { font-size: 9pt; color: #6B7A8D; }
.hdr-pharma { font-size: 9pt; color: #1A3A52; font-weight: bold; margin-top: 4px; }
.hdr-pharma small { font-weight: normal; color: #6B7A8D; }
.hdr-right { font-size: 9pt; color: #1A3A52; text-align: right; line-height: 1.6; }
.hdr-right .ref { font-weight: bold; }
.section { margin-bottom: 12px; }
.section-title { font-size: 9pt; font-weight: bold; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.2px; padding-bottom: 3px; border-bottom: 1px solid #E4E0D8; margin-bottom: 7px; }
.identity { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; padding: 10px 12px; background: #F8F7F3; border-radius: 4px; }
.field { display: flex; gap: 8px; align-items: baseline; font-size: 10pt; }
.field-label { font-size: 8.5pt; color: #6B7A8D; text-transform: uppercase; letter-spacing: 0.5px; min-width: 90px; }
.field-value { font-weight: bold; color: #1A3A52; }
.field-empty { border-bottom: 1px dotted #6B7A8D; flex: 1; min-height: 14px; padding-left: 4px; }
.themes { padding: 8px 12px; background: #EAF2EC; border-left: 3px solid #5A8A6A; border-radius: 4px; }
.theme-line { font-size: 10pt; color: #1A3A52; margin: 2px 0; }
.synthese { padding: 10px 12px; background: #FDF4E3; border-left: 3px solid #C8922A; border-radius: 4px; font-size: 10pt; color: #1A3A52; font-style: italic; }
.spacer { flex: 1; }
.signature { margin-top: 14px; padding-top: 10px; border-top: 1px solid #E4E0D8; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.sig-box { border: 1px solid #E4E0D8; padding: 10px; border-radius: 4px; min-height: 70px; }
.sig-title { font-size: 8.5pt; color: #6B7A8D; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
.signed { font-size: 9pt; color: #5A8A6A; font-weight: bold; }
.signed-info { font-size: 9pt; color: #6B7A8D; margin-top: 3px; line-height: 1.4; }
.lieu-date { font-size: 9pt; color: #1A3A52; text-align: right; margin-bottom: 6px; }
.legal { margin-top: 10px; padding: 6px 10px; background: #F8F7F3; border-radius: 4px; font-size: 8pt; color: #6B7A8D; text-align: center; line-height: 1.5; }
.footer { margin-top: 8px; font-size: 7.5pt; color: #6B7A8D; text-align: center; padding-top: 6px; border-top: 1px solid #E4E0D8; }
.reco { padding: 8px 10px; border: 1px solid #E4E0D8; margin-bottom: 5px; border-radius: 4px; page-break-inside: avoid; }
.reco-priority { font-size: 7.5pt; font-weight: bold; padding: 1px 5px; border-radius: 3px; display: inline-block; margin-right: 6px; }
.priority-high { background: #EAF2EC; color: #5A8A6A; }
.priority-low { background: #FDF4E3; color: #C8922A; }
.reco-theme { font-size: 7.5pt; color: #6B7A8D; }
.reco-label { font-weight: bold; color: #1A3A52; margin-top: 3px; font-size: 9.5pt; }
.reco-detail { font-size: 8.5pt; color: #6B7A8D; margin-top: 2px; line-height: 1.45; }
.ppp { padding: 9px 11px; background: #FAFAF7; border: 1px solid #E4E0D8; border-radius: 4px; page-break-inside: avoid; font-size: 9pt; }
.ppp-line { margin: 3px 0; }
.ppp-label { font-size: 8pt; color: #6B7A8D; text-transform: uppercase; font-weight: 600; }
.qa { display: flex; padding: 4px 0; border-bottom: 1px solid #F0EDE5; font-size: 8.5pt; }
.qa-q { flex: 1; color: #6B7A8D; padding-right: 10px; }
.qa-a { font-weight: bold; color: #1A3A52; max-width: 38%; text-align: right; }
.page-num { position: relative; margin-top: 10px; font-size: 8pt; color: #6B7A8D; text-align: right; }
@media print { body { padding: 0; } }
</style></head>
<body>

<!-- ═══════════ PAGE 1 — IDENTITÉ + THÈMES + SIGNATURE ═══════════ -->
<div class="page">
  <div class="hdr">
    <div class="hdr-left">
      <h1>Bilan de Prévention</h1>
      <div class="sub">Tranche d'âge : ${ageGroup} ans</div>
      <div class="hdr-pharma">${PHARMACY.name}<br><small>${PHARMACY.address} · Tel : ${PHARMACY.phone}</small></div>
    </div>
    <div class="hdr-right">
      <div class="ref">N° ${refNumber}</div>
      <div>Date du bilan</div>
      <div>${dateStr}</div>
      <div>${timeStr}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Identité du patient</div>
    <div class="identity">
      <div class="field"><span class="field-label">Nom</span><span class="field-value">${nom.toUpperCase()}</span></div>
      <div class="field"><span class="field-label">Prénom</span><span class="field-value">${prenom}</span></div>
      <div class="field"><span class="field-label">Né(e) le</span><span class="field-value">${dateNaissance}</span></div>
      <div class="field"><span class="field-label">Sexe</span><span class="field-value">${sexe}</span></div>
      <div class="field" style="grid-column: span 2;">
        <span class="field-label">N° Sécu</span><span class="field-empty"></span>
      </div>
      <div class="field" style="grid-column: span 2;">
        <span class="field-label">Médecin traitant</span><span class="field-empty"></span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Thèmes abordés (Bilan ${ageGroup} ans)</div>
    <div class="themes">
      ${themes.map((t, i) => `<div class="theme-line">✓ Thème ${i + 1} : ${t}</div>`).join("")}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Synthèse</div>
    <div class="synthese">${synthese}</div>
  </div>

  <div class="spacer"></div>

  <div class="lieu-date">Fait à ${PHARMACY.city}, le ${dateStr}</div>

  <div class="signature">
    <div class="sig-box">
      <div class="sig-title">Consentement patient</div>
      <div class="signed">✓ Confirmé électroniquement</div>
      <div class="signed-info">${prenom} ${nom.toUpperCase()}<br>${dateStr} à ${timeStr}</div>
    </div>
    <div class="sig-box">
      <div class="sig-title">Cachet de la pharmacie</div>
    </div>
  </div>

  <div class="legal">
    Document conforme au dispositif « Mon Bilan Prévention » — Arrêté du 28 mai 2024.<br>
    Bilan réalisé en officine · À archiver dans le dossier patient.
  </div>

  <div class="footer">
    ${PHARMACY.name} · Référence ${refNumber} · Page 1/2
  </div>
</div>

<!-- ═══════════ PAGE 2 — RECOMMANDATIONS + PPP + RÉPONSES ═══════════ -->
<div class="page">
  <div class="hdr">
    <div class="hdr-left">
      <h1>Recommandations cliniques</h1>
      <div class="sub">${prenom} ${nom.toUpperCase()} · ${dateNaissance}</div>
    </div>
    <div class="hdr-right">
      <div class="ref">N° ${refNumber}</div>
      <div>${dateStr}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Actions recommandées au patient</div>
    ${recos.length === 0 ? `<div style="font-size: 9pt; color: #6B7A8D; padding: 8px;">Aucune recommandation particulière identifiée.</div>` : recos.map(r => `
      <div class="reco">
        <span class="reco-priority ${r.priority ? "priority-high" : "priority-low"}">${r.priority ? "PRIORITAIRE" : "À PROPOSER"}</span>
        <span class="reco-theme">${r.theme}</span>
        <div class="reco-label">${r.label}</div>
        <div class="reco-detail">${r.detail}</div>
      </div>
    `).join("")}
  </div>

  <div class="section">
    <div class="section-title">Plan Personnalisé de Prévention (PPP)</div>
    <div class="ppp">
      <div class="ppp-line"><span class="ppp-label">Thèmes abordés :</span> ${themes.join(", ")}</div>
      <div class="ppp-line" style="margin-top: 5px;">
        <span class="ppp-label">Actions prioritaires identifiées :</span><br>
        ${priorityRecos.length === 0 ? "Aucune action prioritaire identifiée." : priorityRecos.map(r => `• ${r.label}`).join("<br>")}
      </div>
      <div class="ppp-line" style="margin-top: 5px;">
        <span class="ppp-label">Objectifs retenus avec le patient :</span> Basés sur les recommandations ci-dessus, à formaliser au comptoir.
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Réponses du patient</div>
    ${getQuestionsForSexe(ageGroup, sexe).map(q => `
      <div class="qa"><div class="qa-q">${q.q}</div><div class="qa-a">${answers[q.id] || "—"}</div></div>
    `).join("")}
  </div>

  <div class="spacer"></div>

  <div class="legal">
    Document conforme au dispositif « Mon Bilan Prévention » — Arrêté du 28 mai 2024.
  </div>

  <div class="footer">
    ${PHARMACY.name} · Référence ${refNumber} · Page 2/2
  </div>
</div>

</body></html>`;
}

function downloadPDF(data) {
  const html = generatePDFContent(data);
  const w = window.open("", "_blank");
  if (!w) return alert("Veuillez autoriser les pop-ups pour télécharger le document.");
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
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

// ─── SCREENS ──────────────────────────────────────────────
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
        {[["~3 min", "Durée"], ["Gratuit", "Accès"], ["🔒", "Confidentiel"]].map(([v, l], i) => (
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

// ─── ÉTAPE IDENTITÉ (nom + prénom + date naissance sur 1 page) ─
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

function Results({ data }) {
  const { prenom, nom, ageGroup, sexe, dateNaissance, answers, refNumber, dateStr, timeStr } = data;
  const tips = getPatientAdvice(ageGroup, answers, sexe, prenom);
  const recos = getPharmacistReco(ageGroup, answers, sexe);
  const themes = [...new Set(getQuestionsForSexe(ageGroup, sexe).map(q => q.theme))];
  const priorityRecos = recos.filter(r => r.priority);

  const fullData = { ...data, themes, recos, priorityRecos };

  return (
    <div className="fade" style={{ paddingTop: 12 }}>
      <Tag />

      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 60, height: 60, margin: "0 auto 14px", borderRadius: "50%", background: C.sageLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✓</div>
        <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.navy, margin: "0 0 6px", lineHeight: 1.1 }}>Merci, {prenom} !</h1>
        <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Votre bilan a été transmis à votre pharmacie.<br />
          <span style={{ fontSize: 11, color: C.muted }}>Référence : <strong style={{ color: C.navy }}>{refNumber}</strong></span>
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

      <button onClick={() => downloadPDF(fullData)}
        style={{ width: "100%", padding: "14px", background: C.sage, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: F.body, cursor: "pointer", transition: "all 0.2s", marginBottom: 10 }}>
        📄 Télécharger mon compte-rendu (PDF)
      </button>

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
// ROOT
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
    const themes = [...new Set(getQuestionsForSexe(identite.ageGroup, sexe).map(q => q.theme))];
    const priorityRecos = recos.filter(r => r.priority);
    const questionsLib = getQuestionsForSexe(identite.ageGroup, sexe);

    const payload = {
      ...identite, sexe, answers: ans, refNumber, dateStr, timeStr,
      tips, recos, themes, priorityRecos, questionsLib,
    };

    setSubmitData(payload);
    setStep("sending");

    try {
      await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Erreur envoi mail:", e);
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
