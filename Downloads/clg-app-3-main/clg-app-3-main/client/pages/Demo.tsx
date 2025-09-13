import { Link } from "react-router-dom";

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Background pattern */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"30\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            🌐 Website is <span className="text-cyan-400">LIVE</span>!
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your full-stack application is now accessible to anyone on the internet with 
            database storage, authentication, and an interactive dashboard.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-white mb-2">User Authentication</h3>
            <p className="text-gray-300 mb-4">Complete login and signup system with secure sessions</p>
            <Link to="/" className="text-cyan-400 hover:text-cyan-300 underline">
              Try Login →
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-white mb-2">Interactive Dashboard</h3>
            <p className="text-gray-300 mb-4">Beautiful dashboard with GIGS, Messenger, Campus Map, and more</p>
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 underline">
              Create Account →
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">API Testing</h3>
            <p className="text-gray-300 mb-4">Test all backend endpoints and see the database in action</p>
            <Link to="/api-test" className="text-cyan-400 hover:text-cyan-300 underline">
              Test APIs →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">✅ What's Working</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">🛠️ Backend Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ SQLite Database Storage</li>
                <li>✅ User Registration & Login</li>
                <li>✅ Session Management</li>
                <li>✅ Password Validation</li>
                <li>✅ API Endpoints</li>
                <li>✅ Data Persistence</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">🎨 Frontend Features</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ Responsive Design</li>
                <li>✅ Interactive Dashboard</li>
                <li>✅ Beautiful Login/Signup</li>
                <li>✅ Real-time Feedback</li>
                <li>✅ Mobile-Friendly</li>
                <li>✅ Professional UI</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-16">
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-4">🗄️</div>
            <div>
              <h3 className="text-xl font-semibold text-green-400">Database Storage Active</h3>
              <p className="text-green-300">All user data is now stored persistently in SQLite database</p>
            </div>
          </div>
          <div className="bg-black/20 rounded-lg p-4 font-mono text-sm text-green-300">
            <div>📁 Storage Location: ./data/users.db</div>
            <div>🔒 Storage Type: SQLite Database</div>
            <div>💾 Persistence: ✅ Data survives server restarts</div>
            <div>🌐 Public Access: ✅ Available worldwide</div>
          </div>
        </div>

        {/* Public URLs */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-16">
          <h3 className="text-xl font-semibold text-blue-400 mb-4">🔗 Share These Public URLs</h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="bg-black/20 rounded p-3 text-blue-300">
              <strong>Homepage:</strong> {window.location.origin}
            </div>
            <div className="bg-black/20 rounded p-3 text-blue-300">
              <strong>Sign Up:</strong> {window.location.origin}/signup
            </div>
            <div className="bg-black/20 rounded p-3 text-blue-300">
              <strong>API Test:</strong> {window.location.origin}/api-test
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">🚀 Get Started</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/signup"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Your Account
            </Link>
            <Link 
              to="/"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-colors border border-white/20"
            >
              Login to Dashboard
            </Link>
            <Link 
              to="/api-test"
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Test Backend APIs
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p>🎉 Your full-stack application is live and ready for users worldwide!</p>
        </div>
      </div>
    </div>
  );
}
