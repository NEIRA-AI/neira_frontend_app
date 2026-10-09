import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import type { ChannelNotice } from "./channel-notice";

type RouteNotice = "connectSuccess" | "deleteSuccess";

export function useChannelNotice(routeNotice?: RouteNotice) {
  const { t } = useTranslation("channels");
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<ChannelNotice>(() =>
    routeNotice &&
    (location.state as { channelNotice?: string } | null)?.channelNotice ===
      routeNotice
      ? { kind: "success", message: t(routeNotice) }
      : null,
  );

  useEffect(() => {
    if (
      routeNotice &&
      (location.state as { channelNotice?: string } | null)?.channelNotice ===
        routeNotice
    ) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, routeNotice]);

  const dismiss = useCallback(() => setNotice(null), []);
  return { notice, notify: setNotice, dismiss };
}
