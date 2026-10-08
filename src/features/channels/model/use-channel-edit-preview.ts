import { useState, type FormEvent } from "react";

import type { ChannelPreview } from "./channel-preview";
import { useChannelsPreview } from "./channels-preview-context";

type Draft = { name: string; agent: string; enabled: boolean };

function initialDraft(channel: ChannelPreview): Draft {
  return {
    name: channel.name,
    agent: channel.agent ? "sample" : "none",
    enabled: channel.status === "active" || channel.status === "checking",
  };
}

export function useChannelEditPreview(
  channel: ChannelPreview,
  sampleAgentName: string,
) {
  const { setChannels } = useChannelsPreview();
  const [saved, setSaved] = useState(() => initialDraft(channel));
  const [draft, setDraft] = useState(saved);
  const [showPreviewNotice, setShowPreviewNotice] = useState(false);
  const [turnOffOpen, setTurnOffOpen] = useState(false);
  const isDirty =
    draft.name !== saved.name ||
    draft.agent !== saved.agent ||
    draft.enabled !== saved.enabled;
  const nameIsEmpty = draft.name.trim().length === 0;

  function updateDraft(update: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...update }));
    setShowPreviewNotice(false);
  }

  function savePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDirty || nameIsEmpty) return;
    const nextDraft = { ...draft, name: draft.name.trim() };
    setChannels((current) =>
      current.map((item) =>
        item.id === channel.id
          ? {
              ...item,
              name: nextDraft.name,
              agent:
                nextDraft.agent === "none"
                  ? null
                  : (item.agent ?? sampleAgentName),
              status:
                nextDraft.enabled === saved.enabled
                  ? item.status
                  : nextDraft.enabled
                    ? "active"
                    : "stopped",
            }
          : item,
      ),
    );
    setSaved(nextDraft);
    setDraft(nextDraft);
    setShowPreviewNotice(true);
  }

  function chooseEnabled(enabled: boolean) {
    if (!enabled && draft.enabled) {
      setTurnOffOpen(true);
      return;
    }
    updateDraft({ enabled });
  }

  function confirmTurnOff() {
    updateDraft({ enabled: false });
    setTurnOffOpen(false);
  }

  return {
    draft,
    isDirty,
    nameIsEmpty,
    showPreviewNotice,
    turnOffOpen,
    updateDraft,
    savePreview,
    chooseEnabled,
    closeTurnOff: () => setTurnOffOpen(false),
    confirmTurnOff,
  };
}
