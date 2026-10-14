import { useCallback, useEffect, useRef, useState } from "react";

export type SelectedAttachment = {
  id: string;
  kind: "photo" | "file";
  file: File;
  previewUrl: string | null;
};

export function useMediaAttachments() {
  const [attachments, setAttachments] = useState<SelectedAttachment[]>([]);
  const previewUrls = useRef(new Map<string, string>());

  const addAttachments = useCallback(
    (files: File[], kind: SelectedAttachment["kind"]) => {
      const selected = files.map((file): SelectedAttachment => {
        const id = crypto.randomUUID();
        const previewUrl = kind === "photo" ? URL.createObjectURL(file) : null;
        if (previewUrl) previewUrls.current.set(id, previewUrl);
        return { id, kind, file, previewUrl };
      });
      setAttachments((current) => [...current, ...selected]);
    },
    [],
  );

  const removeAttachments = useCallback((ids: string[]) => {
    const removed = new Set(ids);
    for (const id of removed) {
      const url = previewUrls.current.get(id);
      if (url) URL.revokeObjectURL(url);
      previewUrls.current.delete(id);
    }
    setAttachments((current) =>
      current.filter((attachment) => !removed.has(attachment.id)),
    );
  }, []);

  const clearAttachments = useCallback(() => {
    for (const url of previewUrls.current.values()) URL.revokeObjectURL(url);
    previewUrls.current.clear();
    setAttachments([]);
  }, []);

  useEffect(
    () => () => {
      for (const url of previewUrls.current.values()) URL.revokeObjectURL(url);
      previewUrls.current.clear();
    },
    [],
  );

  return {
    attachments,
    addAttachments,
    removeAttachments,
    clearAttachments,
  };
}
