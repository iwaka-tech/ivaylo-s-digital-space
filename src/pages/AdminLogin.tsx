import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import MatrixRain from "@/components/MatrixRain";

export default function AdminLogin() {
  const { login, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdmin) {
    navigate("/admin", { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);
    if (res.ok) {
      toast({ title: "Влязохте успешно :D" });
      navigate("/admin");
    } else {
      toast({ title: "Грешка", description: res.error || "Невалидни данни", variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-10" />
      <div className="relative z-20 w-full max-w-md p-8 rounded-lg border border-border bg-card/60 backdrop-blur-md border-glow">
        <h1 className="text-3xl font-heading font-bold text-primary text-glow mb-2 text-center">
          {">"} admin_login
        </h1>
        <p className="text-xs text-muted-foreground mb-6 text-center">// only authorized personnel B-)</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-terminal-dim block mb-1">$ username</label>
            <Input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-mono bg-background/60 border-primary/30"
              placeholder="..."
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs text-terminal-dim block mb-1">$ password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-mono bg-background/60 border-primary/30"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary hover:bg-primary/30">
            {loading ? "Проверявам..." : "[ ENTER ]"}
          </Button>
        </form>
      </div>
    </div>
  );
}
