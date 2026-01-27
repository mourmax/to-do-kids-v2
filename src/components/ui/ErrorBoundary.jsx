import React from 'react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-center">
                    <div className="max-w-md space-y-4">
                        <h1 className="text-2xl font-black text-white uppercase italic">Oups ! Une erreur est survenue</h1>
                        <p className="text-slate-400 text-sm font-mono bg-slate-900 p-4 rounded-xl border border-white/5 overflow-auto max-h-40">
                            {this.state.error?.toString()}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Recharger l'application
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
