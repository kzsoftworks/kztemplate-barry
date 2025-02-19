import { User, Mail, BadgeCheck } from 'lucide-react';
import { getServerAppUser } from '@/utils/getServerAppUser';

export default async function Profile() {
  const { user } = await getServerAppUser();

  return (
    <div>
      <div>
        <div>
          <img
            src={user?.dbData?.picture || '/default-avatar.png'}
            alt="Profile Picture"
          />
          <h1>{user?.dbData?.name || 'Unknown User'}</h1>
          <p>{user?.email}</p>
        </div>
        <div>
          <div>
            <Mail />
            <p>{user?.email || 'No Email'}</p>
          </div>
          <div>
            <User />
            <p>{user?.dbData?.name || 'No Name'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
