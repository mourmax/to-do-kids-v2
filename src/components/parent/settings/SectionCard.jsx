export default function SectionCard({ icon: Icon, colorClass, title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
      <div className={`flex items-center gap-2 ${colorClass} font-bold text-[10px] uppercase tracking-widest`}>
        <Icon size={16} /> {title}
      </div>
      {children}
    </section>
  )
}
