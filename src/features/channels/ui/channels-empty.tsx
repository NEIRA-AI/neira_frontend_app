import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import channelsIcon from "@/shared/assets/channels.svg";
import { ROUTES } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { MaskIcon } from "@/shared/ui/mask-icon";

import telegramIcon from "../assets/telegram.png";
import vkIcon from "../assets/vk.svg";

const socialIcons = [telegramIcon, vkIcon];

export function ChannelsEmpty({ canManage }: { canManage: boolean }) {
  const { t } = useTranslation("channels");

  return (
    <section className="flex min-h-96 flex-col items-center justify-center rounded-2xl bg-surface px-5 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <MaskIcon className="size-9" src={channelsIcon} />
      </span>
      <h2 className="mt-6 text-xl font-bold text-ink">
        {t(canManage ? "emptyTitle" : "emptyReadOnlyTitle")}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        {t(canManage ? "emptyDescription" : "emptyReadOnlyDescription")}
      </p>
      <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-brand-soft px-4 py-2">
        <span aria-hidden="true" className="flex -space-x-2">
          {socialIcons.map((icon) => (
            <img
              key={icon}
              alt=""
              className="size-6 rounded-full border-2 border-surface"
              height="30"
              src={icon}
              width="30"
            />
          ))}
        </span>
        <span className="text-sm font-semibold text-brand-strong">
          {t("supportedNow")}
        </span>
      </div>
      {canManage && (
        <Button asChild className="mt-8" size="lg">
          <Link to={ROUTES.CHANNELS_CONNECT}>
            <Plus aria-hidden="true" className="size-4" />
            {t("connect")}
          </Link>
        </Button>
      )}
    </section>
  );
}
