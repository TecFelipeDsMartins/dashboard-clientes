"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Upload, CheckCircle, Copy, Loader2, Plus } from "lucide-react";

export default function AdminPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("new");
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [copyText, setCopyText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase.from("projects").select("id, client_name, project_name");
      if (data) setProjects(data);
    }
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Selecione os arquivos.");
      return;
    }

    setLoading(true);
    setStatus("Fazendo upload das mídias...");

    try {
      let projectId = selectedProjectId;

      // 1. Criar novo projeto se necessário
      if (projectId === "new") {
        if (!clientName || !projectName) {
          alert("Preencha nome do cliente e projeto.");
          setLoading(false);
          return;
        }
        const { data: project, error: pError } = await supabase
          .from("projects")
          .insert([{ client_name: clientName, project_name: projectName, copy_text: copyText }])
          .select()
          .single();
        if (pError) throw pError;
        projectId = project.id;
      }

      const items = [];

      // 2. Upload de cada arquivo
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uError } = await supabase.storage
          .from("materials")
          .upload(filePath, file);

        if (uError) throw uError;

        const { data: { publicUrl } } = supabase.storage
          .from("materials")
          .getPublicUrl(filePath);

        items.push({
          project_id: projectId,
          media_url: publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
          copy_text: copyText, // Aplicando a copy nos itens para o cliente visualizar
        });
      }

      // 3. Salvar itens
      const { error: iError } = await supabase.from("project_items").insert(items);
      if (iError) throw iError;

      const link = `${window.location.origin}/approve/${projectId}`;
      setGeneratedLink(link);
      setStatus("Sucesso!");
      
      setClientName("");
      setProjectName("");
      setCopyText("");
      setFiles([]);
    } catch (error) {
      console.error(error);
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Suba o material para o seu cliente aprovar</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="new">+ Criar Novo Projeto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.client_name} - {p.project_name}</option>
              ))}
            </select>
          </div>

          {selectedProjectId === "new" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Nome do Cliente"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nome do Projeto"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Copy / Legenda</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arquivos (Carrossel/Vídeos)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {files.length > 0 ? `${files.length} arquivos selecionados` : "Clique para selecionar arquivos"}
                  </p>
                </div>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {status}
              </>
            ) : (
              "Gerar Link de Aprovação"
            )}
          </button>
        </form>

        {generatedLink && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <CheckCircle className="w-5 h-5" />
              Link gerado com sucesso!
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={generatedLink}
                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm text-gray-600"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  alert("Link copiado!");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
