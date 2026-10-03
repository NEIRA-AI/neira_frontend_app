import { CircleAlert, CircleCheck, Phone } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { MaskIcon } from "@/shared/ui/mask-icon";
import { Select } from "@/shared/ui/select";

import checkIcon from "../assets/check.svg";
import crossIcon from "../assets/cross.svg";
import deleteIcon from "../assets/delete.svg";
import editIcon from "../assets/edit.svg";
import photoIcon from "../assets/photo.svg";
import telegramIcon from "../assets/telegram.svg";

import { SettingsRow } from "./settings-row";

export type ProfileContact = {
  kind: "telegram" | "phone";
  value: string;
};

export type ProfileValue = {
  name: string;
  contact: ProfileContact;
  avatar: string | null;
};

type ProfileEditorProps = {
  value: ProfileValue;
  contactOptions: readonly ProfileContact[];
  email?: string | null;
  onApply: (next: ProfileValue) => void;
};

function contactKey(contact: ProfileContact) {
  return `${contact.kind}:${contact.value}`;
}

function contactLabel(contact: ProfileContact) {
  return contact.kind === "telegram"
    ? `@${contact.value.replace(/^@+/, "")}`
    : contact.value;
}

function initialsForName(name: string) {
  return name.trim().charAt(0).toLocaleUpperCase();
}

export function ProfileEditor({
  value,
  contactOptions,
  email,
  onApply,
}: ProfileEditorProps) {
  const { t } = useTranslation("settings");
  const avatarErrorId = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [readingAvatar, setReadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (editing) {
      nameInputRef.current?.focus();
    } else if (wasEditingRef.current) {
      editButtonRef.current?.focus();
    }
    wasEditingRef.current = editing;
  }, [editing]);

  useEffect(() => () => readerRef.current?.abort(), []);

  function startEditing() {
    setDraft(value);
    setAvatarError(null);
    setEditing(true);
  }

  function cancelEditing() {
    readerRef.current?.abort();
    readerRef.current = null;
    setReadingAvatar(false);
    setAvatarError(null);
    setEditing(false);
  }

  function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    readerRef.current?.abort();
    readerRef.current = null;
    setReadingAvatar(false);

    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setAvatarError(t("avatarUploadHint"));
      return;
    }

    const reader = new FileReader();
    readerRef.current = reader;
    setReadingAvatar(true);
    reader.onload = () => {
      if (readerRef.current !== reader) return;
      const result = reader.result;
      if (typeof result === "string") {
        setDraft((current) => ({ ...current, avatar: result }));
        setAvatarError(null);
      }
      setReadingAvatar(false);
      readerRef.current = null;
    };
    reader.onerror = () => {
      if (readerRef.current !== reader) return;
      setAvatarError(t("avatarUploadHint"));
      setReadingAvatar(false);
      readerRef.current = null;
    };
    reader.readAsDataURL(file);
  }

  function applyPreview() {
    if (readingAvatar) return;
    onApply({
      name: draft.name.trim(),
      contact: draft.contact,
      avatar: draft.avatar,
    });
    setEditing(false);
  }

  const visible = editing ? draft : value;
  const avatarInitials = initialsForName(visible.name) || "N";
  const selectOptions = contactOptions.map((contact) => ({
    value: contactKey(contact),
    label: contactLabel(contact),
  }));

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
          {avatarError}
        </p>
      )}
      <Card className="overflow-hidden border-0">
        <div className="grid min-h-[100px] grid-cols-[60px_minmax(0,1fr)] items-center gap-x-4 gap-y-4 px-4 pb-4 pt-6 sm:flex sm:flex-wrap sm:gap-4 sm:px-6">
          <div className="relative size-[60px] shrink-0">
            <button
              aria-describedby={avatarError ? avatarErrorId : undefined}
              aria-label={editing ? t("uploadAvatar") : undefined}
              className="flex size-full items-center justify-center overflow-hidden rounded-full bg-brand-20 text-[33px] font-semibold text-brand-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default"
              disabled={!editing}
              onClick={() => avatarInputRef.current?.click()}
              type="button"
            >
              {visible.avatar ? (
                <img
                  alt=""
                  className="size-full rounded-full object-cover"
                  src={visible.avatar}
                />
              ) : (
                avatarInitials
              )}
            </button>
            {editing && (
              <>
                <input
                  ref={avatarInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={chooseAvatar}
                  type="file"
                />
                {draft.avatar && (
                  <button
                    aria-label={t("removeAvatar")}
                    className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-avatar-control text-avatar-control-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    onClick={() =>
                      setDraft((current) => ({ ...current, avatar: null }))
                    }
                    type="button"
                  >
                    <MaskIcon src={deleteIcon} />
                  </button>
                )}
                {!draft.avatar && (
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
            {editing ? (
              <label className="block h-12 w-full max-w-[240px] rounded-[10px] bg-subtle px-3 py-1.5">
                <span className="block text-[11px] leading-4 text-muted">
                  {t("profileName")}
                </span>
                <Input
                  ref={nameInputRef}
                  autoComplete="name"
                  className="min-h-0 h-5 border-0 bg-transparent p-0 text-sm focus-visible:border-0 focus-visible:ring-0"
                  maxLength={80}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder={t("namePlaceholder")}
                  value={draft.name}
                />
              </label>
            ) : (
              <strong className="block break-words text-xl font-bold text-ink sm:text-2xl">
                {value.name || t("nameNotSet")}
              </strong>
            )}
          </div>

          {editing ? (
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
                disabled={readingAvatar}
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
            {email && (
              <Badge tone="success">
                <CircleCheck aria-hidden="true" className="size-3.5" />
                {t("verified")}
              </Badge>
            )}
          </div>
        </SettingsRow>
        <SettingsRow
          divider
          label={
            editing ? (
              <span className="flex flex-col gap-1 font-normal">
                <span className="flex items-center gap-2">
                  {draft.contact.kind === "telegram" ? (
                    <MaskIcon src={telegramIcon} />
                  ) : (
                    <Phone aria-hidden="true" className="size-4" />
                  )}
                  {t(draft.contact.kind === "telegram" ? "telegram" : "phone")}
                </span>
                <span className="text-xs text-muted">
                  {t("supportContact")}
                </span>
              </span>
            ) : (
              t(value.contact.kind === "telegram" ? "telegram" : "phone")
            )
          }
        >
          {editing ? (
            <div className="relative max-w-full">
              {draft.contact.kind === "phone" && (
                <Phone
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted"
                />
              )}
              <Select
                ariaLabel={t("supportContactSelection")}
                className={`h-10 w-[230px] max-w-full min-w-0 rounded-[10px] border-0 bg-subtle font-bold text-muted hover:bg-subtle/80 disabled:cursor-default disabled:opacity-100 ${draft.contact.kind === "phone" ? "pl-9" : "pl-3"}`}
                disabled={contactOptions.length < 2}
                onValueChange={(selected) => {
                  const contact = contactOptions.find(
                    (option) => contactKey(option) === selected,
                  );
                  if (contact) {
                    setDraft((current) => ({ ...current, contact }));
                  }
                }}
                options={selectOptions}
                value={contactKey(draft.contact)}
              />
            </div>
          ) : value.contact.value ? (
            <span className="break-all">{contactLabel(value.contact)}</span>
          ) : (
            "—"
          )}
        </SettingsRow>
      </Card>
    </>
  );
}
