import React, { useState, useEffect } from 'react';
import { Home, List, Search, Star, Plus, X, Utensils, Activity, Settings, Moon, Sun, Image as ImageIcon, StarHalf } from 'lucide-react';

interface Food {
  id: number;
  name: string;
  emoji: string;
  imageUrl: string;
  category: string;
  estPrice: number;
  desc: string;
}

interface FoodEntry {
  foodId: number;
  status: 'want_to_eat' | 'eaten';
  rating: number;
  addedAt: number;
}

const INITIAL_FOODS: Food[] = [
  { id: 1, name: 'Swiss Cheese Fondue', emoji: '🧀', imageUrl: '', category: 'Swiss', estPrice: 28, desc: 'A rich blend of Gruyère and Vacherin, served with bread cubes.' },
  { id: 2, name: 'Shoyu Ramen', emoji: '🍜', imageUrl: '', category: 'Japanese', estPrice: 18, desc: 'Soy sauce based broth with curly noodles, chashu, and a soft boiled egg.' },
  { id: 3, name: 'Pizza Margherita', emoji: '🍕', imageUrl: '', category: 'Italian', estPrice: 15, desc: 'Classic Neapolitan pizza with San Marzano tomatoes, mozzarella, and basil.' },
  { id: 4, name: 'Salmon Nigiri', emoji: '🍣', imageUrl: '', category: 'Japanese', estPrice: 22, desc: 'Fresh raw salmon over pressed vinegared rice.' },
];

