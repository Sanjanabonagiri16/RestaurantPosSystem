import React, { useState } from 'react';
import { ArrowLeft, LogOut, RefreshCw, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order, Table } from '../pages/Index';

interface AdminViewProps {
  orders: Order[];
  tables: Table[];
  onBack: () => void;
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({
  orders,
  tables,
  onBack,
  onLogout,
}) => {
  const activeOrders = orders.filter(order => order.status === 'active');
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

  return (
    <div 
      className="min-h-screen relative"
      style={{ background: 'var(--gradient-bg)' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-white/3 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
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
                    className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300"
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
                          className="text-white font-medium px-3 py-1"
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
                          <Button 
                            className="w-full h-12 font-bold text-white"
                            style={{ background: 'var(--gradient-primary)' }}
                          >
                            Start Preparing
                          </Button>
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
                          className="w-full h-10 font-medium bg-white/10 border-red-400/50 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                        >
                          Cancel Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminView;