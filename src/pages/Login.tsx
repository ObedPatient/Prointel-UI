import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REMEMBERED_EMAIL_KEY = "remembered_login_email";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter both email and password to continue.");
      return;
    }

    if (rememberMe) {
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    setError("");
    navigate("/dashboard");
  };

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_45%,#f8fafc_100%)]">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.2),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.16),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-16rem)] max-w-6xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700/70">
            Welcome Back
          </p>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Access production visibility, supplier activity, and company controls from one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <Mail className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Secure access</p>
              <p className="mt-1 text-sm text-slate-600">Sign in with your admin or team account.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-cyan-600" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Protected sessions</p>
              <p className="mt-1 text-sm text-slate-600">Remembered email for faster repeat access.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <LockKeyhole className="h-5 w-5 text-slate-700" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Company controls</p>
              <p className="mt-1 text-sm text-slate-600">Jump back into operations and settings quickly.</p>
            </div>
          </div>
        </div>

        <Card className="border-white/70 bg-white/92 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.4)] backdrop-blur">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">Log in</CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-600">
                Enter your email and password to continue to ProdIntel.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    className="h-11 border-slate-200 bg-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-700 transition-colors hover:text-blue-600"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-11 border-slate-200 bg-white pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="remember-me" className="flex items-center gap-3 text-sm text-slate-600">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="h-11 w-full bg-[#1a2744] hover:bg-[#111b31]">
                Log in
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-slate-600">
                New company onboarding?
                {" "}
                <Link to="/tenant-register" className="font-semibold text-blue-700 hover:text-blue-600">
                  Register a tenant
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
