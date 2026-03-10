import { useQuery } from "@tanstack/react-query";

import { toApiError } from "../../lib/api";
import { me, type AuthUser } from "./api";

export function useMe() {
  return useQuery<AuthUser | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await me();
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.status === 401 || apiError.status === 403) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}
