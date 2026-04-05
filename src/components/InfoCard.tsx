import { useState } from "react";

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  delay?: number;
}

const InfoCard = ({ icon, label, value, delay = 0 }: InfoCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card opacity-0 animate-fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        boxShadow: hovered ? "var(--glow-primary)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
          <div className="text-sm text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
