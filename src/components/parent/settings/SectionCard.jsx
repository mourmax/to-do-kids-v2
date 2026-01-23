export default function SectionCard({ icon: Icon, colorClass, title, children }) {
    return (
      <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
        <div className={`flex items-center gap-2 ${colorClass} font-black uppercase text-[10px] tracking-widest`}>
          <Icon size={16} /> {title}
        </div>
        {children}
      </section>
    )
  }