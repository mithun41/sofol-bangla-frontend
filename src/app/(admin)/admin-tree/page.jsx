"use client";
import { useState } from "react";
import api from "@/services/api";

const TreeNode = ({ node, onNodeClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!node) {
    return (
      <div className="flex flex-col items-center mt-2 opacity-30">
        <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
          <span className="text-[6px] text-gray-400">-</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* User Node */}
      <div className="relative">
        <div
          onClick={() => onNodeClick(node.username)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-white shadow-md cursor-pointer transform hover:scale-110 transition-all duration-150 border-2 relative ${
            node.status === "active"
              ? "bg-emerald-500 border-emerald-200"
              : "bg-rose-400 border-rose-200"
          }`}
        >
          {/* Username (First 4 chars) */}
          <span className="text-[8px] font-black leading-none uppercase">
            {node.username.slice(0, 6)}
          </span>

          {/* Division (Replacing ID) */}
          <span className="text-[6px] opacity-90 leading-none mt-1 font-bold">
            {node.division ? node.division.slice(0, 5) : "N/A"}
          </span>
        </div>

        {/* Enhanced Hover Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg whitespace-nowrap z-50 shadow-2xl animate-fadeIn border border-slate-700">
            <div className="font-bold text-indigo-300 border-b border-slate-700 pb-1 mb-1">
              {node.username}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[9px]">
                <span className="text-slate-400">Division:</span>{" "}
                <span className="text-emerald-400 font-bold">
                  {node.division || "Not Set"}
                </span>
              </div>
              <div className="text-[9px]">
                <span className="text-slate-400">Status:</span>{" "}
                <span
                  className={
                    node.status === "active"
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }
                >
                  {node.status === "active" ? "✓ Active" : "✗ Inactive"}
                </span>
              </div>
              <div className="text-[8px] text-slate-500 italic mt-1">
                Click to explore this branch
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>

      {/* Children Branches */}
      {(node.left || node.right) && (
        <div className="flex gap-4 md:gap-8 mt-4 relative">
          {/* Horizontal connecting line */}
          <div className="absolute top-[-8px] left-1/2 w-[60%] h-[1px] bg-gray-300 -translate-x-1/2"></div>

          {/* Left Branch */}
          <div className="relative">
            <div className="absolute top-[-8px] left-1/2 w-[1px] h-[8px] bg-gray-300"></div>
            <TreeNode node={node.left} onNodeClick={onNodeClick} />
          </div>

          {/* Right Branch */}
          <div className="relative">
            <div className="absolute top-[-8px] left-1/2 w-[1px] h-[8px] bg-gray-300"></div>
            <TreeNode node={node.right} onNodeClick={onNodeClick} />
          </div>
        </div>
      )}
    </div>
  );
};

// Recursive function to fetch complete tree
const fetchCompleteTree = async (username) => {
  if (!username) return null;
  try {
    const res = await api.get(`accounts/tree/${username}/`);
    const node = res.data;

    if (node) {
      const [leftTree, rightTree] = await Promise.all([
        node.left?.username
          ? fetchCompleteTree(node.left.username)
          : Promise.resolve(null),
        node.right?.username
          ? fetchCompleteTree(node.right.username)
          : Promise.resolve(null),
      ]);

      return { ...node, left: leftTree, right: rightTree };
    }
    return node;
  } catch (err) {
    console.error(`Error fetching tree:`, err);
    return null;
  }
};

export default function CompactFullTreeView() {
  const [treeData, setTreeData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalNodes, setTotalNodes] = useState(0);
  const [zoom, setZoom] = useState(100);

  const countNodes = (node) => {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  };

  const fetchTree = async (username) => {
    const targetUser = username || search;
    if (!targetUser.trim()) {
      setErrorMessage("Please enter a username.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const completeTree = await fetchCompleteTree(targetUser);
      setTreeData(completeTree);
      setTotalNodes(countNodes(completeTree));
      setSearch(targetUser);
    } catch (err) {
      setTreeData(null);
      setErrorMessage("User not found or API error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -4px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Search Bar & Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex flex-wrap items-center justify-center gap-4 mb-6 w-full max-w-2xl">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <span className="text-slate-400 text-sm font-bold">@</span>
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent p-2 text-slate-800 text-sm outline-none w-32 md:w-48 font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchTree()}
            />
          </div>

          <button
            onClick={() => fetchTree()}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 disabled:bg-slate-300 transition-all"
          >
            {loading ? "Searching..." : "View Tree"}
          </button>

          {treeData && (
            <div className="flex items-center gap-3 border-l pl-4">
              <button
                onClick={() => setZoom(Math.max(40, zoom - 10))}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold"
              >
                -
              </button>
              <span className="text-[11px] font-black text-slate-500 min-w-[35px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Info & Errors */}
        {errorMessage && (
          <div className="mb-4 text-rose-500 text-xs font-bold bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
            {errorMessage}
          </div>
        )}

        {treeData && !loading && (
          <div className="mb-6 flex gap-4">
            <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-[11px] font-bold text-slate-600">
              🌳 Total Network:{" "}
              <span className="text-indigo-600">{totalNodes}</span>
            </div>
          </div>
        )}

        {/* Tree Visualizer */}
        {treeData ? (
          <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 overflow-auto scrollbar-hide min-h-[600px] flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <TreeNode node={treeData} onNodeClick={fetchTree} />
            </div>
          </div>
        ) : (
          !loading && (
            <div className="mt-20 text-center opacity-20">
              <div className="text-6xl mb-4">🌳</div>
              <p className="text-xl font-bold italic text-slate-800 uppercase tracking-widest">
                Search a username to load tree
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
