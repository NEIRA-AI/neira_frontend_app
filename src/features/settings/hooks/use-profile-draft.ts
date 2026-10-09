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
  const nameLength = Array.from(draft.name.trim()).length;
  const nameValid = nameLength >= 2 && nameLength <= 120;
  const telegramValid =
    draft.telegram === value.telegram ||
    !telegram ||
    /^@?[a-zA-Z0-9_]{5,32}$/.test(telegram);
  const normalizedTelegram = telegram
    ? draft.telegram === value.telegram
      ? telegram
      : `@${telegram.replace(/^@/, "")}`
    : null;

  return {
    draft,
    editing,
    nameValid,
    normalizedTelegram,
    setName,
    setTelegram,
    start,
    stop,
    telegramValid,
  };
}
