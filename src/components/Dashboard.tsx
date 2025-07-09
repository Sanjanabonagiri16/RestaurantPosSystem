
import React from 'react';
import { LogOut, Settings, Users, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Table } from '../pages/Index';

interface DashboardProps {
  user: User;
  tables: Table[];
  onTableSelect: (tableId: number) => void;
  onLogout: () => void;
  onViewAdmin: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  tables,
  onTableSelect,
  onLogout,
  onViewAdmin,
}) => {
  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Restaurant POS</h1>
                <p className="text-sm text-slate-600">Welcome, {user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user.role === 'admin' && (
                <Button
                  onClick={onViewAdmin}
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin View
                </Button>
              )}
              
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800 text-lg">Available Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{availableTables}</div>
              <p className="text-emerald-700 text-sm">Ready for seating</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-800 text-lg">Occupied Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{occupiedTables}</div>
              <p className="text-amber-700 text-sm">Currently serving</p>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-50 border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-indigo-800 text-lg">Total Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{tables.length}</div>
              <p className="text-indigo-700 text-sm">Restaurant capacity</p>
            </CardContent>
          </Card>
        </div>

        {/* Table Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Table Overview
            </CardTitle>
            <p className="text-slate-600">Click on an available table to start taking orders</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => onTableSelect(table.id)}
                  disabled={table.status === 'occupied' || user.role === 'admin'}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-105
                    ${table.status === 'available'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer'
                      : 'bg-amber-50 border-amber-200 text-amber-800 cursor-not-allowed opacity-75'
                    }
                    ${user.role === 'admin' ? 'cursor-not-allowed' : ''}
                  `}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">T{table.id}</div>
                    <div className={`
                      inline-block px-3 py-1 rounded-full text-xs font-medium
                      ${table.status === 'available'
                        ? 'bg-emerald-200 text-emerald-800'
                        : 'bg-amber-200 text-amber-800'
                      }
                    `}>
                      {table.status === 'available' ? 'Available' : 'Occupied'}
                    </div>
                  </div>
                  
                  {table.status === 'available' && user.role === 'waiter' && (
                    <div className="absolute inset-0 bg-emerald-500 bg-opacity-0 hover:bg-opacity-10 rounded-xl transition-all duration-200" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
