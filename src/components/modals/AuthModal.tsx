import type { AuthError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/buttons/Button";
import { Modal } from "@/components/modals/Modal";
import { navCopy, type NavCopy } from "@/i18n/nav";
import { getSupabase } from "@/lib/supabase";
import type { Locale } from "@/store/uiStore";

export type AuthMode = "signin" | "signup";

type AuthModalProps = {
  open: boolean;
  mode: AuthMode;
  locale: Locale;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
};

const inputClass = "field-input";

/** Keep aligned with DB-friendly signup metadata & sensible UX limits */
const MAX_ROLE_CHARS = 120;
const MAX_SKILLS_CHARS = 2000;

function trimField(value: string): string {
  return value.trim();
}

function mapSupabaseAuthError(err: AuthError, t: NavCopy): string {
  const raw = err.message.trim();
  const msg = raw.toLowerCase();

  if (msg.includes("invalid login credentials"))
    return t.errorWrongPassword;
  if (msg.includes("email not confirmed")) return t.errorEmailNotConfirmed;
  if (
    msg.includes("user already registered") ||
    msg.includes("already registered")
  )
    return t.errorEmailInUse;
  if (msg.includes("invalid email")) return t.errorInvalidEmail;
  if (
    msg.includes("password") &&
    (msg.includes("weak") ||
      msg.includes("least") ||
      msg.includes("characters"))
  )
    return t.errorWeakPassword;
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    err.status === 0
  )
    return t.errorNetwork;

  return raw || t.errorGeneric;
}

export function AuthModal({
  open,
  mode,
  locale,
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  const t = navCopy[locale];
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [signupRole, setSignupRole] = useState("");
  const [signupSkills, setSignupSkills] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabase();

  const title = mode === "signin" ? t.signInTitle : t.signUpTitle;
  const subtitle =
    mode === "signin" ? t.authSubtitleSignIn : t.authSubtitleSignUp;

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setConfirm("");
      setSignupRole("");
      setSignupSkills("");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  async function handleGoogleSignIn() {
    setError(null);
    if (!supabase) {
      setError(t.configMissing);
      return;
    }
    setBusy(true);
    try {
      const redirectTo = `${window.location.origin}/dashboard`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (oauthErr) throw oauthErr;
      // Browser follows redirect when Supabase returns; if not, modal stays briefly busy.
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as AuthError).message === "string"
      ) {
        setError(mapSupabaseAuthError(err as AuthError, t));
      } else {
        setError(t.errorGeneric);
      }
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      setError(t.configMissing);
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError(t.passwordMismatch);
      return;
    }
    if (mode === "signup") {
      const r = trimField(signupRole);
      const s = trimField(signupSkills);
      if (r.length > MAX_ROLE_CHARS) {
        setError(t.errorRoleTooLong);
        return;
      }
      if (s.length > MAX_SKILLS_CHARS) {
        setError(t.errorSkillsTooLong);
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: signErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signErr) throw signErr;
        onClose();
        navigate("/dashboard");
      } else {
        const roleTrimmed = trimField(signupRole);
        const skillsTrimmed = trimField(signupSkills);
        const { data, error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              ...(roleTrimmed ? { role: roleTrimmed } : {}),
              ...(skillsTrimmed
                ? { skills_description: skillsTrimmed }
                : {}),
            },
          },
        });
        if (signErr) throw signErr;
        if (data.session) {
          onClose();
          navigate("/dashboard");
        } else {
          setError(t.signUpCheckEmail);
        }
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as AuthError).message === "string"
      ) {
        setError(mapSupabaseAuthError(err as AuthError, t));
      } else {
        setError(t.errorGeneric);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      closeLabel={t.modalClose}
    >
      <div className="space-y-3.5">
        <Button
          type="button"
          variant="outline"
          className="btn-glow-hover w-full py-2.5"
          disabled={busy}
          onClick={() => void handleGoogleSignIn()}
        >
          <GoogleGlyph className="h-5 w-5 shrink-0" />
          {t.continueWithGoogle}
        </Button>
        <div
          className="relative flex items-center gap-3 text-xs font-medium text-fg-subtle dark:text-slate-500"
          role="separator"
        >
          <span className="h-px flex-1 bg-border-muted/90 dark:bg-white/15" />
          {t.authDividerOr}
          <span className="h-px flex-1 bg-border-muted/90 dark:bg-white/15" />
        </div>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
        {error ? (
          <p
            role="alert"
            className={`rounded-xl border px-3 py-2 text-sm ${
              error === t.signUpCheckEmail
                ? "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-950/35 dark:text-emerald-200"
                : "border-red-200/80 bg-red-50 text-red-800 dark:border-red-500/25 dark:bg-red-950/35 dark:text-red-200"
            }`}
          >
            {error}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <label
            htmlFor="auth-email"
            className="block text-xs font-medium text-fg-muted dark:text-slate-400"
          >
            {t.email}
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="auth-password"
            className="block text-xs font-medium text-fg-muted dark:text-slate-400"
          >
            {t.password}
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        {mode === "signup" ? (
          <>
            <div className="space-y-1.5">
              <label
                htmlFor="auth-confirm"
                className="block text-xs font-medium text-fg-muted dark:text-slate-400"
              >
                {t.confirmPassword}
              </label>
              <input
                id="auth-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="auth-role"
                className="block text-xs font-medium text-fg-muted dark:text-slate-400"
              >
                {t.authRoleLabel}
              </label>
              <input
                id="auth-role"
                type="text"
                autoComplete="organization-title"
                maxLength={MAX_ROLE_CHARS}
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value)}
                className={inputClass}
                placeholder={t.authRolePlaceholder}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="auth-skills"
                className="block text-xs font-medium text-fg-muted dark:text-slate-400"
              >
                {t.authSkillsLabel}
              </label>
              <textarea
                id="auth-skills"
                rows={3}
                maxLength={MAX_SKILLS_CHARS}
                value={signupSkills}
                onChange={(e) => setSignupSkills(e.target.value)}
                className={`${inputClass} min-h-[4.5rem] resize-y py-2`}
                placeholder={t.authSkillsPlaceholder}
              />
              <p className="text-[11px] leading-snug text-fg-subtle dark:text-slate-500">
                {t.authSkillsHint}
              </p>
            </div>
          </>
        ) : null}
        <Button
          type="submit"
          variant="gradient"
          className="btn-glow-hover mt-1 w-full py-2.5"
          disabled={busy}
        >
          {busy
            ? t.loading
            : mode === "signin"
              ? t.submitSignIn
              : t.submitSignUp}
        </Button>
        <p className="pt-0.5 text-center text-xs leading-relaxed text-fg-subtle dark:text-slate-400">
          {mode === "signin" ? (
            <button
              type="button"
              className="font-semibold text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
              onClick={() => {
                setError(null);
                onSwitchMode("signup");
              }}
            >
              {t.switchToSignUp}
            </button>
          ) : (
            <button
              type="button"
              className="font-semibold text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
              onClick={() => {
                setError(null);
                onSwitchMode("signin");
              }}
            >
              {t.switchToSignIn}
            </button>
          )}
        </p>
      </form>
      </div>
    </Modal>
  );
}

/** Official-style multicolor G for the Google button (minimal inline SVG). */
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
