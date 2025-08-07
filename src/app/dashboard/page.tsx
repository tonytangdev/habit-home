'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Stats {
  overview: {
    pendingTasks: number;
    completedTasks: number;
    totalPoints: number;
    totalTasks: number;
  };
  personal: {
    pendingTasks: number;
    completedTasks: number;
    totalTasks: number;
  };
  recentActivity: any[];
}

interface Family {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members: any[];
  _count: {
    tasks: number;
    members: number;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  family: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

type SortOption = 'dueDate' | 'priority' | 'completion';

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

// 任務卡片組件
function TaskCard({ 
  task, 
  onUpdate, 
  onEdit, 
  onDelete 
}: { 
  task: Task; 
  onUpdate: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'URGENT': return 'text-red-800 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-700 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-700 bg-blue-100';
      case 'PENDING': return 'text-gray-700 bg-gray-100';
      case 'CANCELLED': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '已完成';
      case 'IN_PROGRESS': return '進行中';
      case 'PENDING': return '待處理';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return '高優先級';
      case 'URGENT': return '緊急';
      case 'MEDIUM': return '中等';
      case 'LOW': return '低優先級';
      default: return priority;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await apiClient.updateTask(task.id, { status: newStatus });
      if (response.success) {
        onUpdate();
      }
    } catch (error) {
      console.error('更新任務狀態失敗:', error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3 gap-5">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-3">{task.title}</h3>
          {task.description && (
            <p className="text-base bold text-gray-600 mb-2 border p-3">{task.description}</p>
          )}
          <div className="flex items-center flex-wrap gap-5 text-sm">
            <span className="text-gray-500">群組: {task.family.name}</span>
            <span className="text-gray-500">分類: {task.category}</span>
            {task.points > 0 && (
              <span className="text-primary-600 font-medium">🏆 積分: {task.points} 分</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {getPriorityText(task.priority)}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </div>
          {/* 編輯和刪除按鈕 */}
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="編輯任務"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="刪除任務"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {task.assignedTo ? (
            <div className="flex items-center space-x-2">
              {/* <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-xs">
                  {task.assignedTo.name.charAt(0).toUpperCase()}
                </span>
              </div> */}
              <span>分配給 {task.assignedTo.name}</span>
            </div>
          ) : (
            <span className="text-orange-600">尚未分配</span>
          )}
          
          {task.dueDate && (
            <span>截止：{new Date(task.dueDate).toLocaleDateString('zh-TW')}</span>
          )}
        </div>

        {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
          <div className="flex space-x-2">
            {task.status === 'PENDING' && (
              <button
                onClick={() => handleStatusUpdate('IN_PROGRESS')}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xl font-medium rounded-md transition-colors"
              >
                開始
              </button>
            )}
            {task.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleStatusUpdate('COMPLETED')}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xl font-medium rounded-md transition-colors"
              >
                完成
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 創建任務彈窗組件
function CreateTaskModal({ families, onClose, onSuccess }: { 
  families: Family[]; 
  onClose: () => void; 
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 0,
    category: '',
    priority: 'MEDIUM' as const,
    familyId: families[0]?.id || '',
    assignedToId: '',
    dueDate: ''
  });
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(families[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFamilyChange = (familyId: string) => {
    const family = families.find(f => f.id === familyId);
    setSelectedFamily(family || null);
    setFormData({ ...formData, familyId, assignedToId: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createTask({
        ...formData,
        points: Number(formData.points),
        dueDate: formData.dueDate || undefined,
        assignedToId: formData.assignedToId || undefined
      });
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || '創建任務失敗');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '創建任務失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const commonCategories = [
    '清潔打掃', '洗衣整理', '廚房料理', '採購物品', 
    '維護修理', '照顧寵物', '庭院整理', '其他'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="text-gray-600 bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">創建新任務</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 任務標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任務標題 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="例如：打掃客廳、洗碗、整理房間..."
              required
            />
          </div>

          {/* 任務描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任務描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="描述任務的具體要求..."
              rows={3}
            />
          </div>

          {/* 群組選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇群組 *
            </label>
            <select
              value={formData.familyId}
              onChange={(e) => handleFamilyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            >
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>

          {/* 分配給成員 */}
          {selectedFamily && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分配給成員
              </label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">稍後分配</option>
                {selectedFamily.members.map((member: any) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 任務分類和積分 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任務分類 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              >
                <option value="">選擇分類</option>
                {commonCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                獎勵積分
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* 優先級和截止日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先級
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="LOW">低優先級</option>
                <option value="MEDIUM">中等</option>
                <option value="HIGH">高優先級</option>
                <option value="URGENT">緊急</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                截止日期
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.category || !formData.familyId}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? '創建中...' : '創建任務'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 編輯任務彈窗組件
function EditTaskModal({ task, families, onClose, onSuccess }: { 
  task: Task;
  families: Family[]; 
  onClose: () => void; 
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    points: task.points,
    category: task.category,
    priority: task.priority,
    familyId: task.family.id,
    assignedToId: task.assignedTo?.id || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  });
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(
    families.find(f => f.id === task.family.id) || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFamilyChange = (familyId: string) => {
    const family = families.find(f => f.id === familyId);
    setSelectedFamily(family || null);
    setFormData({ ...formData, familyId, assignedToId: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.updateTask(task.id, {
        ...formData,
        points: Number(formData.points),
        dueDate: formData.dueDate || undefined,
        assignedToId: formData.assignedToId || undefined
      });
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || '更新任務失敗');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新任務失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const commonCategories = [
    '清潔打掃', '洗衣整理', '廚房料理', '採購物品', 
    '維護修理', '照顧寵物', '庭院整理', '其他'
  ];

  return (
    <div className="text-gray-600 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">編輯任務</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 任務標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任務標題 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="例如：打掃客廳、洗碗、整理房間..."
              required
            />
          </div>

          {/* 任務描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任務描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="描述任務的具體要求..."
              rows={3}
            />
          </div>

          {/* 群組選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇群組 *
            </label>
            <select
              value={formData.familyId}
              onChange={(e) => handleFamilyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
            >
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </div>

          {/* 分配給成員 */}
          {selectedFamily && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分配給成員
              </label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">稍後分配</option>
                {selectedFamily.members.map((member: any) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 任務分類和積分 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                任務分類 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              >
                {commonCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                獎勵積分
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="0"
              />
            </div>
          </div>

          {/* 優先級和截止日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先級
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="LOW">低優先級</option>
                <option value="MEDIUM">中等</option>
                <option value="HIGH">高優先級</option>
                <option value="URGENT">緊急</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                截止日期
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.category || !formData.familyId}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? '更新中...' : '更新任務'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 創建群組彈窗組件
function CreateFamilyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createFamily(formData);
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || '創建群組失敗');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '創建群組失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-gray-600 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">創建新群組</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              群組名稱 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="請輸入群組名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              群組描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="簡單描述一下這個群組..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? '創建中...' : '創建群組'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 加入群組彈窗組件
function JoinFamilyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.joinFamily(inviteCode.trim());
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || '加入群組失敗');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '加入群組失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">加入群組</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邀請碼
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-center text-lg font-mono"
              placeholder="輸入6位數邀請碼"
              maxLength={8}
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              請輸入群組管理員提供的邀請碼
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? '加入中...' : '加入群組'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 刪除確認對話框組件
function DeleteConfirmModal({ task, onClose, onSuccess }: {
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.deleteTask(task.id);
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.error || '刪除任務失敗');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '刪除任務失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-gray-900">確認刪除任務</h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            您確定要刪除任務「<span className="font-semibold text-gray-900">{task.title}</span>」嗎？
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ 此操作無法撤銷，請謹慎確認。
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={isLoading}
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? '刪除中...' : '確認刪除'}
          </button>
        </div>
      </div>
    </div>
  );
}