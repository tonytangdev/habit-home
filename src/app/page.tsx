import Link from 'next/link';

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              🏠 <span className="text-primary-600">HabitHome</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              智能家務分配工具，讓情侶、室友和家庭成員<br />
              公平分擔家務，建立和諧美好的居家環境
            </p>
            <div className="space-x-4">
              <Link
                href="/auth"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                開始使用
              </Link>
              <Link
                href="/about"
                className="inline-block border border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                了解更多
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">公平分配</h3>
              <p className="text-gray-600">
                基於每個人的偏好、能力和時間，智能分配家務任務
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">進度追蹤</h3>
              <p className="text-gray-600">
                實時查看任務完成情況，保持透明的溝通環境
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">積分系統</h3>
              <p className="text-gray-600">
                量化每個人的貢獻，提升參與動機和成就感
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">開發狀態</h2>
            <p className="text-gray-600 mb-4">
              專案正在開發中，敬請期待！我們正在打造最棒的家務分配體驗。
            </p>
            <div className="flex justify-center">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                ✅ MVP 開發階段
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}