
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  status: 'available' | 'occupied' | 'reserved';
  seatCount?: number;
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
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load tables
      const { data: tablesData } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('id');
      
      if (tablesData) {
        setTables(tablesData.map(table => ({
          id: table.id,
          status: table.status as 'available' | 'occupied' | 'reserved',
          seatCount: table.seat_count
        })));
      }

      // Load menu items
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category, name');
      
      if (menuData) {
        setMenuItems(menuData.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price.toString()),
          category: item.category
        })));
      }

      // Load orders
      await loadOrders();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersData) {
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          tableId: order.table_id,
          items: order.order_items.map((item: any) => ({
            menuItem: {
              id: item.menu_items.id,
              name: item.menu_items.name,
              price: parseFloat(item.price), // Use stored price from order
              category: item.menu_items.category
            },
            quantity: item.quantity
          })),
          total: parseFloat(order.total.toString()),
          status: order.status as 'active' | 'preparing' | 'served',
          timestamp: new Date(order.created_at)
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

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

  const handleOrderPlace = async (orderItems: OrderItem[]) => {
    if (!selectedTable) return;

    try {
      const total = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: selectedTable,
          total: total,
          status: 'active'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // Update table status
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable);

      if (tableError) throw tableError;

      // Refresh data
      await loadInitialData();
      
      setCurrentView('dashboard');
      setSelectedTable(null);
    } catch (error) {
      console.error('Error placing order:', error);
      // Could add toast notification here
    }
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
