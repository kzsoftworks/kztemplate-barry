// app/api/roles/route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/roles/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    role: {
      findMany: jest.fn()
    }
  }
}));

// Mock Next.js objects
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    headers: new Map()
  })),
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
      headers: new Map()
    }))
  }
}));

describe('Roles API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/roles', () => {
    it('should return list of roles', async () => {
      // Mock roles data
      const mockRoles = [
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' },
        { id: 3, name: 'editor' }
      ];

      // Configure mock
      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      // Create mock request
      const req = new NextRequest('https://example.com/api/roles');

      // Call the GET handler
      const result = await GET(req);

      // Assertions
      expect(prisma.role.findMany).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(mockRoles);

      const responseBody = await result.json();
      expect(responseBody).toEqual(mockRoles);
    });

    it('should handle database errors when fetching roles', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed');
      (prisma.role.findMany as jest.Mock).mockRejectedValue(dbError);

      // Create mock request
      const req = new NextRequest('https://example.com/api/roles');

      // Call the GET handler
      const result = await GET(req);

      // Assertions
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Failed to fetch roles',
          details: 'Database connection failed'
        },
        { status: 500 }
      );

      const responseBody = await result.json();
      expect(responseBody.error).toBe('Failed to fetch roles');
      expect(responseBody.details).toBe('Database connection failed');
      expect(result.status).toBe(500);
    });
  });
});
