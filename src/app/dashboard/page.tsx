'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import {User, Stats, Family, Task, SortOption} from '@/types/common'
import CreateFamilyModal from "@/components/CreateFamilyModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import EditTaskModal from "@/components/EditTaskModal";
import JoinFamilyModal from "@/components/JoinFamilyModal";
import TaskCard from "@/components/TaskCard";


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showJoinFamily, setShowJoinFamily] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');

  const handleDataRefresh = async () => {
    try {
      const [statsResponse, familiesResponse, tasksResponse] = await Promise.all([
        apiClient.getStats(),
        apiClient.getFamilies(),
        apiClient.getTasks()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as Stats);
      }

      if (familiesResponse.success && familiesResponse.data) {
        setFamilies(familiesResponse.data as Family[]);
      }

      if (tasksResponse.success && tasksResponse.data) {
        setTasks(tasksResponse.data as Task[]);
      }
    } catch (error) {
      console.error('更新數據失敗:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // 檢查用戶認證
        const userResponse = await apiClient.getCurrentUser();
        if (!userResponse.success || !userResponse.data) {
          window.location.href = '/auth';
          return;
        }
        setUser(userResponse.data as User);

        // 載入統計數據、群組列表和任務列表
        const [statsResponse, familiesResponse, tasksResponse] = await Promise.all([
          apiClient.getStats(),
          apiClient.getFamilies(),
          apiClient.getTasks()
        ]);

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data as Stats);
        }

        if (familiesResponse.success && familiesResponse.data) {
          setFamilies(familiesResponse.data as Family[]);
        }

        if (tasksResponse.success && tasksResponse.data) {
          setTasks(tasksResponse.data as Task[]);
        }
      } catch (error) {
        console.error('載入數據失敗:', error);
        window.location.href = '/auth';
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 排序任務的函數
  const sortTasks = (tasks: Task[], sortBy: SortOption): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // 最接近今日的排在前面
          const today = new Date();
          const aDueDate = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          const bDueDate = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          
          const aDiff = Math.abs(aDueDate.getTime() - today.getTime());
          const bDiff = Math.abs(bDueDate.getTime() - today.getTime());
          
          return aDiff - bDiff;
          
        case 'priority':
          // 重要程度排序：URGENT > HIGH > MEDIUM > LOW
          const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
          
        case 'completion':
          // 完成程度排序：PENDING > IN_PROGRESS > COMPLETED > CANCELLED
          const statusOrder = { 
            'PENDING': 4, 
            'IN_PROGRESS': 3, 
            'COMPLETED': 2, 
            'CANCELLED': 1 
          };
          return statusOrder[b.status] - statusOrder[a.status];
          
        default:
          return 0;
      }
    });
  };

  // 獲取排序後的任務
  const sortedTasks = sortTasks(tasks, sortBy);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('登出失敗:', error);
      // 即使登出失敗也跳轉到首頁
      window.location.href = '/';
    }
  };

  const handleCopyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    alert('已複製邀請碼');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* <Link href="/" className="flex items-center space-x-2"> */}
              <span className="text-2xl font-bold text-primary-600">🏠 HabitHome</span>
            {/* </Link> */}
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div> */}
                <span className="text-gray-700 font-medium">{user?.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            歡迎回來，{user?.name}！
          </h1>
          <p className="text-gray-600">
            準備好開始智能分配家務了嗎？
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.personal.pendingTasks || 0}</p>
                <p className="text-gray-600">我的待辦任務</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.personal.completedTasks || 0}</p>
                <p className="text-gray-600">我已完成</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalPoints || 0}</p>
                <p className="text-gray-600">總積分</p>
              </div>
            </div>
          </div>
        </div>

        {/* 群組列表 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">我的群組</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowJoinFamily(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                加入群組
              </button>
              <button
                onClick={() => setShowCreateFamily(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                創建群組
              </button>
            </div>
          </div>

          {families.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {families.map((family) => (
                <div key={family.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{family.name}</h3>
                  {family.description && (
                    <p className="text-sm text-gray-600 mb-3">{family.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{family._count.members} 位成員</span>
                    <span>{family._count.tasks} 個任務</span>
                  </div>
                  <div className="mt-5 flex items-center gap-2 justify-between">
                    <span className='text-gray-500 bg-gray-100 rounded-lg px-2 py-1 w-full'>邀請碼：{family.inviteCode}</span>

                    <button className="text-gray-500 hover:text-gray-700 text-nowrap" onClick={() => handleCopyInviteCode(family.inviteCode)}>
                    複製邀請碼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">👥</span>
              <h3 className="font-semibold text-gray-900 mb-2">還沒有加入任何群組</h3>
              <p className="text-gray-600 mb-4">創建新群組或使用邀請碼加入現有群組</p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowJoinFamily(true)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  加入群組
                </button>
                <button
                  onClick={() => setShowCreateFamily(true)}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  創建群組
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 任務管理區域 */}
        {families.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between flex-wrap items-center mb-4 gap-3">
              <h2 className="text-xl font-bold text-gray-900">任務管理</h2>
              <div className="flex items-center  flex-wrap gap-3">
                {/* 排序選擇器 */}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">排序方式：</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-gray-600 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="dueDate">最接近今日</option>
                    <option value="priority">重要程度</option>
                    <option value="completion">完成程度</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  創建任務
                </button>
              </div>
            </div>

            {tasks.length > 0 ? (
              <div className="space-y-4">
                {sortedTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onUpdate={handleDataRefresh}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setShowEditTask(true);
                    }}
                    onDelete={(task) => {
                      setDeletingTask(task);
                      setShowDeleteConfirm(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">📋</span>
                <h3 className="font-semibold text-gray-900 mb-2">還沒有任務</h3>
                <p className="text-gray-600 mb-4">創建第一個家務任務開始分配吧！</p>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  創建任務
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 創建群組彈窗 */}
      {showCreateFamily && <CreateFamilyModal onClose={() => setShowCreateFamily(false)} onSuccess={handleDataRefresh} />}

      {/* 加入群組彈窗 */}
      {showJoinFamily && <JoinFamilyModal onClose={() => setShowJoinFamily(false)} onSuccess={handleDataRefresh} />}

      {/* 創建任務彈窗 */}
      {showCreateTask && <CreateTaskModal families={families} onClose={() => setShowCreateTask(false)} onSuccess={handleDataRefresh} />}

      {/* 編輯任務彈窗 */}
      {showEditTask && editingTask && (
        <EditTaskModal 
          task={editingTask} 
          families={families} 
          onClose={() => {
            setShowEditTask(false);
            setEditingTask(null);
          }} 
          onSuccess={handleDataRefresh} 
        />
      )}

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && deletingTask && (
        <DeleteConfirmModal 
          task={deletingTask}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletingTask(null);
          }}
          onSuccess={handleDataRefresh}
        />
      )}
    </div>
  );
}