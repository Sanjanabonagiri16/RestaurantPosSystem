
import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MenuItem, OrderItem } from '../pages/Index';

interface OrderViewProps {
  tableId: number;
  menuItems: MenuItem[];
  onPlaceOrder: (orderItems: OrderItem[]) => void;
  onBack: () => void;
}

const OrderView: React.FC<OrderViewProps> = ({
  tableId,
  menuItems,
  onPlaceOrder,
  onBack,
}) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const categories = [...new Set(menuItems.map(item => item.category))];

  const addToOrder = (menuItem: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1 }];
    });
  };

  const removeFromOrder = (menuItemId: number) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter(item => item.menuItem.id !== menuItemId);
    });
  };

  const getItemQuantity = (menuItemId: number) => {
    return orderItems.find(item => item.menuItem.id === menuItemId)?.quantity || 0;
  };

  const total = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (orderItems.length > 0) {
      onPlaceOrder(orderItems);
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
                Back to Tables
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Table {tableId}</h1>
                <p className="text-sm text-slate-600">Place your order</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {menuItems
                      .filter(item => item.category === category)
                      .map(item => {
                        const quantity = getItemQuantity(item.id);
                        return (
                          <div
                            key={item.id}
                            className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors duration-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-800 mb-1">{item.name}</h3>
                                <p className="text-lg font-semibold text-indigo-600">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {quantity === 0 ? (
                                <Button
                                  onClick={() => addToOrder(item)}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add to Order
                                </Button>
                              ) : (
                                <div className="flex items-center justify-between w-full">
                                  <Button
                                    onClick={() => removeFromOrder(item.id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  
                                  <span className="mx-4 font-medium text-slate-800">
                                    {quantity}
                                  </span>
                                  
                                  <Button
                                    onClick={() => addToOrder(item)}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-300"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    No items added yet
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {orderItems.map(item => (
                        <div key={item.menuItem.id} className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">{item.menuItem.name}</p>
                            <p className="text-sm text-slate-600">
                              ${item.menuItem.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-800">
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-slate-800">Total</span>
                        <span className="text-2xl font-bold text-indigo-600">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      
                      <Button
                        onClick={handlePlaceOrder}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="lg"
                      >
                        Place Order
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
