import { NextRequest } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

const CreateFamilySchema = z.object({
  name: z.string().min(1, '家庭名稱不能為空'),
  description: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const families = await prisma.family.findMany({
      where: {
        members: {
          some: {
            userId: user.id
          }
        }
      },
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

    return successResponse(families);
  } catch (error) {
    console.error('獲取家庭列表錯誤:', error);
    return errorResponse('獲取家庭列表失敗');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const body = await request.json();
    const validation = CreateFamilySchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { name, description } = validation.data;

    // 生成邀請碼
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const family = await prisma.family.create({
      data: {
        name,
        description,
        inviteCode,
        members: {
          create: {
            userId: user.id,
            role: 'ADMIN'
          }
        }
      },
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
        }
      }
    });

    return successResponse(family, 201);
  } catch (error) {
    console.error('創建家庭錯誤:', error);
    return errorResponse('創建家庭失敗');
  }
}