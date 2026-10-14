import { useTranslation } from "react-i18next";

import type { ChatMessage } from "../api/conversations-api";

import { MessagePhoto } from "./message-photo";

type MessagePart = ChatMessage["parts"][number];

const rowPatterns: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [3, 2, 2],
  8: [3, 2, 3],
  9: [3, 3, 3],
  10: [3, 2, 3, 2],
};

function photoRatio(part: MessagePart): number {
  if (!part.width || !part.height) return 4 / 3;
  return Math.max(0.55, Math.min(2.5, part.width / part.height));
}

function rowSizes(count: number): number[] {
  const rows: number[] = [];
  let remaining = count;
  while (remaining > 10) {
    rows.push(3);
    remaining -= 3;
  }
  return [...rows, ...(rowPatterns[remaining] ?? [])];
}

export function MessagePhotoMosaic({
  allPhotos,
  photos,
  refreshMessage,
  onOpen,
}: {
  allPhotos: MessagePart[];
  photos: MessagePart[];
  refreshMessage: () => Promise<ChatMessage>;
  onOpen: (partId: string) => void;
}) {
  const { t } = useTranslation("chats");
  const openLabel = (partId: string) =>
    t("openPhotoPosition", {
      current: allPhotos.findIndex((photo) => photo.id === partId) + 1,
      total: allPhotos.length,
    });

  if (photos.length === 1) {
    const photo = photos[0];
    if (!photo) return null;
    return (
      <MessagePhoto
        key={photo.id}
        openLabel={openLabel(photo.id)}
        onOpen={() => onOpen(photo.id)}
        part={photo}
        refreshMessage={refreshMessage}
      />
    );
  }

  const sizes = rowSizes(photos.length);
  const rows = sizes.map((size, index) => {
    const offset = sizes
      .slice(0, index)
      .reduce((total, previous) => total + previous, 0);
    return photos.slice(offset, offset + size);
  });

  return (
    <div className="flex w-[min(78vw,32rem)] max-w-full flex-col gap-[2px]">
      {rows.map((row, index) => {
        const ratios = row.map(photoRatio);
        const rowRatio = Math.max(
          1.8,
          Math.min(
            4.2,
            ratios.reduce((total, ratio) => total + ratio, 0),
          ),
        );

        return (
          <div
            className="flex w-full min-w-0 gap-[2px]"
            key={row[0]?.id ?? index}
            style={{ aspectRatio: rowRatio }}
          >
            {row.map((photo, index) => (
              <div
                className="min-w-0 overflow-hidden"
                key={photo.id}
                style={{ flex: `${ratios[index] ?? 1} 1 0%` }}
              >
                <MessagePhoto
                  layout="tile"
                  onOpen={() => onOpen(photo.id)}
                  openLabel={openLabel(photo.id)}
                  part={photo}
                  refreshMessage={refreshMessage}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
