import { createServerClient } from "@supabase/ssr";

const supabaseAdmin = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  }
);

export default supabaseAdmin;
