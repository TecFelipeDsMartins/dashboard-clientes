"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, MessageSquare } from "lucide-react";

export default function ClientPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    async function fetchData() {
      const { data: projectData, error: pError } = await supabase
        .from("projects")
        .select(`*, project_items (*)`)
        .eq("id", id)
        .single();

      if (pError) {
        console.error(pError);
      } else {
        setProject(projectData);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const updateStatus = async (itemId, status) => {
    const { error } = await supabase
      .from("project_items")
      .update({ status, feedback: feedback[itemId] || "" })
      .eq("id", itemId);

    if (error) {
      alert("Erro ao atualizar status");
    } else {
      // Atualizar localmente
      const newItems = project.project_items.map((it) =>
        it.id === itemId ? { ...it, status, feedback: feedback[itemId] } : it
      );
      setProject({ ...project, project_items: newItems });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Carregando material...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold mt-4">Link inválido ou expirado</h1>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 pb-20">
      <header className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
        <p className="text-gray-600 mt-2">Olá, {project.client_name}! Revise o material abaixo.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Legenda / Copy do Projeto
        </h3>
        <p className="text-gray-800 bg-gray-50 p-4 rounded-xl border-l-4 border-blue-500 whitespace-pre-wrap leading-relaxed">
          {project.copy_text || "Sem legenda informada para este projeto."}
        </p>
      </div>

      <div className="space-y-12">
        {project.project_items.map((item, index) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center px-6">
              <span className="text-sm font-bold text-gray-400">ITEM #{index + 1}</span>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                item.status === 'adjustment' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {item.status === 'pending' ? 'Pendente' : item.status === 'approved' ? 'Aprovado' : 'Ajuste solicitado'}
              </span>
            </div>

            <div className="flex flex-col">
              {item.media_type === "video" ? (
                <video controls src={item.media_url} className="w-full max-h-[600px] bg-black" />
              ) : (
                <img src={item.media_url} alt="Material" className="w-full max-h-[700px] object-contain bg-white" />
              )}
            </div>

            <div className="p-8">
              {item.status !== "approved" && (
                <div className="space-y-4">
                  <textarea
                    placeholder="Se precisar de ajustes neste item, descreva aqui..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    value={feedback[item.id] || ""}
                    onChange={(e) => setFeedback({ ...feedback, [item.id]: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(item.id, "adjustment")}
                      className="flex-1 py-3 px-4 border-2 border-amber-500 text-amber-600 font-bold rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      Solicitar Ajuste
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "approved")}
                      className="flex-1 py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md shadow-green-100 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aprovar Item
                    </button>
                  </div>
                </div>
              )}

              {item.status === "approved" && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 py-4 rounded-xl border border-green-100">
                  <CheckCircle className="w-6 h-6" />
                  Item aprovado com sucesso!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
