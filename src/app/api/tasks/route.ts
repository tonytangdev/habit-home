import { NextRequest } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1, '任務標題不能為空'),
  description: z.string().optional(),
  points: z.number().min(0, '積分不能為負數').default(0),
  category: z.string().min(1, '分類不能為空'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  familyId: z.string().min(1, '家庭ID不能為空'),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined)
});

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    let whereCondition: any = {};

    if (familyId) {
      // 檢查用戶是否為該家庭成員
      const familyMember = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: user.id,
            familyId: familyId
          }
        }
      });

      if (!familyMember) {
        return errorResponse('您不是該家庭的成員', 403);
      }

      whereCondition.familyId = familyId;
    } else {
      // 獲取用戶所有家庭的任務
      const userFamilies = await prisma.familyMember.findMany({
        where: { userId: user.id },
        select: { familyId: true }
      });

      whereCondition.familyId = {
        in: userFamilies.map(f => f.familyId)
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return successResponse(tasks);
  } catch (error) {
    console.error('獲取任務列表錯誤:', error);
    return errorResponse('獲取任務列表失敗');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const body = await request.json();
    const validation = CreateTaskSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { title, description, points, category, priority, familyId, assignedToId, dueDate } = validation.data;

    // 檢查用戶是否為該家庭成員
    const familyMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: user.id,
          familyId: familyId
        }
      }
    });

    if (!familyMember) {
      return errorResponse('您不是該家庭的成員', 403);
    }

    // 如果指定了分配對象，檢查該用戶是否為家庭成員
    if (assignedToId) {
      const assignedMember = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: assignedToId,
            familyId: familyId
          }
        }
      });

      if (!assignedMember) {
        return errorResponse('指定的分配對象不是該家庭成員', 400);
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        points,
        category,
        priority,
        familyId,
        assignedToId,
        createdById: user.id,
        dueDate
      },
      include: {
        family: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return successResponse(task, 201);
  } catch (error) {
    console.error('創建任務錯誤:', error);
    return errorResponse('創建任務失敗');
  }
}