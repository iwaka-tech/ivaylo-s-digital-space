import { useState, useRef, useEffect, useCallback } from "react";

type HistoryEntry = { cmd: string; output: string };

const DINO_GAME_ART = `
    __
   / _)  RAWR!
  / /    
 / /|    ____
( ( |___/    \\
 \\  \\        |
  \\  \\   ___/
   \\__\\_/

  Натисни Enter за скок! Напиши 'stop' за край.
  >>>------->   🌵   >>>------->   🌵🌵
`;

const WEATHER_ART = `
  ╔═══════════════════════════════════╗
  ║   ПРОГНОЗА ЗА ВРЕМЕТО :D         ║
  ╠═══════════════════════════════════╣
  ║                                   ║
  ║   Понеделник:  \\  /   25°C  :)   ║
  ║                 \\/                ║
  ║   Вторник:    .--.    18°C  :(   ║
  ║              (    ).              ║
  ║             (___(__)  дъжд       ║
  ║                                   ║
  ║   Сряда:      \\  /   30°C  :D   ║
  ║                \\/    горещо!     ║
  ║                                   ║
  ║   Четвъртък:  *  *   -2°C  :'(  ║
  ║              * ** *  сняг?!      ║
  ║                                   ║
  ║   Петък:      \\  /   22°C  ;)   ║
  ║                \\/    идеално!    ║
  ║                                   ║
  ║   Събота:    ~~~~    15°C  :/    ║
  ║              мъгла навсякъде     ║
  ║                                   ║
  ║   Неделя:     \\  /   28°C  XD   ║
  ║                \\/    перфектно!  ║
  ╚═══════════════════════════════════╝
  * Прогнозата е 100% неточна :P
`;

const FISH_ART = `
  Има много риби в морето... :')
  
    ><(((°>   ><((°>    ><(°>
         ><(((°>    ><((°>
    ><((°>      ><(((°>
         ><(°>   ><((°>   ><(((°>
`;

const GIRL_YES_ART = `
  OMG! :D :D :D
  
  ╔═══════════════════════════════════╗
  ║  <3 <3 <3  YAAAY!  <3 <3 <3     ║
  ║                                   ║
  ║  Ето инстаграма ми :3            ║
  ║  -> @sys_error_human              ║
  ║                                   ║
  ║  Пиши ми! ;) ;) ;)               ║
  ╚═══════════════════════════════════╝
  
       (\\                          
       ( \\    /)                   
        \\ \\  //                   
   (\\.='" "=./))                  
   (\\.='     '=./))               
    \\)   <3    (/                  
`;

