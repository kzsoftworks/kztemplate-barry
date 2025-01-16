'use server';

import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export type ActionResponse = {
  success: boolean;
  message: string;
  user?: User;
};

export async function updateUserProfile(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const email = formData.get('email') as string;

  const updateData: Partial<Pick<User, 'name' | 'picture'>> = {
    name: (formData.get('name') as string) || null,
    picture: (formData.get('picture') as string) || null
  };

  try {
    const response = await prisma.user.update({
      where: { email },
      data: updateData
    });

    return {
      success: true,
      user: response,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return {
      success: false,
      message: 'Error updating profile'
    };
  }
}

export async function fetchUserStats() {
  try {
    const stats = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        roles: {
          select: { name: true }
        }
      }
    });

    return { success: true, stats };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { success: false, error: 'Error getting stats' };
  }
}
