export const metadata = {
  title: "Bilan de Prévention",
  description: "Bilan santé personnalisé",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