const COMMANDS: Record<string, string> = {
  help: `Налични команди :)
  ╔═══════════════════════════════════╗
  ║  help       - тази помощ :D      ║
  ║  about      - за мен :)          ║
  ║  skills     - умения (=^.^=)     ║
  ║  education  - образование B-)    ║
  ║  interests  - интереси :3        ║
  ║  contact    - контакти ;)        ║
  ║  girl       - хмм... <3          ║
  ║  weather    - прогноза :P        ║
  ║  dino       - динозавър игра!    ║
  ║  joke       - виц :D            ║
  ║  hack       - хакни нещо >:)    ║
  ║  coffee     - кафе? :)          ║
  ║  flip       - обърни маса >:(   ║
  ║  sudo       - опитай ;)         ║
  ║  matrix     - follow the rabbit ║
  ║  ascii      - ASCII арт :3      ║
  ║  clear      - изчисти всичко    ║
  ╚═══════════════════════════════════╝`,

  about: `За мен :)
  ╔═══════════════════════════════════╗
  ║  Казвам се Ivaylo! :D            ║
  ║  Студент 3-та година по          ║
  ║  софтуерно инженерство           ║
  ║  в Тракийския университет :)     ║
  ║                                   ║
  ║  Обичам да ровя в системи,      ║
  ║  да чупя неща и после да ги      ║
  ║  поправям :P                     ║
  ║                                   ║
  ║  "Ако не е счупено, не си        ║
  ║   опитвал достатъчно" ;)         ║
  ╚═══════════════════════════════════╝`,

  skills: `Умения (=^.^=)
╔══════════════════════════════════════╗
║  C#             ████████████░░  85%  ║
║  ООП            █████████████░  90%  ║
║  Бази данни     ████████████░░  80%  ║
║  Мрежи          ██████████░░░░  70%  ║
║  DNS/Хостинг    █████████████░  90%  ║
║  AI Системи     ████████░░░░░░  60%  ║
║  Кафе пиене     ██████████████ 100%  ║
║  Дебъгване      █████████████░  92%  ║
║  Google-ване    ██████████████ 100%  ║
╚══════════════════════════════════════╝
  * Google-ването е супер сила :D`,

  education: `Образование B-)
  ╔═══════════════════════════════════╗
  ║  :mortarboard: 3-та година        ║
  ║  Software Engineering             ║
  ║  @ Trakia University              ║
  ║                                   ║
  ║  Фокус:                           ║
  ║  -> C# ......... :)               ║
  ║  -> ООП ......... :D              ║
  ║  -> Бази данни .. B-)             ║
  ║  -> Мрежи ....... :3              ║
  ║  -> DNS & Хостинг (=^.^=)        ║
  ╚═══════════════════════════════════╝`,

  interests: `Интереси :3
  ╔═══════════════════════════════════╗
  ║  :robot: AI Системи     :O       ║
  ║  :globe: Инфраструктура :)       ║
  ║  :wrench: DNS           B-)      ║
  ║  :game: Гейминг         XD       ║
  ║  :bulb: Електроника     :D       ║
  ║  :brain: Дълбоко учене  :3       ║
  ║  :coffee: Кафе          <3       ║
  ╚═══════════════════════════════════╝`,

  contact: `Контакти ;)
  ╔═══════════════════════════════════╗
  ║  :globe:  iv4o.online             ║
  ║  :email:  ivoo21abc@gmail.com     ║
  ║  :camera: @phamtombyte (Insta)    ║
  ║                                   ║
  ║  Пиши ми смело! :D               ║
  ║  Не хапя... обикновено :P        ║
  ╚═══════════════════════════════════╝`,

  girl: "INTERACTIVE_GIRL",

  weather: WEATHER_ART,

  dino: DINO_GAME_ART,

  joke: "RANDOM_JOKE",

  hack: `Хакване в прогрес... >:)
  
  [██████████████████████████] 100%
  
  Свързване към mainframe... :D
  Прескачане на firewall... ;)
  Декриптиране на пароли... :O
  
  ╔═══════════════════════════════════╗
  ║  ДОСТЪП ПОЛУЧЕН!                  ║
  ║                                   ║
  ║  Паролата е: *********            ║
  ║  Шегувам се :P                    ║
  ║                                   ║
  ║  Не хакваме, ние сме добрите! :) ║
  ╚═══════════════════════════════════╝`,

  coffee: `Приготвяне на кафе... :)
  
     ( (
      ) )
    ........
    |      |]
    \\      /
     \`----'
  
  Кафето е готово! :D
  Сега можеш да кодиш 10x по-бързо! XD
  
  ВНИМАНИЕ: Това е ${Math.floor(Math.random() * 10) + 5}-тото ти кафе днес :/`,

  flip: `(╯°□°)╯︵ ┻━┻

  ...

  Добре, добре...

  ┬─┬ ノ( ゜-゜ノ)
  
  Извинявай, масичка :')`,

  sudo: `  ╔═══════════════════════════════════╗
  ║  [sudo] password for iv4o:        ║
  ║  ****                              ║
  ║                                    ║
  ║  iv4o is not in the sudoers file. ║
  ║  This incident will be reported.  ║
  ║                                    ║
  ║  Nice try! ;) >:)                 ║
  ╚═══════════════════════════════════╝`,

  matrix: `  :green_circle: Wake up, Neo... 
  The Matrix has you... 
  Follow the white rabbit. :rabbit:
  
      (\\(\\
      ( -.-)
      o_(")(")
  
  Knock knock, Neo... :O`,

  ascii: `ASCII Арт Галерия :3

    /\\_/\\  
   ( o.o ) < Мяу! :3
    > ^ <

     __
    (oo)
   /----\\   < Муу! :D
  / |  | \\
 *  |--|  *

    |\\_/|
    | @ @ |  Уау! 
    |  <>  | 
    |______|  :P
     / || \\
    (_/  \\_)`,
};

