"use client"

import { Wifi } from "lucide-react"
import ActivateForm from "./components/ActivateForm"

export default function ActivateConnect() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 flex justify-center p-6">
			<div className="w-full max-w-xl">
				<div className="text-center mb-10">
					<div className="flex justify-center mb-4">
						<div className="bg-cyan-400/20 p-4 rounded-full">
							<Wifi className="text-cyan-400 w-8 h-8" />
						</div>
					</div>
					<h1 className="text-3xl font-bold text-white">Activation Voucher</h1>
					<p className="text-purple-200">Accès Internet sécurisé</p>
				</div>

				<div className="bg-slate-900/80 border border-slate-700 rounded-xl p-8 shadow-xl">
					<ActivateForm />
				</div>
			</div>
		</div>
	)
}
