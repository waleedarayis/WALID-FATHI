
import React from 'react';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Truck },
    { id: 'map', label: 'Live Map', icon: Icons.Map },
    { id: 'clients', label: 'Clients', icon: Icons.Users },
    { id: 'messages', label: 'Messages', icon: Icons.Message },
  ];

  return (
    <div className="flex h-screen bg-emerald-950 text-emerald-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-900/40 backdrop-blur-xl border-r border-emerald-800/50 flex flex-col hidden md:flex">
        <div className="p-8 pb-4">
          <div className="flex flex-col items-start gap-4">
            <div className="w-14 h-14 bg-[#008B8B] rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-900/40 border border-emerald-400/30">
              <Icons.Truck className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter leading-none">
                WF AUTOTRASPORTI
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500 mt-1">LOGISTICA FARMACEUTICA</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-[#008B8B] text-white shadow-lg shadow-emerald-900/40 scale-[1.02]' 
                  : 'text-emerald-500/60 hover:bg-emerald-800/50 hover:text-emerald-200'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-white' : ''}`} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-800/50">
          <div className="flex items-center gap-3 p-3 bg-emerald-800/20 rounded-2xl border border-emerald-800/30">
            <img src="https://picsum.photos/seed/admin/100" className="w-10 h-10 rounded-xl border border-emerald-700" alt="Admin" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-emerald-100">Fleet Manager</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">Online</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-emerald-900/20 backdrop-blur-md border-b border-emerald-800/50 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 md:hidden">
             <div className="w-10 h-10 bg-[#008B8B] rounded-xl flex items-center justify-center border border-emerald-400/20">
               <Icons.Truck className="w-6 h-6 text-white" />
             </div>
             <span className="font-black text-sm tracking-tighter text-white">WF AUTOTRASPORTI</span>
          </div>
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-800 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search logistics network..." 
                className="w-full bg-emerald-950/40 border-emerald-800/30 border rounded-2xl pl-12 pr-5 py-2.5 text-sm text-emerald-100 placeholder-emerald-800 focus:ring-2 focus:ring-[#008B8B]/50 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Fleet</span>
              <span className="text-sm font-bold text-white uppercase">4 TRUCKS EN ROUTE</span>
            </div>
            <button className="p-3 bg-emerald-900/40 text-emerald-600 hover:text-emerald-400 border border-emerald-800/30 rounded-2xl transition-all relative group">
              <Icons.Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-emerald-950"></span>
            </button>
            <button className="p-3 bg-emerald-900/40 text-emerald-600 hover:text-emerald-400 border border-emerald-800/30 rounded-2xl transition-all group">
              <Icons.Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          {children}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-emerald-950 border-t border-emerald-800 h-20 flex items-center justify-around px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === item.id ? 'text-emerald-400 scale-110' : 'text-emerald-800'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[9px] uppercase font-black tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
