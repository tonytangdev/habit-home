import { NextRequest } from 'next/server';
import { RefreshTokenSchema } from '@/lib/validations';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證輸入數據
    const validation = RefreshTokenSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { refreshToken } = validation.data;

    // 驗證refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return errorResponse('無效的refresh token', 401);
    }

    // 檢查用戶是否仍然存在
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true
      }
    });

    if (!user) {
      return errorResponse('用戶不存在', 401);
    }

    // 生成新的tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    return successResponse({
      user,
      token: accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('刷新token錯誤:', error);
    return errorResponse('刷新token失敗，請重新登入');
  }
}