import { NextRequest } from 'next/server';
import { LoginSchema } from '@/lib/validations';
import { verifyPassword, generateTokens } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證輸入數據
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { email, password } = validation.data;

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return errorResponse('電子郵件或密碼不正確', 401);
    }

    // 驗證密碼
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('電子郵件或密碼不正確', 401);
    }

    // 生成JWT tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // 移除密碼字段
    const { password: _, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    return errorResponse('登入失敗，請稍後再試');
  }
}