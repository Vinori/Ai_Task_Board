import { type FormEvent, useEffect, useId, useState } from "react";
import { fetchMyProfile, updateMyProfile } from "@/api/profile";
import { Button } from "@/components/buttons/Button";
import { Modal } from "@/components/modals/Modal";
import { navCopy } from "@/i18n/nav";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

const MAX_DISPLAY_NAME = 200;
const MAX_ROLE = 120;
const MAX_ABOUT = 2000;

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t.length ? t : null;
}

type UserSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function UserSettingsModal({ open, onClose }: UserSettingsModalProps) {
  const locale = useUiStore((s) => s.locale);
  const user = useAuthStore((s) => s.user);
  const t = navCopy[locale];

  const nameId = useId();
  const emailId = useId();
  const roleId = useId();
  const aboutId = useId();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [about, setAbout] = useState("");
  const [initLoading, setInitLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  const email =
    user?.email?.trim() ||
    (typeof user?.user_metadata?.email === "string"
      ? user.user_metadata.email.trim()
      : "") ||
    "";

  useEffect(() => {
    if (!open || !user) return;
    setLoadError(null);
    setFormError(null);
    setSavedOk(false);
    setInitLoading(true);
    void fetchMyProfile().then(({ data, error }) => {
      setInitLoading(false);
      if (error) {
        setLoadError(error.message);
        return;
      }
      setDisplayName(data?.display_name?.trim() ?? "");
      setRole(data?.role?.trim() ?? "");
      setAbout(data?.about?.trim() ?? "");
    });
  }, [open, user?.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setSavedOk(false);

    const dn = displayName.trim();
    const r = role.trim();
    const ab = about.trim();

    if (dn.length > MAX_DISPLAY_NAME) {
      setFormError(t.errorDisplayNameTooLong);
      return;
    }
    if (r.length > MAX_ROLE) {
      setFormError(t.errorRoleTooLong);
      return;
    }
    if (ab.length > MAX_ABOUT) {
      setFormError(t.errorAboutTooLong);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await updateMyProfile({
        display_name: emptyToNull(displayName),
        role: emptyToNull(role),
        about: emptyToNull(about),
      });
      if (error || !data) {
        setFormError(error?.message ?? t.profileUpdateError);
        return;
      }
      setSavedOk(true);
      setDisplayName(data.display_name?.trim() ?? "");
      setRole(data.role?.trim() ?? "");
      setAbout(data.about?.trim() ?? "");
      window.setTimeout(() => setSavedOk(false), 2500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title={t.userSettingsTitle}
      subtitle={t.userSettingsSubtitle}
      onClose={onClose}
      closeLabel={t.modalClose}
    >
      {!user ? (
        <p className="text-sm text-fg-muted dark:text-slate-400">
          {t.authSubtitleSignIn}
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {loadError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
          ) : null}
          {initLoading ? (
            <p className="text-sm text-fg-muted dark:text-slate-400">
              {t.loading}
            </p>
          ) : null}

          <div>
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
            >
              {t.profileNameLabel}
            </label>
            <input
              id={nameId}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.profileNamePlaceholder}
              maxLength={MAX_DISPLAY_NAME}
              autoComplete="name"
              disabled={submitting || initLoading}
              className="field-input"
            />
          </div>

          <div>
            <label
              htmlFor={emailId}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
            >
              {t.email}
            </label>
            <input
              id={emailId}
              type="email"
              value={email}
              readOnly
              disabled
              aria-readonly="true"
              className="field-input cursor-not-allowed opacity-80"
            />
            <p className="mt-1 text-xs text-fg-subtle dark:text-slate-500">
              {t.emailReadOnlyHint}
            </p>
          </div>

          <div>
            <label
              htmlFor={roleId}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
            >
              {t.authRoleLabel}
            </label>
            <input
              id={roleId}
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={t.authRolePlaceholder}
              maxLength={MAX_ROLE}
              autoComplete="organization-title"
              disabled={submitting || initLoading}
              className="field-input"
            />
          </div>

          <div>
            <label
              htmlFor={aboutId}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle dark:text-slate-400"
            >
              {t.profileAboutLabel}
            </label>
            <textarea
              id={aboutId}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder={t.profileAboutPlaceholder.replace(
                "{{max}}",
                String(MAX_ABOUT),
              )}
              maxLength={MAX_ABOUT}
              rows={4}
              disabled={submitting || initLoading}
              className="field-input min-h-[6rem] resize-y"
            />
          </div>

          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          ) : null}
          {savedOk ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {t.profileSaved}
            </p>
          ) : null}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="gradient"
              disabled={submitting || initLoading || !!loadError}
              className="min-w-[7rem] px-5 py-2.5"
            >
              {submitting ? t.savingProfile : t.saveProfile}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