const JOKES = [
  "Чък Норис пита дете:\n- На колко години си?\n- На 11.\n- Аз на твоите години бях на 12. :D",
  "Когато Александър Бел изобретил телефона, той имал три неприети обаждания от Чък Норис :O",
  "Чък Норис отваря хладилника и вижда, че пудингът се тресе.\nКазва:\n- Спокойно, дошъл съм за бира! :D :D",
  "Чък Норис се нуждае от дубльор за каскадите си, само когато трябва да плаче... :')",
  "Когато Чък Норис приключи с тренировката. Тежестите имат нужда от почивка :P",
  "Когато Чък Норис заминавал в колеж, той казал на баща си:\n- Сега - ти ще бъдеш мъжа в тая къща! B-)",
  "Чък Норис отишъл веднъж на сбирка на феминистки и се върнал с изгладени дрехи и сандвич XD",
  "Чък Норис може да делят на нула. Нулата е тази, която трябва да внимава :O",
  "Чък Норис не прави лицеви опори. Той натиска Земята надолу :D",
  "Чък Норис преброил до безкрайност. Два пъти. B-)",
  "Иванчо пита баща си:\n- Тате, какво е алкохол?\n- Виж, стоят две дървета. Алкохолът е когато виждаш четири.\n- Ама, тате, там има само едно дърво... :D :D",
  "Учителката пита Иванчо:\n- Иванчо, кажи ми три животни!\n- Куче, котка и кученце! :P",
  "Иванчо:\n- Мамо, днес учителката ме похвали!\n- Браво! За какво?\n- Попита кой не си е написал домашното и само аз вдигнах ръка! :D",
  "Иванчо на изпит:\n- Иванчо, кажи ми какво знаеш за Черно море?\n- Черно е! :P :P",
  "Иванчо на учителката:\n- Може ли да бъда наказан за нещо, което не съм направил?\n- Не, разбира се!\n- Добре, не съм си написал домашното :D",
  "Чък Норис не ползва ctrl+c за копиране. Той гледа кода и кодът се копира сам от страх >:)",
];

