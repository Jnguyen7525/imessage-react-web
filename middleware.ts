// import { type NextRequest } from "next/server";
// import updateSession from "./lib/supabase/middleware";

// export async function middleware(request: NextRequest) {
//   return await updateSession(request);
// }

// export const config = {
//   matcher: ["/profile", "/login", "/signup"],
// };

import { type NextRequest, NextResponse } from "next/server";
import updateSession from "./lib/supabase/middleware";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;
const ipHits = new Map<string, { count: number; timestamp: number }>();

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ Rate limit only /api/precheck-login
  // if (pathname === "/api/precheck-login") {
  //   const ip =
  //     request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  //     "unknown";
  //   const now = Date.now();
  //   const record = ipHits.get(ip) || { count: 0, timestamp: now };
  //   const elapsed = now - record.timestamp;

  //   if (elapsed > RATE_LIMIT_WINDOW) {
  //     ipHits.set(ip, { count: 1, timestamp: now });
  //   } else {
  //     if (record.count >= RATE_LIMIT_MAX) {
  //       return NextResponse.json(
  //         { error: "Too many requests. Please try again later." },
  //         { status: 429 }
  //       );
  //     }
  //     ipHits.set(ip, { count: record.count + 1, timestamp: record.timestamp });
  //   }
  // }

  // ✅ Always hydrate session for protected routes
  return await updateSession(request);
}

// ✅ Optional: scope middleware to specific routes
export const config = {
  matcher: ["/profile", "/login", "/signup"],
};
