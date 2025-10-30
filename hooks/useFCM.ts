import { useEffect } from "react";
import { registerFCMToken } from "@/lib/firebase/registerFCMtoken";

export function useFCM(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    registerFCMToken(userId);
  }, [userId]);
}
