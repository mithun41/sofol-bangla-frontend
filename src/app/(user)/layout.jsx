// src/app/(user)/layout.js
export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-blue-50/30">
      <header className="bg-blue-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <span className="font-bold">User Portal</span>
          <div className="flex items-center gap-4">
            <span>Hello, User!</span>
            <button className="bg-red-400 hover:bg-red-500 px-3 py-1 rounded text-sm transition">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm h-fit">
            <ul className="space-y-3 font-medium text-gray-600">
              <li className="text-blue-600">My Profile</li>
              <li>Settings</li>
              <li>Notifications</li>
            </ul>
          </aside>
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
