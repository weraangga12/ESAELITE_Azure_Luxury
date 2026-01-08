import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Star, 
  Plus, 
  Minus, 
  X, 
  MessageCircle, 
  Send,
  Menu,
  ChevronRight,
  Heart,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from './constants';
import { Product, CartItem, Message } from './types';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', text: 'Halo Cantik! Selamat datang di ESA CANTIK. Saya asisten kecantikan pribadi Anda. Ada yang bisa saya bantu hari ini? Ingin rekomendasi produk atau tips perawatan kulit?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare'];

  // Initialize AI Chat
  useEffect(() => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return;
      
      const ai = new GoogleGenAI({ apiKey });
      chatInstance.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'Anda adalah "Esa Beauty Expert", asisten virtual profesional untuk toko online ESA CANTIK. Gunakan gaya bahasa yang elegan, feminin, dan sangat ramah. Panggil pengguna dengan sebutan "Cantik", "Kakak", atau "Sista". Fokus pada rekomendasi produk kecantikan dan tips perawatan diri.',
        },
      });
    } catch (err) {
      console.error("AI Initialization Error:", err);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const filteredProducts = useMemo(() => {
    let result = activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping || !chatInstance.current) return;

    const userMsg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await chatInstance.current.sendMessage({ message: userMsg });
      if (response && response.text) {
        setChatMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Maaf Cantik, ada sedikit gangguan teknis. Coba tanya lagi ya?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setShowOrderSuccess(true);
      setCart([]);
      setIsCartOpen(false);
      setTimeout(() => setShowOrderSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafb] selection:bg-pink-100 selection:text-pink-600">
      {showOrderSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-pink-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-bold">Pesanan Cantik sudah kami terima!</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-pink-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Menu className="lg:hidden text-pink-400 cursor-pointer" />
          <h1 className="text-2xl lg:text-3xl font-serif font-black tracking-tighter text-pink-500">
            ESA <span className="font-light italic text-gray-800 tracking-widest uppercase">Cantik</span>
          </h1>
        </div>

        <div className="hidden lg:flex gap-8 font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`${activeCategory === cat ? 'text-pink-500 border-b-2 border-pink-500' : 'hover:text-pink-300'} pb-1 transition-all`}
            >
              {cat === 'All' ? 'Beranda' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Cari kecantikan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-pink-50 rounded-full pl-10 pr-4 py-2 text-sm w-48 focus:w-64 transition-all focus:ring-1 focus:ring-pink-200 outline-none"
            />
            <Search className="w-4 h-4 text-pink-200 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-pink-500 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
          <User className="w-5 h-5 text-gray-700 hover:text-pink-500 cursor-pointer hidden md:block" />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center overflow-hidden bg-pink-50">
        <div className="absolute inset-0 z-0 opacity-90">
          <img 
            src="https://images.unsplash.com/photo-1596462502278-27bfad450216?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Beauty Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-pink-50/20 to-transparent"></div>
        </div>
        <div className="relative z-10 px-6 lg:px-24 max-w-4xl">
          <span className="uppercase tracking-[0.4em] text-xs font-bold text-pink-400 mb-4 block animate-slide-up">Eksklusif & Mewah</span>
          <h2 className="text-5xl lg:text-7xl font-serif mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Temukan <span className="text-pink-500 italic">Pesona</span><br/>Terbaik Sista
          </h2>
          <p className="text-lg mb-8 text-gray-600 font-light leading-relaxed max-w-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Kurasi produk kecantikan premium yang dirancang untuk menonjolkan kecantikan alami Sista setiap hari.
          </p>
          <button className="bg-pink-500 text-white px-10 py-4 font-bold rounded-full hover:bg-pink-600 transition-all shadow-xl shadow-pink-100 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            Jelajahi Koleksi
          </button>
        </div>
      </section>

      {/* Product Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-pink-50 pb-8">
          <h3 className="text-3xl font-serif text-gray-900 mb-4 md:mb-0">Pilihan <span className="italic text-pink-500">Istimewa</span></h3>
          <div className="flex items-center gap-3 text-xs font-bold text-pink-400 uppercase tracking-widest bg-pink-50 px-6 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>Gratis Ongkir Seluruh Indonesia</span>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="group flex flex-col bg-white rounded-[2.5rem] p-4 border border-pink-50 hover:shadow-2xl transition-all duration-500">
                <div className="relative overflow-hidden rounded-[2rem] aspect-[4/5] mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {product.isFeatured && (
                    <div className="absolute top-4 left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                      Best Seller
                    </div>
                  )}
                  <button 
                    onClick={() => addToCart(product)}
                    className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur text-pink-500 py-3 rounded-2xl font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
                <div className="flex-1 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-pink-300 uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
                      <span className="text-[10px] font-bold">{product.rating}</span>
                    </div>
                  </div>
                  <h4 className="font-serif text-lg text-gray-900 mb-1 leading-tight group-hover:text-pink-500 transition-colors">{product.name}</h4>
                  <p className="text-pink-600 font-black">Rp {(product.price / 1000).toLocaleString()}k</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Search className="w-12 h-12 text-pink-100 mx-auto mb-4" />
            <h4 className="text-xl font-serif text-gray-300 italic">Produk yang Sista cari belum tersedia...</h4>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('All');}} 
              className="mt-6 text-pink-500 font-bold underline hover:text-pink-600 transition-colors"
            >
              Lihat Semua Produk
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-50 py-16 px-6 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-2xl font-serif font-bold text-pink-500 mb-6 italic">ESA CANTIK</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Mewujudkan kilau alami Sista melalui produk kecantikan pilihan terbaik di Indonesia.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="font-bold text-xs uppercase tracking-widest mb-2 text-gray-900">Belanja</h5>
            <a href="#" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Skincare</a>
            <a href="#" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Makeup</a>
            <a href="#" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Parfum</a>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="font-bold text-xs uppercase tracking-widest mb-2 text-gray-900">Bantuan</h5>
            <a href="#" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Hubungi Kami</a>
            <a href="#" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Pengiriman</a>
            <a href="#" className="text-sm text-gray-400 hover:text-pink-500 transition-colors">Lacak Pesanan</a>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-widest mb-4 text-gray-900">Newsletter</h5>
            <div className="flex p-1 bg-pink-50 rounded-full">
              <input type="email" placeholder="Email Cantik" className="bg-transparent border-none px-4 py-2 flex-1 text-xs outline-none" />
              <button className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors shadow-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-pink-50 mt-16 pt-10 text-center text-[10px] text-gray-300 uppercase tracking-[0.3em] font-bold">
          © 2024 ESA CANTIK. Elegansi dalam setiap sentuhan.
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-8 border-b border-pink-50 flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-pink-500">Tas Belanja</h3>
              <X className="w-6 h-6 text-gray-300 cursor-pointer hover:text-pink-500 transition-colors" onClick={() => setIsCartOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-serif italic text-xl">Tas Sista masih kosong...</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <img src={item.image} className="w-20 h-24 object-cover rounded-2xl" alt={item.name} />
                    <div className="flex-1">
                      <h5 className="font-bold text-sm leading-tight group-hover:text-pink-500 transition-colors">{item.name}</h5>
                      <p className="text-pink-500 font-bold text-xs mt-1">Rp {(item.price / 1000).toLocaleString()}k</p>
                      <div className="flex items-center gap-3 mt-4">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-gray-200 hover:text-red-400 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-8 bg-pink-50/50 border-t border-pink-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                  <span className="text-2xl font-black text-gray-900">Rp {cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-pink-500 text-white py-5 rounded-3xl font-bold hover:bg-pink-600 transition-all shadow-xl shadow-pink-100 flex items-center justify-center gap-3"
                >
                  {isCheckingOut ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Selesaikan Pesanan"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
        {!isChatOpen && (
          <div className="bg-white px-5 py-2.5 rounded-2xl shadow-2xl border border-pink-100 text-[10px] font-black text-pink-500 animate-bounce cursor-pointer flex items-center gap-2" onClick={() => setIsChatOpen(true)}>
            <Sparkles className="w-3 h-3" /> Konsultasi Sista?
          </div>
        )}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform relative group"
        >
          <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-20"></div>
          {isChatOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
        </button>
      </div>

      {isChatOpen && (
        <div className="fixed bottom-28 right-8 z-[100] w-[90vw] max-w-[380px] h-[550px] bg-white rounded-[3rem] shadow-2xl border border-pink-50 flex flex-col overflow-hidden animate-slide-up">
          <div className="bg-pink-500 p-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30"><Sparkles className="w-6 h-6" /></div>
            <div>
              <p className="font-serif font-bold text-xl leading-none mb-1">Esa Expert</p>
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Siap Melayani Cantik</p>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="ml-auto opacity-50 hover:opacity-100 transition-opacity"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-pink-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 rounded-tl-none border border-pink-50 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none flex gap-1 animate-pulse border border-pink-50">
                  <div className="w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-5 bg-white border-t border-pink-50 flex gap-3">
            <input 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tanya rahasia cantik..." 
              className="flex-1 bg-pink-50/50 rounded-full px-5 py-3 text-sm outline-none border border-transparent focus:border-pink-200 transition-all placeholder:text-pink-300"
            />
            <button 
              onClick={handleSendMessage} 
              className="bg-pink-500 text-white p-3 rounded-full hover:bg-pink-600 transition-colors shadow-lg shadow-pink-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: #f8bbd0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}