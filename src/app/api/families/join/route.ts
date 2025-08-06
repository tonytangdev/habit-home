import { NextRequest } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

const JoinFamilySchema = z.object({
  inviteCode: z.string().min(6, '邀請碼格式錯誤').max(8, '邀請碼格式錯誤')
});

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const body = await request.json();
    const validation = JoinFamilySchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { inviteCode } = validation.data;

    // 查找家庭
    const family = await prisma.family.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    });

    if (!family) {
      return errorResponse('邀請碼無效', 404);
    }

    // 檢查用戶是否已經是該家庭成員
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId: family.id
        }
      }
    });

    if (existingMember) {
      return errorResponse('您已經是該家庭的成員', 409);
    }

    // 加入家庭
    const familyMember = await prisma.familyMember.create({
      data: {
        userId: user.id,
        familyId: family.id,
        role: 'MEMBER'
      }
    });

    // 返回更新後的家庭信息
    const updatedFamily = await prisma.family.findUnique({
      where: { id: family.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    });

    return successResponse(updatedFamily);
  } catch (error) {
    console.error('加入家庭錯誤:', error);
    return errorResponse('加入家庭失敗');
  }
}