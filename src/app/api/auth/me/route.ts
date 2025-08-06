import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // 驗證認證
    const auth = await authenticateRequest(request);
    
    if (auth.error) {
      return unauthorizedResponse(auth.error);
    }

    // 獲取用戶詳細信息
    const user = await prisma.user.findUnique({
      where: { id: auth.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        familyMembers: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return errorResponse('用戶不存在', 404);
    }

    return successResponse(user);

  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    return errorResponse('獲取用戶信息失敗');
  }
}