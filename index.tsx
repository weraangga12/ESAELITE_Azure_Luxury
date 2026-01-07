
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
import { GoogleGenAI, Chat } from "@google/genai";
import { PRODUCTS } from './constants';
import { Product, CartItem, Message } from './types';

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [category, setCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', text: 'Halo Cantik! Selamat datang di ESA CANTIK. Saya asisten kecantikan pribadi Anda. Ada yang bisa saya bantu hari ini? Ingin rekomendasi produk atau tips perawatan kulit?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<Chat | null>(null);

  const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare'];

  // Initialize AI Chat
  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatInstance.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `Anda adalah 'Esa Beauty Expert', asisten virtual untuk toko online kecantikan 'ESA CANTIK'. 
        Tugas Anda:
        1. Memberikan saran kecantikan profesional (skincare, makeup, fragrance, hair care).
        2. Gunakan gaya bahasa yang ramah, sopan, dan elegan. Sering-seringlah memanggil pengguna dengan sebutan 'Cantik', 'Kakak', atau 'Sista'.
        3. Rekomendasikan produk berdasarkan katalog ESA CANTIK (Skincare, Makeup, Fragrance, Haircare).
        4. Berikan tips kecantikan yang edukatif dan praktis.
        5. Jika ditanya harga, informasikan bahwa detail lengkap ada di katalog kami.`,
      },
    });
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
    let result = category === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [category, searchQuery]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping || !chatInstance.current) return;

    const userMsg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const result = await chatInstance.current.sendMessage({ message: userMsg });
      if (result.text) {
        setChatMessages(prev => [...prev, { role: 'model', text: result.text }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Maaf Cantik, ada sedikit gangguan teknis. Bisa Anda ulangi pertanyaannya?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const processCheckout = () => {
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
    <div className="min-h-screen flex flex-col relative">
      {/* Success Notification */}
      {showOrderSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-bold">Pesanan Anda telah diterima! Terima kasih telah mempercayai ESA CANTIK.</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-pink-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Menu className="lg:hidden text-gray-600 cursor-pointer" />
          <h1 className="text-2xl lg:text-3xl font-serif font-black tracking-tighter text-pink-500">
            ESA <span className="font-light italic text-gray-900 tracking-widest">CANTIK</span>
          </h1>
        </div>

        <div className="hidden lg:flex gap-10 font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400">
          <a href="#" className="text-pink-500 border-b-2 border-pink-500 pb-1">Home</a>
          <a href="#" className="hover:text-pink-500 transition-colors">Catalog</a>
          <a href="#" className="hover:text-pink-500 transition-colors">Best Sellers</a>
          <a href="#" className="hover:text-pink-500 transition-colors">About Us</a>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Cari kecantikan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/50 border border-pink-100 rounded-full pl-10 pr-4 py-2 text-sm w-48 focus:w-64 transition-all focus:ring-1 focus:ring-pink-300 outline-none"
            />
            <Search className="w-4 h-4 text-pink-300 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <User className="w-5 h-5 text-gray-700 hover:text-pink-500 transition-colors cursor-pointer" />
          <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-pink-500 transition-colors" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-pink-50">
        <div className="absolute inset-0 z-0 opacity-80">
          <img 
            src="https://images.unsplash.com/photo-1596462502278-27bfad450216?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Beauty Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-100/90 via-pink-50/20 to-transparent"></div>
        </div>
        <div className="relative z-10 px-6 lg:px-24 max-w-4xl">
          <span className="uppercase tracking-[0.4em] text-xs font-bold text-pink-400 mb-4 block animate-slide-up">Premium Beauty Selection</span>
          <h2 className="text-5xl lg:text-7xl font-serif mb-8 leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Pancarkan <br/> <span className="text-pink-500 italic">Pesona Sejati</span> Anda
          </h2>
          <p className="text-lg mb-10 text-gray-600 font-light leading-relaxed max-w-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Koleksi eksklusif produk perawatan diri yang dirancang khusus untuk menonjolkan kecantikan alami setiap wanita.
          </p>
          <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <button className="bg-pink-500 text-white px-10 py-4 font-bold rounded-full hover:bg-pink-600 transition-all shadow-xl shadow-pink-200">
              Mulai Belanja
            </button>
            <button className="bg-white text-pink-500 px-10 py-4 font-bold rounded-full border border-pink-100 hover:bg-pink-50 transition-all">
              Promo Spesial
            </button>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h3 className="text-4xl font-serif mb-4">Koleksi Terkurasi</h3>
            <p className="text-gray-400">Pilihan produk terbaik untuk perawatan harian Anda.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  category === cat 
                  ? 'bg-pink-500 text-white shadow-lg' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-pink-200 hover:text-pink-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map(product => (
              <div key={product.id} className="group flex flex-col">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-pink-50/30 aspect-[4/5] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.isFeatured && (
                    <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-500 shadow-sm">
                      Best Seller
                    </span>
                  )}
                  <button 
                    onClick={() => addToCart(product)}
                    className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md text-pink-500 py-4 rounded-3xl font-bold translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-pink-500 hover:text-white flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah Keranjang
                  </button>
                </div>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase text-pink-300 font-black tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
                      <span className="text-xs font-bold">{product.rating}</span>
                    </div>
                  </div>
                  <h4 className="font-serif text-xl text-gray-900 mb-1 group-hover:text-pink-500 transition-colors">{product.name}</h4>
                  <p className="text-sm text-gray-400 font-light mb-4 line-clamp-1">{product.description}</p>
                  <p className="text-xl font-black text-gray-900">Rp {(product.price / 1000).toLocaleString()}k</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h4 className="text-xl font-serif text-gray-400">Oops! Produk yang Anda cari belum tersedia.</h4>
            <button onClick={() => {setSearchQuery(''); setCategory('All');}} className="mt-4 text-pink-500 underline font-bold">Lihat Semua Koleksi</button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-50 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-2xl font-serif font-bold mb-8 text-pink-500 italic">ESA CANTIK</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Destinasi kecantikan nomor satu untuk wanita Indonesia yang menghargai kualitas dan kemewahan dalam setiap sentuhan.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 cursor-pointer hover:bg-pink-500 hover:text-white transition-all">IG</div>
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 cursor-pointer hover:bg-pink-500 hover:text-white transition-all">TT</div>
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 cursor-pointer hover:bg-pink-500 hover:text-white transition-all">FB</div>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-gray-900">Shopping</h5>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><a href="#" className="hover:text-pink-500">Skincare</a></li>
              <li><a href="#" className="hover:text-pink-500">Makeup</a></li>
              <li><a href="#" className="hover:text-pink-500">Best Seller</a></li>
              <li><a href="#" className="hover:text-pink-500">New Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-gray-900">Service</h5>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><a href="#" className="hover:text-pink-500">Shipping Info</a></li>
              <li><a href="#" className="hover:text-pink-500">Returns</a></li>
              <li><a href="#" className="hover:text-pink-500">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-pink-500">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-gray-900">Newsletter</h5>
            <p className="text-xs text-gray-400 mb-6">Dapatkan penawaran eksklusif dan tips kecantikan langsung di inbox Anda.</p>
            <div className="flex gap-2 p-1 border border-pink-100 rounded-full">
              <input type="email" placeholder="Email Anda" className="bg-transparent border-none px-4 py-2 flex-1 text-xs outline-none" />
              <button className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-pink-50 mt-20 pt-10 text-center text-[10px] text-gray-300 uppercase tracking-widest font-bold">
          © 2024 ESA CANTIK. Elegansi dalam Setiap Sentuhan.
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-8 border-b border-pink-50 flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold">Tas Belanja</h3>
              <X className="w-6 h-6 text-gray-400 cursor-pointer hover:text-pink-500" onClick={() => setIsCartOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-16 h-16 text-pink-100 mx-auto mb-6" />
                  <p className="text-gray-400 font-serif text-xl italic">Tas Anda masih sepi...</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <img src={item.image} className="w-20 h-24 object-cover rounded-2xl" alt={item.name} />
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900">{item.name}</h5>
                      <p className="text-pink-500 font-bold text-sm">Rp {(item.price / 1000).toLocaleString()}k</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center bg-pink-50 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-pink-500 hover:bg-white rounded-full"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-pink-500 hover:bg-white rounded-full"><Plus className="w-3 h-3" /></button>
                        </div>
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
              <div className="p-8 bg-pink-50 border-t border-pink-100">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Total Pembayaran</span>
                  <span className="text-2xl font-black text-gray-900">Rp {cartTotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={processCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-pink-500 text-white py-5 rounded-3xl font-bold hover:bg-pink-600 transition-all shadow-xl shadow-pink-200 flex items-center justify-center gap-3 disabled:bg-gray-400"
                >
                  {isCheckingOut ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Checkout Sekarang <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Button */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
        {!isChatOpen && (
          <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-pink-100 text-[10px] font-bold text-pink-400 animate-bounce cursor-pointer" onClick={() => setIsChatOpen(true)}>
            Butuh tips kecantikan? ✨
          </div>
        )}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 group relative"
        >
          <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-20"></div>
          {isChatOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
        </button>
      </div>

      {/* AI Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-10 z-[100] w-[90vw] max-w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-pink-50 flex flex-col overflow-hidden animate-slide-up">
          <div className="bg-pink-500 p-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-serif font-bold text-lg">Esa Beauty Expert</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Online Sekarang</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="ml-auto opacity-50 hover:opacity-100"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
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
                <div className="bg-white border border-pink-50 p-4 rounded-3xl rounded-tl-none flex gap-1 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-pink-200 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-pink-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-6 border-t border-pink-50 bg-white">
            <div className="flex items-center gap-2 bg-pink-50/50 rounded-full px-4 py-1.5">
              <input 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tanyakan rahasia cantik..." 
                className="flex-1 bg-transparent border-none text-sm outline-none py-2"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isTyping}
                className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 hover:shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
