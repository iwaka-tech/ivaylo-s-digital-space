import { useEffect, useState } from "react";

const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

const KonamiEasterEgg = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      setSequence((prev) => {
        const next = [...prev, e.key].slice(-10);
        if (next.join(",") === KONAMI.join(",")) {
          setActivated(true);
          setTimeout(() => setActivated(false), 5000);
        }
        return next;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!activated) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="text-center animate-fade-in-up">
        <div className="text-6xl mb-4">🎮</div>
        <div className="text-2xl font-heading text-primary text-glow-strong mb-2">
          KONAMI CODE ACTIVATED!
        </div>
        <div className="text-muted-foreground text-sm">
          +30 lives! Ти си истински gamer. 🕹️
        </div>
        <div className="mt-4 text-xs text-terminal-dim">
          (изчезва след 5 секунди...)
        </div>
      </div>
    </div>
  );
};

export default KonamiEasterEgg;
