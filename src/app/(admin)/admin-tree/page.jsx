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
      {/* Compact User Node with Individual Hover Tooltip */}
      <div className="relative">
        <div
          onClick={() => onNodeClick(node.username)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-white shadow-md cursor-pointer transform hover:scale-125 transition-transform duration-150 border-2 relative ${
            node.status === "active"
              ? "bg-emerald-500 border-emerald-200"
              : "bg-rose-400 border-rose-200"
          }`}
        >
          <span className="text-[7px] font-bold leading-none">
            {node.username.slice(0, 4)}
          </span>
          <span className="text-[5px] opacity-70 leading-none mt-0.5">
            {node.placement_id}
          </span>
        </div>

        {/* Hover Tooltip - শুধুমাত্র এই node এ hover করলে দেখাবে */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded whitespace-nowrap z-50 shadow-lg animate-fadeIn">
            <div className="font-bold">{node.username}</div>
            <div className="text-[8px] opacity-80">ID: {node.placement_id}</div>
            <div className="text-[8px] opacity-80">
              Status: {node.status === "active" ? "✓ Active" : "✗ Inactive"}
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>

      {/* Children Container - Very Compact */}
      {(node.left || node.right) && (
        <div className="flex gap-2 md:gap-4 mt-4 relative">
          {/* Connecting Line - Thinner */}
          <div className="absolute top-[-8px] left-1/2 w-[50%] h-[1px] bg-gray-300 -translate-x-1/2"></div>

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

      return {
        ...node,
        left: leftTree,
        right: rightTree,
      };
    }

    return node;
  } catch (err) {
    console.error(`Error fetching tree for ${username}:`, err);
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
    setTreeData(null);

    try {
      const completeTree = await fetchCompleteTree(targetUser);
      setTreeData(completeTree);
      setTotalNodes(countNodes(completeTree));
      setSearch(targetUser);
    } catch (err) {
      setTreeData(null);
      setErrorMessage(
        err.response?.status === 404
          ? "User not found!"
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 md:p-4 bg-slate-50 min-h-screen overflow-auto">
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
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>

      <div className="max-w-full mx-auto flex flex-col items-center">
        {/* Compact Search Header */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="Username..."
            className="border border-slate-200 p-2 rounded-lg text-black text-sm outline-none focus:border-indigo-500 w-36 md:w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTree()}
          />
          <button
            onClick={() => fetchTree()}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-all"
          >
            {loading ? "Loading..." : "Load Tree"}
          </button>

          {/* Zoom Controls */}
          {treeData && (
            <div className="flex items-center gap-2 border-l pl-2 ml-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs"
              >
                -
              </button>
              <span className="text-xs text-slate-600 w-10 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* Compact Loading */}
        {loading && (
          <div className="mb-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
            <p className="text-indigo-600 text-xs font-semibold animate-pulse">
              🌳 Loading{" "}
              {totalNodes > 0 ? `(${totalNodes} nodes so far)` : "tree"}...
            </p>
          </div>
        )}

        {errorMessage && (
          <p className="mb-3 text-rose-500 text-xs font-semibold bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
            {errorMessage}
          </p>
        )}

        {/* Compact Stats */}
        {treeData && !loading && (
          <div className="mb-3 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
            <p className="text-emerald-700 text-xs font-semibold">
              ✅ Total:{" "}
              <span className="text-emerald-900 font-black">{totalNodes}</span>{" "}
              nodes
              <span className="ml-3 text-slate-500">
                💡 Hover on nodes to see full details
              </span>
            </p>
          </div>
        )}

        {/* Compact Tree Canvas with Zoom */}
        {treeData && (
          <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-4 overflow-auto">
            <div
              className="inline-block min-w-full"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.2s",
              }}
            >
              <div className="flex justify-center py-4">
                <TreeNode node={treeData} onNodeClick={fetchTree} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
