import { useCallback, useEffect, useRef, useState } from "react";

export function usePhotoPreview() {
  const [selection, setSelection] = useState<{
    photo: File;
    previewUrl: string;
  } | null>(null);
  const activeUrl = useRef<string | null>(null);

  const setPhoto = useCallback((photo: File | null) => {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    const previewUrl = photo ? URL.createObjectURL(photo) : null;
    activeUrl.current = previewUrl;
    setSelection(photo && previewUrl ? { photo, previewUrl } : null);
  }, []);

  useEffect(
    () => () => {
      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    },
    [],
  );

  return {
    photo: selection?.photo ?? null,
    previewUrl: selection?.previewUrl ?? null,
    setPhoto,
  };
}
