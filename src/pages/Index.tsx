
import React, { useState } from 'react';
import LoginPage from '../components/LoginPage';
import Dashboard from '../components/Dashboard';
import OrderView from '../components/OrderView';
import AdminView from '../components/AdminView';

export interface User {
  username: string;
  role: 'waiter' | 'admin';
}

export interface Table {
  id: number;
  status: 'available' | 'occupied';
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  total: number;
  status: 'active' | 'preparing' | 'served';
  timestamp: Date;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'order' | 'admin'>('dashboard');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      status: Math.random() > 0.7 ? 'occupied' : 'available'
    }))
  );
  const [orders, setOrders] = useState<Order[]>([]);

  const menuItems: MenuItem[] = [
    { id: 1, name: "Margherita Pizza", price: 12.99, category: "Pizza" },
    { id: 2, name: "Caesar Salad", price: 8.99, category: "Salads" },
    { id: 3, name: "Grilled Chicken", price: 15.99, category: "Mains" },
    { id: 4, name: "Fish & Chips", price: 14.99, category: "Mains" },
    { id: 5, name: "Pasta Carbonara", price: 13.99, category: "Pasta" },
    { id: 6, name: "Chocolate Cake", price: 6.99, category: "Desserts" },
    { id: 7, name: "Coffee", price: 3.99, category: "Beverages" },
    { id: 8, name: "Orange Juice", price: 4.99, category: "Beverages" },
  ];

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setSelectedTable(null);
  };

  const handleTableSelect = (tableId: number) => {
    if (tables.find(t => t.id === tableId)?.status === 'available') {
      setSelectedTable(tableId);
      setCurrentView('order');
    }
  };

  const handleOrderPlace = (orderItems: OrderItem[]) => {
    if (!selectedTable) return;

    const total = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now().toString(),
      tableId: selectedTable,
      items: orderItems,
      total,
      status: 'active',
      timestamp: new Date()
    };

    setOrders(prev => [...prev, newOrder]);
    setTables(prev => prev.map(table => 
      table.id === selectedTable 
        ? { ...table, status: 'occupied' as const }
        : table
    ));

    setCurrentView('dashboard');
    setSelectedTable(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView(user?.role === 'admin' ? 'admin' : 'dashboard');
    setSelectedTable(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          tables={tables}
          onTableSelect={handleTableSelect}
          onLogout={handleLogout}
          onViewAdmin={() => setCurrentView('admin')}
        />
      )}
      
      {currentView === 'order' && selectedTable && (
        <OrderView
          tableId={selectedTable}
          menuItems={menuItems}
          onPlaceOrder={handleOrderPlace}
          onBack={handleBackToDashboard}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminView
          orders={orders}
          tables={tables}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Index;
