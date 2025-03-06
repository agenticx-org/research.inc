"use client";

import { Document } from "@/types/document";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card } from "../ui/card";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const { id, title, content, editedAt } = document;

  // Format the date as "Edited about X years ago"
  const formattedDate = editedAt
    ? `Edited about ${formatDistanceToNow(editedAt, { addSuffix: false })}`
    : "";

  return (
    <Link href={`/document/${id}`} className="block">
      <Card className="h-[200px] shadow-none p-4 overflow-hidden flex flex-col border border-border hover:border-border/80">
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <div className="text-xs text-muted-foreground mb-2">
          {formattedDate}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-muted-foreground">
            {content ? content.substring(0, 150) : "No content"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
