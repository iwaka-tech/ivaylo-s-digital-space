import { useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText = ({ text, className = "" }: GlitchTextProps) => {
  const [isGlitching, setIsGlitching] = useState(false);

  return (
    <span
      className={`relative inline-block cursor-pointer select-none ${className}`}
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => setIsGlitching(false)}
    >
      <span className={isGlitching ? "animate-glitch" : ""}>{text}</span>
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 animate-glitch text-cyber-purple opacity-70"
            style={{ clipPath: "inset(0 0 50% 0)", animationDelay: "0.05s" }}
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 animate-glitch text-cyber-blue opacity-70"
            style={{ clipPath: "inset(50% 0 0 0)", animationDelay: "0.1s" }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
};

export default GlitchText;
