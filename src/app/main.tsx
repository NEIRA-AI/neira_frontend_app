import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import { router } from "@/app/router.tsx";
import { initI18n } from "@/app/i18n/i18n";
import {
  BootstrapErrorScreen,
  RootErrorBoundary,
} from "@/features/error-boundary";
import "@/app/index.css";

const root = createRoot(document.getElementById("root")!);

try {
  await initI18n();

  root.render(
    <StrictMode>
      <RootErrorBoundary>
        <RouterProvider router={router} />
      </RootErrorBoundary>
    </StrictMode>,
  );
} catch (error) {
  if (import.meta.env.DEV) console.error("Application setup failed", error);
  root.render(<BootstrapErrorScreen />);
}
