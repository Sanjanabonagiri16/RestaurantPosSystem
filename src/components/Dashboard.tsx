import React from 'react';
import { LogOut, Settings, Users, User as UserIcon, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Table } from '../pages/Index';
import './AdminViewAnimations.css';
import { toast } from '@/components/ui/sonner';

interface DashboardProps {
  user: User;
  tables: Table[];
  onTableSelect: (tableId: number) => void;
  onLogout: () => void;
  onViewAdmin: () => void;
  onReserveTable: (tableId: number) => void;
  onUnreserveTable: (tableId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  tables,
  onTableSelect,
  onLogout,
  onViewAdmin,
  onReserveTable,
  onUnreserveTable,
}) => {
  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const reservedTables = tables.filter(t => t.status === 'reserved').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'var(--gradient-success)';
      case 'occupied':
        return 'var(--gradient-danger)';
      case 'reserved':
        return 'var(--gradient-warning)';
      default:
        return 'var(--gradient-primary)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{ background: 'var(--gradient-dashboard)' }}
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
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Restaurant Management</h1>
                <div className="flex items-center space-x-3">
                  <span className="text-white/80 text-lg">Welcome, {user.username}!</span>
                  <Badge 
                    className="bg-white/20 text-white border-white/30 capitalize"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {user.role === 'admin' && (
                  <Button
                    onClick={onViewAdmin}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                <Button
                  onClick={onLogout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Table Management Card */}
              <Card className="lg:col-span-2 backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
                <CardHeader className="animate-fade-slide-in">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-white/20 animate-float">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Table Management</CardTitle>
                      <p className="text-white/70">View tables and place orders</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full h-12 text-lg font-semibold backdrop-blur-sm border border-white/30 text-white"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    View Tables
                  </Button>
                </CardContent>
              </Card>

              {/* User Info Card */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl animate-fade-slide-in">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-white/20 animate-float">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">User Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-white/70" />
                    <span className="text-white/90">{user.username}@restaurant.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-white/70" />
                    <span className="text-white/90 capitalize">Role: {user.role}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Status: Authenticated</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        {/* Restaurant Tables Section */}
        <main className="px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Restaurant Tables</h2>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gradient-success)' }}></div>
                  <span className="text-white/80">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gradient-danger)' }}></div>
                  <span className="text-white/80">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gradient-warning)' }}></div>
                  <span className="text-white/80">Reserved</span>
                </div>
              </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
              {tables.map((table) => (
                <Card
                  key={table.id}
                  className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-slide-in"
                  onClick={() => table.status === 'available' && user.role === 'waiter' && onTableSelect(table.id)}
                  role="region"
                  aria-label={`Table ${table.id} (${getStatusText(table.status)})`}
                  tabIndex={0}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-2xl font-bold text-white" id={`table-title-${table.id}`}>Table {table.id}</h3>
                    {/* Status Bar */}
                    <div 
                      className="h-2 rounded-full mx-4"
                      style={{ background: getStatusColor(table.status) }}
                      aria-label={`Status: ${getStatusText(table.status)}`}
                    ></div>
                    <div className="flex items-center justify-center space-x-2 text-white/80">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      <span>{table.seatCount || 4} seats</span>
                    </div>
                    {table.status === 'available' && (
                      <div className="flex flex-col gap-2">
                        {user.role === 'waiter' && (
                          <Button 
                            className="w-full h-10 font-semibold backdrop-blur-sm border border-white/30 text-white"
                            style={{ background: 'var(--gradient-primary)' }}
                            onClick={() => onTableSelect(table.id)}
                          >
                            Select Table
                          </Button>
                        )}
                        <Button
                          className="w-full h-10 font-semibold backdrop-blur-sm border border-yellow-400/30 text-yellow-200"
                          style={{ background: 'var(--gradient-warning)' }}
                          onClick={() => onReserveTable(table.id)}
                        >
                          Reserve Table
                        </Button>
                      </div>
                    )}
                    {table.status === 'reserved' && (
                      <div className="w-full h-10 rounded-lg flex items-center justify-center text-yellow-300 font-medium border border-yellow-400/30 bg-yellow-900/20">
                        Reserved
                        {user.role === 'admin' && (
                          <Button
                            size="sm"
                            className="ml-4 px-3 py-1 text-xs font-semibold border border-yellow-400/30 text-yellow-200 bg-yellow-900/40"
                            onClick={() => onUnreserveTable(table.id)}
                          >
                            Unreserve
                          </Button>
                        )}
                      </div>
                    )}
                    {table.status === 'occupied' && (
                      <div 
                        className="w-full h-10 rounded-lg flex items-center justify-center text-white/90 font-medium"
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        Occupied
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;