export default function App() {
  // App State
  const [theme, setTheme] = useState('dark'); // 'light' | 'dark'
  const [pureBlack, setPureBlack] = useState(false);
  const [materialYou, setMaterialYou] = useState(true);
  const [accentColor, setAccentColor] = useState('#818cf8'); // Default pastel Material-ish color
  
  const [ratingScale, setRatingScale] = useState(10); // 10 | 5
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  
// Replace your existing state lines with these:
const [foodDatabase, setFoodDatabase] = useState<Food[]>(INITIAL_FOODS);
const [myList, setMyList] = useState<FoodEntry[]>(() => {
  const saved = localStorage.getItem('myFoodList');
  return saved ? JSON.parse(saved) : [];
});
  
  // Modal States
  const [selectedFood, setSelectedFood] = useState(null);
  const [isAddingFood, setIsAddingFood] = useState(false);

  // --- DYNAMIC THEMING ---
  const isDark = theme === 'dark';
  const activeColor = materialYou ? accentColor : '#ea580c'; // Fallback to original Orange
  
  // Dynamic CSS classes for standard dark mode (grayer) vs OLED (pure black)
  const appBg = isDark ? (pureBlack ? 'bg-black' : 'bg-slate-900') : 'bg-gray-100';
  const frameBg = isDark ? (pureBlack ? 'bg-black' : 'bg-[#1e293b]') : 'bg-gray-50'; // slate-800 hex
  const cardBg = isDark ? (pureBlack ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-[#334155] border-[#475569]') : 'bg-white border-gray-100';
  const modalBg = isDark ? (pureBlack ? 'bg-black border border-[#1f1f1f]' : 'bg-[#1e293b]') : 'bg-white';
  const inputBg = isDark ? (pureBlack ? 'bg-[#141414]' : 'bg-[#0f172a]') : 'bg-gray-100';
  const textColorMain = isDark ? 'text-gray-100' : 'text-gray-900';
  const textColorSub = isDark ? 'text-gray-400' : 'text-gray-500';

  // --- LOGIC HANDLERS ---
  const handleScaleChange = (newScale) => {
    if (newScale === ratingScale) return;
    const factor = newScale === 5 ? 0.5 : 2;
    setMyList(prev => prev.map(item => ({ ...item, rating: item.rating * factor })));
    setRatingScale(newScale);
  };

  const handleAddToList = (foodId, status, rating) => {
    setMyList(prev => {
      const existing = prev.find(item => item.foodId === foodId);
      if (existing) {
        return prev.map(item => item.foodId === foodId ? { ...item, status, rating, addedAt: Date.now() } : item);
      }
      return [{ foodId, status, rating, addedAt: Date.now() }, ...prev];
    });
    setSelectedFood(null);
  };

  const handleRemoveFromList = (foodId) => {
    setMyList(prev => prev.filter(item => item.foodId !== foodId));
    setSelectedFood(null);
  };

  const handleCreateFood = (newFood) => {
    const foodItem = {
      ...newFood,
      id: Date.now(),
      emoji: newFood.emoji || '🍽️'
    };
    setFoodDatabase([foodItem, ...foodDatabase]);
    setIsAddingFood(false);
  };

  // --- SUB-COMPONENTS ---
  const TopBar = ({ title }: { title: string }) => (
    <div 
      className="text-white p-4 text-center font-bold text-lg shadow-md sticky top-0 z-10 flex justify-between items-center transition-colors"
      style={{ backgroundColor: activeColor }}
    >
      <div className="w-6"></div>
      <span>{title}</span>
      <div className="w-6"></div>
    </div>
  );

  const BottomNav = () => (
    <div className={`${isDark ? (pureBlack ? 'bg-black border-zinc-900' : 'bg-[#1e293b] border-slate-700') : 'bg-white border-gray-200'} border-t flex justify-around p-3 sticky bottom-0 z-10 transition-colors`}>
      {[
        { id: 'home', icon: Home, label: 'Discover' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'list', icon: List, label: 'My List' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)} 
          className={`flex flex-col items-center transition-colors`}
          style={{ color: activeTab === tab.id ? activeColor : (isDark ? '#64748b' : '#9ca3af') }}
        >
          <tab.icon size={24} />
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const FAB = () => (
    <button 
      onClick={() => setIsAddingFood(true)}
      className="absolute bottom-20 right-4 w-14 h-14 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform z-20"
      style={{ 
        backgroundColor: activeColor, 
        boxShadow: `0 10px 15px -3px ${activeColor}66` 
      }}
    >
      <Plus size={28} />
    </button>
  );

  const StarVisualizer = ({ rating, scale }) => {
    const stars = [];
    for (let i = 1; i <= scale; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} size={16} fill="#eab308" color="#eab308" />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalf key={i} size={16} fill="#eab308" color="#eab308" />);
      } else {
        stars.push(<Star key={i} size={16} color={isDark ? "#475569" : "#cbd5e1"} />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const FoodImage = ({ food, sizeClass = "w-16 h-16 text-3xl" }) => {
    const [imgError, setImgError] = useState(false);
    
    if (food.imageUrl && !imgError) {
      return (
        <img 
          src={food.imageUrl} 
          alt={food.name} 
          onError={() => setImgError(true)}
          className={`${sizeClass} rounded-full object-cover shadow-inner ${inputBg}`}
        />
      );
    }
    return (
      <div 
        className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 shadow-inner`}
        style={{ backgroundColor: `${activeColor}20` }}
      >
        {food.emoji}
      </div>
    );
  };

  const FoodCard = ({ food }: { food: Food }) => {
    const listEntry = myList.find(item => item.foodId === food.id);
    
    return (
      <div 
        onClick={() => setSelectedFood(food)}
        className={`rounded-xl p-4 mb-3 shadow-sm border ${cardBg} flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer`}
      >
        <FoodImage food={food} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${textColorMain} truncate`}>{food.name}</h3>
          <p className={`text-sm ${textColorSub}`}>{food.category} • {food.estPrice} CHF</p>
          {listEntry && (
            <div className="mt-2 flex items-center gap-2">
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{
                  backgroundColor: listEntry.status === 'eaten' ? (isDark ? '#064e3b' : '#dcfce7') : `${activeColor}20`,
                  color: listEntry.status === 'eaten' ? (isDark ? '#34d399' : '#166534') : activeColor
                }}
              >
                {listEntry.status.replace('_', ' ')}
              </span>
              {listEntry.rating > 0 && (
                <span className={`flex items-center text-yellow-500 text-xs font-bold`}>
                  <Star size={12} fill="currentColor" className="mr-0.5" /> {listEntry.rating}/{ratingScale}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const AddFoodModal = () => {
    if (!isAddingFood) return null;
    
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [localImageBlob, setLocalImageBlob] = useState('');
    const [emoji, setEmoji] = useState('🍽️');

    const handleFileSelect = (e) => {
      const file = e.target.files?.[0];
      if (file) setLocalImageBlob(URL.createObjectURL(file));
    };

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) setLocalImageBlob(URL.createObjectURL(file));
          break;
        }
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name || !category) return;
      handleCreateFood({ name, category, estPrice: parseFloat(price) || 0, desc, imageUrl: localImageBlob, emoji });
    };

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex flex-col justify-end animate-in fade-in">
        <div className={`w-full rounded-t-3xl p-6 h-[90vh] overflow-y-auto flex flex-col slide-in-from-bottom-full transition-colors ${modalBg}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${textColorMain}`}>Add Custom Food</h2>
            <button onClick={() => setIsAddingFood(false)} className={`p-2 rounded-full ${inputBg} ${textColorSub}`}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
            <div>
              <label className={`text-sm font-bold ${textColorMain} mb-1 block`}>Dish Name *</label>
              <input required value={name} onChange={e => setName(e.target.value)} className={`w-full ${inputBg} ${textColorMain} border-none rounded-xl p-3 outline-none`} placeholder="e.g., Homemade Lasagna" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`text-sm font-bold ${textColorMain} mb-1 block`}>Category *</label>
                <input required value={category} onChange={e => setCategory(e.target.value)} className={`w-full ${inputBg} ${textColorMain} border-none rounded-xl p-3 outline-none`} placeholder="e.g., Italian" />
              </div>
              <div className="flex-1">
                <label className={`text-sm font-bold ${textColorMain} mb-1 block`}>Est. Price (CHF)</label>
                <input type="number" step="0.05" value={price} onChange={e => setPrice(e.target.value)} className={`w-full ${inputBg} ${textColorMain} border-none rounded-xl p-3 outline-none`} placeholder="0.00" />
              </div>
            </div>

            <div>
              <label className={`text-sm font-bold ${textColorMain} mb-1 block`}>Image</label>
              <div
                onPaste={handlePaste}
                tabIndex={0}
                onClick={() => document.getElementById('food-image-input').click()}
                className={`w-full h-32 border-2 border-dashed ${isDark ? 'border-slate-600' : 'border-gray-300'} ${inputBg} rounded-xl flex items-center justify-center cursor-pointer overflow-hidden focus:outline-none`}
              >
                {localImageBlob ? (
                  <img src={localImageBlob} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className={`mx-auto mb-2 ${textColorSub}`} size={24} />
                    <p className={`text-sm ${textColorSub}`}>Tap to select or paste image</p>
                  </div>
                )}
                <input id="food-image-input" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            </div>

            {!localImageBlob && (
              <div>
                <label className={`text-sm font-bold ${textColorMain} mb-1 block`}>Or pick an Emoji</label>
                <input value={emoji} onChange={e => setEmoji(e.target.value)} className={`w-20 ${inputBg} ${textColorMain} border-none rounded-xl p-3 text-center text-2xl outline-none`} maxLength={2} />
              </div>
            )}

            <div>
              <label className={`text-sm font-bold ${textColorMain} mb-1 block`}>Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className={`w-full ${inputBg} ${textColorMain} border-none rounded-xl p-3 outline-none`} placeholder="What is this dish like?"></textarea>
            </div>

            <button 
              type="submit" 
              className="mt-auto py-4 text-white rounded-xl font-bold text-lg active:scale-[0.98] transition-transform"
              style={{ backgroundColor: activeColor }}
            >
              Add Food
            </button>
          </form>
        </div>
      </div>
    );
  };

  const FoodModal = () => {
    if (!selectedFood) return null;
    const existingEntry = myList.find(item => item.foodId === selectedFood.id) || { status: 'want_to_eat', rating: 0 };
    const [tempStatus, setTempStatus] = useState(existingEntry.status || 'want_to_eat');
    const [tempRating, setTempRating] = useState(existingEntry.rating || 0);

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center animate-in fade-in">
        <div className={`w-full rounded-t-3xl p-6 h-[85vh] overflow-y-auto flex flex-col slide-in-from-bottom-full transition-colors ${modalBg}`}>
          <div className="flex justify-between items-start mb-6">
            <FoodImage food={selectedFood} sizeClass="w-24 h-24 text-5xl" />
            <button onClick={() => setSelectedFood(null)} className={`p-2 rounded-full ${inputBg} ${textColorSub}`}>
              <X size={20} />
            </button>
          </div>
          
          <h2 className={`text-2xl font-bold ${textColorMain}`}>{selectedFood.name}</h2>
          <p className={`font-medium mb-4 ${textColorSub}`}>{selectedFood.category} • Est. {selectedFood.estPrice} CHF</p>
          {selectedFood.desc && (
            <p className={`mb-6 p-4 rounded-xl leading-relaxed ${inputBg} ${textColorMain}`}>
              {selectedFood.desc}
            </p>
          )}

          <div className={`border-t pt-6 mt-auto ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
            <h3 className={`font-bold mb-3 ${textColorMain}`}>Your Status</h3>
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setTempStatus('want_to_eat')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${tempStatus === 'want_to_eat' ? 'text-white' : `${inputBg} ${textColorSub}`}`}
                style={{ backgroundColor: tempStatus === 'want_to_eat' ? activeColor : undefined }}
              >
                Want to Eat
              </button>
              <button 
                onClick={() => setTempStatus('eaten')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${tempStatus === 'eaten' ? 'bg-green-600 text-white' : `${inputBg} ${textColorSub}`}`}
              >
                Eaten
              </button>
            </div>

            {tempStatus === 'eaten' && (
              <div className={`mb-6 animate-in slide-in-from-top-2 p-4 rounded-xl ${inputBg}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold flex items-center gap-2 ${textColorMain}`}>
                    Score
                  </h3>
                  <span className="font-bold text-xl text-yellow-500">
                    {tempRating > 0 ? tempRating.toFixed(1) : '-'} <span className="text-sm text-gray-500">/ {ratingScale}</span>
                  </span>
                </div>
                
                <StarVisualizer rating={tempRating} scale={ratingScale} />
                
                <input 
                  type="range" 
                  min="0" 
                  max={ratingScale} 
                  step="0.5" 
                  value={tempRating}
                  onChange={(e) => setTempRating(parseFloat(e.target.value))}
                  className="w-full mt-4 accent-yellow-500 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            <div className="flex gap-3">
              {myList.find(item => item.foodId === selectedFood.id) && (
                 <button 
                 onClick={() => handleRemoveFromList(selectedFood.id)}
                 className={`px-4 py-3 rounded-xl font-bold ${isDark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700'}`}
               >
                 Remove
               </button>
              )}
              <button 
                onClick={() => handleAddToList(selectedFood.id, tempStatus, tempStatus === 'eaten' ? tempRating : 0)}
                className="flex-1 py-3 text-white rounded-xl font-bold shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: activeColor }}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN VIEWS ---
  const renderHome = () => {
    // Fetch recently added entries from myList
    const recentActivityItems = [...myList].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 5);
    const recentFoods = recentActivityItems.map(item => foodDatabase.find(f => f.id === item.foodId)).filter(Boolean);

    return (
      <div className="p-4 animate-in fade-in">
        <div 
          className="mb-6 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${activeColor}, ${isDark ? '#000' : '#333'})` }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">Discover</h2>
            <p className="opacity-90">Find your next culinary adventure.</p>
          </div>
          <Utensils className="absolute -right-4 -bottom-4 text-white opacity-20" size={100} />
        </div>
        
        <h3 className={`font-bold ${textColorMain} mb-3 flex items-center gap-2`}>
          <Activity size={18} style={{ color: activeColor }}/> Recent Activity
        </h3>
        
        {recentFoods.length > 0 ? (
          recentFoods.map(food => <FoodCard key={`recent-${food.id}`} food={food} />)
        ) : (
          <div className={`p-6 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <p className={`text-sm ${textColorSub}`}>No recent activity yet. Discover or add some food!</p>
          </div>
        )}
      </div>
    );
  };

  const renderSearch = () => {
    const results = foodDatabase.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="p-4 flex flex-col h-full animate-in fade-in">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for a dish..." 
            className={`w-full ${cardBg} ${textColorMain} rounded-xl py-3 pl-10 pr-4 outline-none transition-colors border`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {results.length > 0 ? (
            results.map(food => <FoodCard key={food.id} food={food} />)
          ) : (
            <div className="text-center text-gray-400 mt-10">
              <Utensils size={48} className="mx-auto mb-3 opacity-20" />
              <p>No food found. Try searching or add your own!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMyList = () => {
    const wantToEat = myList.filter(item => item.status === 'want_to_eat').map(i => foodDatabase.find(f => f.id === i.foodId)).filter(Boolean);
    const eaten = myList.filter(item => item.status === 'eaten').map(i => foodDatabase.find(f => f.id === i.foodId)).filter(Boolean);

    return (
      <div className="p-4 animate-in fade-in">
        {myList.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${inputBg}`}>
              <List size={40} className={textColorSub} />
            </div>
            <h3 className={`font-bold text-lg mb-1 ${textColorMain}`}>Your list is empty</h3>
            <p className="text-sm">Start discovering or add your own dishes.</p>
          </div>
        ) : (
          <>
            {wantToEat.length > 0 && (
              <div className="mb-6">
                <h3 
                  className={`font-bold ${textColorMain} mb-3 border-b-2 inline-block pb-1`}
                  style={{ borderColor: activeColor }}
                >
                  Want to Eat ({wantToEat.length})
                </h3>
                {wantToEat.map(food => <FoodCard key={`wte-${food.id}`} food={food} />)}
              </div>
            )}
            
            {eaten.length > 0 && (
              <div>
                <h3 className={`font-bold ${textColorMain} mb-3 border-b-2 border-green-500 inline-block pb-1`}>
                  Eaten ({eaten.length})
                </h3>
                {eaten.map(food => <FoodCard key={`eaten-${food.id}`} food={food} />)}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="p-4 animate-in fade-in">
      <h2 className={`text-2xl font-bold mb-6 ${textColorMain}`}>Settings</h2>
      
      <div className={`rounded-2xl p-4 shadow-sm border ${cardBg} mb-6 transition-colors`}>
        <h3 className={`font-bold ${textColorMain} mb-4 flex items-center gap-2`}>
          {isDark ? <Moon size={18}/> : <Sun size={18}/>} Appearance
        </h3>
        
        <div className="space-y-5">
          {/* Light/Dark Toggle */}
          <div className={`flex rounded-xl p-1 ${inputBg}`}>
            <button 
              onClick={() => setTheme('light')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isDark ? 'bg-white shadow-sm text-gray-900' : textColorSub}`}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isDark ? 'bg-slate-700 shadow-sm text-white' : textColorSub}`}
            >
              Dark
            </button>
          </div>

          {/* OLED Toggle (Only in Dark Mode) */}
          {isDark && (
            <div className="flex items-center justify-between">
              <div>
                <label className={`text-sm font-bold ${textColorMain} block`}>Pure Black (OLED)</label>
                <span className={`text-xs ${textColorSub}`}>Optimizes battery on Pixel</span>
              </div>
              <input 
                type="checkbox" 
                checked={pureBlack} 
                onChange={e => setPureBlack(e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: activeColor }}
              />
            </div>
          )}

          <hr className={`border-t ${isDark ? (pureBlack ? 'border-zinc-800' : 'border-slate-700') : 'border-gray-200'}`} />

          {/* Material You Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className={`text-sm font-bold ${textColorMain} block`}>Material You Theme</label>
              <span className={`text-xs ${textColorSub}`}>Use custom accent colors</span>
            </div>
            <input 
              type="checkbox" 
              checked={materialYou} 
              onChange={e => setMaterialYou(e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
              style={{ accentColor: activeColor }}
            />
          </div>

          {/* Material You Color Picker */}
          {materialYou && (
            <div className="flex items-center justify-between animate-in slide-in-from-top-2">
              <label className={`text-sm font-bold ${textColorMain}`}>Accent Color</label>
              <input 
                type="color" 
                value={accentColor} 
                onChange={e => setAccentColor(e.target.value)}
                className="w-10 h-10 p-0 border-0 rounded cursor-pointer bg-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-2xl p-4 shadow-sm border ${cardBg} transition-colors`}>
        <h3 className={`font-bold ${textColorMain} mb-2 flex items-center gap-2`}>
          <Star size={18}/> Rating System
        </h3>
        <p className={`text-xs ${textColorSub} mb-4`}>Switching systems automatically converts your past ratings.</p>
        <div className={`flex rounded-xl p-1 ${inputBg}`}>
          <button 
            onClick={() => handleScaleChange(5)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${ratingScale === 5 ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-900 shadow-sm') : textColorSub}`}
          >
            Out of 5
          </button>
          <button 
            onClick={() => handleScaleChange(10)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${ratingScale === 10 ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-900 shadow-sm') : textColorSub}`}
          >
            Out of 10
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex justify-center font-sans ${appBg} transition-colors duration-300`}>
      {/* Mobile Frame Container */}
      <div className={`w-full max-w-md flex flex-col h-screen overflow-hidden sm:shadow-2xl relative transition-colors duration-300 ${frameBg}`}>
        <TopBar title="MyFoodList" />
        
        <main className="flex-1 overflow-y-auto pb-4 relative">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'search' && renderSearch()}
          {activeTab === 'list' && renderMyList()}
          {activeTab === 'settings' && renderSettings()}
        </main>

        {(activeTab === 'home' || activeTab === 'list') && <FAB />}
        
        <BottomNav />
        <FoodModal />
        <AddFoodModal />
      </div>
    </div>
  );
}