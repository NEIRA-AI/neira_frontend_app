import { useEffect, useRef, useState } from "react";

import type { SessionUser } from "@/features/auth";

import type { AvatarChange } from "./use-avatar-preview";

export type ProfilePreview = {
  name: string;
  telegram: string;
  avatarSrc: string;
};

export type ProfilePreviewInput = Pick<ProfilePreview, "name" | "telegram"> & {
  avatar: AvatarChange;
};

export function useProfilePreview(user: SessionUser | null) {
  const [preview, setPreview] = useState<ProfilePreview | null>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  const profile = preview ?? {
    name: user?.name ?? "",
    telegram: user?.telegram ?? "",
    avatarSrc: user?.avatar_url ?? "",
  };

  function applyProfile({ name, telegram, avatar }: ProfilePreviewInput) {
    if (!user) return;

    let avatarSrc = profile.avatarSrc;
    let nextUrl = objectUrl.current;

    if (avatar.action === "replace") {
      nextUrl = URL.createObjectURL(avatar.file);
      avatarSrc = nextUrl;
    } else if (avatar.action === "remove") {
      nextUrl = null;
      avatarSrc = "";
    }

    const previousUrl = objectUrl.current;
    objectUrl.current = nextUrl;
    setPreview({ name, telegram, avatarSrc });
    if (previousUrl && previousUrl !== nextUrl) {
      URL.revokeObjectURL(previousUrl);
    }
  }

  return { profile, applyProfile };
}
