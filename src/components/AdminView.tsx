import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, RefreshCw, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, Table, OrderItem } from '../pages/Index';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface AdminViewProps {
  orders: Order[];
  tables: Table[];
  onBack: () => void;
  onLogout: () => void;
  onStartPreparing: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onViewOrderHistory: () => void;
  user: { id: string; username: string; role: string };
}

const AdminView: React.FC<AdminViewProps> = ({
  orders,
  tables,
  onBack,
  onLogout,
  onStartPreparing,
  onCancelOrder,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'users' | 'analytics'>('active');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<'active' | 'preparing' | 'served'>('active');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string; role: 'waiter' | 'admin' }[]>([]);

  // Load users for User Management tab
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('id, username, role');
    if (data) setUsers(data.map(u => ({
      ...u,
      role: u.role as 'waiter' | 'admin'
    })));
  };

  const handleRoleChange = async (userId: string, newRole: 'waiter' | 'admin') => {
    await supabase.from('users').update({ role: newRole as 'waiter' | 'admin' }).eq('id', userId);
    loadUsers();
    toast.success('Role updated!');
  };

  const activeOrders = orders.filter(order => order.status === 'active');
  const orderHistory = orders.filter(order => order.status !== 'active');

  // Filtering logic for order history
  const filteredHistory = orderHistory.filter(order => {
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    const matchesTable = filterTable ? String(order.tableId) === filterTable : true;
    const matchesUser = filterUser ? (order.username && order.username.includes(filterUser)) : true;
    // Date filtering is a placeholder (if order.timestamp is available)
    const matchesDate = filterDate ? order.timestamp.toISOString().slice(0, 10) === filterDate : true;
    return matchesStatus && matchesTable && matchesUser && matchesDate;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'active':
        return 'var(--gradient-warning)';
      case 'preparing':
        return 'var(--gradient-primary)';
      case 'served':
        return 'var(--gradient-success)';
      default:
        return 'var(--gradient-primary)';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Open edit modal
  const openEditModal = (order: Order) => {
    setEditOrder(order);
    setEditStatus(order.status);
    setEditItems(order.items);
  };
  // Close edit modal
  const closeEditModal = () => {
    setEditOrder(null);
  };
  // Save edit (backend logic)
  const saveEdit = async () => {
    if (!editOrder) return;
    try {
      // Update order status
      await supabase
        .from('orders')
        .update({ status: editStatus })
        .eq('id', editOrder.id);
      // Update order items (delete all and re-insert for simplicity)
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', editOrder.id);
      const itemsData = editItems.map(item => ({
        order_id: editOrder.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price
      }));
      if (itemsData.length > 0) {
        await supabase.from('order_items').insert(itemsData);
      }
      toast.success('Order updated!');
      closeEditModal();
      // Optionally reload orders (real-time should update, but force reload for safety)
      window.location.reload();
    } catch (error) {
      toast.error('Error updating order: ' + (error.message || error));
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{ background: 'var(--gradient-admin)' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-white/3 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 px-6">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-transparent text-white/60'}`}
            onClick={() => setActiveTab('active')}
          >
            Active Orders
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-transparent text-white/60'}`}
            onClick={() => setActiveTab('history')}
          >
            Order History
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-transparent text-white/60'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold focus:outline-none ${activeTab === 'analytics' ? 'bg-white/20 text-white' : 'bg-transparent text-white/60'}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'analytics' && (
          <div className="px-6 pb-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h2>
              {/* Total Sales */}
              <div className="mb-6 p-4 rounded-lg bg-white/10 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Total Sales</h3>
                <div className="text-2xl font-bold text-green-300">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</div>
              </div>
              {/* Orders Per Day Bar Chart */}
              <div className="mb-6 p-4 rounded-lg bg-white/10 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Orders Per Day</h3>
                {(() => {
                  const dayCounts: Record<string, number> = {};
                  orders.forEach(order => {
                    const day = order.timestamp.toISOString().slice(0, 10);
                    dayCounts[day] = (dayCounts[day] || 0) + 1;
                  });
                  const days = Object.keys(dayCounts).sort();
                  const max = Math.max(...Object.values(dayCounts), 1);
                  return (
                    <svg width="100%" height="120" viewBox={`0 0 ${days.length * 40} 120`} className="w-full">
                      {days.map((day, i) => (
                        <g key={day}>
                          <rect x={i * 40 + 10} y={120 - (dayCounts[day] / max) * 100} width="20" height={(dayCounts[day] / max) * 100} fill="#38bdf8" rx="4" />
                          <text x={i * 40 + 20} y={115} textAnchor="middle" fontSize="10" fill="#fff">{day.slice(5)}</text>
                          <text x={i * 40 + 20} y={120 - (dayCounts[day] / max) * 100 - 5} textAnchor="middle" fontSize="10" fill="#fff">{dayCounts[day]}</text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </div>
              {/* Most Popular Menu Items Bar Chart */}
              <div className="mb-6 p-4 rounded-lg bg-white/10 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Most Popular Menu Items</h3>
                {(() => {
                  const itemCounts: Record<string, number> = {};
                  orders.forEach(order => {
                    order.items.forEach(item => {
                      itemCounts[item.menuItem.name] = (itemCounts[item.menuItem.name] || 0) + item.quantity;
                    });
                  });
                  const items = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                  const max = Math.max(...items.map(i => i[1]), 1);
                  return (
                    <svg width="100%" height="120" viewBox={`0 0 ${items.length * 60} 120`} className="w-full">
                      {items.map(([name, qty], i) => (
                        <g key={name}>
                          <rect x={i * 60 + 20} y={120 - (qty / max) * 100} width="30" height={(qty / max) * 100} fill="#a78bfa" rx="4" />
                          <text x={i * 60 + 35} y={115} textAnchor="middle" fontSize="10" fill="#fff">{name.length > 8 ? name.slice(0, 8) + '…' : name}</text>
                          <text x={i * 60 + 35} y={120 - (qty / max) * 100 - 5} textAnchor="middle" fontSize="10" fill="#fff">{qty}</text>
                        </g>
                      ))}
                    </svg>
                  );
                })()}
              </div>
              {/* Busiest Tables */}
              <div className="mb-6 p-4 rounded-lg bg-white/10 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-2">Busiest Tables</h3>
                <table className="min-w-full text-white text-sm">
                  <thead>
                    <tr><th className="px-4 py-2">Table</th><th className="px-4 py-2">Orders</th></tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const tableCounts: Record<string, number> = {};
                      orders.forEach(order => {
                        tableCounts[order.tableId] = (tableCounts[order.tableId] || 0) + 1;
                      });
                      return Object.entries(tableCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([table, count]) => (
                          <tr key={table}><td className="px-4 py-2">{table}</td><td className="px-4 py-2">{count}</td></tr>
                        ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'active' ? (
          <>
            {/* Header */}
            <header className="p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={onBack}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Dashboard
                    </Button>
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">Restaurant Management</h1>
                      <div className="flex items-center space-x-3">
                        <span className="text-white/80 text-lg">Welcome, Bonagiri Sanjana!</span>
                        <Badge 
                          className="bg-white/20 text-white border-white/30"
                          style={{ background: 'var(--gradient-primary)' }}
                        >
                          Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                      onClick={() => setActiveTab('history')}
                    >
                      View Order History
                    </Button>
                    <Button
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    
                    <Button
                      onClick={onLogout}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Active Orders Section */}
            <main className="px-6 pb-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">Active Orders</h2>
                  <Button
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {/* Orders Grid */}
                {activeOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <Clock className="w-20 h-20 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 text-2xl mb-2">No active orders</p>
                    <p className="text-white/40">Orders will appear here when placed</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeOrders.map(order => (
                      <Card
                        key={order.id}
                        className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-slide-in"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">
                                Table {order.tableId}
                              </h3>
                              <p className="text-white/70">
                                {formatTime(order.timestamp)}
                              </p>
                            </div>
                            <Badge 
                              className={`text-white font-medium px-3 py-1 animate-badge-pulse ${order.status === 'preparing' ? 'shadow-lg shadow-pink-400/40' : ''} ${order.status === 'active' ? 'animate-badge-glow' : ''}`}
                              style={{ background: getStatusColor(order.status) }}
                            >
                              {order.status === 'active' ? 'Pending' : 
                               order.status === 'preparing' ? 'Preparing' : 'Ready'}
                            </Badge>
                          </div>

                          <div className="mb-6">
                            <h4 className="text-white/90 font-semibold mb-3">Items:</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-white/80">
                                  <span className="text-sm">
                                    {item.quantity}x {item.menuItem.name}
                                  </span>
                                  <span className="text-sm font-medium">
                                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-white/20 pt-4 mb-6">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-bold text-lg">Total:</span>
                              <span className="text-white font-bold text-xl">
                                ${order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {order.status === 'active' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      className="w-full h-12 font-bold text-white transition-transform duration-200 active:scale-95"
                                      style={{ background: 'var(--gradient-primary)' }}
                                      onClick={() => onStartPreparing(order.id)}
                                      aria-label="Start Preparing"
                                    >
                                      Start Preparing
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" align="center">
                                    Begin preparing this order!
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            {order.status === 'preparing' && (
                              <Button 
                                className="w-full h-12 font-bold text-white"
                                style={{ background: 'var(--gradient-success)' }}
                              >
                                Mark Ready
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline"
                              className="w-full h-10 font-medium bg-white/10 border-red-400/50 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-transform duration-200 active:scale-95"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  onCancelOrder(order.id);
                                }
                              }}
                            >
                              Cancel Order
                            </Button>
                            <Button
                              className="mr-2 px-3 py-1 text-xs font-semibold border border-blue-400/30 text-blue-200 bg-blue-900/40"
                              onClick={() => openEditModal(order)}
                            >
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </>
        ) : (
          <div className="px-6 pb-6">
            <div className="max-w-7xl mx-auto">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4">
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="px-2 py-1 rounded border border-white/20 bg-white/10 text-white"
                  placeholder="Date"
                />
                <input
                  type="text"
                  value={filterTable}
                  onChange={e => setFilterTable(e.target.value)}
                  className="px-2 py-1 rounded border border-white/20 bg-white/10 text-white"
                  placeholder="Table #"
                />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-2 py-1 rounded border border-white/20 bg-white/10 text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="preparing">Preparing</option>
                  <option value="served">Served</option>
                </select>
                <input
                  type="text"
                  value={filterUser}
                  onChange={e => setFilterUser(e.target.value)}
                  className="px-2 py-1 rounded border border-white/20 bg-white/10 text-white"
                  placeholder="User"
                />
              </div>
              {/* Order History Table */}
              <div className="overflow-x-auto rounded-lg bg-white/10 border border-white/20">
                <table className="min-w-full text-white text-sm">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="px-4 py-2">Order ID</th>
                      <th className="px-4 py-2">Table</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Placed At</th>
                      <th className="px-4 py-2">Total</th>
                      <th className="px-4 py-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(order => (
                      <tr key={order.id} className="border-t border-white/10">
                        <td className="px-4 py-2 font-mono">{order.id}</td>
                        <td className="px-4 py-2">{order.tableId}</td>
                        <td className="px-4 py-2 capitalize">{order.status}</td>
                        <td className="px-4 py-2">{order.timestamp.toLocaleString()}</td>
                        <td className="px-4 py-2">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-2">{order.username || '-'}</td>
                        <td className="px-4 py-2">
                          <Button
                            className="mr-2 px-3 py-1 text-xs font-semibold border border-blue-400/30 text-blue-200 bg-blue-900/40"
                            onClick={() => openEditModal(order)}
                          >
                            Edit
                          </Button>
                          <Button
                            className="px-3 py-1 text-xs font-semibold border border-red-400/30 text-red-200 bg-red-900/40"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this order?')) {
                                onCancelOrder(order.id);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredHistory.length === 0 && (
                  <div className="text-center text-white/60 py-8">No orders found for selected filters.</div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="px-6 pb-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
              <table className="min-w-full text-white text-sm bg-white/10 border border-white/20 rounded-lg">
                <thead>
                  <tr className="bg-white/10">
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t border-white/10">
                      <td className="px-4 py-2">{u.username}</td>
                      <td className="px-4 py-2">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as 'waiter' | 'admin')}
                          className="px-2 py-1 rounded border border-white/20 bg-white/10 text-white"
                        >
                          <option value="waiter">Waiter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {editOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Order</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as 'active' | 'preparing' | 'served')}
                className="w-full px-2 py-1 rounded border border-gray-300"
              >
                <option value="active">Active</option>
                <option value="preparing">Preparing</option>
                <option value="served">Served</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Items</label>
              <ul>
                {editItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-2">
                    <span className="flex-1">{item.menuItem.name}</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => {
                        const newItems = [...editItems];
                        newItems[idx].quantity = parseInt(e.target.value, 10);
                        setEditItems(newItems);
                      }}
                      className="w-16 px-2 py-1 rounded border border-gray-300"
                    />
                    <button
                      className="ml-2 text-red-500"
                      onClick={() => setEditItems(editItems.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeEditModal} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;

// Animations for badge pulse, glow, and card fade-slide-in
import './AdminViewAnimations.css';