import './globals.css';

export const metadata = {
  title: '5th Creative — Attention Creates Opportunity',
  description: 'Build trust before the first call. Full-service creative for brands that move.',
  openGraph: {
    title: '5th Creative — Attention Creates Opportunity',
    description: 'Build trust before the first call. Full-service creative for brands that move.',
    type: 'website',
    images: [
      {
        url: 'https://d8j0ntlcm91z4.cloudfront.net/user_3EiySi9FiZS1xcUPg6DMyzXk0LA/hf_20260606_174859_35a2c48b-8947-4cf1-9c37-494498840632.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
