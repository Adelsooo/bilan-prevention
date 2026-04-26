import { Resend } from "resend";

export async function POST(request) {
  try {
    const data = await request.json();
    const resend = new Resend(process.env.RESEND_API_KEY);
    const PHARMACY_EMAIL = process.env.PHARMACY_EMAIL || "abelkaious@gmail.com";
    const PHARMACY = {
      name: "Pharmacie de l'Avenue",
      address: "29 avenue du Général Leclerc, 75014 Paris",
      city: "Paris",
      phone: "01 43 21 25 85",
    };

    const {
      prenom, nom, dateNaissance, sexe, ageGroup,
      answers, refNumber, dateStr, timeStr,
      themes, recos, priorityRecos, questionsLib,
    } = data;

    // Synthèse
    const parTheme = {};
    recos.forEach(r => { parTheme[r.theme] = (parTheme[r.theme] || 0) + 1; });
    const partsSynth = Object.entries(parTheme).map(([t, n]) => `${n} action${n > 1 ? "s" : ""} en ${t.toLowerCase()}`);
    const synthese = partsSynth.length === 0 ? "Aucune action particulière identifiée." : `Patient présentant ${partsSynth.join(", ")}.`;

    // ═══════════════════════════════════════════════════════════
    // PDF HTML — 2 pages format A4, prêt à imprimer
    // ═══════════════════════════════════════════════════════════
    const pdfHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Bilan ${refNumber}</title>
<style>
@page { size: A4; margin: 16mm; }
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif; }
body { color: #1E1E1E; font-size: 10pt; line-height: 1.5; }
.page { min-height: calc(297mm - 32mm); display: flex; flex-direction: column; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.hdr { border-bottom: 2px solid #1A3A52; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; }
.hdr h1 { font-size: 17pt; color: #1A3A52; font-family: 'Georgia', serif; margin-bottom: 2px; font-weight: 700; }
.hdr .sub { font-size: 9pt; color: #6B7A8D; }
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
</style></head>
<body>

<div class="page">
  <div class="hdr">
    <div>
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
      <div class="field" style="grid-column: span 2;"><span class="field-label">N° Sécu</span><span class="field-empty"></span></div>
      <div class="field" style="grid-column: span 2;"><span class="field-label">Médecin traitant</span><span class="field-empty"></span></div>
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

  <div class="footer">${PHARMACY.name} · Référence ${refNumber} · Page 1/2</div>
</div>

<div class="page">
  <div class="hdr">
    <div>
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
    ${(questionsLib || []).map(q => `<div class="qa"><div class="qa-q">${q.q}</div><div class="qa-a">${answers[q.id] || "—"}</div></div>`).join("")}
  </div>

  <div class="spacer"></div>

  <div class="legal">Document conforme au dispositif « Mon Bilan Prévention » — Arrêté du 28 mai 2024.</div>
  <div class="footer">${PHARMACY.name} · Référence ${refNumber} · Page 2/2</div>
</div>

</body></html>`;

    // ═══════════════════════════════════════════════════════════
    // Génération du PDF via API gratuite html2pdf
    // ═══════════════════════════════════════════════════════════
    let pdfAttachment = null;
    try {
      const pdfResponse = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("api:" + (process.env.PDFSHIFT_API_KEY || "")).toString("base64"),
        },
        body: JSON.stringify({
          source: pdfHtml,
          format: "A4",
          margin: "0",
          sandbox: !process.env.PDFSHIFT_API_KEY,
        }),
      });

      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer();
        pdfAttachment = {
          filename: `Bilan_${nom}_${prenom}_${refNumber}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        };
      }
    } catch (pdfError) {
      console.error("Erreur génération PDF:", pdfError);
    }

    // ═══════════════════════════════════════════════════════════
    // Mail HTML pour le pharmacien (résumé exploitable)
    // ═══════════════════════════════════════════════════════════
    const mailHtml = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: 'Helvetica', 'Arial', sans-serif; color: #1E1E1E; max-width: 700px; margin: 0 auto; padding: 24px; background: #F8F7F3;">

  <div style="background: #1A3A52; color: white; padding: 16px 20px; border-radius: 10px 10px 0 0;">
    <div style="font-size: 11px; opacity: 0.7; letter-spacing: 1.2px; text-transform: uppercase;">🔔 Nouveau Bilan Reçu</div>
    <div style="font-size: 18px; font-weight: 700; margin-top: 4px; font-family: Georgia, serif;">Bilan Prévention ${ageGroup} ans — ${prenom} ${nom.toUpperCase()}</div>
    <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">Référence : ${refNumber} · ${dateStr} à ${timeStr}</div>
  </div>

  <div style="background: white; padding: 22px 20px; border: 1px solid #E4E0D8; border-top: none;">

    ${pdfAttachment ? `
    <div style="background: #EAF2EC; border-left: 3px solid #5A8A6A; padding: 12px 14px; border-radius: 4px; margin-bottom: 18px;">
      <div style="font-size: 13px; font-weight: 700; color: #1A3A52;">📎 Compte-rendu PDF en pièce jointe</div>
      <div style="font-size: 11px; color: #6B7A8D; margin-top: 3px;">Document officiel 2 pages prêt à archiver et scanner pour la facturation CPAM.</div>
    </div>
    ` : ''}

    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Identité du patient</div>
    <table style="width: 100%; font-size: 13px; margin-bottom: 16px; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #6B7A8D; width: 30%;">Nom</td><td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${nom.toUpperCase()}</td></tr>
      <tr><td style="padding: 4px 0; color: #6B7A8D;">Prénom</td><td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${prenom}</td></tr>
      <tr><td style="padding: 4px 0; color: #6B7A8D;">Né(e) le</td><td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${dateNaissance}</td></tr>
      <tr><td style="padding: 4px 0; color: #6B7A8D;">Sexe</td><td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${sexe}</td></tr>
    </table>

    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Thèmes abordés</div>
    <div style="background: #EAF2EC; border-left: 3px solid #5A8A6A; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px;">
      ${themes.map((t, i) => `<div style="font-size: 13px; color: #1A3A52; margin: 3px 0;">✓ Thème ${i + 1} : <strong>${t}</strong></div>`).join("")}
    </div>

    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Synthèse</div>
    <div style="background: #FDF4E3; border-left: 3px solid #C8922A; padding: 10px 14px; border-radius: 4px; margin-bottom: 18px; font-size: 13px; color: #1A3A52; font-style: italic;">
      ${synthese}
    </div>

    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Actions recommandées</div>
    ${recos.length === 0 ? `<div style="font-size: 13px; color: #6B7A8D; padding: 10px;">Aucune recommandation particulière identifiée.</div>` : recos.map(r => `
      <div style="padding: 11px 13px; border: 1px solid #E4E0D8; margin-bottom: 7px; border-radius: 5px; background: white;">
        <div style="margin-bottom: 4px;">
          <span style="font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 3px; background: ${r.priority ? "#EAF2EC" : "#FDF4E3"}; color: ${r.priority ? "#5A8A6A" : "#C8922A"};">${r.priority ? "PRIORITAIRE" : "À PROPOSER"}</span>
          <span style="font-size: 10px; color: #6B7A8D; margin-left: 6px;">${r.theme}</span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #1A3A52; margin-bottom: 3px;">${r.label}</div>
        <div style="font-size: 12px; color: #6B7A8D; line-height: 1.5;">${r.detail}</div>
      </div>
    `).join("")}

    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #E4E0D8; font-size: 11px; color: #5A8A6A;">
      ✓ Consentement patient confirmé électroniquement — ${prenom} ${nom.toUpperCase()} — ${dateStr} à ${timeStr}
    </div>

    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E4E0D8; font-size: 10px; color: #6B7A8D; text-align: center; line-height: 1.6;">
      Document conforme au dispositif « Mon Bilan Prévention » — Arrêté du 28 mai 2024<br>
      Référence ${refNumber}
    </div>

  </div>

</body></html>`;

    const emailPayload = {
      from: "Bilan Prévention <onboarding@resend.dev>",
      to: PHARMACY_EMAIL,
      subject: `[BILAN PRÉVENTION] ${nom.toUpperCase()} ${prenom} - ${ageGroup} ans - ${dateStr}`,
      html: mailHtml,
    };

    if (pdfAttachment) {
      emailPayload.attachments = [pdfAttachment];
    }

    const result = await resend.emails.send(emailPayload);

    return Response.json({ success: true, id: result.data?.id, hasPDF: !!pdfAttachment });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
