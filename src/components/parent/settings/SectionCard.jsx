export default function SectionCard({ icon: Icon, colorClass, title, children, theme = {} }) {
  return (
    <section className={`bg-white p-4 sm:p-5 rounded-2xl border ${theme.border || 'border-violet-200'} shadow-sm space-y-4`}>
      <div className={`flex items-center gap-2 ${colorClass} font-black uppercase text-[10px] tracking-widest`}>
        {Icon && <Icon size={14} />}
        {title}
      </div>
      {children}
    </section>
  )
}
