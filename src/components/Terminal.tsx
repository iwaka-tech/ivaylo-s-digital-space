import { useState, useRef, useEffect } from "react";

const COMMANDS: Record<string, string> = {
  help: "Налични команди: help, about, skills, education, interests, contact, sudo, clear, matrix",
  about: "Казвам се Ivaylo и съм студент трета година по софтуерно инженерство в Тракийския университет. Интересувам се от C#, обектно-ориентирано програмиране, бази данни, DNS, мрежови технологии и practically oriented software projects. Харесва ми да разбирам системите в дълбочина и да комбинирам обучение с реални технически експерименти.",
  skills: `╔══════════════════════════════════════╗
║  C#            ████████████░░  85%  ║
║  OOP           █████████████░  90%  ║
║  Databases     ████████████░░  80%  ║
║  Networking    ██████████░░░░  70%  ║
║  DNS/Hosting   █████████████░  90%  ║
║  AI Systems    ████████░░░░░░  60%  ║
╚══════════════════════════════════════╝`,
  education: "🎓 3-та година Software Engineering @ Trakia University\n   Фокус: C#, OOP, Databases, Networking, DNS & Hosting",
  interests: "🤖 AI Systems  🌐 Infrastructure  🔧 DNS  🎮 Gaming\n💡 Embedded/Electronics  🧠 Deep Learning  🔬 Systems Understanding",
  contact: "🌐 iv4o.online\n📧 Свържи се с мен чрез сайта!",
  sudo: "⚠️ Nice try! Permission denied. You're not root here. 😎",
  matrix: "🟢 Wake up, Neo... The Matrix has you... Follow the white rabbit. 🐇",
};

const Terminal = () => {
  const [history, setHistory] = useState<{ cmd: string; output: string }[]>([
    { cmd: "", output: "iv4o@terminal:~$ Добре дошли! Напиши 'help' за налични команди." },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();

    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const output = COMMANDS[cmd] || `bash: ${cmd}: command not found. Опитай 'help'`;

    setHistory((prev) => [...prev, { cmd: input, output }]);
    setInput("");
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-lg border border-border bg-card overflow-hidden border-glow"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-border">
        <div className="w-3 h-3 rounded-full bg-destructive" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-primary" />
        <span className="ml-2 text-xs text-muted-foreground">iv4o@iv4o.online: ~</span>
      </div>

      {/* Terminal body */}
      <div className="p-4 h-72 overflow-y-auto font-mono text-sm">
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.cmd && (
              <div className="text-primary">
                <span className="text-cyber-purple">iv4o</span>
                <span className="text-muted-foreground">@</span>
                <span className="text-cyber-blue">terminal</span>
                <span className="text-muted-foreground">:~$ </span>
                {entry.cmd}
              </div>
            )}
            <pre className="text-foreground whitespace-pre-wrap opacity-80">{entry.output}</pre>
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-cyber-purple">iv4o</span>
          <span className="text-muted-foreground">@</span>
          <span className="text-cyber-blue">terminal</span>
          <span className="text-muted-foreground">:~$ </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-primary caret-primary ml-1"
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
