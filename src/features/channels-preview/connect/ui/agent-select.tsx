import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type AgentSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  onCreate: () => void;
};

export function AgentSelect({
  value,
  onValueChange,
  onCreate,
}: AgentSelectProps) {
  const { t } = useTranslation("channelConnectPreview");

  return (
    <SelectPrimitive.Root
      onValueChange={(next) => {
        if (next === "create") onCreate();
        else onValueChange(next);
      }}
      value={value}
    >
      <SelectPrimitive.Trigger
        aria-label={t("selectAgent")}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-subtle px-4 text-left text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <SelectPrimitive.Value placeholder={t("selectAgent")} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-60 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-line bg-surface p-1 text-ink shadow-xl"
          position="popper"
          sideOffset={6}
        >
          <SelectPrimitive.Viewport>
            <SelectPrimitive.Item
              className="relative flex min-h-10 cursor-pointer items-center rounded-lg px-3 text-sm text-brand outline-none data-highlighted:bg-brand-soft"
              value="create"
            >
              <SelectPrimitive.ItemText>
                {t("createAgentOption")}
              </SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
            <div aria-hidden="true" className="my-1 border-t border-line" />
            {[
              { value: "preview-agent", connected: false },
              { value: "preview-agent-connected", connected: true },
            ].map((agent) => (
              <SelectPrimitive.Item
                className="relative flex min-h-11 cursor-pointer items-center gap-2 rounded-lg py-2 pl-3 pr-9 text-sm outline-none data-highlighted:bg-brand-soft"
                key={agent.value}
                value={agent.value}
              >
                <SelectPrimitive.ItemText>
                  {t("agentName")}
                </SelectPrimitive.ItemText>
                {agent.connected && (
                  <span className="rounded-full bg-danger-soft px-2 py-1 text-[11px] leading-none text-danger">
                    {t("connectedToChannel")}
                  </span>
                )}
                <SelectPrimitive.ItemIndicator className="absolute right-3 text-brand">
                  <Check aria-hidden="true" className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
