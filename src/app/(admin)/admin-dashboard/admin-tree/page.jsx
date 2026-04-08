"use client";
import { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import { ZoomIn, ZoomOut, Move, Search, Layers } from "lucide-react";

const TreeNode = ({ node, onNodeClick, maxLevel, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  // যদি নোড না থাকে অথবা ইউজারের সিলেক্ট করা লেভেলের বাইরে চলে যায় তবে দেখাবে না
  if (!node || node.level > maxLevel) return null;

  const shouldShowMember = viewMode === "full" || node.level === maxLevel;

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      {shouldShowMember ? (
        <div className="relative group">
          {/* প্রোফাইল পিকচার এবং গোল কার্ড */}
          <div
            onClick={() => onNodeClick(node.username)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-10 h-10 rounded-full overflow-hidden shadow-xl cursor-pointer transform hover:scale-125 transition-all duration-300 border-4 relative z-10 ${
              node.status === "active"
                ? "border-emerald-400 ring-2 ring-emerald-50"
                : "border-rose-400 ring-2 ring-rose-50"
            }`}
          >
            <img
              src={node.profile_picture || "/default-avatar.png"}
              alt={node.username}
              className="w-full h-full object-cover"
            />
          </div>

          {/* লেভেল ট্যাগ */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-lg z-20 border border-slate-700">
            L{node.level}
          </div>

          {/* ইউজারনেম */}
          <div className="mt-1 flex flex-col items-center">
            <span className="text-[8px] font-black text-slate-800 uppercase tracking-tighter">
              {node.username.slice(0, 7)}
            </span>
          </div>

          {/* Tooltip */}
          {isHovered && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-xl whitespace-nowrap z-50 shadow-2xl border border-slate-700">
              <div className="font-bold text-indigo-300 border-b border-slate-700 pb-1 mb-1 text-center">
                {node.username}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Position:</span>
                  <span className="font-bold text-emerald-400 uppercase">
                    {node.position || "Root"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`${node.status === "active" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {node.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-2 h-2 bg-slate-200 rounded-full mb-2"></div>
      )}

      {/* কানেক্টিং লাইনস এবং চিলড্রেন রেন্ডারিং */}
      {(node.left || node.right) && node.level < maxLevel && (
        <div className="flex gap-4 md:gap-8 mt-4 relative">
          <div className="absolute top-[-10px] left-1/2 w-[65%] h-[1px] bg-slate-300 -translate-x-1/2"></div>

          {/* বাম পাশের চাইল্ড */}
          <div className="relative">
            <div className="absolute top-[-10px] left-1/2 w-[1px] h-[10px] bg-slate-300"></div>
            <TreeNode
              node={node.left}
              onNodeClick={onNodeClick}
              maxLevel={maxLevel}
              viewMode={viewMode}
            />
          </div>

          {/* ডান পাশের চাইল্ড */}
          <div className="relative">
            <div className="absolute top-[-10px] left-1/2 w-[1px] h-[10px] bg-slate-300"></div>
            <TreeNode
              node={node.right}
              onNodeClick={onNodeClick}
              maxLevel={maxLevel}
              viewMode={viewMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function EnhancedTreeView() {
  const [treeData, setTreeData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxLevel, setMaxLevel] = useState(4); // ডিফল্ট ভিউ ৪ লেভেল
  const [viewMode, setViewMode] = useState("full");
  const [zoom, setZoom] = useState(100);

  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // ড্র্যাগ করে স্ক্রল করার লজিক
  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragState({
      startX: e.pageX - scrollRef.current.offsetLeft,
      startY: e.pageY - scrollRef.current.offsetTop,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    });
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const y = e.pageY - scrollRef.current.offsetTop;
    const walkX = (x - dragState.startX) * 1.5;
    const walkY = (y - dragState.startY) * 1.5;
    scrollRef.current.scrollLeft = dragState.scrollLeft - walkX;
    scrollRef.current.scrollTop = dragState.scrollTop - walkY;
  };

  // আনলিমিটেড লেভেল ফেচ করার রিকাসিভ ফাংশন
  const fetchCompleteTree = async (username, currentLevel = 0) => {
    if (!username) return null;
    try {
      const res = await api.get(`accounts/tree/${username}/`);
      const node = res.data;
      if (node) {
        // এখানে কোনো লেভেল লিমিট নেই, ডাটা থাকলে ফেচ হতেই থাকবে
        const [l, r] = await Promise.all([
          node.left?.username
            ? fetchCompleteTree(node.left.username, currentLevel + 1)
            : null,
          node.right?.username
            ? fetchCompleteTree(node.right.username, currentLevel + 1)
            : null,
        ]);
        return { ...node, level: currentLevel, left: l, right: r };
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchTree = async (targetUsername) => {
    const user = targetUsername || search;
    if (!user || !user.trim()) return;
    setLoading(true);
    const data = await fetchCompleteTree(user);
    setTreeData(data);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Control Bar */}
        <div className="bg-white/80 backdrop-blur p-4 rounded-[2rem] shadow-xl border border-slate-100 mb-6 flex flex-wrap items-center justify-between gap-4 relative z-30">
          {/* সার্চ বক্স */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border">
            <Search size={14} className="text-slate-400" />
            <input
              placeholder="Username..."
              className="bg-transparent outline-none font-bold text-xs w-24"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchTree()}
            />
            <button
              onClick={() => fetchTree()}
              className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-[9px] font-black hover:bg-indigo-700 transition-colors"
            >
              {loading ? "FETCHING..." : "SEARCH"}
            </button>
          </div>

          {/* ভিউ মোড */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl border">
            <button
              onClick={() => setViewMode("full")}
              className={`px-3 py-1 rounded-xl text-[9px] font-black transition-all ${viewMode === "full" ? "bg-white shadow text-indigo-600" : "text-slate-400"}`}
            >
              FULL TREE
            </button>
            <button
              onClick={() => setViewMode("isolated")}
              className={`px-3 py-1 rounded-xl text-[9px] font-black transition-all ${viewMode === "isolated" ? "bg-white shadow text-indigo-600" : "text-slate-400"}`}
            >
              BY LEVEL
            </button>
          </div>

          {/* জুম কন্ট্রোল */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border">
            <button
              onClick={() => setZoom((z) => Math.max(20, z - 10))}
              className="p-1.5 hover:bg-white rounded-lg"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] font-bold w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1.5 hover:bg-white rounded-lg"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* লেভেল ফিল্টার (এখানে ২০ লেভেল পর্যন্ত সেট করা হয়েছে) */}
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl border">
            <Layers size={14} className="text-indigo-600" />
            <input
              type="range"
              min="0"
              max="50" // তোমার চাহিদা অনুযায়ী এখানে ২০ বা তার বেশি দিতে পারো
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value))}
              className="w-32 h-1 accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] font-bold text-indigo-600 min-w-[20px]">
              L{maxLevel}
            </span>
          </div>
        </div>

        {/* Tree Canvas */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={() => setIsDragging(false)}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={onMouseMove}
          className={`bg-white rounded-[3rem] shadow-inner border border-slate-100 p-10 overflow-auto min-h-[700px] flex justify-center items-start scrollbar-hide relative z-10 cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
        >
          {treeData ? (
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease-out",
              }}
              className="pt-10 pb-40"
            >
              <TreeNode
                node={treeData}
                onNodeClick={(clickedUser) => fetchTree(clickedUser)}
                maxLevel={maxLevel}
                viewMode={viewMode}
              />
            </div>
          ) : (
            <div className="mt-48 flex flex-col items-center gap-4">
              <div className="text-slate-200 text-6xl font-black italic tracking-tighter uppercase opacity-50">
                Binary Tree
              </div>
              <p className="text-slate-400 text-xs font-medium">
                Enter a username to visualize the network
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS for hiding scrollbars */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
