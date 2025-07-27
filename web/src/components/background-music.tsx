"use client";

import { useEffect, useState } from "react";

export default function YouTubeBackgroundMusic() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const startMusic = () => {
      setEnabled(true);
      document.removeEventListener("click", startMusic);
    };

    document.addEventListener("click", startMusic);
    return () => document.removeEventListener("click", startMusic);
  }, []);

  if (!enabled) return null;

  return (
    <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
      <iframe
        width="200"
        height="200"
        src="https://www.youtube.com/embed/Z8ADjKR_qjs?autoplay=1&loop=1&playlist=Z8ADjKR_qjs"
        title="YOUNGGU - NOT LIKE US"
        frameBorder="0"
        allow="autoplay"
        allowFullScreen
      ></iframe>
    </div>
  );
}
 