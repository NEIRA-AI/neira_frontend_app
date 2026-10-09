import { useState, type ReactNode } from "react";

import { sampleChannels, type ChannelPreview } from "./channel-preview";
import { ChannelsPreviewContext } from "./channels-preview-context";

export function ChannelsPreviewProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<ChannelPreview[]>(() =>
    sampleChannels.map((channel) => ({ ...channel })),
  );

  return (
    <ChannelsPreviewContext.Provider value={{ channels, setChannels }}>
      {children}
    </ChannelsPreviewContext.Provider>
  );
}
