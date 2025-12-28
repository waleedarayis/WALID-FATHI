
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MapView from './components/MapView';
import { MOCK_CLIENTS, MOCK_MESSAGES, MOCK_ROUTE, Icons } from './constants';
import { Client, Message, RouteStop, TransportState, TrafficSegment } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients] = useState<Client[]>(MOCK_CLIENTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [route] = useState<RouteStop[]>(MOCK_ROUTE);
  const [transportState, setTransportState] = useState<TransportState>({
    currentLocation: { lat: 43.7696, lng: 11.2558, name: 'Florence' },
    activeRoute: MOCK_ROUTE,
    speed: 105,
    heading: 185,
    trafficSegments: []
  });
  const [aiTip, setAiTip] = useState<string>('Analyzing current route patterns...');
  const [isRefreshingTip, setIsRefreshingTip] = useState<boolean>(false);
  const [clientSearch, setClientSearch] = useState<string>('');
  
  // Nearby Search States
  const [nearbyQuery, setNearbyQuery] = useState('');
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [nearbyResults, setNearbyResults] = useState<{ text: string; links: { title: string; uri: string }[] } | null>(null);

  // Notification States
  const [notifyingStop, setNotifyingStop] = useState<RouteStop | null>(null);
  const [draftMessage, setDraftMessage] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Brand Splash Timer
    const timer = setTimeout(() => setIsInitializing(false), 2500);
    handleRefreshTip();
    return () => clearTimeout(timer);
  }, [route]);

  const handleRefreshTip = async () => {
    setIsRefreshingTip(true);
    try {
      // Fetch both route optimization and real-time traffic
      const optimizationTip = await geminiService.optimizeRoute(route);
      const trafficAnalysis = await geminiService.getTrafficAnalysis(transportState.currentLocation.name);
      
      setAiTip(`${optimizationTip} Traffic Report: ${trafficAnalysis.tip}`);
      setTransportState(prev => ({
        ...prev,
        trafficSegments: trafficAnalysis.segments
      }));
    } catch (error) {
      console.error("Failed to refresh logistics intelligence:", error);
    } finally {
      setIsRefreshingTip(false);
    }
  };

  const handleSearchNearby = async () => {
    if (!nearbyQuery.trim()) return;
    setIsSearchingNearby(true);
    setNearbyResults(null);
    try {
      const results = await geminiService.findNearbyPlaces(nearbyQuery, transportState.currentLocation.lat, transportState.currentLocation.lng);
      setNearbyResults(results);
    } catch (error) {
      console.error("Failed to search nearby:", error);
    } finally {
      setIsSearchingNearby(false);
    }
  };

  const handleNotifyClient = async (stop: RouteStop) => {
    setNotifyingStop(stop);
    setIsDrafting(true);
    try {
      const message = await geminiService.generateArrivalNotification(stop);
      setDraftMessage(message);
    } catch (error) {
      console.error("Failed to draft notification:", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const confirmSendNotification = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setNotifyingStop(null);
      setDraftMessage('');
    }, 1500);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.company.toLowerCase().includes(clientSearch.toLowerCase())
  );

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-emerald-950 flex flex-col items-center justify-center z-[100] animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-40 h-40 bg-[#008B8B] rounded-[48px] flex items-center justify-center shadow-2xl shadow-emerald-900/60 border border-emerald-400/30 animate-pulse">
            <Icons.Truck className="w-28 h-28 text-white" />
          </div>
          <div className="absolute inset-0 bg-emerald-400 blur-[100px] opacity-10 animate-pulse"></div>
        </div>
        <div className="mt-10 text-center space-y-3">
          <h1 className="text-4xl font-black text-white tracking-tighter">WF AUTOTRASPORTI</h1>
          <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-xs">LOGISTICA FARMACEUTICA</p>
          <p className="text-emerald-700 font-black text-[10px] tracking-widest uppercase opacity-60">DAL 2004</p>
        </div>
        <div className="mt-14 w-64 h-1 bg-emerald-900 rounded-full overflow-hidden">
           <div className="h-full bg-emerald-400 w-1/2 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Brand Hero Header */}
      <div className="relative bg-emerald-900/20 border border-emerald-800/40 rounded-[40px] p-8 md:p-12 overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#008B8B]/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Global Logistics Hub</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                WF AUTOTRASPORTI <br/> 
                <span className="text-[#008B8B] italic">Logistica Farmaceutica</span>
              </h1>
              <p className="text-emerald-700 font-medium max-w-md">Premium pharmaceutical transport solutions since 2004. Your fleet is operating within nominal safety parameters.</p>
           </div>
           <div className="hidden xl:flex items-center gap-6">
              <div className="w-32 h-32 bg-emerald-800/20 rounded-[40px] border border-emerald-700/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                 <Icons.Truck className="w-20 h-20 text-[#008B8B]" />
              </div>
           </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Fleet', value: '4', icon: Icons.Truck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending Requests', value: messages.filter(m => !m.isRead).length, icon: Icons.Message, color: 'text-lime-400', bg: 'bg-lime-500/10' },
          { label: 'Pharma Partners', value: clients.length, icon: Icons.Users, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Network Uptime', value: '99.9%', icon: Icons.Navigation, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-emerald-900/30 border border-emerald-800/40 p-8 rounded-[32px] transition-all hover:scale-[1.05] hover:shadow-2xl hover:shadow-emerald-900/40 group cursor-default">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <p className="text-emerald-700 text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1 text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Route Planner */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Live Operations Map</h2>
            <div className="bg-emerald-800/30 px-4 py-1.5 rounded-full text-xs font-black text-emerald-400 border border-emerald-700/50 uppercase tracking-widest">
              HUB TR-102
            </div>
          </div>
          
          <div className="bg-emerald-900/30 border border-emerald-800/40 rounded-[40px] overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-emerald-800/40 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Icons.Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-emerald-100 italic">
                    <span className="text-emerald-400 font-black uppercase tracking-wider mr-2 text-[10px] not-italic">AI Logistics Tip:</span>
                    {isRefreshingTip ? 'Querying live satellite traffic...' : aiTip}
                  </p>
                </div>
                <button 
                  onClick={handleRefreshTip}
                  disabled={isRefreshingTip}
                  className="p-3 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 rounded-2xl hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                  <Icons.Refresh className={`w-4 h-4 ${isRefreshingTip ? 'animate-spin' : ''}`} />
                </button>
             </div>
             
             <div className="p-10 space-y-10 relative">
                <div className="absolute left-[59px] top-12 bottom-12 w-1 bg-emerald-950 rounded-full"></div>
                <div className="absolute left-[59px] top-12 h-1/2 w-1 bg-gradient-to-b from-[#008B8B] to-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(0,139,139,0.5)]"></div>
                
                {route.map((stop, i) => (
                  <div key={stop.id} className="flex items-start gap-8 group relative z-10">
                    <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 border-4 border-emerald-950 shadow-2xl transition-all group-hover:scale-110 ${
                      stop.status === 'Completed' ? 'bg-[#008B8B] text-white' :
                      stop.status === 'In Progress' ? 'bg-lime-600 text-white ring-8 ring-lime-500/10' :
                      'bg-emerald-900/80 text-emerald-700'
                    }`}>
                      {stop.status === 'Completed' ? <Icons.CheckCircle className="w-6 h-6" /> : (i + 1)}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-xl text-white group-hover:text-[#008B8B] transition-colors uppercase tracking-tight">{stop.location}</h4>
                          {stop.status === 'In Progress' && (
                            <button 
                              onClick={() => handleNotifyClient(stop)}
                              className="px-4 py-1.5 bg-[#008B8B] text-white border border-emerald-400/30 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                            >
                              <Icons.Message className="w-3.5 h-3.5" />
                              Client Notify
                            </button>
                          )}
                        </div>
                        <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest ${
                          stop.type === 'Pickup' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-lime-500/10 text-lime-400'
                        }`}>
                          {stop.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm font-bold text-emerald-700/80">
                        <span className="flex items-center gap-2 bg-emerald-950/40 px-3 py-1 rounded-lg"><Icons.Truck className="w-5 h-5 text-emerald-500" /> {stop.carModel}</span>
                        <span className="flex items-center gap-2 bg-emerald-950/40 px-3 py-1 rounded-lg font-mono tracking-tighter"><Icons.Clock className="w-4 h-4" /> {stop.estimatedTime}</span>
                        <span className={`text-xs font-black uppercase tracking-widest ${
                          stop.status === 'Completed' ? 'text-emerald-500' : 
                          stop.status === 'In Progress' ? 'text-lime-400 animate-pulse' : 'text-emerald-900'
                        }`}>
                          {stop.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Messaging Quickview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Inbound Terminal</h2>
            <button 
              onClick={() => setActiveTab('messages')}
              className="text-xs font-black text-emerald-500 hover:text-white uppercase tracking-widest"
            >
              Inbox (3)
            </button>
          </div>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-emerald-900/30 border border-emerald-800/40 p-6 rounded-[32px] hover:bg-emerald-800/40 transition-all cursor-pointer group border-l-4 border-l-[#008B8B]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://picsum.photos/seed/${msg.clientId}/100`} className="w-10 h-10 rounded-xl border border-emerald-700" alt="" />
                    <span className="font-black text-sm text-emerald-50 tracking-tight">{msg.clientName}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                    msg.priority === 'High' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-800 text-emerald-600'
                  }`}>
                    {msg.priority}
                  </span>
                </div>
                <p className="text-sm text-emerald-600 line-clamp-2 leading-relaxed italic group-hover:text-emerald-300 transition-colors">
                  "{msg.content}"
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-800 font-black uppercase tracking-widest">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <Icons.ChevronRight className="w-4 h-4 text-emerald-800 group-hover:text-emerald-400 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Pharma Partners</h2>
          <p className="text-emerald-700 font-bold uppercase tracking-widest text-xs mt-1">Authorized Logistics Portal</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-800 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Partner search..." 
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl pl-12 pr-6 py-3 text-sm text-emerald-50 focus:ring-2 focus:ring-[#008B8B]/50 outline-none transition-all w-full sm:w-80 font-bold placeholder-emerald-900"
            />
          </div>
          <button className="bg-[#008B8B] hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/40 active:scale-95">
            Register Partner
          </button>
        </div>
      </div>
      
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-emerald-900/30 border border-emerald-800/40 p-8 rounded-[40px] hover:border-[#008B8B]/50 transition-all group relative overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-900/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#008B8B]/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-[#008B8B]/10 transition-colors"></div>
              <img src={client.avatar} alt={client.name} className="w-20 h-20 rounded-[28px] mb-6 border-2 border-emerald-800 group-hover:border-[#008B8B]/50 group-hover:rotate-3 transition-all shadow-lg" />
              <h3 className="font-black text-2xl text-white mb-1 tracking-tight">{client.name}</h3>
              <p className="text-[#008B8B] text-xs font-black uppercase tracking-widest mb-6">{client.company}</p>
              
              <div className="space-y-4 py-6 border-y border-emerald-800/30 mb-6">
                 <div className="flex items-center gap-4 text-sm text-emerald-700 font-bold">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-xs">📧</div>
                    <span className="truncate">{client.email}</span>
                 </div>
                 <div className="flex items-center gap-4 text-sm text-emerald-700 font-bold">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-xs">📞</div>
                    <span>{client.phone}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-[0.2em] uppercase ${
                  client.status === 'Active' ? 'bg-[#008B8B]/20 text-emerald-400' : 
                  client.status === 'Pending' ? 'bg-lime-500/10 text-lime-400' : 'bg-emerald-800 text-emerald-900'
                }`}>
                  {client.status}
                </span>
                <button className="w-10 h-10 bg-emerald-800/40 text-emerald-700 hover:text-white rounded-xl flex items-center justify-center transition-all">
                  <Icons.ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-900/10 border border-emerald-800/20 rounded-[48px] p-24 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-emerald-900/40 rounded-[32px] flex items-center justify-center mb-8 text-emerald-800">
            <Icons.Users className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Partner Matches</h3>
          <p className="text-emerald-700 max-w-xs font-medium">Zero records for "{clientSearch}". Please check the partner registration list.</p>
        </div>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 bg-[#008B8B]/10 text-[#008B8B] rounded-[32px] flex items-center justify-center border border-[#008B8B]/20 shadow-xl shadow-emerald-900/40">
          <Icons.Message className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Communications</h2>
          <p className="text-emerald-700 font-black uppercase tracking-widest text-xs">Secure Logistical Messaging</p>
        </div>
      </div>

      <div className="space-y-8">
        {messages.map((msg) => {
          const isHighPriority = msg.priority === 'High';
          return (
            <div 
              key={msg.id} 
              className={`bg-emerald-900/30 border ${
                isHighPriority ? 'border-orange-500/50 ring-2 ring-orange-500/10 shadow-2xl' : 'border-emerald-800/40'
              } p-10 rounded-[48px] relative group hover:bg-emerald-800/40 transition-all duration-300`}
            >
               {!msg.isRead && <div className={`absolute top-10 left-6 w-2 h-2 ${isHighPriority ? 'bg-orange-500' : 'bg-[#008B8B]'} rounded-full animate-pulse shadow-[0_0_10px_rgba(0,139,139,0.8)]`}></div>}
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                     <div className="relative">
                       <img src={`https://picsum.photos/seed/${msg.clientId}/100`} className={`w-20 h-20 rounded-3xl border-2 ${isHighPriority ? 'border-orange-500/50' : 'border-emerald-800'} shadow-lg`} alt="" />
                       {isHighPriority && (
                         <div className="absolute -top-2 -right-2 bg-orange-500 rounded-2xl p-2 border-2 border-emerald-900 shadow-xl">
                           <Icons.AlertTriangle className="w-4 h-4 text-white" />
                         </div>
                       )}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isHighPriority ? 'text-orange-400' : 'text-emerald-700'}`}>{msg.priority} Priority</span>
                  </div>
                  <div className="flex-1 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{msg.clientName}</h4>
                          {isHighPriority && <span className="text-[10px] bg-orange-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse">Critical Payload</span>}
                        </div>
                        <span className="text-xs text-emerald-700 font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleString()}</span>
                     </div>
                     <p className={`leading-relaxed text-xl font-bold italic ${isHighPriority ? 'text-white' : 'text-emerald-500'} max-w-2xl`}>"{msg.content}"</p>
                     <div className="flex items-center gap-6 pt-6 border-t border-emerald-800/30">
                        <button className={`${isHighPriority ? 'bg-orange-600 hover:bg-orange-500' : 'bg-[#008B8B] hover:bg-emerald-500'} text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95`}>
                          Broadcast Reply
                        </button>
                        <button className="bg-emerald-950/50 text-emerald-600 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-emerald-900 hover:text-white transition-all border border-emerald-800/30">
                          Secure Archive
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="h-full space-y-8 animate-in zoom-in-95 duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Fleet Distribution Map</h2>
          <p className="text-emerald-700 font-black uppercase tracking-widest text-xs mt-1">Satellite Transceiver TR-102 Online</p>
        </div>
        
        {/* Nearby Services Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Facility search..."
              value={nearbyQuery}
              onChange={(e) => setNearbyQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchNearby()}
              className="w-full bg-emerald-950/40 border border-emerald-800/40 rounded-2xl px-5 py-3 text-sm text-emerald-50 focus:ring-2 focus:ring-[#008B8B]/50 outline-none font-bold"
            />
          </div>
          <button 
            onClick={handleSearchNearby}
            disabled={isSearchingNearby}
            className="p-3 bg-[#008B8B] hover:bg-emerald-500 text-white rounded-2xl shadow-xl transition-all disabled:opacity-50"
          >
            {isSearchingNearby ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Icons.Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <MapView currentLocation={transportState.currentLocation} stops={route} trafficSegments={transportState.trafficSegments} />
        </div>
        
        {/* Sidebar Info Panels */}
        <div className="space-y-6">
          {/* Vehicle Detail Section */}
          <div className="bg-[#008B8B]/10 border border-[#008B8B]/30 p-6 rounded-[32px] shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-xs font-black text-[#008B8B] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Icons.Truck className="w-5 h-5" /> Vehicle Telematics
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Assigned Unit</p>
                <p className="text-xl font-black text-white">IVECO Daily Pharma <span className="text-[#008B8B] text-xs font-bold ml-2">#WF-2024</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/40">
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Velocity</p>
                  <p className="text-lg font-black text-white">{transportState.speed} <span className="text-[10px] text-emerald-500">KM/H</span></p>
                </div>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/40">
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Bearing</p>
                  <p className="text-lg font-black text-white">{transportState.heading}° <span className="text-[10px] text-emerald-500">SOUTH</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time Data Stream: Active</p>
              </div>
            </div>
          </div>

          {/* Traffic Status Feed */}
          <div className="bg-emerald-900/30 border border-emerald-800/40 p-6 rounded-[32px]">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Icons.Refresh className="w-4 h-4" /> Live Traffic Feed
            </h3>
            <div className="space-y-4">
               {transportState.trafficSegments?.map((seg, i) => (
                 <div key={seg.id} className="flex items-center justify-between p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/40">
                    <span className="text-[10px] font-black text-emerald-100 uppercase tracking-tight">{seg.label}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      seg.intensity === 'Heavy' ? 'bg-rose-500/20 text-rose-400' :
                      seg.intensity === 'Moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {seg.intensity}
                    </span>
                 </div>
               ))}
            </div>
          </div>

          {/* Nearby Search Results Panel */}
          <div className="bg-emerald-900/30 border border-emerald-800/40 p-6 rounded-[32px] min-h-[200px]">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Icons.Map className="w-4 h-4" /> Logistics Intelligence
            </h3>
            
            {!nearbyResults && !isSearchingNearby && (
              <div className="flex flex-col items-center justify-center h-32 text-center opacity-40">
                <Icons.Sparkles className="w-8 h-8 mb-4 text-emerald-800" />
                <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest px-4">Search for facilities or partners near fleet position</p>
              </div>
            )}

            {isSearchingNearby && (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-emerald-800 rounded w-3/4"></div>
                <div className="h-20 bg-emerald-800 rounded"></div>
              </div>
            )}

            {nearbyResults && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <p className="text-[11px] text-emerald-100 font-medium leading-relaxed italic border-l-2 border-[#008B8B] pl-4">
                  {nearbyResults.text}
                </p>
                {nearbyResults.links.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-emerald-800/40">
                    {nearbyResults.links.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 bg-emerald-950/40 hover:bg-[#008B8B]/10 rounded-xl border border-emerald-800/40 transition-all group"
                      >
                        <span className="text-[10px] font-bold text-[#008B8B] truncate pr-4">{link.title}</span>
                        <Icons.ChevronRight className="w-3 h-3 text-emerald-700 group-hover:text-emerald-400 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Telemetry Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-900/30 border border-emerald-800/40 p-8 rounded-[40px] shadow-xl group hover:border-[#008B8B]/30 transition-all">
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-2">GPS Uplink Status</p>
           <p className="text-2xl font-black text-white uppercase">Sync 100%</p>
           <div className="mt-6 h-2 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/30 shadow-inner">
              <div className="h-full bg-[#008B8B] w-[95%] animate-pulse shadow-[0_0_10px_rgba(0,139,139,0.8)]"></div>
           </div>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-800/40 p-8 rounded-[40px] shadow-xl group hover:border-[#008B8B]/30 transition-all">
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-2">Propulsion & Fuel</p>
           <p className="text-2xl font-black text-white uppercase">78% Nominal</p>
           <div className="mt-6 h-2 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/30 shadow-inner">
              <div className="h-full bg-lime-500 w-[78%] shadow-[0_0_10px_rgba(132,204,22,0.8)]"></div>
           </div>
        </div>
        <div className="bg-emerald-900/30 border border-emerald-800/40 p-8 rounded-[40px] shadow-xl group hover:border-[#008B8B]/30 transition-all">
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-2">Climate Module</p>
           <p className="text-2xl font-black text-white uppercase">19.2°C Stabilized</p>
           <div className="mt-6 h-2 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/30 shadow-inner">
              <div className="h-full bg-teal-500 w-[45%] shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
           </div>
        </div>
      </div>
    </div>
  );

  const getContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'clients': return renderClients();
      case 'messages': return renderMessages();
      case 'map': return renderMap();
      default: return renderDashboard();
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {getContent()}
    </Layout>
  );
};

export default App;
