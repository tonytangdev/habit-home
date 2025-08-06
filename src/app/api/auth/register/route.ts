import { NextRequest } from 'next/server';
import { RegisterSchema } from '@/lib/validations';
import { hashPassword, generateTokens } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證輸入數據
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { email, password, name } = validation.data;

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse('此電子郵件已被註冊', 409);
    }

    // 創建新用戶
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    // 生成JWT tokens
    const { accessToken, refreshToken } = generateTokens(user);

    return successResponse({
      user,
      token: accessToken,
      refreshToken
    }, 201);

  } catch (error) {
    console.error('註冊錯誤:', error);
    return errorResponse('註冊失敗，請稍後再試');
  }
}