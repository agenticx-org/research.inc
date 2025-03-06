"use client";

import { Document } from "@/types/document";
import { DocumentCard } from "./document-card";
import { NewDocumentCard } from "./new-document-card";

interface DocumentGridProps {
  documents: Document[];
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div className="col-span-1">
        <NewDocumentCard />
      </div>

      {documents.map((document) => (
        <div key={document.id} className="col-span-1">
          <DocumentCard document={document} />
        </div>
      ))}
    </div>
  );
}
