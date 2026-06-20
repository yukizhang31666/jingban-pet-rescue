"use client";

import { useEffect } from "react";
import { apiUrl } from "@/lib/api-url";

export function ReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referrerPetId = params.get("ref")?.trim();
    if (!referrerPetId || !/^JB-[A-F0-9]{8}$/.test(referrerPetId)) return;

    let visitorToken = window.localStorage.getItem("jb_visitor_token");
    if (!visitorToken) {
      visitorToken = window.crypto.randomUUID();
      window.localStorage.setItem("jb_visitor_token", visitorToken);
    }
    window.localStorage.setItem("jb_referrer_pet", referrerPetId);
    const landingKey = `jb_referral_landing_${referrerPetId}`;
    if (!window.sessionStorage.getItem(landingKey)) {
      window.sessionStorage.setItem(landingKey, "1");
      fetch(apiUrl("/api/growth-events"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId: referrerPetId, eventType: "referral_landing", channel: params.get("utm_medium") || "share" }),
      }).catch(() => undefined);
    }
  }, []);

  return null;
}
