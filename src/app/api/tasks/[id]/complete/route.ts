import { NextRequest } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const { id } = await params;

    // 檢查任務是否存在
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        family: {
          include: {
            members: true
          }
        }
      }
    });

    if (!existingTask) {
      return errorResponse('任務不存在', 404);
    }

    // 檢查用戶是否為該家庭成員
    const isFamilyMember = existingTask.family.members.some(
      member => member.userId === user.id
    );

    if (!isFamilyMember) {
      return errorResponse('您不是該家庭的成員', 403);
    }

    // 檢查任務是否已經完成
    if (existingTask.status === 'COMPLETED') {
      return errorResponse('任務已經完成', 400);
    }

    // 更新任務狀態為完成
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
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

    // 創建積分記錄（如果任務有積分且分配給了用戶）
    if (existingTask.points > 0 && existingTask.assignedToId) {
      await prisma.pointRecord.create({
        data: {
          userId: existingTask.assignedToId,
          familyId: existingTask.familyId,
          taskId: existingTask.id,
          points: existingTask.points,
          type: 'EARNED',
          description: `完成任務：${existingTask.title}`
        }
      });
    }

    return successResponse(updatedTask);
  } catch (error) {
    console.error('完成任務錯誤:', error);
    return errorResponse('完成任務失敗');
  }
}