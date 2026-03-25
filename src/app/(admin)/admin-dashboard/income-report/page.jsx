"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, ShoppingBag, Search, Loader2 } from 'lucide-react';
import api from '@/services/api';

const SalesReportPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        filter: 'today',
        start_date: '',
        end_date: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('orders/admin/sales-report/', { params: filters });
            setData(res.data);
        } catch (err) {
            console.error("Sales data fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.filter]); // ফিল্টার ড্রপডাউন চেঞ্জ হলে অটো কল হবে

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" /> Sales & Order Analytics
            </h1>

            {/* ফিল্টার সেকশন */}
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <select 
                        className="border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.filter}
                        onChange={(e) => setFilters({...filters, filter: e.target.value})}
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="15days">Last 15 Days</option>
                        <option value="1month">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {filters.filter === 'custom' && (
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <input 
                                type="date" 
                                className="border rounded-lg px-2 py-2"
                                onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                                required
                            />
                            <span>to</span>
                            <input 
                                type="date" 
                                className="border rounded-lg px-2 py-2"
                                onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                                required
                            />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                                <Search size={20} />
                            </button>
                        </form>
                    )}
                </div>

                <button onClick={fetchData} className="text-blue-600 hover:underline text-sm font-medium">
                    Refresh Data
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <>
                    {/* সামারি কার্ডস */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex justify-between items-center opacity-80 mb-2">
                                <span>Total Revenue</span>
                                <DollarSign size={24} />
                            </div>
                            <h2 className="text-3xl font-bold">৳ {data?.summary?.total_income?.toLocaleString()}</h2>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex justify-between items-center opacity-80 mb-2">
                                <span>Total Orders</span>
                                <ShoppingBag size={24} />
                            </div>
                            <h2 className="text-3xl font-bold">{data?.summary?.total_orders} Orders</h2>
                        </div>
                    </div>

                    {/* ডেইলি রিপোর্ট টেবিল */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 font-semibold">Daily Sales Breakdown</div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-center">Orders</th>
                                    <th className="p-4 text-right">Income</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.daily_stats?.length > 0 ? (
                                    data.daily_stats.map((day, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="p-4 flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(day.created_at__date).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="p-4 text-center text-blue-600 font-medium">
                                                {day.order_count}
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-800">
                                                ৳ {day.income?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-10 text-center text-gray-400">
                                            No completed orders found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default SalesReportPage;