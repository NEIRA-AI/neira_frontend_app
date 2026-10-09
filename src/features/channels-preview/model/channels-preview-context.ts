import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { ChannelPreview } from "./channel-preview";

type ChannelsPreviewContextValue = {
  channels: ChannelPreview[];
  setChannels: Dispatch<SetStateAction<ChannelPreview[]>>;
};

export const ChannelsPreviewContext =
  createContext<ChannelsPreviewContextValue | null>(null);

export function useChannelsPreview() {
  const context = useContext(ChannelsPreviewContext);
  if (!context) {
    throw new Error("ChannelsPreviewProvider is missing");
  }
  return context;
}
