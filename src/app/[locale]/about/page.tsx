import Link from 'next/link';
import { getTranslations, type Locale } from '@/lib/translations';

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = getTranslations(locale as Locale);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded">
        <p>Current locale: <strong>{locale}</strong></p>
        <div className="flex gap-2 mt-2">
          <Link href="/zh/about" className="text-blue-600">中文</Link>
          <Link href="/en/about" className="text-blue-600">English</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('navigation.about')} <span className="text-primary-600">HabitHome</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {isZh ? '智能家務分配工具，讓家庭生活更和諧' : 'Smart chore distribution tool that makes family life more harmonious'}
            </p>
          </div>

          {/* App 功能詳細介紹 */}
          <div className="space-y-12">
            {/* 公平分配 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="text-5xl">⚖️</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {isZh ? '智能公平分配' : 'Smart Fair Distribution'}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {isZh 
                      ? 'HabitHome 使用先進的算法來確保家務分配的公平性，考慮每個成員的：'
                      : 'HabitHome uses advanced algorithms to ensure fair chore distribution, considering each member\'s:'
                    }
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>{isZh ? '個人偏好和擅長的家務類型' : 'Personal preferences and preferred chore types'}</li>
                    <li>{isZh ? '可用時間和工作排程' : 'Available time and work schedule'}</li>
                    <li>{isZh ? '身體能力和限制' : 'Physical abilities and limitations'}</li>
                    <li>{isZh ? '過往完成任務的表現' : 'Past task completion performance'}</li>
                  </ul>
                  <p className="text-gray-600">
                    {isZh 
                      ? '系統會自動調整任務分配，確保每個人都能在合理的負擔下貢獻家庭。'
                      : 'The system automatically adjusts task allocation to ensure everyone contributes to the household under reasonable burden.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 進度追蹤 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="text-5xl">📊</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {isZh ? '實時進度追蹤' : 'Real-time Progress Tracking'}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {isZh 
                      ? '透過直觀的儀表板，所有家庭成員都能清楚了解：'
                      : 'Through an intuitive dashboard, all family members can clearly see:'
                    }
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>{isZh ? '當前待完成的任務列表' : 'Current pending task list'}</li>
                    <li>{isZh ? '每個成員的任務完成狀況' : 'Each member\'s task completion status'}</li>
                    <li>{isZh ? '本週、本月的家務統計' : 'Weekly and monthly chore statistics'}</li>
                    <li>{isZh ? '即將到期的重要家務提醒' : 'Important chore reminders that are due soon'}</li>
                  </ul>
                  <p className="text-gray-600">
                    {isZh 
                      ? '保持透明的溝通環境，避免因為家務分工不均而產生的摩擦。'
                      : 'Maintain a transparent communication environment and avoid friction caused by uneven chore distribution.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 積分系統 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="text-5xl">🏆</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {isZh ? '激勵積分系統' : 'Motivational Point System'}
                  </h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {isZh 
                      ? '讓做家務變得有趣！我們的積分系統包含：'
                      : 'Make doing chores fun! Our point system includes:'
                    }
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>{isZh ? '完成任務獲得積分獎勵' : 'Earn point rewards for completing tasks'}</li>
                    <li>{isZh ? '連續完成獲得額外獎勵' : 'Get bonus rewards for consecutive completions'}</li>
                    <li>{isZh ? '月度家務之星排行榜' : 'Monthly chore star leaderboard'}</li>
                    <li>{isZh ? '成就徽章和里程碑慶祝' : 'Achievement badges and milestone celebrations'}</li>
                  </ul>
                  <p className="text-gray-600">
                    {isZh 
                      ? '量化每個人的貢獻，提升參與動機，讓家務分工變成一件值得期待的事情。'
                      : 'Quantify everyone\'s contributions, boost participation motivation, and make chore distribution something to look forward to.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 使用步驟 */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {isZh ? '如何開始使用' : 'How to Get Started'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">1️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isZh ? '註冊帳號' : 'Sign Up'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isZh ? '創建您的 HabitHome 帳號，開始您的智能家務管理之旅' : 'Create your HabitHome account and start your smart chore management journey'}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">2️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isZh ? '建立家庭' : 'Create Family'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isZh ? '邀請家庭成員加入，設定每個人的偏好和時間安排' : 'Invite family members to join and set up everyone\'s preferences and schedules'}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">3️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isZh ? '設定任務' : 'Set Up Tasks'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isZh ? '添加您家中的日常家務，系統會智能分配給合適的成員' : 'Add your household\'s daily chores, and the system will intelligently assign them to suitable members'}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">4️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isZh ? '開始執行' : 'Start Executing'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isZh ? '按照分配完成任務，獲得積分，享受和諧的家庭生活' : 'Complete tasks according to assignments, earn points, and enjoy a harmonious family life'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-primary-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isZh ? '準備好開始了嗎？' : 'Ready to Get Started?'}
              </h2>
              <p className="text-gray-600 mb-6">
                {isZh 
                  ? '立即註冊 HabitHome，讓 AI 幫助您的家庭建立更好的家務分工制度'
                  : 'Sign up for HabitHome today and let AI help your family establish a better chore distribution system'
                }
              </p>
              <div className="space-x-4">
                <Link
                  href={`/${locale}/auth`}
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {t('navigation.getStarted')}
                </Link>
                <Link
                  href={`/${locale}`}
                  className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {t('navigation.backToHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}