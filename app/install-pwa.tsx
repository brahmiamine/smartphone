"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/smartphone/sw.js");
    }
    const updateInstalled = () => setInstalled(Boolean(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone));
    queueMicrotask(updateInstalled);
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", updateInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", updateInstalled);
    };
  }, []);

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") setPrompt(null);
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    window.alert(isIOS
      ? "Sur iPhone/iPad : ouvrez le menu Partager de Safari, puis choisissez « Sur l’écran d’accueil »."
      : "Ouvrez le menu de votre navigateur puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil »."
    );
  };

  if (installed) return null;
  return <Button variant="outline" className="install-button" onClick={install}><Download /> Installer</Button>;
}
