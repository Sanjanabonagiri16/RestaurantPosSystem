import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart, Users } from 'lucide-react';
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
            <div className="flex items-center space-x-4">
              <Button
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Tables
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Order for Table {tableId}</h1>
                <div className="flex items-center space-x-2 text-white/80">
                  <Users className="w-4 h-4" />
                  <span>6 seats</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu Items */}
            <div className="lg:col-span-2 space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-white mb-4">{category}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {menuItems
                      .filter(item => item.category === category)
                      .map(item => {
                        const quantity = getItemQuantity(item.id);
                        return (
                          <Card
                            key={item.id}
                            className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                                  <p className="text-white/70 text-sm mb-3">
                                    {item.category === 'Beverages' ? 'Refreshing drink' : 
                                     item.category === 'Desserts' ? 'Sweet dessert' : 
                                     'Delicious dish'}
                                  </p>
                                </div>
                                <Badge 
                                  className="text-white font-bold px-3 py-1"
                                  style={{ background: 'var(--gradient-success)' }}
                                >
                                  ${item.price.toFixed(2)}
                                </Badge>
                              </div>
                              
                              {quantity === 0 ? (
                                <Button
                                  onClick={() => addToOrder(item)}
                                  className="w-full h-12 font-semibold backdrop-blur-sm border border-white/30 text-white"
                                  style={{ background: 'var(--gradient-primary)' }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add to Order
                                </Button>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <Button
                                    onClick={() => removeFromOrder(item.id)}
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  
                                  <span className="mx-4 font-bold text-white text-lg">
                                    {quantity}
                                  </span>
                                  
                                  <Button
                                    onClick={() => addToOrder(item)}
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8 backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-white/20">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">Order Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 text-lg">No items in cart</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {orderItems.map(item => (
                          <div key={item.menuItem.id} className="flex justify-between items-center p-3 rounded-lg bg-white/10">
                            <div className="flex-1">
                              <p className="font-medium text-white">{item.menuItem.name}</p>
                              <p className="text-sm text-white/70">
                                ${item.menuItem.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-white">
                              ${(item.menuItem.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-white/20 pt-4">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-xl font-bold text-white">Total</span>
                          <span className="text-2xl font-bold text-white">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                        
                        <Button
                          onClick={handlePlaceOrder}
                          className="w-full h-12 text-lg font-bold text-white"
                          style={{ background: 'var(--gradient-success)' }}
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
    </div>
  );
};

export default OrderView;