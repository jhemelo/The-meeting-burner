import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import App from "./App";

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>The Meeting Burner | Real-Time Meeting Cost Calculator</title>
        <meta name="description" content="Track corporate financial waste in real-time. The Meeting Burner calculates the exact cost of your meetings based on attendee salaries." />
        <link rel="canonical" href="https://themeetingburner.online/" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <meta name="robots" content="index,follow" />
        
        {/* Social Media Meta */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://themeetingburner.online/" />
        <meta property="og:title" content="The Meeting Burner | Is this meeting costing you a Rolex?" />
        <meta property="og:description" content="Visualize financial evaporation in real-time. Calculate your meeting's burn rate and share the summary." />
        <meta property="og:image" content="https://themeetingburner.online/og-image.png" />

        {/* External Assets */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6980657374758322" crossOrigin="anonymous"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
        
        {/* Inline styles ported from index.html */}
        <style dangerouslySetInnerHTML={{ __html: `
          html { font-size: 17px; }
          @media (min-width: 1024px) { html { font-size: 18px; } }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; overflow-x: hidden; }
          .mono-ticker { font-family: 'JetBrains Mono', monospace; }
          @keyframes flicker {
            0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 0.99; text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000; }
            20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.4; text-shadow: none; }
          }
          @keyframes light-flicker {
            0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% { opacity: 0.99; text-shadow: 0 0 5px rgba(0,0,0,0.3), 0 0 15px rgba(0,0,0,0.1); }
            20%, 21.999%, 63%, 63.999%, 65%, 69.999% { opacity: 0.6; text-shadow: none; }
          }
          .burn-text { color: #ff4d4d; animation: flicker 2s infinite alternate ease-in-out; }
          .light-burn-text { color: #000000; animation: light-flicker 2.5s infinite alternate ease-in-out; }
          .transition-theme { transition: background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease; }
          @media (max-width: 1024px) { .mono-ticker { font-size: clamp(3.5rem, 16vw, 7rem) !important; } }
          ins.adsbygoogle { display: block !important; margin: 1.5rem auto !important; }
        `}} />
        <Meta />
        <Links />
      </head>
      <body>
        <App />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}