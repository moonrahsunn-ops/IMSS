import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash2 } from "lucide-react";

export default function FeaturesEditor({ features = [], setFeatures }) {
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setFeatures([...features, text.trim()]);
    setText("");
  };
  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-neutral-500 shrink-0" />
          <span className="flex-1">{f}</span>
          <Button variant="ghost" size="icon" onClick={() => setFeatures(features.filter((_, x) => x !== i))}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nueva característica"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" variant="outline" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
