import MatrixRain from "@/components/MatrixRain";
import TypingText from "@/components/TypingText";
import Terminal from "@/components/Terminal";
import GlitchText from "@/components/GlitchText";
import InfoCard from "@/components/InfoCard";
import KonamiEasterEgg from "@/components/KonamiEasterEgg";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <MatrixRain />
      <KonamiEasterEgg />

      {/* Scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-10" />

      <div className="relative z-20">
        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-sm text-muted-foreground mb-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              // welcome to
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-4">
              <GlitchText text="iv4o" className="text-primary text-glow-strong" />
              <span className="text-muted-foreground">.online</span>
            </h1>

            <div className="text-lg md:text-xl text-foreground/80 mb-8 h-8">
              <TypingText
                texts={[
                  "Software Engineering Student",
                  "Junior Software Engineer",
                  "C# Developer",
                  "Systems Explorer",
                  "DNS & Networking Enthusiast",
                ]}
                speed={60}
                deleteSpeed={30}
                pauseTime={2500}
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-terminal-dim opacity-0 animate-fade-in-up" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span>STATUS: ONLINE</span>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground text-xs opacity-0 animate-fade-in-up" style={{ animationDelay: "1200ms", animationFillMode: "forwards" }}>
            <span>scroll down</span>
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-20 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-heading font-semibold text-primary text-glow mb-8 text-center">
            {">"} system_info<span className="animate-blink text-primary">_</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon="👤" label="Име" value="Ivaylo" delay={0} />
            <InfoCard icon="💼" label="Роля" value="Software Engineering Student / Junior Software Engineer" delay={100} />
            <InfoCard icon="🎓" label="Образование" value="3-та година Software Engineering — Trakia University" delay={200} />
            <InfoCard icon="🔧" label="Фокус" value="C#, OOP, Databases, Networking, DNS & Hosting" delay={300} />
            <InfoCard icon="🧠" label="Интереси" value="AI Systems, Infrastructure, DNS, Gaming, Embedded/Electronics, Deep Learning" delay={400} />
            <InfoCard icon="🌐" label="Уебсайт" value="iv4o.online" delay={500} />
          </div>
        </section>

        {/* Bio */}
        <section className="py-20 px-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-heading font-semibold text-primary text-glow mb-8 text-center">
            {">"} cat bio.txt<span className="animate-blink text-primary">_</span>
          </h2>

          <div className="p-6 rounded-lg border border-border bg-card/30 backdrop-blur-sm border-glow">
            <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
              Казвам се <span className="text-primary font-semibold">Ivaylo</span> и съм студент трета година по софтуерно инженерство
              в <span className="text-cyber-blue">Тракийския университет</span>. Интересувам се от{" "}
              <span className="text-cyber-purple">C#</span>, обектно-ориентирано програмиране, бази данни, DNS, мрежови
              технологии и practically oriented software projects. Харесва ми да разбирам системите в
              дълбочина и да комбинирам обучение с реални технически експерименти.
            </p>
          </div>
        </section>

        {/* Terminal */}
        <section className="py-20 px-4">
          <h2 className="text-2xl font-heading font-semibold text-primary text-glow mb-8 text-center">
            {">"} interactive_terminal<span className="animate-blink text-primary">_</span>
          </h2>
          <Terminal />
          <p className="text-center text-xs text-muted-foreground mt-4">
            💡 Опитай: help, about, skills, sudo, matrix
          </p>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          <div className="mb-2">
            <span className="text-terminal-dim">$</span> echo "Built with 💚 by Ivaylo"
          </div>
          <div>iv4o.online © {new Date().getFullYear()}</div>
          <div className="mt-2 text-terminal-dim text-[10px]">
            psst... опитай Konami Code: ↑↑↓↓←→←→BA 🎮
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
