import { z } from 'zod';

// 用戶認證相關
export const RegisterSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(6, '密碼至少需要6個字符').max(100, '密碼不能超過100個字符'),
  name: z.string().min(1, '姓名不能為空').max(50, '姓名不能超過50個字符'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼確認不匹配',
  path: ['confirmPassword']
});

export const LoginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(1, '密碼不能為空')
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token不能為空')
});

// 家庭管理相關
export const CreateFamilySchema = z.object({
  name: z.string().min(1, '家庭名稱不能為空').max(50, '家庭名稱不能超過50個字符'),
  description: z.string().max(200, '描述不能超過200個字符').optional()
});

export const UpdateFamilySchema = z.object({
  name: z.string().min(1, '家庭名稱不能為空').max(50, '家庭名稱不能超過50個字符').optional(),
  description: z.string().max(200, '描述不能超過200個字符').optional()
});

export const JoinFamilySchema = z.object({
  inviteCode: z.string().min(1, '邀請碼不能為空')
});

// 任務管理相關
export const CreateTaskSchema = z.object({
  title: z.string().min(1, '任務標題不能為空').max(100, '任務標題不能超過100個字符'),
  description: z.string().max(500, '任務描述不能超過500個字符').optional(),
  points: z.number().min(0, '積分不能為負數').max(1000, '積分不能超過1000'),
  category: z.string().min(1, '任務類別不能為空').max(50, '任務類別不能超過50個字符'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    message: '優先級必須是 LOW, MEDIUM, HIGH, 或 URGENT 之一'
  }),
  dueDate: z.string().datetime().optional(),
  familyId: z.string().min(1, '家庭ID不能為空'),
  assignedToId: z.string().optional()
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, '任務標題不能為空').max(100, '任務標題不能超過100個字符').optional(),
  description: z.string().max(500, '任務描述不能超過500個字符').optional(),
  points: z.number().min(0, '積分不能為負數').max(1000, '積分不能超過1000').optional(),
  category: z.string().min(1, '任務類別不能為空').max(50, '任務類別不能超過50個字符').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional()
});

export const AssignTaskSchema = z.object({
  assignedToId: z.string().min(1, '被分配用戶ID不能為空')
});

// API響應類型
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
}