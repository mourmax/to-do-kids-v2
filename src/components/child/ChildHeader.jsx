import { Trophy } from 'lucide-react'

export default function ChildHeader() {
  return (
    <header className="flex justify-between items-center px-2 py-4">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
          <Trophy className="text-white" size={24} />
        </div>
        <span className="text-white font-black uppercase italic tracking-tighter text-xl text-shadow-sm">
          TO DO <span className="text-indigo-500">KIDS</span>
        </span>
      </div>
      {/* Bouton LogOut supprimé ici */}
    </header>
  )
}