import { supabase, supabaseAdmin } from './supabase';
import { verifyToken, JWTPayload } from './auth';

/**
 * 簡化版本：保持現有的 JWT 認證，使用 Supabase 作為數據庫
 * 現有的 Prisma + JWT 系統已經有很好的權限控制，
 * 我們主要利用 Supabase 的數據庫功能和性能
 */

/**
 * 使用 service role 執行管理操作（用於服務器端）
 */
export function getSupabaseAdmin() {
  return supabaseAdmin;
}

/**
 * 獲取公共 Supabase 客戶端（用於客戶端操作）
 */
export function getSupabaseClient() {
  return supabase;
}

/**
 * 驗證 JWT 並返回用戶信息（與現有系統集成）
 */
export async function verifySupabaseCompatibleToken(jwtToken: string) {
  const payload = await verifyToken(jwtToken);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
  };
}

/**
 * 檢查用戶是否有權訪問指定家庭的數據
 */
export async function checkFamilyAccess(userId: string, familyId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('family_members')
      .select('id')
      .eq('user_id', userId)
      .eq('family_id', familyId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking family access:', error);
    return false;
  }
}