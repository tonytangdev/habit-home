'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // 登入邏輯
        const response = await apiClient.login(formData.email, formData.password);
        if (response.success) {
          // 登入成功，跳轉到主頁面
          window.location.href = '/dashboard';
        } else {
          setError(response.error || '登入失敗');
        }
      } else {
        // 註冊邏輯
        if (formData.password !== formData.confirmPassword) {
          setError('密碼確認不匹配');
          return;
        }
        
        const response = await apiClient.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          confirmPassword: formData.confirmPassword
        });
        
        if (response.success) {
          // 註冊成功，跳轉到主頁面
          window.location.href = '/dashboard';
        } else {
          setError(response.error || '註冊失敗');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '發生未知錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-600">
                🏠 HabitHome
              </h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? '歡迎回來' : '開始你的家務分配之旅'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? '登入你的帳戶' : '創建新帳戶'}
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field (only for registration) */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                    placeholder="請輸入你的姓名"
                    required
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  電子郵件
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                  placeholder="請輸入你的電子郵件"
                  required
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密碼
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                  placeholder="請輸入你的密碼"
                  required
                />
              </div>

              {/* Confirm Password field (only for registration) */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    確認密碼
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
                    placeholder="請再次輸入密碼"
                    required
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    處理中...
                  </>
                ) : (
                  isLogin ? '登入' : '註冊'
                )}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? '還沒有帳戶？' : '已經有帳戶了？'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {isLogin ? '立即註冊' : '立即登入'}
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                繼續使用即表示你同意我們的服務條款和隱私政策
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← 返回首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}