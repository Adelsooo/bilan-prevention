import { Resend } from "resend";

export async function POST(request) {
  try {
    const data = await request.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const PHARMACY_EMAIL = process.env.PHARMACY_EMAIL || "abelkaious@gmail.com";

    const {
      prenom, nom, dateNaissance, sexe, ageGroup,
      answers, refNumber, dateStr, timeStr,
      themes, recos, priorityRecos, tips
    } = data;

    // Synthèse
    const parTheme = {};
    recos.forEach(r => { parTheme[r.theme] = (parTheme[r.theme] || 0) + 1; });
    const partsSynth = Object.entries(parTheme).map(([t, n]) => `${n} action${n > 1 ? "s" : ""} en ${t.toLowerCase()}`);
    const synthese = partsSynth.length === 0 ? "Aucune action particulière identifiée." : `Patient présentant ${partsSynth.join(", ")}.`;

    const html = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: 'Helvetica', 'Arial', sans-serif; color: #1E1E1E; max-width: 700px; margin: 0 auto; padding: 24px; background: #F8F7F3;">

  <div style="background: #1A3A52; color: white; padding: 16px 20px; border-radius: 10px 10px 0 0;">
    <div style="font-size: 11px; opacity: 0.7; letter-spacing: 1.2px; text-transform: uppercase;">🔔 Nouveau Bilan Reçu</div>
    <div style="font-size: 18px; font-weight: 700; margin-top: 4px; font-family: Georgia, serif;">Bilan Prévention ${ageGroup} ans — ${prenom} ${nom.toUpperCase()}</div>
    <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">Référence : ${refNumber} · ${dateStr} à ${timeStr}</div>
  </div>

  <div style="background: white; padding: 22px 20px; border: 1px solid #E4E0D8; border-top: none;">

    <!-- IDENTITÉ -->
    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Identité du patient</div>
    <table style="width: 100%; font-size: 13px; margin-bottom: 16px; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 0; color: #6B7A8D; width: 30%;">Nom</td>
        <td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${nom.toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7A8D;">Prénom</td>
        <td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${prenom}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7A8D;">Né(e) le</td>
        <td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${dateNaissance}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7A8D;">Sexe</td>
        <td style="padding: 4px 0; color: #1A3A52; font-weight: 700;">${sexe}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7A8D;">N° Sécu</td>
        <td style="padding: 4px 0; color: #6B7A8D; font-style: italic; font-size: 11px;">à compléter au comptoir</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #6B7A8D;">Médecin traitant</td>
        <td style="padding: 4px 0; color: #6B7A8D; font-style: italic; font-size: 11px;">à compléter au comptoir</td>
      </tr>
    </table>

    <!-- THÈMES -->
    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Thèmes abordés</div>
    <div style="background: #EAF2EC; border-left: 3px solid #5A8A6A; padding: 10px 14px; border-radius: 4px; margin-bottom: 16px;">
      ${themes.map((t, i) => `<div style="font-size: 13px; color: #1A3A52; margin: 3px 0;">✓ Thème ${i + 1} : <strong>${t}</strong></div>`).join("")}
    </div>

    <!-- SYNTHÈSE -->
    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Synthèse</div>
    <div style="background: #FDF4E3; border-left: 3px solid #C8922A; padding: 10px 14px; border-radius: 4px; margin-bottom: 18px; font-size: 13px; color: #1A3A52; font-style: italic;">
      ${synthese}
    </div>

    <!-- RECOMMANDATIONS CLINIQUES -->
    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Actions recommandées au patient</div>
    ${recos.length === 0 ? `<div style="font-size: 13px; color: #6B7A8D; padding: 10px;">Aucune recommandation particulière identifiée.</div>` : recos.map(r => `
      <div style="padding: 11px 13px; border: 1px solid #E4E0D8; margin-bottom: 7px; border-radius: 5px; background: white;">
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 3px; background: ${r.priority ? "#EAF2EC" : "#FDF4E3"}; color: ${r.priority ? "#5A8A6A" : "#C8922A"};">${r.priority ? "PRIORITAIRE" : "À PROPOSER"}</span>
          <span style="font-size: 10px; color: #6B7A8D;">${r.theme}</span>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #1A3A52; margin-bottom: 3px;">${r.label}</div>
        <div style="font-size: 12px; color: #6B7A8D; line-height: 1.5;">${r.detail}</div>
      </div>
    `).join("")}

    <!-- PPP -->
    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px; margin-top: 18px;">Plan Personnalisé de Prévention (PPP)</div>
    <div style="background: #FAFAF7; border: 1px solid #E4E0D8; padding: 12px 14px; border-radius: 5px; font-size: 13px; margin-bottom: 18px;">
      <div style="margin-bottom: 6px;"><strong style="font-size: 10px; color: #6B7A8D; text-transform: uppercase; letter-spacing: 0.8px;">Thèmes :</strong> ${themes.join(", ")}</div>
      <div style="margin-bottom: 6px;">
        <strong style="font-size: 10px; color: #6B7A8D; text-transform: uppercase; letter-spacing: 0.8px;">Actions prioritaires identifiées :</strong><br>
        ${priorityRecos.length === 0 ? "Aucune action prioritaire identifiée." : priorityRecos.map(r => `• ${r.label}`).join("<br>")}
      </div>
      <div>
        <strong style="font-size: 10px; color: #6B7A8D; text-transform: uppercase; letter-spacing: 0.8px;">Objectifs retenus avec le patient :</strong> Basés sur les recommandations ci-dessus, à formaliser au comptoir.
      </div>
    </div>

    <!-- RÉPONSES -->
    <div style="font-size: 10px; font-weight: 700; color: #5A8A6A; text-transform: uppercase; letter-spacing: 1.3px; padding-bottom: 4px; border-bottom: 1px solid #E4E0D8; margin-bottom: 10px;">Réponses du patient</div>
    <div style="border: 1px solid #E4E0D8; border-radius: 5px; overflow: hidden;">
      ${Object.entries(answers).map(([id, v], i) => {
        const q = data.questionsLib.find(qq => qq.id === id);
        return `<div style="display: flex; padding: 7px 11px; border-bottom: ${i < Object.keys(answers).length - 1 ? "1px solid #F0EDE5" : "none"}; background: ${i % 2 === 0 ? "white" : "#FAFAF7"};">
          <div style="flex: 1; font-size: 11px; color: #6B7A8D; padding-right: 10px;">${q ? q.q : id}</div>
          <div style="font-size: 12px; font-weight: 700; color: #1A3A52; max-width: 40%; text-align: right;">${v || "—"}</div>
        </div>`;
      }).join("")}
    </div>

    <!-- SIGNATURE -->
    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #E4E0D8; font-size: 11px; color: #5A8A6A;">
      ✓ Consentement patient confirmé électroniquement — ${prenom} ${nom.toUpperCase()} — ${dateStr} à ${timeStr}
    </div>

    <!-- FOOTER -->
    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #E4E0D8; font-size: 10px; color: #6B7A8D; text-align: center; line-height: 1.6;">
      Document conforme au dispositif « Mon Bilan Prévention » — Arrêté du 28 mai 2024<br>
      À archiver dans le dossier patient · Référence ${refNumber}
    </div>

  </div>

</body></html>`;

    const result = await resend.emails.send({
      from: "Bilan Prévention <onboarding@resend.dev>",
      to: PHARMACY_EMAIL,
      subject: `[BILAN PRÉVENTION] ${nom.toUpperCase()} ${prenom} - ${ageGroup} ans - ${dateStr}`,
      html: html,
    });

    return Response.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
