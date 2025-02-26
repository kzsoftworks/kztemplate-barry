// src/hooks/__tests__/useAppUser.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppUser } from '@/src/hooks/useAppUser';

jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: jest.fn()
}));

global.fetch = jest.fn();

describe('useAppUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should return the same data as useUser from Auth0', () => {
    // Mock the Auth0 useUser hook to return some test data
    const mockUserData = {
      user: {
        email: 'test@example.com',
        name: 'Test User',
        sub: 'auth0|123456'
      },
      isLoading: false,
      error: undefined
    };

    (useUser as jest.Mock).mockReturnValue(mockUserData);

    const { result } = renderHook(() => useAppUser());

    expect(result.current.user).toEqual(mockUserData.user);
    expect(result.current.isLoading).toEqual(mockUserData.isLoading);
    expect(result.current.error).toEqual(mockUserData.error);
  });

  it('should call fetch when refreshDbData is called', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    });

    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    (useUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isLoading: false
    });

    const { result } = renderHook(() => useAppUser());

    await act(async () => {
      await result.current.refreshDbData();
    });

    expect(fetch).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    expect(mockReload).toHaveBeenCalled();
  });

  it('should handle fetch errors during refreshDbData', async () => {
    // Mock failed fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: jest.fn().mockResolvedValue('Error refreshing data')
    });

    (useUser as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      isLoading: false
    });

    const { result } = renderHook(() => useAppUser());

    await expect(
      act(async () => {
        await result.current.refreshDbData();
      })
    ).rejects.toThrow();

    expect(fetch).toHaveBeenCalled();
  });
});
