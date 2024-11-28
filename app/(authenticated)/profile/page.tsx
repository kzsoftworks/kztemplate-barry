import { authConfig } from 'app/lib/auth0';
import { Label } from 'app/lib/components/ui/label';
import { User, Mail, BadgeCheck } from 'lucide-react';

export default async function Profile() {
  const session = await authConfig.getSession();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <img
            src={session?.user?.picture || '/default-avatar.png'}
            alt="Profile Picture"
            className="w-24 h-24 rounded-full border-2 border-blue-500 dark:border-blue-300"
          />
          <h1 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
            {session?.user?.name || 'Unknown User'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {session?.user?.email}
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-500 dark:text-blue-300" />
            <p className="text-gray-700 dark:text-gray-300">
              {session?.user?.email || 'No Email'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-green-500 dark:text-green-300" />
            <p className="text-gray-700 dark:text-gray-300">
              {session?.user?.name || 'No Name'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <BadgeCheck className="w-5 h-5 text-purple-500 dark:text-purple-300" />
            <p className="text-gray-700 dark:text-gray-300">
              {session?.user?.sub || 'No ID'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