const Terminal = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { cmd: "", output: "iv4o@terminal:~$ Добре дошли! :D Напиши 'help' за налични команди ;)" },
  ]);
  const [input, setInput] = useState("");
  const [girlMode, setGirlMode] = useState(false);
  const [dinoMode, setDinoMode] = useState(false);
  const [dinoScore, setDinoScore] = useState(0);
  const [dinoAlive, setDinoAlive] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dinoInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Dino game loop
  useEffect(() => {
    if (dinoMode && dinoAlive) {
      dinoInterval.current = setInterval(() => {
        setDinoScore((prev) => {
          const newScore = prev + 1;
          if (Math.random() < 0.15) {
            // Hit cactus
            setDinoAlive(false);
            setDinoMode(false);
            setHistory((h) => [
              ...h,
              {
                cmd: "",
                output: `  GAME OVER! :(
  
      __
     / _)   x_x
    / /
   / /|
  ( ( |___/    
   \\  \\       
    \\  \\  ___/
     \\__\\_/   ...🌵
  
  Резултат: ${newScore} точки!
  ${newScore > 20 ? "Браво! :D :D" : newScore > 10 ? "Не е лошо! :)" : "Опитай пак! :P"}`,
              },
            ]);
            return 0;
          }
          if (newScore % 5 === 0) {
            const frames = [
              `  Резултат: ${newScore} :D    🦕 >>>------->  🌵`,
              `  Резултат: ${newScore} :D    🦕     >>>------->    🌵🌵`,
            ];
            setHistory((h) => [
              ...h,
              { cmd: "", output: frames[newScore % 2] },
            ]);
          }
          return newScore;
        });
      }, 800);
    }
    return () => {
      if (dinoInterval.current) clearInterval(dinoInterval.current);
    };
  }, [dinoMode, dinoAlive]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const raw = input.trim();
      const cmd = raw.toLowerCase();

      if (!cmd) return;

      // Girl mode handling
      if (girlMode) {
        setGirlMode(false);
        if (cmd === "да" || cmd === "yes" || cmd === "da") {
          setHistory((prev) => [...prev, { cmd: raw, output: GIRL_YES_ART }]);
        } else {
          setHistory((prev) => [...prev, { cmd: raw, output: FISH_ART }]);
        }
        setInput("");
        return;
      }

      // Dino mode - jump
      if (dinoMode) {
        if (cmd === "stop" || cmd === "стоп") {
          setDinoMode(false);
          setHistory((prev) => [
            ...prev,
            { cmd: raw, output: `Играта спря! Резултат: ${dinoScore} :)` },
          ]);
          setDinoScore(0);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              cmd: raw,
              output: `  🦕 СКОК! ^^^^^  Резултат: ${dinoScore} :D`,
            },
          ]);
        }
        setInput("");
        return;
      }

      if (cmd === "clear") {
        setHistory([]);
        setInput("");
        return;
      }

      if (cmd === "girl") {
        setGirlMode(true);
        setHistory((prev) => [
          ...prev,
          {
            cmd: raw,
            output: `  Хмм... <3
  
     (\\ 
     ( \\     /)
      \\ \\   //
  (\\.='"  "=./))
   \\)        (/
  
  Кефя ли те? :3
  Напиши "да" или "не" ;)`,
          },
        ]);
        setInput("");
        return;
      }

      if (cmd === "dino" || cmd === "динозавър") {
        setDinoMode(true);
        setDinoAlive(true);
        setDinoScore(0);
        setHistory((prev) => [
          ...prev,
          {
            cmd: raw,
            output: `  DINO GAME! :D
  
      __
     / _)  RAWR!
    / /    
   / /|    
  ( ( |___/    
   \\  \\       
    \\  \\  ___/
     \\__\\_/
  
  Натискай Enter за скок! Напиши 'stop' за край ;)`,
          },
        ]);
        setInput("");
        return;
      }

      if (cmd === "joke" || cmd === "виц") {
        const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
        setHistory((prev) => [...prev, { cmd: raw, output: joke }]);
        setInput("");
        return;
      }

      const output =
        COMMANDS[cmd] ||
        `bash: ${cmd}: командата не е намерена :(
  Опитай 'help' за списък с команди ;)`;

      setHistory((prev) => [...prev, { cmd: raw, output }]);
      setInput("");
    },
    [input, girlMode, dinoMode, dinoScore]
  );

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
        <span className="ml-2 text-xs text-muted-foreground">
          iv4o@iv4o.online: ~ {dinoMode ? "[ DINO GAME :D ]" : girlMode ? "[ <3 ]" : ""}
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-4 h-80 overflow-y-auto font-mono text-sm">
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
            <pre className="text-foreground whitespace-pre-wrap opacity-80">
              {entry.output}
            </pre>
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
            placeholder={
              girlMode ? 'да / не :3' : dinoMode ? 'Enter = скок! :D' : ''
            }
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;
