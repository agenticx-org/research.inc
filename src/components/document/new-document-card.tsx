"use client";

import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Card } from "../ui/card";

export function NewDocumentCard() {
  const router = useRouter();

  const handleCreateNewDocument = () => {
    // In a real app, this would create a new document in the database
    // and then redirect to it. For now, we'll just redirect to a mock ID.
    router.push("/document/new");
  };

  return (
    <Card
      className="h-[200px] shadow-none p-4 overflow-hidden 
                flex flex-col items-center justify-center cursor-pointer bg-purple-100 dark:bg-purple-900/20"
      onClick={handleCreateNewDocument}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-8 h-8 rounded-full bg-purple-900 dark:bg-purple-500 flex items-center justify-center">
          <Plus size={20} weight="bold" className="text-white" />
        </div>
        <div className="font-medium">Start new doc</div>
        <div className="text-xs text-muted-foreground">New Document</div>
      </div>
    </Card>
  );
}
