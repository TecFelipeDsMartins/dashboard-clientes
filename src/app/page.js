import Link from "next/link";
import { CheckCircle, Zap, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="px-6 py-24 md:py-32 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Zap className="w-4 h-4" />
          Aprovações 10x mais rápidas
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Aprove seus materiais de <span className="text-blue-600">Marketing</span> sem estresse.
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Chega de feedbacks perdidos no WhatsApp. Centralize carrosséis, vídeos e copies em um só lugar.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            Criar Nova Aprovação
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Feedback Direto</h3>
            <p className="text-gray-600">Seu cliente comenta exatamente na foto ou vídeo que precisa de ajuste.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Link Único</h3>
            <p className="text-gray-600">Envie apenas um link e o cliente visualiza todo o conteúdo da semana.</p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-4">Histórico Real</h3>
            <p className="text-gray-600">Tudo fica registrado no banco de dados. Sem "disse-me-disse".</p>
          </div>
        </div>
      </section>
    </div>
  );
}
