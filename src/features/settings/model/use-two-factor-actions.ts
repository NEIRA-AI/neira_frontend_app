import { useQueryClient } from "@tanstack/react-query";

import {
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  regenerateBackupCodes,
  twoFactorQueryKey,
} from "../api/two-factor-api";

export function useTwoFactorActions() {
  const queryClient = useQueryClient();

  return {
    beginSetup: beginTwoFactorSetup,
    confirmSetup: async (code: string) => {
      const result = await confirmTwoFactorSetup(code);
      await queryClient.invalidateQueries({ queryKey: twoFactorQueryKey });
      return result;
    },
    disable: async (input: { current_password: string; code: string }) => {
      await disableTwoFactor(input);
      await queryClient.invalidateQueries({ queryKey: twoFactorQueryKey });
    },
    regenerate: async (input: { current_password: string; code: string }) => {
      const result = await regenerateBackupCodes(input);
      await queryClient.invalidateQueries({ queryKey: twoFactorQueryKey });
      return result;
    },
  };
}
