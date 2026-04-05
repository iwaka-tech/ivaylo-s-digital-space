import { useState, useEffect, useCallback, useRef } from "react";

const GRID_W = 20;
const GRID_H = 12;
const TICK_MS = 200;

type Pos = { x: number; y: number };
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

const randomFood = (snake: Pos[]): Pos => {
  let p: Pos;
  do {
    p = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
};

const SnakeGame = ({ onExit }: { onExit: (score: number) => void }) => {
  const initSnake: Pos[] = [{ x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 6 }];
  const [snake, setSnake] = useState<Pos[]>(initSnake);
  const [food, setFood] = useState<Pos>(() => randomFood(initSnake));
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);
  const dirRef = useRef<Dir>("RIGHT");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    const map: Record<string, Dir> = {
      ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
      w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT",
    };
    const newDir = map[e.key];
    if (!newDir) {
      if (e.key === "Escape" || e.key === "q") {
        onExit(score);
      }
      return;
    }
    const opposite: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (newDir !== opposite[dirRef.current]) {
      dirRef.current = newDir;
      setDir(newDir);
    }
    e.preventDefault();
  }, [onExit, score]);

  // Game loop
  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        const d = dirRef.current;
        if (d === "UP") head.y--;
        if (d === "DOWN") head.y++;
        if (d === "LEFT") head.x--;
        if (d === "RIGHT") head.x++;

        // Wall collision
        if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
          setAlive(false);
          return prev;
        }
        // Self collision
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setAlive(false);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood(randomFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [alive, food]);

  // Render grid
  const renderGrid = () => {
    const lines: string[] = [];
    lines.push("╔" + "══".repeat(GRID_W) + "╗");
    for (let y = 0; y < GRID_H; y++) {
      let row = "║";
      for (let x = 0; x < GRID_W; x++) {
        if (snake[0]?.x === x && snake[0]?.y === y) {
          row += "██";
        } else if (snake.some((s) => s.x === x && s.y === y)) {
          row += "░░";
        } else if (food.x === x && food.y === y) {
          row += "🍎";
        } else {
          row += "  ";
        }
      }
      row += "║";
      lines.push(row);
    }
    lines.push("╚" + "══".repeat(GRID_W) + "╝");
    return lines.join("\n");
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKey}
      tabIndex={0}
      className="outline-none"
    >
      <pre className="text-primary text-xs leading-tight">
        {`  🐍 SNAKE GAME! Резултат: ${score}  ${alive ? ":D" : "GAME OVER :("}\n`}
        {`  Стрелки/WASD = движение | ESC/Q = изход\n\n`}
        {renderGrid()}
      </pre>
      {!alive && (
        <pre className="text-primary mt-2">
          {`\n  GAME OVER! Резултат: ${score} точки!\n`}
          {score >= 100 ? "  Легенда си! :D :D :D\n" : score >= 50 ? "  Супер! :D\n" : "  Опитай пак! :P\n"}
          {`  Натисни ESC за изход ;)\n`}
        </pre>
      )}
    </div>
  );
};

export default SnakeGame;
