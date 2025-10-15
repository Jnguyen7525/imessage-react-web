import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// import { Button } from "@/components/ui/button";

import createClient from "@/lib/supabase/client";

import { ArrowRightIcon, LogOut } from "lucide-react";
import useUser from "@/hooks/useUser";
import { LOGIN_PATH } from "../constants/common";

export default function AuthButton() {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === LOGIN_PATH) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(LOGIN_PATH);
    router.refresh();
  };

  if (loading) return null;

  if (user) {
    return (
      <button onClick={handleLogout}>
        <span>Logout</span>
        <LogOut className="opacity-60" size={16} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button className="group">
      <Link href={LOGIN_PATH}>
        <span>Login</span>
        <ArrowRightIcon
          className="opacity-60 transition-transform group-hover:translate-x-0.5"
          size={16}
          aria-hidden="true"
        />
      </Link>
    </button>
  );
}
