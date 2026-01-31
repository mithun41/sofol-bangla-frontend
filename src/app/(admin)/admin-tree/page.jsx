"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

const TreeNode = ({ node, level = 0 }) => {
  if (!node) {
    return (
      <div className="flex flex-col items-center mt-4">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-[10px] text-gray-400">
          Empty
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-lg ${node.status === "active" ? "bg-green-500" : "bg-red-400"}`}
      >
        <span className="text-[10px] font-bold">{node.username}</span>
        <span className="text-[8px] opacity-80">{node.placement_id}</span>
      </div>

      {level < 2 && (
        <div className="flex gap-8 mt-8 relative">
          <div className="absolute top-[-20px] left-1/2 w-[80%] h-[2px] bg-gray-200 -translate-x-1/2"></div>
          <TreeNode node={node.left} level={level + 1} />
          <TreeNode node={node.right} level={level + 1} />
        </div>
      )}
    </div>
  );
};

export default function TreeViewPage() {
  const [treeData, setTreeData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  const fetchTree = async () => {
    // 1. Faka search handle kora
    if (!search.trim()) {
      setErrorMessage("Please enter a username.");
      setTreeData(null);
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Purono error muche fela

    try {
      const res = await api.get(`accounts/tree/${search}/`);
      setTreeData(res.data);
    } catch (err) {
      // 2. 404 ba onno error handle kora
      setTreeData(null);
      if (err.response && err.response.status === 404) {
        setErrorMessage("User not found! Please check the username.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load-e faka call bondho kora
  useEffect(() => {
    if (search) fetchTree();
  }, []);

  return (
    <div className="p-10 bg-white min-h-screen overflow-auto">
      <div className="mb-10 flex flex-col items-center">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Username"
            className="border p-2 rounded text-black outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTree()} // Enter press korle search hobe
          />
          <button
            onClick={fetchTree}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Searching..." : "Search Tree"}
          </button>
        </div>

        {/* 3. Error Message UI */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}
      </div>

      {treeData ? (
        <div className="flex justify-center min-w-[800px] mt-10">
          <TreeNode node={treeData} />
        </div>
      ) : (
        !loading &&
        !errorMessage && (
          <p className="text-center text-gray-400 mt-10">
            Search for a user to visualize the tree.
          </p>
        )
      )}
    </div>
  );
}
