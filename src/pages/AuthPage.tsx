import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Car, Loader2, Store, Building2, User } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AccountType = "buyer" | "vendor" | "stand";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("vendor");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pass the account type to signup for role assignment
  const handleSignUpWithRole = async (email: string, password: string, fullName: string, role: AccountType) => {
    return signUp(email, password, fullName, role === "buyer" ? undefined : role);
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await handleSignUpWithRole(email, password, fullName, accountType)
        : await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: isSignUp ? "Account created!" : "Welcome back!" });
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <Car className="h-8 w-8 text-secondary" />
            <span className="font-display font-bold text-2xl">
              <span className="text-primary">Carros</span>
              <span className="text-secondary">Usados</span>
            </span>
          </Link>
          <CardTitle className="font-display">{isSignUp ? "Criar Conta" : "Bem-vindo de Volta"}</CardTitle>
          <CardDescription>{isSignUp ? "Registe-se para começar a vender" : "Entre na sua conta"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="João Silva" />
                </div>
                
                <div className="space-y-3">
                  <Label>Tipo de Conta</Label>
                  <RadioGroup
                    value={accountType}
                    onValueChange={(value) => setAccountType(value as AccountType)}
                    className="grid gap-3"
                  >
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="buyer" id="buyer" />
                      <Label htmlFor="buyer" className="flex items-center gap-2 cursor-pointer flex-1">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Comprador</p>
                          <p className="text-sm text-muted-foreground">Pesquisar e guardar carros favoritos</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="vendor" id="vendor" />
                      <Label htmlFor="vendor" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Store className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="font-medium">Vendedor</p>
                          <p className="text-sm text-muted-foreground">Criar e atualizar anúncios de carros</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="stand" id="stand" />
                      <Label htmlFor="stand" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Stand</p>
                          <p className="text-sm text-muted-foreground">Gestão completa de anúncios com acesso para eliminar</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" variant="hero" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Registar" : "Entrar"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-secondary hover:underline font-medium">
              {isSignUp ? "Entrar" : "Registar"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
