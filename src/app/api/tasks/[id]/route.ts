import { NextRequest } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { z } from 'zod';

const UpdateTaskSchema = z.object({
  title: z.string().min(1, '任務標題不能為空').optional(),
  description: z.string().optional(),
  points: z.number().min(0, '積分不能為負數').optional(),
  category: z.string().min(1, '分類不能為空').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined).nullable()
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    const { id } = await params;
    const body = await request.json();
    
    const validation = UpdateTaskSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

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

    const updateData = validation.data;

    // 如果更新狀態為已完成，設置完成時間和積分記錄
    if (updateData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED') {
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

      // 設置完成時間會在下面的 update 中處理
    }

    // 更新任務
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        completedAt: updateData.status === 'COMPLETED' ? new Date() : 
                     updateData.status === 'PENDING' || updateData.status === 'IN_PROGRESS' ? null : 
                     existingTask.completedAt
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

    return successResponse(updatedTask);
  } catch (error) {
    console.error('更新任務錯誤:', error);
    return errorResponse('更新任務失敗');
  }
}

export async function DELETE(
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

    // 檢查用戶是否為該家庭成員且為任務創建者或管理員
    const familyMember = existingTask.family.members.find(
      member => member.userId === user.id
    );

    if (!familyMember) {
      return errorResponse('您不是該家庭的成員', 403);
    }

    // 只有任務創建者或家庭管理員可以刪除任務
    if (existingTask.createdById !== user.id && familyMember.role !== 'ADMIN') {
      return errorResponse('沒有權限刪除此任務', 403);
    }

    // 刪除相關積分記錄
    await prisma.pointRecord.deleteMany({
      where: { taskId: id }
    });

    // 刪除任務
    await prisma.task.delete({
      where: { id }
    });

    return successResponse({ message: '任務已刪除' });
  } catch (error) {
    console.error('刪除任務錯誤:', error);
    return errorResponse('刪除任務失敗');
  }
}