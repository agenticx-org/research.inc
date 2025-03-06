import { redirect } from "next/navigation";

// In a real app, this would create a new document in the database
// and then redirect to it. For now, we'll just redirect to a mock ID.
export default function NewDocumentPage() {
  // Redirect to a mock document ID
  // In a real app, this would be a newly created document
  redirect("/document/new-doc-123");
}
