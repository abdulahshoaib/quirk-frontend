"use client"

import { useState } from "react";
import { RxLightningBolt } from "react-icons/rx"
import { FaSearchengin } from "react-icons/fa";
import { TbFileTextSpark } from "react-icons/tb";
import { AiOutlineDatabase } from "react-icons/ai";
import { ImEmbed } from "react-icons/im";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LuDatabaseZap } from "react-icons/lu";
import { IoIosCog } from "react-icons/io";
import { ChromaLogo } from "@/components/chroma-logo";
import { toast } from "sonner";

export default function Home() {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [tenant, setTenant] = useState("");
  const [database, setDatabase] = useState("");
  const [collectionID, setCollectionID] = useState("");

  const [upload, setUpload] = useState(true);
  const [embed, setEmbed] = useState(false);
  const [store, setStore] = useState(false);
  const [search, setSearch] = useState(false);

  const handleTestConnection = async () => {
    try {
      const resp = await fetch(`http://${host}:${port}/api/v2/healthcheck`);
      if (resp.status === 200)
        console.log(resp);
      toast.success("Database Connected");
    } catch (error) {
      console.error(error);
      toast.error("Database healthcheck failed");
    }
  }

  const openEmbed = () => {
    toast.info("Selected Embed")
    setEmbed(true);
  }

  const openUpload = () => {
    toast.info("Selected Upload")
    setUpload(true);
  }

  const openSearch = () => {
    toast.info("Selected Search")
    setSearch(true);
  }

  const openStore = () => {
    toast.info("Selected Store")
    setStore(true);
  }

  return (
    <>
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
                    id="host"
                    placeholder="localhost"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="port" className="text-amber-100 text-sm font-medium">Port</Label>
                    <Input
                      id="port"
                      placeholder="8000"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="tenant" className="text-amber-100 text-sm font-medium">Tenant</Label>
                    <Input
                      id="tenant"
                      placeholder="default"
                      value={tenant}
                      onChange={(e) => setTenant(e.target.value)}
                      className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="database" className="text-amber-100 text-sm font-medium">Database</Label>
                  <Input
                    id="database"
                    placeholder="default_db"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    className="bg-black/20 text-sm px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="collection_id" className="text-amber-100 text-sm font-medium">Collection ID</Label>
                  <Input
                    id="collection_id"
                    placeholder="550e84...0000"
                    value={collectionID}
                    onChange={(e) => setCollectionID(e.target.value)}
                    className="bg-black/20 text-sm font-mono px-2 py-1 border-amber-400/30 text-amber-50 placeholder:text-amber-200/50 focus:border-amber-400/60 focus:ring-amber-400/20 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  variant="glass"
                  size="sm"
                  className="text-xs px-3 py-1 bg-amber-500 text-black font-semibold hover:bg-amber-300/80 transition-all rounded duration-300"
                  onClick={handleTestConnection}
                >
                  Test Connection
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
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={openUpload}
          >
            <TbFileTextSpark size={18} />
            <span className="text-sm text-white/80">upload</span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={openEmbed}
          >
            <ImEmbed size={18} />
            <span className="text-sm text-white/80">embed</span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={openStore}
          >
            <AiOutlineDatabase size={18} />
            <span className="text-sm text-white/80">store</span>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={openSearch}
          >
            <FaSearchengin size={18} />
            <span className="text-sm text-white/80">search</span>
          </div>
        </div>
      </div>

      <div className="mt-96 flex justify-center">
        {/* Component that takes in multiple files */}
        {upload && (
          <div></div>
        )}

        {/* Backend Call to create API and then either download those || export to chroma */}
        {embed && (
          <div></div>
        )}

        {/* embeddings need to be available for option to show that it is ready for import to chroma */}
        {store && (
          <div></div>
        )}

        {/* query the data from the backend and show the distances between the query sentence embeddings and the documents embeddings */}
        {search && (
          <div></div>
        )}

      </div>
    </>
  );
}
