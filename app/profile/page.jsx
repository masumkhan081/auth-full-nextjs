import { getSessionFromRequest } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSessionFromRequest();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { user } = session;

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">Profile & Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Details Section */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <div className="bg-white border rounded-md p-6 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-zinc-800">Account Information</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-sm text-zinc-500 font-medium">Name</span>
                <p className="text-lg">{user.name}</p>
              </div>
              
              <div>
                <span className="text-sm text-zinc-500 font-medium">Email</span>
                <p className="text-lg flex items-center gap-2">
                  {user.email}
                  {user.emailVerified ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium dark:bg-green-900/30 dark:text-green-400">Verified</span>
                  ) : (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium dark:bg-yellow-900/30 dark:text-yellow-400">Unverified</span>
                  )}
                </p>
              </div>

              <div>
                <span className="text-sm text-zinc-500 font-medium">Role</span>
                <p className="text-lg capitalize">{user.role?.toLowerCase() || 'User'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white border rounded-md p-6 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-zinc-800">Security</h2>
            
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/auth/change-password" className="text-blue-600 hover:underline font-medium">
                  Change Password
                </Link>
              </li>
              <li>
                <Link href="/auth/sessions" className="text-blue-600 hover:underline font-medium">
                  Manage Devices
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Placeholder for future OAuth Linking */}
          <div className="bg-white border rounded-md p-6 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-zinc-800">Connected Accounts</h2>
            <p className="text-sm text-zinc-500 italic">
              Social account linking (Google, GitHub) will appear here.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
