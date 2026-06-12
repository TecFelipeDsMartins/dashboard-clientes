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
  const [copyText, setCopyText] = useState("");
  const [isCopyModified, setIsCopyModified] = useState(false);
  const [originalCopy, setOriginalCopy] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: projectData, error: pError } = await supabase
        .from("projects")
        .select(`*, project_items (*, order:created_at)`) // order:created_at is used for sorting
        .eq("id", id)
        .single();

      if (pError) {
        console.error(pError);
      } else {
        // Ordenar itens explicitamente por data de criação
        const sortedItems = projectData.project_items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setProject({ ...projectData, project_items: sortedItems });
        setCopyText(projectData.copy_text || "");
        setOriginalCopy(projectData.copy_text || "");
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleCopyChange = (e) => {
    setCopyText(e.target.value);
    setIsCopyModified(e.target.value !== originalCopy);
  };

  const updateStatus = async (itemId, status) => {
    const { error } = await supabase
      .from("project_items")
      .update({ status, feedback: feedback[itemId] || "" })
      .eq("id", itemId);

    if (error) {
      alert("Erro ao atualizar status");
    } else {
      const newItems = project.project_items.map((it) =>
        it.id === itemId ? { ...it, status, feedback: feedback[itemId] || it.feedback } : it
      );
      setProject({ ...project, project_items: newItems });
    }
  };

  // ... (rest of the component)


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

      <div className={`bg-white p-8 rounded-2xl shadow-sm border-2 mb-12 transition-colors ${isCopyModified ? 'border-amber-400' : 'border-gray-100'}`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Legenda / Copy do Projeto {isCopyModified && <span className="text-amber-600">(Alterado)</span>}
          </h3>
          {isCopyModified && (
            <button
              onClick={async () => {
                await supabase.from("projects").update({ copy_text: copyText }).eq("id", id);
                setOriginalCopy(copyText);
                setIsCopyModified(false);
                alert("Legenda atualizada!");
              }}
              className="text-sm bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600"
            >
              Salvar Nova Legenda
            </button>
          )}
        </div>
        <textarea
          className={`w-full p-4 rounded-xl border-l-4 whitespace-pre-wrap leading-relaxed outline-none transition-colors ${isCopyModified ? 'text-blue-600 bg-blue-50 border-blue-400' : 'text-gray-800 bg-gray-50 border-blue-500'}`}
          rows={6}
          value={copyText}
          onChange={handleCopyChange}
        />
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
              {item.status === "adjustment" && item.feedback && (
                <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                  <p className="text-sm font-bold text-amber-800 mb-1">Ajuste solicitado anteriormente:</p>
                  <p className="text-sm text-amber-900">{item.feedback}</p>
                </div>
              )}

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
