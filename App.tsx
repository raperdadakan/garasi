import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Customer, Expense } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CustomerList } from './components/CustomerList';
import { RoomGrid } from './components/RoomGrid';
import { CustomerForm } from './components/CustomerForm';
import { Modal } from './components/ui/Modal';

type View = 'dashboard' | 'customers' | 'rooms';

function App() {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(c => c.id !== customerId));
  };

  const handleFormSubmit = (customerData: Omit<Customer, 'id'>, id?: string) => {
    if (id) { // Editing existing customer
      setCustomers(customers.map(c => c.id === id ? { ...customerData, id } : c));
    } else { // Adding new customer
      setCustomers([...customers, { ...customerData, id: new Date().toISOString() }]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    setExpenses([...expenses, { ...expenseData, id: new Date().toISOString() }]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter(e => e.id !== expenseId));
  };
  
  const renderContent = () => {
    switch (currentView) {
      case 'customers':
        return <CustomerList customers={customers} onAdd={handleAddCustomer} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />;
      case 'rooms':
        return <RoomGrid customers={customers} />;
      case 'dashboard':
      default:
        return <Dashboard 
                customers={customers} 
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />;
    }
  };
  
  const occupiedRooms = customers.map(c => c.roomNumber);

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="container mx-auto">
        {renderContent()}
      </main>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? "Edit Customer" : "Tambah Customer Baru"}
      >
        <CustomerForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            initialData={editingCustomer}
            occupiedRooms={occupiedRooms}
        />
      </Modal>
    </div>
  );
}

export default App;