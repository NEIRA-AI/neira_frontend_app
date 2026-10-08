import { useEffect, useRef, useState } from "react";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

export type AvatarChange =
  { action: "keep" } | { action: "remove" } | { action: "replace"; file: File };

type AvatarDraft =
  | { action: "keep" }
  | { action: "remove" }
  | { action: "replace"; file: File; url: string };

export function useAvatarPreview() {
  const [draft, setDraft] = useState<AvatarDraft>({ action: "keep" });
  const [hasError, setHasError] = useState(false);
  const objectUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  function releaseUrl() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  }

  function select(file: File) {
    if (
      !allowedTypes.has(file.type) ||
      file.size === 0 ||
      file.size > maxFileSize
    ) {
      setHasError(true);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      releaseUrl();
      objectUrl.current = url;
      setDraft({ action: "replace", file, url });
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }

  function remove() {
    releaseUrl();
    setDraft({ action: "remove" });
    setHasError(false);
  }

  function reset() {
    releaseUrl();
    setDraft({ action: "keep" });
    setHasError(false);
  }

  const previewUrl =
    draft.action === "replace"
      ? draft.url
      : draft.action === "remove"
        ? ""
        : null;
  const change: AvatarChange =
    draft.action === "replace"
      ? { action: "replace", file: draft.file }
      : { action: draft.action };

  return { change, hasError, previewUrl, remove, reset, select };
}
