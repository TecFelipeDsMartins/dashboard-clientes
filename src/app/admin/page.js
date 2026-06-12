"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Upload, CheckCircle, Copy, Loader2, Plus, FolderOpen, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ... (states mantidos)
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [postType, setPostType] = useState("static");
  const [copyText, setCopyText] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  }

  const deleteProject = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este projeto e todo o material dele?")) return;
    
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert("Erro ao deletar: " + error.message);
    } else {
      fetchProjects();
    }
  };

  // ... (handleSubmit mantido)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !clientName || !projectName) {
      alert("Preencha todos os campos e selecione os arquivos.");
      return;
    }

    setLoading(true);
    setStatus("Criando projeto...");

    try {
      const { data: project, error: pError } = await supabase
        .from("projects")
        .insert([{ 
          client_name: clientName, 
          project_name: projectName, 
          copy_text: copyText,
          post_type: postType 
        }])
        .select()
        .single();

      if (pError) throw pError;

      for (const file of files) {
        const filePath = `uploads/${uuidv4()}.${file.name.split(".").pop()}`;
        await supabase.storage.from("materials").upload(filePath, file);
        const { data: { publicUrl } } = supabase.storage.from("materials").getPublicUrl(filePath);

        await supabase.from("project_items").insert({
          project_id: project.id,
          media_url: publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
        });
      }

      setGeneratedLink(`${window.location.origin}/approve/${project.id}`);
      setStatus("Sucesso!");
      fetchProjects();
      setClientName(""); setProjectName(""); setCopyText(""); setFiles([]);
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>
      
      {/* Projetos Ativos */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FolderOpen/> Projetos Ativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
              <div>
                <p className="font-bold">{p.project_name}</p>
                <p className="text-sm text-gray-500">{p.client_name} • {p.post_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/approve/${p.id}`} className="text-blue-600 flex items-center gap-1 hover:underline">
                  Acessar <ExternalLink size={16}/>
                </Link>
                <button onClick={() => deleteProject(p.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ... (resto do formulário mantido) */}


      {/* Novo Projeto */}
      <section className="bg-white p-8 rounded-xl border">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Plus/> Novo Projeto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Cliente" className="border p-2 rounded" value={clientName} onChange={e=>setClientName(e.target.value)} required />
            <input placeholder="Projeto" className="border p-2 rounded" value={projectName} onChange={e=>setProjectName(e.target.value)} required />
          </div>
          <select className="w-full border p-2 rounded" value={postType} onChange={e=>setPostType(e.target.value)}>
            <option value="static">Imagem Estática</option>
            <option value="carousel">Carrossel</option>
            <option value="video">Vídeo</option>
          </select>
          <textarea placeholder="Legenda (Copy)" className="w-full border p-2 rounded" rows={3} value={copyText} onChange={e=>setCopyText(e.target.value)} />
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors text-center">
              Selecionar Arquivos
              <input type="file" multiple className="hidden" onChange={e=>setFiles(Array.from(e.target.files))} />
            </label>
            <p className="text-sm text-gray-500 text-center">
              {files.length > 0 ? `${files.length} arquivos selecionados` : "Nenhum arquivo selecionado"}
            </p>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded">{loading ? "Processando..." : "Criar"}</button>
        </form>
        {generatedLink && <div className="mt-4 p-3 bg-green-100 rounded">Link: {generatedLink}</div>}
      </section>
    </main>
  );
}
