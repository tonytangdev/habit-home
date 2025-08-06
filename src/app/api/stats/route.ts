import { NextRequest } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request);
    if (!user) {
      return errorResponse('未授權', 401);
    }

    // 獲取用戶所有家庭
    const userFamilies = await prisma.familyMember.findMany({
      where: { userId: user.id },
      select: { familyId: true }
    });

    const familyIds = userFamilies.map(f => f.familyId);

    // 統計所有家庭的任務數據
    const [
      pendingTasks,
      completedTasks,
      totalPoints
    ] = await Promise.all([
      // 待完成任務數量
      prisma.task.count({
        where: {
          familyId: { in: familyIds },
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),
      
      // 已完成任務數量
      prisma.task.count({
        where: {
          familyId: { in: familyIds },
          status: 'COMPLETED'
        }
      }),
      
      // 用戶總積分
      prisma.pointRecord.aggregate({
        where: {
          userId: user.id,
          familyId: { in: familyIds }
        },
        _sum: {
          points: true
        }
      })
    ]);

    // 用戶個人的任務統計
    const [
      userPendingTasks,
      userCompletedTasks
    ] = await Promise.all([
      // 分配給用戶的待完成任務
      prisma.task.count({
        where: {
          familyId: { in: familyIds },
          assignedToId: user.id,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),
      
      // 分配給用戶的已完成任務
      prisma.task.count({
        where: {
          familyId: { in: familyIds },
          assignedToId: user.id,
          status: 'COMPLETED'
        }
      })
    ]);

    // 最近的任務活動
    const recentTasks = await prisma.task.findMany({
      where: {
        familyId: { in: familyIds },
        OR: [
          { assignedToId: user.id },
          { createdById: user.id }
        ]
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
            avatar: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    });

    const stats = {
      overview: {
        pendingTasks,
        completedTasks,
        totalPoints: totalPoints._sum.points || 0,
        totalTasks: pendingTasks + completedTasks
      },
      personal: {
        pendingTasks: userPendingTasks,
        completedTasks: userCompletedTasks,
        totalTasks: userPendingTasks + userCompletedTasks
      },
      recentActivity: recentTasks
    };

    return successResponse(stats);
  } catch (error) {
    console.error('獲取統計數據錯誤:', error);
    return errorResponse('獲取統計數據失敗');
  }
}