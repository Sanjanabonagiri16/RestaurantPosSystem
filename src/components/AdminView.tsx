
import React from 'react';
import { ArrowLeft, LogOut, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <AlertCircle className="w-4 h-4" />;
      case 'served':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-amber-100 text-amber-800';
      case 'served':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Order management and overview</p>
              </div>
            </div>
            
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 text-lg">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{activeOrders.length}</div>
              <p className="text-blue-700 text-sm">Currently processing</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-800 text-lg">Occupied Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{occupiedTables}</div>
              <p className="text-amber-700 text-sm">Out of {tables.length} total</p>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800 text-lg">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{orders.length}</div>
              <p className="text-emerald-700 text-sm">All time</p>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-50 border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-indigo-800 text-lg">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                ${totalRevenue.toFixed(2)}
              </div>
              <p className="text-indigo-700 text-sm">Total sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">All Orders</CardTitle>
            <p className="text-slate-600">Complete order history and status</p>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No orders yet</p>
                <p className="text-slate-400">Orders will appear here when placed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(order => (
                    <div
                      key={order.id}
                      className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              Table {order.tableId}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {order.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <span className="text-xl font-bold text-slate-800">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-slate-700 mb-2">Order Items:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2"
                            >
                              <span className="text-slate-700">{item.menuItem.name}</span>
                              <span className="text-slate-600 font-medium">×{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminView;
