"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { ZoomIn, ZoomOut, RefreshCw, Maximize2 } from "lucide-react";

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

// Count total nodes in tree
const countNodes = (node) => {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
};

// Tree Node Component
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
      {/* Compact User Node with Tooltip */}
      <div className="relative">
        <div
          onClick={() => onNodeClick && onNodeClick(node.username)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-white shadow-md cursor-pointer transform hover:scale-125 transition-transform duration-150 border-2 ${
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

        {/* Hover Tooltip */}
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

      {/* Children Container */}
      {(node.left || node.right) && (
        <div className="flex gap-2 md:gap-4 mt-4 relative">
          {/* Connecting Line */}
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

export default function MyTreePage() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalNodes, setTotalNodes] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const loadTree = async () => {
    setLoading(true);
    try {
      // Get current user profile
      const profileRes = await api.get("accounts/profile/");
      const username = profileRes.data.username;
      setCurrentUser(profileRes.data);

      // Fetch complete tree recursively
      const completeTree = await fetchCompleteTree(username);
      setTreeData(completeTree);
      setTotalNodes(countNodes(completeTree));
    } catch (err) {
      console.error("Failed to load tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const handleRefresh = () => {
    loadTree();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(50, prev - 10));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-slate-600 font-semibold animate-pulse">
            Loading Your Complete Network Tree...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white"
          : "bg-white rounded-3xl shadow-sm border border-slate-100"
      }`}
    >
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

      {/* Header */}
      <div className="border-b border-slate-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">
              My Network Tree
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Complete visualization of your binary placement network
            </p>
          </div>

          {/* Stats and Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Total Nodes Badge */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-2 rounded-lg border border-emerald-200">
              <p className="text-[10px] text-emerald-600 uppercase font-bold">
                Total Members
              </p>
              <p className="text-emerald-900 font-black text-lg">
                {totalNodes}
              </p>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white rounded-md transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-3 py-2 hover:bg-white rounded-md transition-colors"
                title="Reset Zoom"
              >
                <span className="text-xs font-bold text-slate-600">
                  {zoom}%
                </span>
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white rounded-md transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleRefresh}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Refresh Tree"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              <Maximize2 className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs text-indigo-700">
            💡 <strong>Tip:</strong> Hover on any node to see full details •
            Click to navigate • Use zoom controls for better view
          </p>
        </div>
      </div>

      {/* Tree Canvas */}
      <div
        className={`overflow-auto ${
          isFullscreen ? "h-[calc(100vh-180px)]" : "max-h-[70vh]"
        } p-4 md:p-8`}
      >
        <div
          className="inline-block min-w-full"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out",
          }}
        >
          <div className="flex justify-center py-8">
            {treeData ? (
              <TreeNode node={treeData} />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 font-semibold">
                  No tree data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">
              Your Username
            </p>
            <p className="text-slate-800 font-bold text-sm">
              {currentUser?.username}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">
              Ref Code
            </p>
            <p className="text-slate-800 font-bold text-sm font-mono">
              {currentUser?.reff_id}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">
              Placement Code
            </p>
            <p className="text-slate-800 font-bold text-sm font-mono">
              {currentUser?.placement_id}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">
              Tree Depth
            </p>
            <p className="text-slate-800 font-bold text-sm">
              {totalNodes > 0 ? Math.ceil(Math.log2(totalNodes + 1)) : 0} levels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
