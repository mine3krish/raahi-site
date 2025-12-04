"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface AdSenseProps {
  slot: string;
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdSense({ 
  slot, 
  format = "auto", 
  responsive = true,
  style = {}
}: AdSenseProps) {
  const [clientId, setClientId] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetchAdSenseSettings();
  }, []);

  const fetchAdSenseSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setClientId(data.adsenseClientId || "");
        setEnabled(data.adsenseEnabled || false);
      }
    } catch (error) {
      console.error("Error fetching AdSense settings:", error);
    }
  };

  // Don't render if AdSense is disabled or no client ID
  if (!enabled || !clientId || !slot) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          ...style,
        }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      <Script id={`adsense-init-${slot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </>
  );
}

