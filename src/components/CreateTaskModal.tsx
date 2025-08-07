
import { useState } from "react";
import { Family } from '@/types/common'
import { apiClient } from '@/lib/api-client';

// 創建任務彈窗組件
export default function CreateTaskModal({ families, onClose, onSuccess }: { 
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