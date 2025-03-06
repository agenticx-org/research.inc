"use client";

import { Document } from "@/types/document";
import { DocumentCard } from "./document-card";

interface DocumentSectionProps {
  title: string;
  documents: Document[];
}

export function DocumentSection({ title, documents }: DocumentSectionProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {documents.map((document) => (
          <div key={document.id} className="col-span-1">
            <DocumentCard document={document} />
          </div>
        ))}
      </div>
    </div>
  );
}
