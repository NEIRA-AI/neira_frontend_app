import { CircleAlert, CircleCheck } from "lucide-react";
import { useEffect, useId, useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { MaskIcon } from "@/shared/ui/mask-icon";

import { useAvatarPreview } from "../hooks/use-avatar-preview";
import { useProfileDraft } from "../hooks/use-profile-draft";
import type {
  ProfilePreview,
  ProfilePreviewInput,
} from "../hooks/use-profile-preview";
import checkIcon from "../assets/check.svg";
import crossIcon from "../assets/cross.svg";
import deleteIcon from "../assets/delete.svg";
import editIcon from "../assets/edit.svg";
import photoIcon from "../assets/photo.svg";

import { SettingsRow } from "./settings-row";

type ProfileEditorProps = {
  value: ProfilePreview;
  email: string;
  emailVerified?: boolean;
  onApply: (next: ProfilePreviewInput) => void;
};

function initialsForName(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase();
}

export function ProfileEditor({
  value,
  email,
  emailVerified = false,
  onApply,
}: ProfileEditorProps) {
  const { t } = useTranslation("settings");
  const avatarErrorId = useId();
  const telegramErrorId = useId();
  const form = useProfileDraft(value);
  const avatar = useAvatarPreview();
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

  function startEditing() {
    avatar.reset();
    form.start();
  }

  function cancelEditing() {
    avatar.reset();
    form.stop();
  }

  function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    avatar.select(file);
  }

  function applyPreview() {
    if (!form.telegramValid) return;
    onApply({
      name: form.draft.name.trim(),
      telegram: form.normalizedTelegram,
      avatar: avatar.change,
    });
    avatar.reset();
    form.stop();
  }

  const avatarSrc = form.editing
    ? (avatar.previewUrl ?? value.avatarSrc)
    : value.avatarSrc;
  const avatarInitials =
    initialsForName(form.editing ? form.draft.name : value.name) || "N";
  const avatarContent = avatarSrc ? (
    <img
      alt=""
      className="size-full rounded-full object-cover"
      src={avatarSrc}
    />
  ) : (
    avatarInitials
  );
  const avatarClassName =
    "flex size-full items-center justify-center overflow-hidden rounded-full bg-brand-20 text-[33px] font-semibold text-brand-light";

  return (
    <>
      {avatar.hasError && (
        <p
          className="fixed left-1/2 top-24 z-30 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-5 text-ink shadow-lg"
          id={avatarErrorId}
          role="alert"
        >
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-danger"
          />
          {t("avatarUploadHint")}
        </p>
      )}
      <Card className="overflow-hidden border-0">
        <div className="grid min-h-[100px] grid-cols-[60px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 px-4 pb-4 pt-6 sm:flex sm:flex-wrap sm:gap-4 sm:px-6">
          <div className="relative size-[60px] shrink-0">
            {form.editing ? (
              <button
                aria-describedby={avatar.hasError ? avatarErrorId : undefined}
                aria-label={t("uploadAvatar")}
                className={`${avatarClassName} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
                onClick={() => avatarInputRef.current?.click()}
                type="button"
              >
                {avatarContent}
              </button>
            ) : (
              <span aria-hidden="true" className={avatarClassName}>
                {avatarContent}
              </span>
            )}
            {form.editing && (
              <>
                <input
                  ref={avatarInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={chooseAvatar}
                  type="file"
                />
                {avatarSrc && (
                  <button
                    aria-label={t("removeAvatar")}
                    className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-avatar-control text-avatar-control-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    onClick={avatar.remove}
                    type="button"
                  >
                    <MaskIcon src={deleteIcon} />
                  </button>
                )}
                {!avatarSrc && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-avatar-control text-avatar-control-ink"
                  >
                    <MaskIcon src={photoIcon} />
                  </span>
                )}
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {form.editing ? (
              <label className="block h-12 w-full max-w-[240px] rounded-[10px] bg-subtle px-3 py-1.5">
                <span className="block text-[11px] leading-4 text-muted">
                  {t("profileName")}
                </span>
                <Input
                  ref={nameInputRef}
                  autoComplete="name"
                  className="min-h-0 h-5 border-0 bg-transparent p-0 text-sm focus-visible:border-0 focus-visible:ring-0"
                  maxLength={80}
                  onChange={(event) => form.setName(event.target.value)}
                  placeholder={t("namePlaceholder")}
                  value={form.draft.name}
                />
              </label>
            ) : (
              <strong className="block break-words text-xl font-bold text-ink sm:text-2xl">
                {value.name || t("nameNotSet")}
              </strong>
            )}
          </div>

          {form.editing ? (
            <div className="col-span-2 flex shrink-0 justify-self-end gap-2 sm:ml-auto">
              <Button
                aria-label={t("cancel")}
                className="min-h-10 size-10 rounded-lg bg-subtle p-0 text-ink hover:bg-subtle/80"
                onClick={cancelEditing}
                size="sm"
                variant="secondary"
              >
                <MaskIcon src={crossIcon} />
              </Button>
              <Button
                aria-label={t("applyPreview")}
                className="min-h-10 size-10 rounded-lg p-0"
                disabled={!form.telegramValid}
                onClick={applyPreview}
                size="sm"
              >
                <MaskIcon src={checkIcon} />
              </Button>
            </div>
          ) : (
            <Button
              ref={editButtonRef}
              className="col-span-2 min-h-8 shrink-0 justify-self-end gap-1 rounded-lg bg-subtle px-3 text-xs font-bold text-ink hover:bg-subtle/80"
              onClick={startEditing}
              size="sm"
              variant="secondary"
            >
              <MaskIcon src={editIcon} />
              {t("edit")}
            </Button>
          )}
        </div>

        <SettingsRow divider label={t("email")}>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
            <span className="break-all">{email || "—"}</span>
            {email && emailVerified && (
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
            <span className="break-all">{value.telegram || "—"}</span>
          )}
        </SettingsRow>
      </Card>
    </>
  );
}
