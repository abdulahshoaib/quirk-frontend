"use client"

import { useEffect, useState } from "react";

import { RxLightningBolt } from "react-icons/rx"
import { FaSearchengin } from "react-icons/fa";
import { TbFileTextSpark } from "react-icons/tb";
import { AiOutlineDatabase } from "react-icons/ai";
import { IoIosCog } from "react-icons/io";
import { ImEmbed } from "react-icons/im";
import { LuDatabaseZap } from "react-icons/lu";
import { TiInfoLargeOutline } from "react-icons/ti";
import { IoSearch } from "react-icons/io5";
import { Upload, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChromaLogo } from "@/components/chroma-logo";
import { toast } from "sonner";

interface ChromaConfig {
  host: string | "";
  port: string | "";
  tenant: string | "";
  database: string | "";
  collectionID: string | "";
};

interface QueryResp {
  distances: number[][];
  documents: string[][];
}

export default function Home() {
  // auth
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const [chromaConfig, setChromaConfig] = useState<ChromaConfig | null>(null);
  const [objectID, setObjectID] = useState("");
  // options
  const [selected, setSelected] = useState<"upload" | "embed" | "store" | "search">("upload")

  // Upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Embed
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);

  // Store
  const [operation, setOperation] = useState<"add" | "update">("add");
  const [exportingToChroma, setExportingToChroma] = useState(false);

  // Search
  const [queryResp, setQueryResp] = useState<QueryResp | null>(null)
  const [query, setQuery] = useState("");
  const [waitRes, setWaitRes] = useState(false);

  const isChromaConfigured =
    chromaConfig &&
    Object.values(chromaConfig).every((v) => v && v.trim() !== "");


  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    toast.success(`${files.length} file(s) added`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearConfig = () => {
    setChromaConfig((prev) => ({ ...prev!, host: "", port: "", collectionID: "", tenant: "", database: "" }));
  }

  const handleProcess = () => {
    openEmbed();
  };

  const postFiles = async () => {
    try {
      setGeneratingEmbeddings(true);
      const formData = new FormData;
      selectedFiles.forEach(file => {
        formData.append("files", file);
      });
      const resp = await fetch("http://localhost:8080/process", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
        mode: "cors"
      });
      const { object_id } = await resp.json();
      if (resp.ok) {
        setObjectID(object_id);
        toast.success("Files Uploaded");
      }
    } catch (error) {
      console.error("Error Uploading to API", error);
      toast.error("Error Uploading to API");
      setGeneratingEmbeddings(false);
    }
  };

  useEffect(() => {
    if (!objectID) return;

    const timer = setTimeout(() => {
      checkStatus();
    }, 5000)

    return () => clearTimeout(timer);
  }, [objectID]);

  const openEmbed = () => {
    setSelected("embed");
  };

  const maxRetries = 4;
  let retryCount = 0;
  const checkStatus = async () => {
    if (!objectID) return;
    else if (retryCount >= maxRetries) {
      toast.error("Server timeout, took too long to respond");
    }
    try {
      const resp = await fetch(`http://localhost:8080/status?object_id=${objectID}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const { status } = await resp.json();
      if (status === "completed") {
        setHasEmbeddings(true);
      } else if (status === "processing") {
        setTimeout(checkStatus, 3000);
      }
    } catch (error) {
      console.error("Failed to embed data: ", error);
      toast.error("Failed to embed data");
    } finally {
      setGeneratingEmbeddings(false);
      toast.success("Embeddings Generated");
    }
  }

  const searchDB = async () => {
    setWaitRes(true);
    const payload = {
      req: {
        host: chromaConfig?.host,
        port: Number(chromaConfig?.port),
        tenant: chromaConfig?.tenant,
        database: chromaConfig?.database,
        collection_id: chromaConfig?.collectionID
      },
      text: [query]
    }
    try {
      const resp = await fetch("http://localhost:8080/query", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const searchObj: QueryResp = await resp.json();
      if (resp.ok) {
        toast.success("Distance recived");
        setQueryResp(searchObj);
      }
    } catch (error) {
      console.error("Error fetching from DB", error);
      toast.error("Error fetching from DB");
    } finally {
      setWaitRes(false);
    }
  };

  const openUpload = () => {
    setSelected("upload");
  };

  const openSearch = () => {
    setSelected("search");
  };

  const openStore = () => {
    setSelected("store");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) added`);
  };

  const handleExport = async () => {
    const toastID = toast.loading(`Downloading embeddings as ${format}...`);
    try {
      const resp = await fetch(`http://localhost:8080/export?object_id=${objectID}&format=${format}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);

        // Try to extract filename from header, fallback if not set
        const contentDisposition = resp.headers.get("Content-Disposition");
        let filename = "exported_file";

        if (contentDisposition && contentDisposition.includes("filename=")) {
          const match = contentDisposition.match(/filename="?(.+?)"?$/);
          if (match) {
            filename = match[1];
          }
        }

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        toast.success("Download complete");
      }
    } catch (error) {
      console.error("Error downloading embeddings: ", error);
      toast.error("Error downloading embeddings");
    } finally {
      toast.dismiss(toastID);
    }
  };

  const handleExportChroma = async () => {
    const payload = {
      req: {
        Host: chromaConfig?.host,
        Port: Number(chromaConfig?.port),
        Tenant: chromaConfig?.tenant,
        Database: chromaConfig?.database,
        Collection_id: chromaConfig?.collectionID
      },
      payload: {}
    }
    setExportingToChroma(true);
    try {
      const resp = await fetch(
        `http://localhost:8080/export-chroma?operation=${operation}&object_id=${objectID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        }
      );
      if (resp.ok) {
        toast.success(`Files ${operation} to chroma`)
      }
    } catch (error) {
      console.error("Failed to export to chroma: ", error);
      toast.error("Failed to export to chroma");
    } finally {
      setExportingToChroma(false);
    }
  }

  const handleAuth = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        body: JSON.stringify({ email: email }),
      });

      const data = await resp.json();
      if (data.token) setToken(data.token);
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-start ml-30">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="glass"
              className="group bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-600/25 hover:to-yellow-600/25 border-amber-400/30 hover:border-amber-400/50 text-amber-100 hover:text-amber-50 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 backdrop-blur-sm rounded"
              size="sm"
            >
              <RxLightningBolt className="text-yellow-400" />
              quirk Auth
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-72 bg-black/30 backdrop-blur-xl border border-amber-400/30 shadow-2xl shadow-amber-500/10 px-4 py-3 rounded">
            <div className="space-y-4">
              <div className="border-b border-amber-400/20 pb-3">
                <label className="block mb-1 text-amber-300">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-1 rounded bg-black/40 border border-amber-500/30 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="enter email"
                />
              </div>

              <Button
                onClick={handleAuth}
                className="w-full py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 hover:text-white transition"
                disabled={loading}
                size="sm"
              >
                {loading ? 'Requesting...' : 'Get Token'}
              </Button>

              <div>
                <label className="block mb-1 text-amber-300">Token</label>
                <Input
                  type="text"
                  value={token}
                  disabled
                  className="w-full px-3 py-1 rounded bg-black/20 border border-amber-500/20 text-amber-300 disabled:text-yellow-400"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex justify-end mr-52">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="glass"
              className="group bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-600/25 hover:to-yellow-600/25 border-amber-400/30 hover:border-amber-400/50 text-amber-100 hover:text-amber-50 transition-all duration-300 shadow-lg hover:shadow-amber-500/20 backdrop-blur-sm rounded"
              size="sm"
            >
              <ChromaLogo />
              ChromaDB
              <IoIosCog className="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-black/30 backdrop-blur-xl border border-amber-400/30 shadow-2xl shadow-amber-500/10 px-4 py-3 rounded">
            <div className="space-y-4">
              <div className="border-b border-amber-400/20 pb-3">
                <h4 className="text-base font-semibold text-amber-100 flex items-center gap-2">
                  <LuDatabaseZap className="w-4 h-4 text-amber-400" />
                  ChromaDB Config
                </h4>
                <p className="text-xs text-amber-200/70 mt-1">Setup your vector DB</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="host" className="text-amber-100 text-sm font-medium">Host</Label>
                  <Input
                    type="text"
                    id="host"
                    placeholder="localhost"
                    value={chromaConfig?.host}
                    onChange={(e) => setChromaConfig((prev) => ({ ...prev!, host: e.target.value }))}
                    className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="port" className="text-amber-100 text-sm font-medium">Port</Label>
                    <Input
                      type="text"
                      id="port"
                      placeholder="8000"
                      value={chromaConfig?.port}
                      onChange={(e) => setChromaConfig((prev) => ({ ...prev!, port: e.target.value }))}
                      className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="tenant" className="text-amber-100 text-sm font-medium">Tenant</Label>
                    <Input
                      type="text"
                      id="tenant"
                      placeholder="default"
                      value={chromaConfig?.tenant}
                      onChange={(e) => setChromaConfig((prev) => ({ ...prev!, tenant: e.target.value }))}
                      className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="database" className="text-amber-100 text-sm font-medium">Database</Label>
                  <Input
                    type="text"
                    id="database"
                    placeholder="default_db"
                    value={chromaConfig?.database}
                    onChange={(e) => setChromaConfig((prev) => ({ ...prev!, database: e.target.value }))}
                    className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="collection_id" className="text-amber-100 text-sm font-medium">Collection ID</Label>
                  <Input
                    type="text"
                    id="collection_id"
                    placeholder="550e84...0000"
                    value={chromaConfig?.collectionID}
                    onChange={(e) => setChromaConfig((prev) => ({ ...prev!, collectionID: e.target.value }))}
                    className="bg-black/20 text-sm font-mono px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                  />
                </div>
              </div>

              <div className="pt-1 pb-3 flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  className="px-3 py-1"
                  onClick={handleClearConfig}
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div >
      <div className="flex justify-center" >
        <h1 className="scroll-m-20 pb-2 text-white text-4xl font-semibold tracking-tight">quirk</h1>
        <RxLightningBolt size={24} className="text-yellow-400" />
      </div>

      <div className="max-w-2xl mx-auto pt-2 text-center space-y-6">
        <p className="text-white/90 text-lg font-medium">
          transform data into vector embeddings
        </p>

        <div className="flex justify-center items-center gap-6 text-yellow-300">
          <div className="flex items-center justify-center gap-4">
            <div
              onClick={openUpload}
              className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 ${selected === "upload" ? "bg-amber-500/70" : "hover:bg-white/10"}`}
            >
              <TbFileTextSpark size={18} className={selected === "upload" ? "text-amber-300" : "text-yellow-300"} />
              <span className={`text-sm capitalize ${selected === "upload" ? "text-amber-100" : "text-white/80"}`}>
                upload
              </span>
            </div>

            <div
              onClick={openEmbed}
              className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 ${selected === "embed" ? "bg-amber-500/70" : "hover:bg-white/10"}`}
            >
              <ImEmbed size={18} className={selected === "embed" ? "text-amber-300" : "text-yellow-300"} />
              <span className={`text-sm capitalize ${selected === "embed" ? "text-amber-100" : "text-white/80"}`}>
                embed
              </span>
            </div>

            <div
              onClick={openStore}
              className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 ${selected === "store" ? "bg-amber-500/70" : "hover:bg-white/10"}`}
            >
              <AiOutlineDatabase size={18} className={selected === "store" ? "text-amber-300" : "text-yellow-300"} />
              <span className={`text-sm capitalize ${selected === "store" ? "text-amber-100" : "text-white/80"}`}>
                store
              </span>
            </div>

            <div
              onClick={openSearch}
              className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 ${selected === "search" ? "bg-amber-500/70" : "hover:bg-white/10"}`}
            >
              <FaSearchengin size={18} className={selected === "search" ? "text-amber-300" : "text-yellow-300"} />
              <span className={`text-sm capitalize ${selected === "search" ? "text-amber-100" : "text-white/80"}`}>
                search
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 flex justify-center">
        {/* Component that takes in multiple files */}
        {selected == "upload" && (
          <div className="w-full max-w-4xl space-y-6">
            {selectedFiles.length === 0 ? (
              <div
                className={`relative w-full px-8 py-12 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl border-2 border-dashed transition-all duration-300 shadow-2xl shadow-amber-500/5 ${dragActive
                  ? 'border-amber-400/60 bg-amber-500/10'
                  : 'border-amber-400/30 hover:border-amber-400/50'
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="p-6 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full shadow-lg">
                    <Upload className="w-12 h-12 text-amber-300" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-amber-100">
                      Drop your files here
                    </h3>
                    <p className="text-amber-200/70 text-sm">
                      or click to browse and select files
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/30">
                        Choose Files
                      </div>
                    </Label>

                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <p className="text-amber-200/50 text-xs">
                    Supports: PDF, TXT, DOC, CSV, JSON
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-amber-400/20 shadow-lg shadow-amber-500/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-amber-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                      className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/10"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-amber-400/20 hover:border-amber-400/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-amber-100 text-sm font-medium truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-amber-200/60 text-xs">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-amber-200 hover:text-red-400 hover:bg-red-500/10 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-amber-400/20">
                  <Button
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/30"
                    onClick={handleProcess}
                  >
                    Process {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backend Call to create API and then either download those || export to chroma */}
        {selected == "embed" && (
          <div className="w-full max-w-4xl space-y-1">
            {/* Embeddings Status */}
            <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 shadow-2xl shadow-amber-500/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full">
                    <ImEmbed className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-100">Vector Embeddings</h3>
                    <p className="text-amber-200/70 text-sm">Transform your data into vector representations</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedFiles.length > 0 ? "bg-green-400" : "animate-pulse bg-amber-400"}`} />
                  <span className={`text-sm font-medium ${selectedFiles.length > 0 ? "text-green-300" : "text-amber-300"}`} >
                    {selectedFiles.length > 0 ? "Ready" : "Waiting for files"}
                  </span>
                </div>
              </div>

              {/* Processing Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    disabled={selectedFiles.length === 0 || generatingEmbeddings}
                    className="w-56 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 disabled:from-amber-700 disabled:to-amber-800 disabled:text-gray-400 transition-all duration-300 shadow-lg hover:shadow-amber-500/30"
                    onClick={postFiles}
                  >
                    {!generatingEmbeddings ? "Generate Embeddings" : "Generating..."}
                  </Button>

                  <div className="text-amber-200/60 text-sm">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </div>
            </div>

            {/* Export Section - Only shown when embeddings are ready */}
            {selectedFiles.length > 0 && (
              <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-amber-400/20 shadow-lg shadow-amber-500/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
                      <Upload className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-amber-100">Export Embeddings</h4>
                      <p className="text-amber-200/70 text-sm">Download your vector embeddings</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${hasEmbeddings && !generatingEmbeddings ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`}
                    ></div>
                    <span className={`text-sm font-medium ${hasEmbeddings && !generatingEmbeddings ? "text-green-400" : "text-yellow-400"}`}>
                      {hasEmbeddings && !generatingEmbeddings ? "Ready" : "Waiting for Embeddings"}
                    </span>
                  </div>

                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="format-select" className="text-amber-200 text-sm font-medium">
                      Format:
                    </Label>
                    <select
                      id="format-select"
                      className="bg-black/20 cursor-pointer border border-amber-400/30 rounded-lg px-3 py-2 text-amber-100 text-sm focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                      value={format}
                      onChange={(e) => setFormat(e.target.value as "json" | "csv")}
                    >
                      <option value="json" className="bg-black text-amber-100 cursor-pointer">JSON</option>
                      <option value="csv" className="bg-black text-amber-100 cursor-pointer">CSV</option>
                    </select>
                  </div>

                  <Button
                    disabled={!hasEmbeddings || !objectID || generatingEmbeddings}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-green-500/30"
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </div>

                {/* Export Options */}
                <div className="mt-4 pt-4 border-t border-amber-400/20">
                  <div className="text-amber-200/60 text-sm space-y-1">
                    <p>• JSON: Structured format with metadata and vector arrays</p>
                    <p>• CSV: Tabular format suitable for analysis and ML workflows</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* embeddings need to be available for option to show that it is ready for import to chroma */}
        {selected == "store" && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Store to Database Header */}
            <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 shadow-2xl shadow-amber-500/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full">
                    <AiOutlineDatabase className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-100">Store to Database</h3>
                    <p className="text-amber-200/70 text-sm">Save your embeddings to ChromaDB</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full  ${!isChromaConfigured ? "bg-red-400 animate-caret-blink transition-opacity duration-700" : hasEmbeddings ? "bg-green-400" : "bg-amber-400 animate-pulse"}`}
                    />
                    <span
                      className={`text-sm font-medium ${!isChromaConfigured ? "text-red-400" : hasEmbeddings ? "text-green-300" : "text-amber-300"}`}
                    >
                      {!isChromaConfigured ? "Configure Chroma" : hasEmbeddings ? "Embeddings Found" : "No embeddings available"}
                    </span>
                  </div>

                </div>
              </div>

              {/* Database Configuration Display */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <h4 className="text-amber-100 font-medium mb-3 flex items-center gap-2">
                  <LuDatabaseZap className="w-4 h-4 text-amber-400" />
                  Current Configuration
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-200/60">Host:</span>
                    <span className="text-amber-100 ml-2">{chromaConfig?.host || 'not set'}</span>
                  </div>
                  <div>
                    <span className="text-amber-200/60">Port:</span>
                    <span className="text-amber-100 ml-2">{chromaConfig?.port || 'not set'}</span>
                  </div>
                  <div>
                    <span className="text-amber-200/60">Tenant:</span>
                    <span className="text-amber-100 ml-2">{chromaConfig?.tenant || 'not set'}</span>
                  </div>
                  <div>
                    <span className="text-amber-200/60">Database:</span>
                    <span className="text-amber-100 ml-2">{chromaConfig?.database || 'not set'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-200/60">Collection ID:</span>
                    <span className="text-amber-100 ml-2 font-mono text-xs">{chromaConfig?.collectionID || 'Not specified'} </span>
                  </div>
                </div>
              </div>

              {/* Store Action */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      disabled={!hasEmbeddings || !isChromaConfigured || exportingToChroma}
                      className="w-52 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 disabled:from-amber-700 disabled:to-amber-800 disabled:text-gray-400 transition-all duration-300 shadow-lg hover:shadow-amber-500/30"
                      onClick={handleExportChroma}
                    >
                      {exportingToChroma ? "Storing..." : "Store to Chroma"}
                    </Button>
                    <div className="flex justify-center gap-1 ml-20">
                      <Button
                        onClick={() => setOperation("add")}
                        size="sm"
                        variant={operation === "add" ? "secondary" : "glass"}
                        disabled={!hasEmbeddings || !isChromaConfigured || exportingToChroma}
                        className="w-30 px-6 py-3"
                      >
                        Add
                      </Button>

                      <Button
                        onClick={() => setOperation("update")}
                        size="sm"
                        disabled={!hasEmbeddings || !isChromaConfigured || exportingToChroma}
                        variant={operation === "update" ? "secondary" : "glass"}
                        className="w-30 px-6 py-3"
                      >
                        Update
                      </Button>
                    </div>

                    {hasEmbeddings && isChromaConfigured && (
                      <div className="text-amber-300 text-sm flex items-center gap-1">
                        <div className="w-2 h-2 bg-amber-400/60 rounded-full animate-pulse"></div>
                        Ready to {operation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Progress */}
            {hasEmbeddings && (
              <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-amber-400/20 shadow-lg shadow-amber-500/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-amber-100 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-400" />
                    Storage Details
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-200/70">Embeddings count:</span>
                    <span className="text-amber-100">{selectedFiles.length} documents</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-200/70">Vector dimensions:</span>
                    <span className="text-amber-100">1024</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-200/70">Storage format:</span>
                    <span className="text-amber-100">ChromaDB collection</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-400/20">
                  <div className="text-amber-200/60 text-sm space-y-1">
                    <p>• Embeddings will be stored with metadata and document references</p>
                    <p>• Collection will be created if it doesn't exist</p>
                    <p>• Duplicate documents will be updated automatically</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* query the data from the backend and show the distances between the query sentence embeddings and the documents embeddings */}
        {selected == "search" && (
          <div className="w-full max-w-4xl space-y-6">
            {/* Search in Database Header */}
            <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl rounded-2xl border border-amber-400/30 shadow-2xl shadow-amber-500/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full">
                    <FaSearchengin className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-100">Search in Database</h3>
                    <p className="text-amber-200/70 text-sm">Query stored embeddings from ChromaDB</p>
                  </div>
                </div>

                {/* DB Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${!chromaConfig ? "bg-green-400" : "bg-green-400 animate-pulse"}`} />
                  <span className={`text-sm font-medium ${!chromaConfig ? "text-green-300" : "text-green-300"}`}>
                    {!chromaConfig ? "Database not Configured" : "Enter Something to search"}
                  </span>
                </div>
              </div>

              {/* Query Input */}
              <div className="space-y-4">
                <label htmlFor="query" className="block text-sm font-medium text-amber-200/70">
                  Write a sentence to query
                </label>
                <Input
                  id="query"
                  type="text"
                  placeholder="e.g., How does quantum computing work?"
                  className="w-full bg-black/30 border border-amber-400/20 text-amber-100 placeholder:text-amber-400/40"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                  onClick={searchDB}
                  disabled={!query.trim() || waitRes || !chromaConfig}
                  aria-disabled={!query.trim() || waitRes || !chromaConfig}
                  className="w-full font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600 hover:shadow-amber-500/30 disabled:from-amber-700 disabled:to-amber-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {waitRes ? (
                    <span className="text-black">
                      Hang on this might take a second
                    </span>
                  ) : (
                    "Search Database"
                  )}
                </Button>
              </div>
            </div>

            {/* Query Results */}
            {queryResp?.distances && queryResp.distances[0]?.length > 0 && (
              <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-amber-400/20 shadow-lg shadow-amber-500/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-amber-100 flex items-center gap-2">
                        <IoSearch className="w-5 h-5 text-amber-400" />
                        Vector Similarity Results
                      </h4>
                      <div className="flex items-center gap-2 mt-3">
                        <TiInfoLargeOutline size={20} className="text-amber-400" />
                        <p className="text-xs text-amber-200/70">
                          Semantic matches ranked by similarity
                        </p>
                        <div className="w-1 h-1 bg-amber-400/50 rounded-full"></div>
                        <p className="text-xs text-amber-200/50">
                          Distance: 0.0 = perfect match, +1.0 = low similarity
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {queryResp.distances[0]?.map((distance, idx) => (
                    <div key={idx} className="p-4 bg-black/20 rounded-lg border border-amber-400/20 mb-3">
                      <p className="text-amber-100 font-mono truncate">
                        <span className="text-amber-400">{idx + 1}. </span>
                        {
                          queryResp.documents[0]?.[idx]
                            ? queryResp.documents[0][idx].replace(/\n/g, " ")
                            : "Document not found"
                        }
                      </p>
                      <h3 className="text-amber-200/70 mt-2">
                        Distance: {distance.toFixed(4)}
                      </h3>
                    </div>

                  ))}

                </div>
              </div>
            )}
          </div>
        )}

      </div >
    </>
  );
};
