import { useState } from "react";

type ProfileFields = { name: string; telegram: string };

export function useProfileDraft(value: ProfileFields) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileFields>({
    name: value.name,
    telegram: value.telegram,
  });

  function start() {
    setDraft({ name: value.name, telegram: value.telegram });
    setEditing(true);
  }

  function stop() {
    setEditing(false);
  }

  function setName(name: string) {
    setDraft((current) => ({ ...current, name }));
  }

  function setTelegram(telegram: string) {
    setDraft((current) => ({ ...current, telegram }));
  }

  const telegram = draft.telegram.trim();
  const telegramValid = !telegram || /^@?[a-zA-Z0-9_]{5,32}$/.test(telegram);
  const normalizedTelegram = telegram ? `@${telegram.replace(/^@/, "")}` : "";

  return {
    draft,
    editing,
    normalizedTelegram,
    setName,
    setTelegram,
    start,
    stop,
    telegramValid,
  };
}
