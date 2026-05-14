import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Link
} from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Send, 
  Heart, 
  Wallet, 
  Apple, 
  Beef, 
  Egg, 
  Martini, 
  SprayCan, 
  Baby, 
  Stethoscope, 
  Coffee, 
  PenTool, 
  CheckCircle2, 
  Gift, 
  CloudIcon, 
  Trash2, 
  Check, 
  Store, 
  Download, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { CATEGORIES, STORES, LOVE_NOTES } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MashlaService, type SharedItem, type SharedList } from './services/mashlaService';
import Landing from './components/Landing';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IconMap: Record<string, any> = {
  Apple, Beef, Egg, Martini, SprayCan, Baby, Stethoscope, Coffee, PenTool
};

interface Category {
  id: string;
  name: string;
  icon: string;
  items: string[];
  units: string[];
}

interface SelectedItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  note: string;
}

// --- CREATOR VIEW ---
function MashlaCreator() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mashla_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });
  const [selectedStore, setSelectedStore] = useState(STORES[0].name);
  const [customStore, setCustomStore] = useState('');
  const [activeTab, setActiveTab] = useState(categories[0]?.id || '');
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>(() => {
    const saved = localStorage.getItem('mashla_draft');
    return saved ? JSON.parse(saved) : {};
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mashla_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [budget, setBudget] = useState(localStorage.getItem('mashla_budget') || '');
  const [loveNote, setLoveNote] = useState(localStorage.getItem('mashla_note') || LOVE_NOTES[0]);
  const [customNote, setCustomNote] = useState(localStorage.getItem('mashla_custom_note') || '');
  const [includeSurprise, setIncludeSurprise] = useState(localStorage.getItem('mashla_surprise') === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeCloudId, setActiveCloudId] = useState<string | null>(() => localStorage.getItem('mashla_active_cloud_id'));
  const [syncStartTime, setSyncStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('mashla_sync_start');
    return saved ? Number(saved) : null;
  });
  const [cloudItems, setCloudItems] = useState<SharedItem[]>([]);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeItems, setNudgeItems] = useState<string[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<{ catId: string, oldName: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('mashla_categories', JSON.stringify(categories));
    localStorage.setItem('mashla_draft', JSON.stringify(selectedItems));
    localStorage.setItem('mashla_budget', budget);
    localStorage.setItem('mashla_note', loveNote);
    localStorage.setItem('mashla_custom_note', customNote);
    localStorage.setItem('mashla_surprise', String(includeSurprise));
    localStorage.setItem('mashla_favorites', JSON.stringify(favorites));
    if (activeCloudId) localStorage.setItem('mashla_active_cloud_id', activeCloudId);
    else localStorage.removeItem('mashla_active_cloud_id');
    if (syncStartTime) localStorage.setItem('mashla_sync_start', String(syncStartTime));
    else localStorage.removeItem('mashla_sync_start');
  }, [categories, selectedItems, budget, loveNote, customNote, includeSurprise, favorites, activeCloudId, syncStartTime]);

  // Listen to cloud items if tracking is active
  useEffect(() => {
    if (!activeCloudId) return;
    const unsub = MashlaService.listenToItems(activeCloudId, setCloudItems);
    return () => unsub();
  }, [activeCloudId]);

  // Smart Nudge Logic
  useEffect(() => {
    if (!activeCloudId || !syncStartTime) {
      setShowNudge(false);
      return;
    }

    const checkNudge = () => {
      const now = Date.now();
      const elapsed = now - syncStartTime;
      const nudgeThreshold = 5 * 60 * 1000; // 5 Minutes

      if (elapsed >= nudgeThreshold) {
        const pending = cloudItems.filter(i => !i.completed);
        if (pending.length > 0) {
          setNudgeItems(pending.map(p => p.name));
          setShowNudge(true);
        } else {
          setShowNudge(false);
        }
      } else {
        setShowNudge(false);
      }
    };

    // Run every 10 seconds to check if we crossed the 5-min mark
    const interval = setInterval(checkNudge, 10000);
    checkNudge(); // Initial check

    return () => clearInterval(interval);
  }, [activeCloudId, syncStartTime, cloudItems]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearList = () => {
    if (confirm('هل أنت متأكد من مسح القائمة بالكامل؟')) {
      setSelectedItems({});
      setBudget('');
      setActiveCloudId(null);
      setSyncStartTime(null);
    }
  };

  const toggleItem = (categoryName: string, itemName: string) => {
    const id = `${categoryName}-${itemName}`;
    setSelectedItems(prev => {
      if (prev[id]) {
        const newItems = { ...prev };
        delete newItems[id];
        return newItems;
      }
      return {
        ...prev,
        [id]: {
          id,
          name: itemName,
          category: categoryName,
          quantity: 1,
          unit: categories.find(c => c.name === categoryName)?.units[0] || 'حبة',
          note: ''
        }
      };
    });
  };

  const addCategory = () => {
    const name = prompt('أدخل اسم القسم الجديد:');
    if (name) {
      const id = `cat-${Date.now()}`;
      setCategories(prev => [...prev, {
        id,
        name,
        icon: 'Apple',
        items: [],
        units: ['حبة', 'كيلو', 'كرتون']
      }]);
      setActiveTab(id);
    }
  };

  const removeCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cat = categories.find(c => c.id === id);
    if (cat && confirm(`هل تريد حذف قسم "${cat.name}" وكل محتوياته؟`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (activeTab === id) setActiveTab(categories[0]?.id || '');
      // Also remove selected items in this category
      setSelectedItems(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key].category === cat.name) delete next[key];
        });
        return next;
      });
    }
  };

  const editCategoryName = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cat = categories.find(c => c.id === id);
    if (cat) {
      const newName = prompt('تعديل اسم القسم:', cat.name);
      if (newName && newName !== cat.name) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
        // Update selected items names if needed (though they rely on name which is slightly brittle here, but standard for this app)
        setSelectedItems(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
            if (next[key].category === cat.name) next[key].category = newName;
          });
          return next;
        });
      }
    }
  };

  const addNewItem = (catId: string) => {
    if (!newItemName.trim()) return;
    setCategories(prev => prev.map(c => 
      c.id === catId ? { ...c, items: [newItemName.trim(), ...c.items] } : c
    ));
    setNewItemName('');
    setIsAddingItem(false);
  };

  const removeItemFromCategory = (catId: string, itemName: string) => {
    if (confirm(`هل تريد حذف صنف "${itemName}" من النظام؟`)) {
      setCategories(prev => prev.map(c => 
        c.id === catId ? { ...c, items: c.items.filter(i => i !== itemName) } : c
      ));
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        const id = `${cat.name}-${itemName}`;
        setSelectedItems(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }
  };

  const startEditingItem = (catId: string, itemName: string) => {
    setEditingItem({ catId, oldName: itemName });
    setEditValue(itemName);
  };

  const saveEditedItem = () => {
    if (!editingItem || !editValue.trim() || editValue === editingItem.oldName) {
      setEditingItem(null);
      return;
    }
    const { catId, oldName } = editingItem;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;

    setCategories(prev => prev.map(c => 
      c.id === catId ? { ...c, items: c.items.map(i => i === oldName ? editValue.trim() : i) } : c
    ));

    // Update selected items if active
    const oldId = `${cat.name}-${oldName}`;
    const newId = `${cat.name}-${editValue.trim()}`;
    setSelectedItems(prev => {
      if (prev[oldId]) {
        const next = { ...prev };
        const itemData = { ...next[oldId], id: newId, name: editValue.trim() };
        delete next[oldId];
        next[newId] = itemData;
        return next;
      }
      return prev;
    });

    setEditingItem(null);
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedItems(prev => {
      if (!prev[id]) return prev;
      const newQty = Math.max(1, prev[id].quantity + delta);
      return {
        ...prev,
        [id]: { ...prev[id], quantity: newQty }
      };
    });
  };

  const updateUnit = (id: string, unit: string) => {
    setSelectedItems(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], unit }
      };
    });
  };

  const updateNote = (id: string, note: string) => {
    setSelectedItems(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], note }
      };
    });
  };

  const finalStore = selectedStore === 'متجر آخر' ? customStore : selectedStore;
  const finalNote = loveNote === 'مخصصة' ? customNote : loveNote;

  const handleShareCloud = async () => {
    if (Object.keys(selectedItems).length === 0) return;
    setIsLoading(true);
    
    try {
      const listId = await MashlaService.createSharedList({
        store: finalStore || 'بندة',
        budget: budget || 'غير محدد',
        loveNote: finalNote,
        includeSurprise,
        status: 'active'
      }, (Object.values(selectedItems) as SelectedItem[]).map(i => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity,
        unit: i.unit,
        note: i.note,
        completed: false
      })));

      setIsLoading(false);
      
      if (listId) {
        setActiveCloudId(listId);
        setSyncStartTime(Date.now());
        const shareUrl = `${window.location.origin}/list/${listId}`;
        const message = `الماشلة السحابية جاهزة! ☁️\nافتح الرابط لمتابعة المقاضي وشطبها مباشرة:\n${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (e) {
      setIsLoading(false);
      alert('حدث خطأ أثناء تفعيل المزامنة السحابية.');
    }
  };

  const generateWhatsAppLink = () => {
    const itemsByCat: Record<string, SelectedItem[]> = {};
    (Object.values(selectedItems) as SelectedItem[]).forEach((item) => {
      if (!itemsByCat[item.category]) itemsByCat[item.category] = [];
      itemsByCat[item.category].push(item);
    });

    let message = `الماشلة من: 🏠 [البيت]\n`;
    message += `الوجهة المفضلة: 🛒 [${finalStore || 'بندة'}]\n`;
    if (budget) message += `الميزانية المقترحة: 💰 [${budget} ريال]\n`;
    message += `\nالمقاضي:\n`;

    Object.entries(itemsByCat).forEach(([cat, list]) => {
      message += `\n📦 ${cat}:\n`;
      list.forEach(item => {
        message += `- ${item.name} (${item.quantity} ${item.unit})${item.note ? ` [${item.note}]` : ''}\n`;
      });
    });

    if (includeSurprise) {
      message += `\n🎁 ولا تنسى تجيب لنا معاك شيء حلو على ذوقك\n`;
    }

    message += `\n❤️ كلمة من القلب:\n${finalNote}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const exportAsImage = async () => {
    if (exportRef.current === null) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = `ماشلة-${new Date().toLocaleDateString('ar-SA')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    } finally {
      setIsExporting(false);
    }
  };

  const activeCategoryItems = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeTab);
  }, [activeTab]);

  const completedCount = cloudItems.filter(i => i.completed).length;
  const totalCount = cloudItems.length;

  return (
    <div className="flex flex-col h-screen h-full overflow-hidden bg-secondary">
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-50">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
            <ShoppingCart size={20} />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2 text-right">
            <h1 className="text-xl lg:text-2xl font-bold text-text-deep leading-none">الماشلة</h1>
            <span className="text-[9px] lg:text-xs bg-accent text-white px-2 py-0.5 rounded-full inline-block w-fit mt-0.5 lg:mt-0">مقاضي البيت بلمسة حب</span>
          </div>
        </Link>

        {activeCloudId && (
          <div className="lg:hidden flex items-center gap-2 bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
             <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-primary">{completedCount}/{totalCount}</span>
          </div>
        )}
        
        {showNudge && nudgeItems.length > 0 && completedCount < totalCount && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:hidden fixed top-20 left-4 right-4 z-[60] bg-accent p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-white/20"
          >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                  <Gift size={16} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white/80">نسي بعض الأغراض؟</p>
                  <p className="text-xs font-bold text-white">تذكير بالأصناف المتبقية</p>
               </div>
            </div>
            <button 
              onClick={() => {
                const message = `حبيبي لا تنسى الماشلة المتبقية: 🛒\n${nudgeItems.join(' - ')}\n\nتقدر تشطبها من هنا:\n${window.location.origin}/list/${activeCloudId}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="bg-white text-accent px-4 py-2 rounded-xl text-[10px] font-black shadow-sm"
            >
              تذكير ✉️
            </button>
          </motion.div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            onClick={clearList}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">مسح</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-64 bg-sidebar border-l border-border flex-col shrink-0">
          <div className="p-4 font-bold text-primary border-b border-border text-center flex items-center justify-between">
            <span className="flex-1">الأقسام</span>
            <button 
              onClick={addCategory}
              className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all active:scale-95"
              title="إضافة قسم جديد"
            >
              <Plus size={16} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {categories.map(cat => {
              const isActive = activeTab === cat.id;
              const selectedInCat = (Object.values(selectedItems) as SelectedItem[]).filter(i => i.category === cat.name).length;
              return (
                <div 
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "group flex items-center justify-between px-4 py-4 transition-colors cursor-pointer text-sm font-medium",
                    isActive ? "bg-primary text-white shadow-inner" : "hover:bg-border/30 text-text-soft"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {IconMap[cat.icon] && <span className="shrink-0 mr-1 inline-block -rotate-3 text-current ring-1 ring-white/10 rounded"><Check size={10}/></span>}
                    <span className="truncate">{cat.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => editCategoryName(cat.id, e)}
                        className={cn("p-1 rounded hover:bg-white/20", isActive ? "text-white" : "text-gray-400")}
                      >
                        <Plus size={12} className="rotate-45" /> {/* Using Pencil icon would be better but let's stick to lucide available ones or look for Pencil */}
                      </button>
                      <button 
                        onClick={(e) => removeCategory(cat.id, e)}
                        className={cn("p-1 rounded hover:bg-white/20", isActive ? "text-white" : "text-red-400")}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {selectedInCat > 0 && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full shrink-0", isActive ? "bg-white text-primary" : "bg-primary text-white")}>{selectedInCat}</span>}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden bg-white border-b border-border flex items-center gap-2 p-3 overflow-hidden shrink-0">
            <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 shadow-sm",
                    activeTab === cat.id ? "bg-primary text-white" : "bg-white text-text-soft border border-border"
                  )}
                >
                  {cat.name}
                  {(Object.values(selectedItems) as SelectedItem[]).filter(i => i.category === cat.name).length > 0 && <span>•</span>}
                </button>
              ))}
            </div>
            <button 
              onClick={addCategory}
              className="p-2 bg-primary text-white rounded-full shadow-md shrink-0 active:scale-95"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Desktop Store Selection */}
              <div className="hidden md:flex mb-8 card-container items-center gap-4">
                 <div className="bg-primary/10 p-2 rounded-lg text-primary"><Store size={20}/></div>
                 <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">المتجر المفضل</label>
                      <select 
                        className="w-full p-2 bg-secondary rounded-lg border-none focus:ring-1 focus:ring-primary outline-none text-sm"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                      >
                        {STORES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    {selectedStore === 'متجر آخر' && (
                       <div>
                         <label className="block text-[10px] font-bold text-gray-400 mb-1">اسم المتجر</label>
                         <input 
                            type="text" 
                            placeholder="اكتب اسم المتجر..."
                            className="w-full p-2 bg-secondary rounded-lg border-none focus:ring-1 focus:ring-primary outline-none text-sm"
                            value={customStore}
                            onChange={(e) => setCustomStore(e.target.value)}
                          />
                       </div>
                    )}
                 </div>
              </div>

              {/* Mobile Store Selection */}
              <div className="md:hidden mb-6 card-container">
                <label className="block text-xs font-bold text-primary mb-2">🛒 اختر المتجر</label>
                <select 
                  className="w-full p-2 bg-secondary rounded-lg border-none focus:ring-1 focus:ring-primary outline-none text-sm"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  {STORES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                {selectedStore === 'متجر آخر' && (
                  <input 
                    type="text" 
                    placeholder="اسم المتجر..."
                    className="mt-2 w-full p-2 bg-secondary rounded-lg border-none focus:ring-1 focus:ring-primary outline-none text-sm"
                    value={customStore}
                    onChange={(e) => setCustomStore(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-text-deep">{activeCategoryItems?.name}</h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                     <input 
                       type="text" 
                       placeholder="إضافة صنف جديد..."
                       className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none shadow-sm"
                       value={newItemName}
                       onChange={(e) => setNewItemName(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && activeCategoryItems && addNewItem(activeCategoryItems.id)}
                     />
                     <button 
                       onClick={() => activeCategoryItems && addNewItem(activeCategoryItems.id)}
                       className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
                     >
                       <Plus size={14} />
                     </button>
                   </div>
                  <span className="hidden sm:inline-block bg-white border border-border px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm whitespace-nowrap">
                    {(Object.values(selectedItems) as SelectedItem[]).filter(i => i.category === activeCategoryItems?.name).length} مختار
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {activeCategoryItems?.items.map(item => {
                    const id = `${activeCategoryItems.name}-${item}`;
                    const isSelected = !!selectedItems[id];
                    const isEditing = editingItem?.catId === activeCategoryItems.id && editingItem?.oldName === item;
                    
                    return (
                      <motion.div
                        layout
                        key={item}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "group bg-white p-4 rounded-xl border transition-all flex flex-col gap-3 relative overflow-hidden",
                          isSelected ? "border-primary ring-2 ring-primary shadow-md" : "border-border shadow-sm hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleItem(activeCategoryItems.name, item)}
                            className="mt-1 h-5 w-5 rounded border-border text-primary focus:ring-primary transition-all cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0" onClick={() => !isSelected && !isEditing && toggleItem(activeCategoryItems.name, item)}>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  autoFocus
                                  className="flex-1 bg-secondary p-1 rounded text-sm font-bold border-none outline-none focus:ring-1 focus:ring-primary"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditedItem();
                                    if (e.key === 'Escape') setEditingItem(null);
                                  }}
                                />
                                <button onClick={saveEditedItem} className="p-1 text-green-500"><Check size={16}/></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn("font-bold text-text-deep truncate", isSelected ? "" : "")}>{item}</span>
                                <button onClick={(e) => toggleFavorite(id, e)} className="transition-transform active:scale-125 shrink-0">
                                  <Heart size={12} className={cn("transition-colors", favorites.includes(id) ? "fill-accent text-accent" : "text-gray-200")} />
                                </button>
                              </div>
                            )}
                            <div className="text-[10px] text-gray-400">
                              {isSelected ? selectedItems[id].unit : activeCategoryItems.units[0]}
                            </div>
                          </div>
                          
                          <div className={cn("flex items-center gap-1", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                            {!isEditing && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); startEditingItem(activeCategoryItems.id, item); }}
                                  className="p-1.5 text-gray-300 hover:text-primary transition-colors"
                                >
                                  <Plus size={12} className="rotate-45" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeItemFromCategory(activeCategoryItems.id, item); }}
                                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}

                            {isSelected && (
                              <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5 border border-border/50 shrink-0">
                                <button 
                                  onClick={() => updateQuantity(id, 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-white border border-border rounded shadow-sm hover:bg-gray-50 active:scale-95"
                                >
                                  <Plus size={12} />
                                </button>
                                <span className="font-bold px-1 min-w-[20px] text-center text-xs">{selectedItems[id].quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(id, -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-white border border-border rounded shadow-sm hover:bg-gray-50 active:scale-95"
                                >
                                  <Minus size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 pt-2 border-t border-dashed border-border"
                          >
                            <div className="flex gap-2 flex-wrap">
                              {activeCategoryItems.units.map(unit => (
                                <button
                                  key={unit}
                                  onClick={() => updateUnit(id, unit)}
                                  className={cn(
                                    "px-2 py-1 rounded text-[10px] border transition-all",
                                    selectedItems[id].unit === unit ? "bg-primary text-white border-primary" : "bg-white border-border text-text-soft"
                                  )}
                                >
                                  {unit}
                                </button>
                              ))}
                            </div>
                            <input 
                              type="text" 
                              placeholder="أضف ملاحظة (مثل: طازج)..."
                              className="w-full text-xs p-1.5 border-b border-dashed border-border focus:border-primary focus:outline-none bg-transparent"
                              value={selectedItems[id].note}
                              onChange={(e) => updateNote(id, e.target.value)}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>

        <aside className="hidden xl:flex w-80 bg-white border-r border-border flex-col p-6 shadow-2xl shrink-0">
          <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar">
            {activeCloudId && (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2 text-primary font-bold text-xs">
                       <CloudIcon size={14} />
                       <span>المتابعة الحية</span>
                     </div>
                     <span className="text-[10px] text-accent font-bold px-2 py-0.5 bg-accent/10 rounded-full animate-pulse">متصل</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>تم شطب {completedCount} من {totalCount}</span>
                      <span>{Math.round((completedCount/totalCount)*100) || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount/totalCount)*100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <button 
                      onClick={() => {
                          const shareUrl = `${window.location.origin}/list/${activeCloudId}`;
                          const message = `تذكير بمقاضي البيت: 🛒\n${shareUrl}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="w-full py-2 bg-white border border-primary/20 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      إعادة إرسال الرابط لزوجك 🔗
                    </button>
                  </div>
                </div>

                {showNudge && nudgeItems.length > 0 && completedCount < totalCount && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-accent/10 border border-accent/20 rounded-2xl p-4 relative overflow-hidden"
                  >
                    <div className="absolute -top-2 -left-2 text-accent/10">
                      <Sparkles size={40} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-accent font-black text-[11px] mb-2">
                         <Gift size={14} />
                         <span>مساعد الماشلة الذكي</span>
                      </div>
                      <p className="text-[10px] text-text-soft font-bold mb-3 leading-relaxed">
                        مرت 5 دقائق ويبدو أنه نسي: <span className="text-accent underline">{nudgeItems[0]}</span> {nudgeItems.length > 1 && `و${nudgeItems.length - 1} أصناف أخرى.`}
                      </p>
                      <button 
                        onClick={() => {
                          const message = `حبيبي لا تنسى الماشلة المتبقية: 🛒\n${nudgeItems.join(' - ')}\n\nتقدر تشطبها من هنا:\n${window.location.origin}/list/${activeCloudId}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="w-full py-2 bg-accent text-white text-[10px] font-black rounded-lg shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        تذكيره بالمنسيات الآن ✉️
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                <Wallet size={14} /> 💰 الميزانية المقترحة
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-border bg-secondary rounded-xl p-4 text-xl font-bold text-text-deep focus:outline-none focus:ring-1 focus:ring-primary text-left"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent text-sm font-sans">ريال</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                <Heart size={14} /> ❤️ كلمة من القلب
              </label>
              <select 
                className="w-full border border-border bg-secondary rounded-xl p-3 mb-3 focus:outline-none text-sm"
                value={loveNote}
                onChange={(e) => setLoveNote(e.target.value)}
              >
                {LOVE_NOTES.map((n, i) => <option key={i} value={n}>{n}</option>)}
                <option value="مخصصة">كتابة رسالة مخصصة...</option>
              </select>
              {loveNote === 'مخصصة' && (
                <textarea 
                  placeholder="اكتبي رسالة من القلب..." 
                  className="w-full h-24 border border-border bg-secondary rounded-xl p-3 text-sm focus:outline-none resize-none shadow-inner"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                />
              )}
            </div>

            <div 
              onClick={() => setIncludeSurprise(!includeSurprise)}
              className={cn(
                "border-2 border-dashed p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all",
                includeSurprise ? "bg-accent/5 border-accent shadow-sm" : "border-border bg-transparent shadow-inner"
              )}
            >
              <input 
                type="checkbox" 
                checked={includeSurprise}
                readOnly
                className="rounded border-border text-accent focus:ring-accent" 
              />
              <label className={cn(
                "text-sm font-medium leading-relaxed",
                includeSurprise ? "text-accent" : "text-text-soft"
              )}>ولا تنسى تجيب لنا معاك شيء حلو على ذوقك 🍰</label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border space-y-3">
            <button 
              onClick={handleShareCloud}
              disabled={isLoading || Object.keys(selectedItems).length === 0}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg bg-primary text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <CloudIcon size={20} />
              )}
              <span>الماشلة السحابية (تحديث حي)</span>
            </button>
            <button 
              onClick={generateWhatsAppLink}
              disabled={Object.keys(selectedItems).length === 0}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg bg-[#25D366] text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={20} />
              <span>إرسال نصي فقط</span>
            </button>
            <button 
              onClick={exportAsImage}
              disabled={Object.keys(selectedItems).length === 0 || isExporting}
              className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /> : <ImageIcon size={20} />}
              <span>حفظ كصورة أنيقة 🖼️</span>
            </button>
          </div>
        </aside>
      </div>

      <div className="xl:hidden bg-white border-t border-border p-4 shadow-2xl z-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button 
            onClick={handleShareCloud}
            disabled={isLoading || Object.keys(selectedItems).length === 0}
            className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary text-white shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <CloudIcon size={16} />}
            <span>مشاركة</span>
          </button>
          <button 
            onClick={exportAsImage}
            disabled={Object.keys(selectedItems).length === 0 || isExporting}
            className="p-3 bg-white border border-border rounded-xl text-primary shadow-md active:scale-95"
          >
            {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /> : <ImageIcon size={20} />}
          </button>
          <button 
            onClick={generateWhatsAppLink}
            disabled={Object.keys(selectedItems).length === 0}
            className="p-3 bg-[#25D366] rounded-xl text-white shadow-md active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Hidden Export Card Pre-rendered */}
      <div className="fixed -left-[2000px] top-0 pointer-events-none">
        <div ref={exportRef} className="w-[600px] p-8 bg-[#fdf2f2] text-right" dir="rtl">
           <div className="bg-white rounded-[40px] p-10 shadow-sm border border-[#fee2e2] relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-24 translate-x-24" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full translate-y-16 -translate-x-16" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10 border-b-2 border-dashed border-gray-100 pb-8">
                  <div>
                    <h1 className="text-4xl font-black text-primary mb-2 tracking-tighter">الماشلة</h1>
                    <div className="flex items-center gap-2 text-text-soft text-sm">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                       <span>مقاضي البيت السعيدة</span>
                    </div>
                  </div>
                  <div className="text-left bg-secondary p-4 rounded-2xl border border-border">
                    <p className="text-[10px] font-black text-primary mb-1 uppercase opacity-50">متجرك المختار</p>
                    <p className="text-xl font-bold text-text-deep leading-none">{finalStore || 'بندة'}</p>
                  </div>
                </div>

                <div className="space-y-8 mb-10">
                  {Object.entries(
                    (Object.values(selectedItems) as SelectedItem[]).reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = [];
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, SelectedItem[]>)
                  ).map(([cat, list]) => (
                    <div key={cat}>
                      <h3 className="text-xs font-black text-primary mb-4 flex items-center gap-2 bg-primary/5 w-fit px-3 py-1 rounded-full">
                        {cat}
                      </h3>
                      <div className="grid grid-cols-1 gap-3 px-2">
                        {list.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-base border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                               <span className="text-text-deep font-bold">{item.name}</span>
                            </div>
                            <span className="text-text-soft font-medium bg-secondary px-2 py-0.5 rounded text-xs">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {budget && (
                  <div className="bg-primary p-6 rounded-3xl flex justify-between items-center mb-8 text-white shadow-xl shadow-primary/20">
                    <div className="flex items-center gap-3">
                       <Wallet size={24} />
                       <span className="text-sm font-bold opacity-80">الميزانية المقترحة</span>
                    </div>
                    <span className="text-3xl font-black">{budget} ريال</span>
                  </div>
                )}

                <div className="bg-[#fff9f9] p-8 rounded-[32px] border-2 border-dashed border-primary/20 relative">
                  <div className="absolute -top-4 right-8 bg-white border-2 border-primary/20 p-2 rounded-full shadow-sm text-primary">
                    <Heart size={20} className="fill-primary" />
                  </div>
                  <p className="text-[10px] font-black text-primary mb-3 uppercase tracking-widest opacity-60">رسالة حب</p>
                  <p className="text-2xl text-text-deep font-bold leading-relaxed italic">{finalNote}</p>
                  {includeSurprise && (
                    <div className="mt-6 pt-6 border-t border-primary/10 text-accent font-black text-sm flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shrink-0">
                         <Gift size={16} />
                      </div>
                      <span>ولا تنسى المفاجأة الحلوة على ذوقك يا بطل ✨</span>
                    </div>
                  )}
                </div>

                <div className="mt-12 text-center">
                  <div className="inline-block px-4 py-2 bg-gray-50 rounded-full text-[10px] text-gray-400 font-bold border border-gray-100">
                    تـم الإنـشـاء بـواسـطـة تـطـبـيـق المـاشـلـة ✨ {new Date().toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- SHOPPER VIEW ---
function MashlaShopper() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<SharedList | null>(null);
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listId) return;

    const unsubList = MashlaService.listenToList(listId, setList);
    const unsubItems = MashlaService.listenToItems(listId, (newItems) => {
      setItems(newItems);
      setLoading(false);
    });

    return () => {
      unsubList();
      unsubItems();
    };
  }, [listId]);

  const itemsByCat = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, SharedItem[]>);
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-pulse text-primary font-bold">جاري تحميل الماشلة...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-8 text-center" dir="rtl">
        <div className="card-container max-w-md">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-text-deep mb-2">عفواً، لم نجد الماشلة المطلوبة</h2>
          <p className="text-sm text-gray-500 mb-6">قد يكون الرابط منتهياً أو غير صحيح.</p>
          <button onClick={() => window.location.href = '/'} className="btn-primary w-full bg-primary text-white p-3 rounded-xl">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pb-12" dir="rtl">
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
            <ShoppingCart size={20} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-text-deep leading-tight">ماشلة البيت</h1>
            <p className="text-[10px] text-accent font-medium leading-tight">تحديث فوري ☁️</p>
          </div>
        </Link>
        {list.status === 'completed' && <span className="bg-[#25D366] text-white text-[10px] px-2 py-1 rounded-full font-bold">تم الانتهاء!</span>}
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-6">
        <div className="card-container overflow-hidden p-0 shadow-lg">
          <div className="bg-primary/5 p-4 border-b border-border flex justify-between items-center text-right">
            <div className="flex items-center gap-2 text-primary">
              <Store size={16} />
              <span className="font-bold">{list.store}</span>
            </div>
            <div className="text-accent font-bold text-sm">{list.budget} ريال</div>
          </div>
          <div className="p-4 space-y-4 text-right">
             <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-border shadow-inner">
                <div className="text-2xl">❤️</div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold text-primary uppercase mb-1">كلمة من القلب</p>
                  <p className="text-xs text-text-soft leading-relaxed italic">{list.loveNote}</p>
                </div>
             </div>
             {list.includeSurprise && (
                <div className="flex items-center gap-3 bg-accent/5 p-3 rounded-xl border border-dashed border-accent">
                  <Gift size={20} className="text-accent" />
                  <p className="text-xs font-bold text-accent">ولا تنسى تجيب شيء حلو على ذوقك 🍰</p>
                </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
          {(Object.entries(itemsByCat) as [string, SharedItem[]][]).map(([cat, catItems]) => (
            <div key={cat} className="space-y-3">
              <h3 className="text-xs font-bold text-primary flex items-center gap-2 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {cat}
              </h3>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <motion.div 
                    layout
                    key={item.id}
                    onClick={() => MashlaService.toggleItemCompletion(list!.id, item.id, !item.completed)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      item.completed 
                        ? "bg-gray-100 border-gray-200 opacity-60 grayscale" 
                        : "bg-white border-border shadow-sm hover:border-primary active:scale-[0.98]"
                    )}
                  >
                    <div className="flex items-center gap-4 text-right flex-1">
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0",
                        item.completed ? "bg-primary border-primary text-white" : "border-gray-200 bg-white"
                      )}>
                        {item.completed && <Check size={16} />}
                      </div>
                      <div className={cn("flex-1", item.completed ? "line-through text-gray-400" : "")}>
                        <p className="font-bold text-sm text-text-deep leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{item.quantity} {item.unit}</p>
                        {item.note && <p className="text-[9px] text-accent mt-1 bg-accent/5 px-2 py-0.5 rounded inline-block">💡 {item.note}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Completion Indicator */}
      <AnimatePresence>
        {items.length > 0 && items.every(i => i.completed) && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-50"
          >
            <div className="bg-[#25D366] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} />
                <span className="font-bold text-sm sm:text-base">خلصت الماشلة! الله يعطيك العافية ❤️</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<MashlaCreator />} />
        <Route path="/list/:listId" element={<MashlaShopper />} />
      </Routes>
    </BrowserRouter>
  );
}
