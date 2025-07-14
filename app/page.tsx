"use client"

import { RxLightningBolt } from "react-icons/rx"
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="flex justify-center" >
        <h1 className="scroll-m-20 pb-2 text-white text-4xl font-semibold tracking-tight">quirk</h1>
        <RxLightningBolt size={24} className="text-yellow-400" />

      </div>
      <div className="mt-12 flex justify-center">
        <Button variant="default" className="bg-white hover:bg-amber-950 hover:text-white rounded" onClick={() => toast.success("debugging")}>
          quirk
        </Button>
      </div>
    </>
  );
}
