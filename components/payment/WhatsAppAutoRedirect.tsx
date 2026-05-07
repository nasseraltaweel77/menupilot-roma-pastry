"use client";

import { useEffect, useState } from "react";

export function WhatsAppAutoRedirect({ whatsappUrl }: { whatsappUrl: string }) {
  const [secondsLeft, setSecondsLeft] = useState(2);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 2000);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(redirectTimer);
    };
  }, [whatsappUrl]);

  return (
    <div className="mt-5 rounded-xl border border-[#d6ad60]/25 bg-[#140b08]/75 px-4 py-3 text-center shadow-lg shadow-black/20">
      <p className="text-sm font-bold text-[#f4d8a4]">
        Redirecting to WhatsApp in {secondsLeft} second{secondsLeft === 1 ? "" : "s"}...
      </p>
      <p className="mt-1 text-xs leading-5 text-[#cdbd9f]">
        The order message is ready and will open automatically.
      </p>
    </div>
  );
}
