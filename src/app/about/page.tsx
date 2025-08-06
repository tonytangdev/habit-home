import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              關於 <span className="text-primary-600">HabitHome</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              智能家務分配工具，讓家庭生活更和諧
            </p>
          </div>

          {/* App 功能詳細介紹 */}
          <div className="space-y-12">
            {/* 公平分配 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="text-5xl">⚖️</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">智能公平分配</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    HabitHome 使用先進的算法來確保家務分配的公平性，考慮每個成員的：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>個人偏好和擅長的家務類型</li>
                    <li>可用時間和工作排程</li>
                    <li>身體能力和限制</li>
                    <li>過往完成任務的表現</li>
                  </ul>
                  <p className="text-gray-600">
                    系統會自動調整任務分配，確保每個人都能在合理的負擔下貢獻家庭。
                  </p>
                </div>
              </div>
            </div>

            {/* 進度追蹤 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="text-5xl">📊</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">實時進度追蹤</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    透過直觀的儀表板，所有家庭成員都能清楚了解：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>當前待完成的任務列表</li>
                    <li>每個成員的任務完成狀況</li>
                    <li>本週、本月的家務統計</li>
                    <li>即將到期的重要家務提醒</li>
                  </ul>
                  <p className="text-gray-600">
                    保持透明的溝通環境，避免因為家務分工不均而產生的摩擦。
                  </p>
                </div>
              </div>
            </div>

            {/* 積分系統 */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start space-x-6">
                <div className="text-5xl">🏆</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">激勵積分系統</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    讓做家務變得有趣！我們的積分系統包含：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                    <li>完成任務獲得積分獎勵</li>
                    <li>連續完成獲得額外獎勵</li>
                    <li>月度家務之星排行榜</li>
                    <li>成就徽章和里程碑慶祝</li>
                  </ul>
                  <p className="text-gray-600">
                    量化每個人的貢獻，提升參與動機，讓家務分工變成一件值得期待的事情。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 使用步驟 */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">如何開始使用</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">1️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">註冊帳號</h3>
                <p className="text-gray-600 text-sm">創建您的 HabitHome 帳號，開始您的智能家務管理之旅</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">2️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">建立家庭</h3>
                <p className="text-gray-600 text-sm">邀請家庭成員加入，設定每個人的偏好和時間安排</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">3️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">設定任務</h3>
                <p className="text-gray-600 text-sm">添加您家中的日常家務，系統會智能分配給合適的成員</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-3xl mb-4">4️⃣</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">開始執行</h3>
                <p className="text-gray-600 text-sm">按照分配完成任務，獲得積分，享受和諧的家庭生活</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="bg-primary-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">準備好開始了嗎？</h2>
              <p className="text-gray-600 mb-6">
                立即註冊 HabitHome，讓 AI 幫助您的家庭建立更好的家務分工制度
              </p>
              <div className="space-x-4">
                <Link
                  href="/auth"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  立即開始
                </Link>
                <Link
                  href="/"
                  className="inline-block border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  返回首頁
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}