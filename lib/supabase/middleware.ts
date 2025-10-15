// import { NextResponse, type NextRequest } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// import { getUserRole } from "@/lib/get-user-role";

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   // Create a Supabase client
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             request.cookies.set(name, value)
//           );
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // Get the current user from Supabase
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Get the user's role using the custom getUserRole function
//   const role = await getUserRole();

//   // Redirect non-admin users trying to access admin pages to the home page
//   if (
//     user &&
//     role !== "admin" &&
//     request.nextUrl.pathname.startsWith("/admin")
//   ) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/";
//     return NextResponse.redirect(url);
//   }

//   // Redirect unauthenticated users to sign-in page
//   if (
//     !user &&
//     !request.nextUrl.pathname.startsWith("/signin") &&
//     !request.nextUrl.pathname.startsWith("/auth")
//   ) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/signin";
//     url.searchParams.set("next", request.nextUrl.pathname);
//     return NextResponse.redirect(url);
//   }

//   // Redirect authenticated users attempting to access the sign-in page to the home page
//   if (user && request.nextUrl.pathname.startsWith("/signin")) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/";
//     return NextResponse.redirect(url);
//   }

//   return supabaseResponse;
// }

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { LOGIN_PATH, SIGNUP_PATH } from "@/app/constants/common";

export default async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Initialize Supabase server client with custom cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Re-create the response with updated cookies
          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Fetch the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Redirect unauthenticated users to login, except for auth routes
  if (!user && !path.startsWith(LOGIN_PATH) && !path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Prevent authenticated users from accessing the login page or signup page
  if ((user && path.startsWith(LOGIN_PATH)) || path.startsWith(SIGNUP_PATH)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
