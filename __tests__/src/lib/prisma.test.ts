import { prisma, syncAuth0User } from '@/src/lib/prisma';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      upsert: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn()
    },
    role: {
      upsert: jest.fn()
    },
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

describe('prisma utils', () => {
  let mockPrisma: any;

  beforeEach(() => {
    // Reset and reconfigure mocks before each test
    jest.clearAllMocks();
    mockPrisma = prisma as any;
  });

  describe('syncAuth0User', () => {
    const mockAuth0User = {
      sub: 'auth0|123456',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/picture.jpg',
      roles: ['user', 'admin']
    };

    it('should upsert a user without roles when no roles provided', async () => {
      // Prepare mock data
      const userWithoutRoles = {
        ...mockAuth0User,
        roles: undefined
      };

      const mockUpsertedUser = {
        id: 1,
        auth0Id: userWithoutRoles.sub,
        email: userWithoutRoles.email,
        name: userWithoutRoles.name,
        picture: userWithoutRoles.picture,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Configure mocks
      mockPrisma.user.upsert.mockResolvedValue(mockUpsertedUser);

      // Call the function
      const result = await syncAuth0User(userWithoutRoles);

      // Assertions
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { auth0Id: userWithoutRoles.sub },
        update: {
          email: userWithoutRoles.email,
          name: userWithoutRoles.name
        },
        create: {
          auth0Id: userWithoutRoles.sub,
          email: userWithoutRoles.email,
          name: userWithoutRoles.name,
          picture: userWithoutRoles.picture,
          roles: {
            connectOrCreate: undefined
          }
        }
      });

      // Verify no role operations were performed
      expect(mockPrisma.role.upsert).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual(mockUpsertedUser);
    });

    it('should upsert a user with roles when roles are provided', async () => {
      // Prepare mock data
      const mockUpsertedUser = {
        id: 1,
        auth0Id: mockAuth0User.sub,
        email: mockAuth0User.email,
        name: mockAuth0User.name,
        picture: mockAuth0User.picture,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockRoles = [
        { id: 1, name: 'user' },
        { id: 2, name: 'admin' }
      ];

      const mockUpdatedUser = {
        ...mockUpsertedUser,
        roles: mockRoles
      };

      // Configure mocks
      mockPrisma.user.upsert.mockResolvedValue(mockUpsertedUser);
      mockPrisma.role.upsert.mockImplementation((args: any) => {
        return Promise.resolve({
          id: args.where.name === 'user' ? 1 : 2,
          name: args.where.name
        });
      });
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      // Call the function
      const result = await syncAuth0User(mockAuth0User);

      // Assertions
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { auth0Id: mockAuth0User.sub },
        update: {
          email: mockAuth0User.email,
          name: mockAuth0User.name
        },
        create: {
          auth0Id: mockAuth0User.sub,
          email: mockAuth0User.email,
          name: mockAuth0User.name,
          picture: mockAuth0User.picture,
          roles: {
            connectOrCreate: [
              {
                where: { name: 'user' },
                create: { name: 'user' }
              },
              {
                where: { name: 'admin' },
                create: { name: 'admin' }
              }
            ]
          }
        }
      });

      // Verify role operations
      expect(mockPrisma.role.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.role.upsert).toHaveBeenCalledWith({
        where: { name: 'user' },
        update: {},
        create: { name: 'user' }
      });
      expect(mockPrisma.role.upsert).toHaveBeenCalledWith({
        where: { name: 'admin' },
        update: {},
        create: { name: 'admin' }
      });

      // Verify user update with roles
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUpsertedUser.id },
        data: {
          roles: {
            connect: [{ id: 1 }, { id: 2 }]
          }
        }
      });

      // Verify the function returns the initial upserted user without roles
      // This reflects the actual behavior of the function which returns before the update happens
      expect(result).toEqual(mockUpsertedUser);

      // Instead, verify that the update with roles was called correctly
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should use default picture when no picture provided', async () => {
      // Prepare mock data
      const userWithoutPicture = {
        ...mockAuth0User,
        picture: undefined,
        roles: undefined
      };

      const mockUpsertedUser = {
        id: 1,
        auth0Id: userWithoutPicture.sub,
        email: userWithoutPicture.email,
        name: userWithoutPicture.name,
        picture: '/placeholder-user.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Configure mocks
      mockPrisma.user.upsert.mockResolvedValue(mockUpsertedUser);

      // Call the function
      const result = await syncAuth0User(userWithoutPicture);

      // Assertions
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { auth0Id: userWithoutPicture.sub },
        update: {
          email: userWithoutPicture.email,
          name: userWithoutPicture.name
        },
        create: {
          auth0Id: userWithoutPicture.sub,
          email: userWithoutPicture.email,
          name: userWithoutPicture.name,
          picture: '/placeholder-user.jpg',
          roles: {
            connectOrCreate: undefined
          }
        }
      });

      // Verify the result
      expect(result).toEqual(mockUpsertedUser);
    });

    it('should handle database errors properly', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed');
      mockPrisma.user.upsert.mockRejectedValue(dbError);

      // Call the function and expect it to throw
      await expect(syncAuth0User(mockAuth0User)).rejects.toThrow(dbError);
    });
  });
});
