'use client';

import { useEffect, useState } from 'react';
import { useAppUser } from '@/hooks/useAppUser';
import { updateUserProfile, fetchUserStats, ActionResponse } from './actions';
import { useFormState } from 'react-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const initialState: ActionResponse = {
  success: false,
  message: ''
};

export default function HomePage() {
  const { user, refreshDbData } = useAppUser();
  const [stats, setStats] = useState<any>(null);
  const [state, formAction] = useFormState(updateUserProfile, initialState);

  useEffect(() => {
    if (state.message && state !== initialState) {
      if (state.success) {
        toast.success(state.message);
        refreshDbData?.();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  async function loadStats() {
    const result = await fetchUserStats();

    if (result.success) {
      setStats(result.stats);
    } else {
      toast.error('Error getting stats');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ''}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Name"
                defaultValue={user?.dbData?.name || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="picture">Profile Image URL</Label>
              <Input
                id="picture"
                name="picture"
                type="url"
                placeholder="https://example.com/profile.jpg"
                defaultValue={user?.picture || ''}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" className="w-full sm:w-auto">
                Upload Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users Stats</CardTitle>
          <Button onClick={loadStats} variant="outline">
            Load Stats
          </Button>
        </CardHeader>

        <CardContent>
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              {stats.map((user: any) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="flex items-center space-x-4">
                    {user.picture && (
                      <img
                        src={user.picture}
                        alt={user.name || 'Profile'}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-lg">
                        {user.name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Roles: {user.roles.map((r: any) => r.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
