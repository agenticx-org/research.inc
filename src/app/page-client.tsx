"use client";

import { DocumentSection } from "@/components/document/document-section";
import { NewDocumentCard } from "@/components/document/new-document-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { mockDocuments } from "@/types/document";
import { SignOut, User } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function HomePageClient() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isLoading = isPending;

  // Group documents by recency
  const { recentlyViewed } = useMemo(() => {
    // In a real app, this would be based on actual user activity
    // For now, we'll just sort by editedAt date
    const sortedDocuments = [...mockDocuments].sort(
      (a, b) => (b.editedAt?.getTime() || 0) - (a.editedAt?.getTime() || 0)
    );

    return {
      recentlyViewed: sortedDocuments,
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess() {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-12 bg-background border-b border-border flex items-center w-full bg-white dark:bg-black shrink-0">
        <div className="flex items-center justify-between px-3 w-full">
          <div className="flex items-center gap-1.5 font-medium">
            <Image
              src={"/research.svg"}
              height={25}
              width={25}
              alt="research.inc logo"
            />
            Research.inc
          </div>
          {isLoading ? (
            <Skeleton className="w-8 h-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer select-none">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User profile"}
                    />
                  ) : null}
                  <AvatarFallback className="bg-white border">
                    <User size={14} weight="bold" aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-lg border shadow-md"
              >
                <div className="px-4 py-3">
                  <p className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email || ""}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="focus:bg-accent cursor-pointer py-2"
                >
                  <div className="flex items-center px-2">
                    <SignOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation - Hidden on mobile, with independent scrolling */}
        <div className="w-64 hidden md:block border-r border-border overflow-y-auto">
          <div className="mb-6 pl-4 pt-4">
            <h3 className="text-sm font-medium mb-2">Recently viewed</h3>
            <ul className="space-y-1">
              {recentlyViewed.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <a
                    href={`/document/${doc.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground block py-1"
                  >
                    {doc.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-4">
            <h3 className="text-sm font-medium mb-2">Personal</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground block py-1"
                >
                  Shared
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground block py-1"
                >
                  Test
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Document Grid - with independent scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Start new doc</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div className="col-span-1">
                  <NewDocumentCard />
                </div>
              </div>
            </div>

            <DocumentSection
              title="Recently viewed"
              documents={recentlyViewed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
