"use client";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { ZoomIn, ZoomOut, TreeDeciduous, Move, Layers } from "lucide-react";

const TreeNode = ({ node, maxLevel, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);

  // যদি নোড না থাকে অথবা ইউজারের সিলেক্ট করা লেভেলের বাইরে চলে যায় তবে দেখাবে না
  if (!node || node.level > maxLevel) return null;

  const shouldShowMember = viewMode === "full" || node.level === maxLevel;

  return (
    <div className="flex flex-col items-center animate-fadeIn">
      {shouldShowMember ? (
        <div className="relative group">
          {/* প্রোফাইল পিকচার */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-10 h-10 rounded-full border-4 shadow-xl cursor-pointer overflow-hidden transform hover:scale-125 transition-all duration-300 relative z-10 ${
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
          <div className="mt-1 text-[8px] font-black text-slate-700 uppercase tracking-tighter text-center">
            {node.username.slice(0, 7)}
          </div>

          {/* Hover Tooltip */}
          {isHovered && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-xl whitespace-nowrap z-50 shadow-2xl border border-slate-700">
              <div className="font-bold text-indigo-300 border-b border-slate-700 pb-1 mb-1 text-center">
                {node.username}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Division:</span>
                  <span className="font-bold text-emerald-400">
                    {node.division || "N/A"}
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
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-2 h-2 bg-slate-200 rounded-full mb-2"></div>
      )}

      {/* কানেক্টিং লাইনস */}
      {(node.left || node.right) && node.level < maxLevel && (
        <div className="flex gap-4 md:gap-8 mt-4 relative">
          <div className="absolute top-[-10px] left-1/2 w-[65%] h-[1px] bg-slate-300 -translate-x-1/2"></div>

          <div className="relative">
            <div className="absolute top-[-10px] left-1/2 w-[1px] h-[10px] bg-slate-300"></div>
            <TreeNode
              node={node.left}
              maxLevel={maxLevel}
              viewMode={viewMode}
            />
          </div>

          <div className="relative">
            <div className="absolute top-[-10px] left-1/2 w-[1px] h-[10px] bg-slate-300"></div>
            <TreeNode
              node={node.right}
              maxLevel={maxLevel}
              viewMode={viewMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function MyTreePage() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [maxLevel, setMaxLevel] = useState(4); // ডিফল্ট ৪ লেভেল
  const [viewMode, setViewMode] = useState("full");

  // Drag to Scroll Logic
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

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

  // আনলিমিটেড লেভেল ফেচ করার জন্য রিকাসিভ ফাংশন
  const fetchTreeRecursively = async (username, currentLevel = 0) => {
    if (!username) return null;
    try {
      const res = await api.get(`accounts/tree/${username}/`);
      const node = res.data;
      if (node) {
        const [l, r] = await Promise.all([
          node.left?.username
            ? fetchTreeRecursively(node.left.username, currentLevel + 1)
            : null,
          node.right?.username
            ? fetchTreeRecursively(node.right.username, currentLevel + 1)
            : null,
        ]);
        return { ...node, level: currentLevel, left: l, right: r };
      }
      return null;
    } catch (err) {
      console.error("Error fetching node:", username, err);
      return null;
    }
  };

  useEffect(() => {
    const initTree = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get("accounts/profile/");
        const data = await fetchTreeRecursively(profileRes.data.username);
        setTreeData(data);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initTree();
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-400 animate-pulse">
          Building your network tree...
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-[2rem] border p-6 shadow-sm overflow-hidden">
      {/* Control Bar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-xl font-black flex items-center gap-2">
          <TreeDeciduous className="text-emerald-500" /> My Network
        </h1>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border">
          {/* View Mode */}
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("full")}
              className={`px-3 py-1 text-[9px] font-black rounded transition-all ${viewMode === "full" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}
            >
              FULL
            </button>
            <button
              onClick={() => setViewMode("isolated")}
              className={`px-3 py-1 text-[9px] font-black rounded transition-all ${viewMode === "isolated" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}
            >
              LEVEL
            </button>
          </div>

          {/* Depth Slider (২০ লেভেল পর্যন্ত আপডেট করা হয়েছে) */}
          <div className="flex items-center gap-2 border-l pl-3">
            <Layers size={12} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase">
              Depth
            </span>
            <input
              type="range"
              min="0"
              max="20"
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value))}
              className="w-24 h-1 accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] font-bold text-indigo-600 w-6">
              L{maxLevel}
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l pl-3">
            <button
              onClick={() => setZoom((z) => Math.max(30, z - 10))}
              className="p-1.5 hover:bg-white rounded-lg transition-all"
            >
              <ZoomOut size={14} className="text-slate-500" />
            </button>
            <span className="text-[10px] font-bold w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1.5 hover:bg-white rounded-lg transition-all"
            >
              <ZoomIn size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tree Area */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={onMouseMove}
        className={`overflow-auto min-h-[550px] border rounded-[2rem] bg-slate-50/50 flex justify-center p-10 cursor-grab ${isDragging ? "cursor-grabbing" : ""} scrollbar-hide`}
      >
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out",
          }}
          className="pt-6 pb-20"
        >
          {treeData && (
            <TreeNode node={treeData} maxLevel={maxLevel} viewMode={viewMode} />
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex justify-center gap-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm"></div>{" "}
          Active
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm"></div>{" "}
          Inactive
        </div>
        <div className="flex items-center gap-1.5">
          <Move size={10} className="text-slate-400" /> Drag to Move
        </div>
      </div>

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
