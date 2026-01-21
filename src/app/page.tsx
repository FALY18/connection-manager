"use client"

import Link from "next/link"
import { Wifi, LogIn, ShoppingCart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">WiFi Connect</h1>
                <p className="text-sm text-white/80">Hotspot Public Management</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Connectez-vous à Internet</h2>
          <p className="text-xl text-white/80 mb-8">Choisissez votre plan et activez votre voucher</p>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
          <Link
            href="/activate"
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-400/30 transition-all"
          >
            <LogIn className="w-6 h-6" />
            J'ai déjà un code
          </Link>
          <Link
            href="/buy"
            className="flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-pink-400 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-400/30 transition-all"
          >
            <ShoppingCart className="w-6 h-6" />
            Acheter un forfait
          </Link>
        </div>

        {/* Quick Info */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-white font-semibold mb-4 text-lg">Comment ça marche?</h3>
            <ol className="space-y-4 text-slate-300">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-semibold">
                  1
                </span>
                <span>Achetez ou utilisez votre code de voucher</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-semibold">
                  2
                </span>
                <span>Cliquez sur "J'ai déjà un code" et entrez votre code</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-semibold">
                  3
                </span>
                <span>Vous êtes connecté! La durée s'écoule automatiquement</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
