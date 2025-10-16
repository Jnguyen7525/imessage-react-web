// "use client";
// import createClient from "@/lib/supabase/client";
// import { useEffect, useState } from "react";
// import Header from "../components/Header";

// export default function ProfilePage() {
//   const supabase = createClient();
//   const [user, setUser] = useState<any>(null);
//   const [profile, setProfile] = useState<any>(null);
//   const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
//   const [newPassword, setNewPassword] = useState("");

//   useEffect(() => {
//     const fetchUser = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       setUser(user);

//       if (user) {
//         const { data: profile } = await supabase
//           .from("users")
//           .select("id, name, email, avatar_url")
//           .eq("id", user.id)
//           .single();

//         setProfile(profile);
//         setAvatarUrl(profile?.avatar_url ?? null);
//       }
//     };

//     fetchUser();
//   }, []);

//   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !user) return;

//     const filePath = `${user.id}/avatar.png`;
//     const { error: uploadError } = await supabase.storage
//       .from("avatars")
//       .upload(filePath, file, { upsert: true });

//     if (uploadError) {
//       alert("Upload failed: " + uploadError.message);
//       return;
//     }

//     const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
//     const publicUrl = data.publicUrl;
//     setAvatarUrl(publicUrl);

//     // ✅ Sync avatar URL to public.users
//     const { error: updateError } = await supabase
//       .from("users")
//       .update({ avatar_url: publicUrl })
//       .eq("id", user.id);

//     if (updateError) {
//       alert("Failed to update avatar URL in profile: " + updateError.message);
//     }
//   };

//   const handleEnableGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${window.location.origin}/auth/callback?next=/profile&flow=link-google`,
//       },
//     });

//     if (error) {
//       alert("Failed to initiate Google login: " + error.message);
//     }
//   };

//   const handleChangePassword = async () => {
//     const { error } = await supabase.auth.updateUser({ password: newPassword });

//     if (error) {
//       alert("Failed to update password: " + error.message);
//     } else {
//       alert("Password updated successfully.");
//       setNewPassword("");
//     }
//   };

//   const handleDeleteAccount = async () => {
//     const confirmed = confirm("Are you sure you want to delete your account?");
//     if (!confirmed || !user) return;

//     const response = await fetch("/api/delete-account", {
//       method: "POST",
//       body: JSON.stringify({ userId: user.id }),
//     });

//     if (response.ok) {
//       alert("Account deleted.");
//       window.location.href = "/";
//     } else {
//       alert("Failed to delete account.");
//     }
//   };

//   if (!user || !profile) return <p className="p-6">Loading profile...</p>;

//   return (
//     <div className="w-full h-full flex flex-col">
//       <Header />
//       <div className="p-6 max-w-md mx-auto flex flex-col w-full h-full justify-start items-start">
//         <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

//         {avatarUrl && (
//           <img
//             src={avatarUrl}
//             alt="Avatar"
//             className="w-24 h-24 rounded-full object-cover mb-4"
//           />
//         )}
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleAvatarUpload}
//           className="mb-4 border rounded-lg px-2 cursor-pointer"
//         />

//         <div className="flex flex-col gap-5">
//           <p>
//             <strong>Name:</strong> {profile.name}
//           </p>
//           <p>
//             <strong>Email:</strong> {profile.email}
//           </p>
//           <p>
//             <strong>Login Method:</strong> {user.app_metadata?.provider}
//           </p>
//           <p>
//             <strong>Created:</strong>{" "}
//             {new Date(user.created_at).toLocaleString()}
//           </p>
//         </div>

//         {user?.app_metadata?.provider === "email" && (
//           <>
//             <div className="mt-6">
//               <h2 className="text-lg font-semibold mb-2">Change Password</h2>
//               <input
//                 type="password"
//                 placeholder="New password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full mb-2 p-2 border rounded"
//               />
//               <button
//                 className="bg-purple-600 text-white py-2 px-4 rounded-lg"
//                 onClick={handleChangePassword}
//               >
//                 Update Password
//               </button>
//             </div>

//             <div className="mt-6">
//               <h2 className="text-lg font-semibold mb-2">
//                 Enable Google Login
//               </h2>
//               <button
//                 className="bg-zinc-800 text-white py-2 px-4 rounded-lg"
//                 onClick={handleEnableGoogleLogin}
//               >
//                 Link Google Account
//               </button>
//             </div>
//           </>
//         )}

//         <div className="mt-6">
//           {/* <h2 className="text-lg font-semibold mb-2 text-red-600">
//             Danger Zone
//           </h2> */}
//           <button
//             className="bg-red-600 text-white py-2 px-4 rounded-lg cursor-pointer"
//             onClick={handleDeleteAccount}
//           >
//             Delete Account
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import createClient from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, name, email, avatar_url")
          .eq("id", user.id)
          .single();

        setProfile(profile);
        setAvatarUrl(profile?.avatar_url ?? null);

        // ✅ Extract linked providers from identities
        const providers =
          user.identities?.map((identity: any) => identity.provider) ?? [];
        setLinkedProviders(providers);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `${user.id}/avatar.png`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    setAvatarUrl(publicUrl);

    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      alert("Failed to update avatar URL in profile: " + updateError.message);
    }
  };

  const handleEnableGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile&flow=link-google`,
      },
    });

    if (error) {
      alert("Failed to initiate Google login: " + error.message);
    }
  };

  const handleChangePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert("Failed to update password: " + error.message);
    } else {
      alert("Password updated successfully.");
      setNewPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (!confirmed || !user) return;

    const response = await fetch("/api/delete-account", {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });

    if (response.ok) {
      alert("Account deleted.");
      window.location.href = "/";
    } else {
      alert("Failed to delete account.");
    }
  };

  if (!user || !profile) return <p className="p-6">Loading profile...</p>;

  const provider = user.app_metadata?.provider;

  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="p-6 max-w-md mx-auto flex flex-col w-full h-full justify-start items-start">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="mb-4 border rounded-lg px-2 cursor-pointer"
        />

        <div className="flex flex-col gap-5">
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Login Method:</strong> {provider}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(user.created_at).toLocaleString()}
          </p>
          <p>
            <strong>Linked Providers:</strong>{" "}
            {linkedProviders.join(", ") || "None"}
          </p>
        </div>

        {provider === "email" && (
          <>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Change Password</h2>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />
              <button
                className="bg-purple-600 text-white py-2 px-4 rounded-lg"
                onClick={handleChangePassword}
              >
                Update Password
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">
                Enable Google Login
              </h2>
              <button
                className="bg-zinc-800 text-white py-2 px-4 rounded-lg"
                onClick={handleEnableGoogleLogin}
              >
                Link Google Account
              </button>
            </div>
          </>
        )}

        {provider === "google" && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Add Password Login</h2>
            <input
              type="password"
              placeholder="Create password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <button
              className="bg-purple-600 text-white py-2 px-4 rounded-lg cursor-pointer"
              onClick={handleChangePassword}
            >
              Set Password
            </button>
          </div>
        )}

        <div className="mt-6">
          <button
            className="bg-red-600 text-white py-2 px-4 rounded-lg cursor-pointer"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
