import React from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingCart, 
  Heart, 
  CloudIcon, 
  Smartphone, 
  Gift, 
  CheckCircle2, 
  ArrowLeft,
  Share2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#fdf2f2] text-right overflow-x-hidden" dir="rtl">
      {/* Navigation */}
      <nav className="h-20 flex items-center justify-between px-6 lg:px-20 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShoppingCart size={20} />
          </div>
          <span className="text-2xl font-black text-primary tracking-tighter">الماشلة</span>
        </div>
        
        <Link 
          to="/create" 
          className="bg-primary text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
        >
          ابدأ الآن
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 lg:px-20 lg:pt-32 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-bold mb-6">
              <Sparkles size={14} />
              <span>جديد: المزامنة السحابية الفورية ☁️</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-text-deep leading-[1.1] mb-8">
               قائمة مقاضي <br />
               <span className="text-primary underline decoration-accent/30 underline-offset-8">تنبض بالحب</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-soft leading-relaxed mb-10 max-w-lg">
              الماشلة ليست مجرد قائمة مشتريات، هي طريقتك لمشاركة احتياجات البيت مع من تحب بلمسة أنيقة، رسائل قلبية، ومتابعة فورية لكل صنف يتم شراؤه.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/create"
                className="inline-flex items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-[2rem] font-bold text-lg shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all"
              >
                <span>جهزي الماشلة الآن</span>
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-4 px-6">
                <div className="flex -space-x-3 space-x-reverse">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-text-soft">
                  <span className="text-primary">+500</span> بيوت سعيدة تستخدم الماشلة
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
             {/* Abstract background blobs */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white rounded-full blur-[100px] opacity-50" />
             
             {/* Mockup Preview */}
             <div className="relative z-10 bg-white p-6 rounded-[3rem] shadow-2xl border border-border/50 rotate-3 transform-gpu">
                <div className="bg-secondary p-4 rounded-[2rem] space-y-4">
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                      <p className="text-[10px] text-primary font-bold mb-1">الخضروات</p>
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-sm">طماطم طازجة 🍅</span>
                         <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">3 كيلو</span>
                      </div>
                   </div>
                   <div className="bg-primary p-4 rounded-2xl shadow-lg border border-primary text-white">
                      <div className="flex items-center gap-2 mb-2">
                         <Heart size={14} className="fill-white" />
                         <span className="text-[10px] font-bold opacity-80 uppercase">رسالة حب</span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed">"لا تنسى ترجع بدري، العشا عليك اليوم ❤️"</p>
                   </div>
                </div>
             </div>
             
             {/* Floating Elements */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-10 -right-10 bg-accent text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20"
             >
                <CloudIcon size={24} />
                <div className="text-right">
                   <p className="text-[10px] font-bold opacity-80">تحديث فوري</p>
                   <p className="text-xs font-black whitespace-nowrap">جاري الشراء الآن...</p>
                </div>
             </motion.div>

             <motion.div 
               animate={{ y: [0, 20, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -bottom-6 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-border flex items-center gap-3 z-20"
             >
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                   <CheckCircle2 size={16} />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400">تم الشطب</p>
                   <p className="text-xs font-bold">بسكويت دايجستف ✅</p>
                </div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="px-6 py-24 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-text-deep mb-4 tracking-tighter">لماذا الماشلة؟</h2>
            <p className="text-text-soft">صممناها لتكون أكثر من مجرد قائمة، بل وسيلة تواصل ذكية.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-secondary p-8 rounded-[2.5rem] border border-border group hover:bg-primary hover:border-primary transition-all duration-500">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <CloudIcon size={28} />
               </div>
               <h3 className="text-xl font-bold text-text-deep mb-3 group-hover:text-white transition-colors">مزامنة سحابية</h3>
               <p className="text-text-soft text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  شاركي الرابط مع زوجك وشاهدي الأصناف وهي تُشطب في نفس اللحظة وهو في السوبر ماركت.
               </p>
            </div>

            <div className="bg-secondary p-8 rounded-[2.5rem] border border-border group hover:bg-accent hover:border-accent transition-all duration-500">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-accent mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Heart size={28} />
               </div>
               <h3 className="text-xl font-bold text-text-deep mb-3 group-hover:text-white transition-colors">عاطفة وكلمات</h3>
               <p className="text-text-soft text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  أضيفي رسائل حب ومفاجآت للمقاضي لتجعلي مهمة الشراء ممتعة وغير مملة لمن يحبونك.
               </p>
            </div>

            <div className="bg-secondary p-8 rounded-[2.5rem] border border-border group hover:bg-black hover:border-black transition-all duration-500">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Share2 size={28} />
               </div>
               <h3 className="text-xl font-bold text-text-deep mb-3 group-hover:text-white transition-colors">تصدير أنيق</h3>
               <p className="text-text-soft text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  يمكنك تحويل القائمة إلى صورة مصممة احترافياً بضغطة زر لمشاركتها عبر الواتساب.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="px-6 py-24 lg:px-20 bg-[#fdf2f2]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
             <div className="space-y-12">
                {[
                  { title: "اختاري الأصناف", desc: "أضيفي المقاضي من الأقسام الجاهزة أو أضيفي أقسامك الخاصة.", icon: <ShoppingCart /> },
                  { title: "اكتبي رسالتك", desc: "حددي الميزانية وأضيفي ملاحظة من القلب ليشعر بوجودك معه.", icon: <Heart /> },
                  { title: "ارسل الرابط", desc: "شاركي الرابط السحابي لمتابعة فورية أو ارسليه كنص/صورة.", icon: <Smartphone /> }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm font-black text-xl">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-text-deep mb-2">{step.title}</h4>
                      <p className="text-text-soft text-sm max-w-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="lg:w-1/2 space-y-4">
             <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-border text-center">
                <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                   <Gift size={40} />
                </div>
                <h3 className="text-2xl font-bold text-text-deep mb-4">جاهزة للتجربة؟</h3>
                <p className="text-text-soft mb-8">الماشلة مجانية تماماً وبدون أي اشتراك. ابدأي الآن!</p>
                <Link 
                  to="/create"
                  className="block w-full bg-primary text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  صممي ماشلتك
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 lg:px-20 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <ShoppingCart size={16} />
            </div>
            <span className="text-xl font-black text-primary tracking-tighter">الماشلة</span>
          </div>
          <div className="text-text-soft text-sm">
            تم التطوير بحب لبيوتكم السعيدة ❤️
          </div>
          <div className="flex gap-6 text-sm font-bold text-text-deep">
            <Link to="/create" className="hover:text-primary">التطبيق</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
