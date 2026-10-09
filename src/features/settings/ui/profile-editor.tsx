import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import type { SessionUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { MaskIcon } from "@/shared/ui/mask-icon";

import type { UpdateProfileInput } from "../api/profile-api";
import checkIcon from "../assets/check.svg";
import crossIcon from "../assets/cross.svg";
import deleteIcon from "../assets/delete.svg";
import editIcon from "../assets/edit.svg";
import photoIcon from "../assets/photo.svg";
import { useProfileDraft } from "../hooks/use-profile-draft";
import { SettingsRow } from "./settings-row";

type ProfileEditorProps = {
  user: SessionUser;
  saving: boolean;
  avatarBusy: boolean;
  onSave: (input: UpdateProfileInput) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
};

type AvatarError = "invalid" | "upload" | "remove" | null;
const allowedAvatarTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxAvatarSize = 5 * 1024 * 1024;

export function ProfileEditor({
  user,
  saving,
  avatarBusy,
  onSave,
  onUploadAvatar,
  onRemoveAvatar,
}: ProfileEditorProps) {
  const { t } = useTranslation("settings");
  const form = useProfileDraft({
    name: user.name,
    telegram: user.telegram ?? "",
  });
  const [avatarError, setAvatarError] = useState<AvatarError>(null);
  const [saveError, setSaveError] = useState(false);
  const busy = saving || avatarBusy;
  const avatarErrorId = useId();
  const nameErrorId = useId();
  const telegramErrorId = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (form.editing) {
      nameInputRef.current?.focus();
    } else if (wasEditingRef.current) {
      editButtonRef.current?.focus();
    }
    wasEditingRef.current = form.editing;
  }, [form.editing]);

  async function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    if (
      !allowedAvatarTypes.has(file.type) ||
      file.size === 0 ||
      file.size > maxAvatarSize
    ) {
      setAvatarError("invalid");
      return;
    }
    setAvatarError(null);
    try {
      await onUploadAvatar(file);
    } catch {
      setAvatarError("upload");
    }
  }

  async function removeAvatar() {
    if (busy) return;
    setAvatarError(null);
    try {
      await onRemoveAvatar();
    } catch {
      setAvatarError("remove");
    }
  }

  async function saveProfile() {
    if (busy || !form.nameValid || !form.telegramValid) return;
    setSaveError(false);
    try {
      await onSave({
        name: form.draft.name.trim(),
        telegram: form.normalizedTelegram,
      });
      form.stop();
    } catch {
      setSaveError(true);
    }
  }

  const avatarClassName =
    "flex size-full items-center justify-center overflow-hidden rounded-full bg-brand-20 text-[33px] font-semibold text-brand-light";

  return (
    <>
      {avatarError && (
        <p
          className="fixed left-1/2 top-24 z-30 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-5 text-ink shadow-lg"
          id={avatarErrorId}
          role="alert"
        >
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-danger"
          />
          {t(
            avatarError === "invalid"
              ? "avatarUploadHint"
              : avatarError === "upload"
                ? "avatarUploadError"
                : "avatarRemoveError",
          )}
        </p>
      )}
      <Card className="overflow-hidden border-0">
        <div className="grid min-h-[100px] grid-cols-[60px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 px-4 pb-4 pt-6 sm:flex sm:flex-wrap sm:gap-4 sm:px-6">
          <div className="relative size-[60px] shrink-0">
            <button
              aria-describedby={avatarError ? avatarErrorId : undefined}
              aria-label={t("uploadAvatar")}
              aria-busy={avatarBusy}
              className={`${avatarClassName} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60`}
              disabled={busy}
              onClick={() => avatarInputRef.current?.click()}
              type="button"
            >
              {avatarBusy ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-6 animate-spin"
                />
              ) : user.avatar_url ? (
                <img
                  alt=""
                  className="size-full rounded-full object-cover"
                  src={user.avatar_url}
                />
              ) : (
                user.name.trim().charAt(0).toLocaleUpperCase() || "N"
              )}
            </button>
            <input
              ref={avatarInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={busy}
              onChange={(event) => void chooseAvatar(event)}
              type="file"
            />
            {user.avatar_url ? (
              <button
                aria-label={t("removeAvatar")}
                className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-avatar-control text-avatar-control-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
                disabled={busy}
                onClick={() => void removeAvatar()}
                type="button"
              >
                <MaskIcon src={deleteIcon} />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-avatar-control text-avatar-control-ink"
              >
                <MaskIcon src={photoIcon} />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {form.editing ? (
              <div>
                <label className="block h-12 w-full max-w-[240px] rounded-[10px] bg-subtle px-3 py-1.5">
                  <span className="block text-[11px] leading-4 text-muted">
                    {t("profileName")}
                  </span>
                  <Input
                    ref={nameInputRef}
                    aria-describedby={form.nameValid ? undefined : nameErrorId}
                    aria-invalid={!form.nameValid}
                    autoComplete="name"
                    className="min-h-0 h-5 border-0 bg-transparent p-0 text-sm focus-visible:border-0 focus-visible:ring-0"
                    disabled={busy}
                    maxLength={120}
                    onChange={(event) => form.setName(event.target.value)}
                    placeholder={t("namePlaceholder")}
                    value={form.draft.name}
                  />
                </label>
                {!form.nameValid && (
                  <p className="mt-1 text-xs text-danger" id={nameErrorId}>
                    {t("nameInvalid")}
                  </p>
                )}
              </div>
            ) : (
              <strong className="block break-words text-xl font-bold text-ink sm:text-2xl">
                {user.name || t("nameNotSet")}
              </strong>
            )}
          </div>

          {form.editing ? (
            <div className="col-span-2 flex shrink-0 justify-self-end gap-2 sm:ml-auto">
              <Button
                aria-label={t("cancel")}
                className="min-h-10 size-10 rounded-lg bg-subtle p-0 text-ink hover:bg-subtle/80"
                disabled={busy}
                onClick={() => {
                  setSaveError(false);
                  form.stop();
                }}
                size="sm"
                variant="secondary"
              >
                <MaskIcon src={crossIcon} />
              </Button>
              <Button
                aria-label={t("saveProfile")}
                aria-busy={saving}
                className="min-h-10 size-10 rounded-lg p-0"
                disabled={busy || !form.nameValid || !form.telegramValid}
                onClick={() => void saveProfile()}
                size="sm"
              >
                {saving ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-5 animate-spin"
                  />
                ) : (
                  <MaskIcon src={checkIcon} />
                )}
              </Button>
            </div>
          ) : (
            <Button
              ref={editButtonRef}
              className="col-span-2 min-h-8 shrink-0 justify-self-end gap-1 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
              disabled={busy}
              onClick={() => {
                setSaveError(false);
                form.start();
              }}
              size="sm"
              variant="secondary"
            >
              <MaskIcon src={editIcon} />
              {t("edit")}
            </Button>
          )}
        </div>

        {saveError && (
          <p className="px-4 pb-4 text-sm text-danger sm:px-6" role="alert">
            {t("profileSaveError")}
          </p>
        )}
        <SettingsRow divider label={t("email")}>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
            <span className="break-all">{user.email || "—"}</span>
            {user.email && user.email_verified && (
              <Badge tone="success">
                <CircleCheck aria-hidden="true" className="size-3.5" />
                {t("verified")}
              </Badge>
            )}
          </div>
        </SettingsRow>
        <SettingsRow divider label={t("telegram")}>
          {form.editing ? (
            <div>
              <Input
                aria-describedby={
                  form.telegramValid ? undefined : telegramErrorId
                }
                aria-invalid={!form.telegramValid}
                aria-label={t("telegram")}
                className="min-h-9 w-48 max-w-full rounded-lg bg-subtle px-3 text-right"
                disabled={busy}
                maxLength={33}
                onChange={(event) => form.setTelegram(event.target.value)}
                value={form.draft.telegram}
              />
              {!form.telegramValid && (
                <p className="mt-1 text-xs text-danger" id={telegramErrorId}>
                  {t("telegramInvalid")}
                </p>
              )}
            </div>
          ) : (
            <span className="break-all">{user.telegram || "—"}</span>
          )}
        </SettingsRow>
      </Card>
    </>
  );
}
