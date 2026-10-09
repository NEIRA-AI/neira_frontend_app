export type ChannelNotice = {
  kind: "loading" | "success" | "error";
  message: string;
} | null;

export type ChannelNoticeSink = (notice: ChannelNotice) => void;
