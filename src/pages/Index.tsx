
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import LoginPage from '../components/LoginPage';
import Dashboard from '../components/Dashboard';
import OrderView from '../components/OrderView';
import AdminView from '../components/AdminView';
import { toast } from '@/components/ui/sonner';

export interface User {
  username: string;
  role: 'waiter' | 'admin';
  id: string; // Added for order placement
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
  userId?: string;
  username?: string;
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

    // Real-time subscriptions
    const tableSub = supabase
      .channel('tables-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, (payload) => {
        toast.success('Table update detected!');
        loadInitialData();
      })
      .subscribe();

    const orderSub = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        toast.success('Order update detected!');
        loadOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tableSub);
      supabase.removeChannel(orderSub);
    };
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
      toast.error('Error loading initial data');
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
          user:user_id (username),
          order_items (
            *,
            menu_items (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedOrders = ordersData.map((order: any) => ({
          id: order.id,
          tableId: order.table_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          timestamp: new Date(order.created_at),
          userId: order.user_id,
          username: order.user?.username || undefined,
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
    if (!selectedTable || !user) return;

    try {
      const total = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: selectedTable,
          total: total,
          status: 'active',
          user_id: user.id // Pass user id
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
      toast.success('Order placed!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Error placing order');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView(user?.role === 'admin' ? 'admin' : 'dashboard');
    setSelectedTable(null);
  };

  const handleStartPreparing = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', orderId);
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      // Only 'active', 'preparing', 'served' are valid. We'll use 'served' to indicate removal/cancellation.
      await supabase
        .from('orders')
        .update({ status: 'served' })
        .eq('id', orderId);
      await loadOrders();
      toast.success('Order cancelled!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error cancelling order');
    }
  };

  const handleReserveTable = async (tableId: number) => {
    try {
      await supabase
        .from('restaurant_tables')
        .update({ status: 'reserved' })
        .eq('id', tableId);
      await loadInitialData();
      toast.success('Table reserved!');
    } catch (error) {
      console.error('Error reserving table:', error);
      toast.error('Error reserving table');
    }
  };

  const handleUnreserveTable = async (tableId: number) => {
    try {
      await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', tableId);
      await loadInitialData();
      toast.success('Table unreserved!');
    } catch (error) {
      console.error('Error unreserving table:', error);
      toast.error('Error unreserving table');
    }
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
          onReserveTable={handleReserveTable}
          onUnreserveTable={handleUnreserveTable}
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
          onStartPreparing={handleStartPreparing}
          onCancelOrder={handleCancelOrder}
          onViewOrderHistory={() => {}}
          user={user}
        />
      )}
    </div>
  );
};

export default Index;
