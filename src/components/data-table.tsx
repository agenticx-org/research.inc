"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

// Define the data structure
export interface Company {
  id: string;
  name: string;
  url: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  phone: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Create a component for the table with toolbar
export function CompanyDataTable() {
  // Sample data based on the image
  const [data] = useState<Company[]>([
    {
      id: "1",
      name: "BlackRock",
      url: "www.blackrock.com",
      linkedin: "http://www.linkedin.com/company/blackrock",
      twitter: "http://www.twitter.com/blackrock",
      facebook: "http://www.facebook.com/BlackRock",
      phone: "212-810-5300",
    },
    {
      id: "2",
      name: "HSBC",
      url: "https://www.hsbc.com/",
      linkedin: "https://www.linkedin.com/company/hsbc",
      twitter: "https://x.com/HSBC",
      facebook: "https://www.facebook.com/HSBC",
      phone: "+44 20-7991-8888",
    },
    {
      id: "3",
      name: "Citi",
      url: "https://www.citigroup.com",
      linkedin: "https://www.linkedin.com/company/citi",
      twitter: "https://twitter.com/citi",
      facebook: "https://www.facebook.com/citi",
      phone: "(212) 559-1000",
    },
    {
      id: "4",
      name: "Google",
      url: "https://www.google.com",
      linkedin: "https://www.linkedin.com/company/google",
      twitter: "https://x.com/google",
      facebook: "https://www.facebook.com/Google",
      phone: "",
    },
    {
      id: "5",
      name: "NVIDIA",
      url: "https://www.nvidia.com",
      linkedin: "https://www.linkedin.com/company/nvidia",
      twitter: "https://www.twitter.com/nvidia",
      facebook: "https://www.facebook.com/NVIDIA",
      phone: "+1 (408) 848-6200",
    },
    {
      id: "6",
      name: "BP",
      url: "https://www.bp.com",
      linkedin: "https://www.linkedin.com/company/bp",
      twitter: "https://twitter.com/BP_plc",
      facebook: "https://www.facebook.com/BP",
      phone: "0800 402 402",
    },
    {
      id: "7",
      name: "Government of Canada",
      url: "https://www.canada.ca",
      linkedin: "https://www.linkedin.com/company/government-of-canada",
      twitter: "",
      facebook: "",
      phone: "+1 604-946-7022",
    },
    {
      id: "8",
      name: "Deutsche Bank",
      url: "https://www.db.com",
      linkedin: "https://www.linkedin.com/company/deutsche-bank",
      twitter: "https://twitter.com/deutschebank",
      facebook: "https://www.facebook.com/DeutscheBank",
      phone: "+49 69 910-00",
    },
    {
      id: "9",
      name: "Microsoft",
      url: "https://www.microsoft.com",
      linkedin: "https://www.linkedin.com/company/microsoft",
      twitter: "https://x.com/Microsoft",
      facebook: "https://www.facebook.com/Microsoft",
      phone: "+1 888-725-1047",
    },
  ]);

  // Define columns
  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Company",
    },
    {
      accessorKey: "url",
      header: "Company URL",
      cell: ({ row }) => (
        <a
          href={
            row.original.url.startsWith("http")
              ? row.original.url
              : `https://${row.original.url}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.original.url}
        </a>
      ),
    },
    {
      accessorKey: "linkedin",
      header: "LinkedIn",
      cell: ({ row }) =>
        row.original.linkedin ? (
          <a
            href={row.original.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.original.linkedin}
          </a>
        ) : null,
    },
    {
      accessorKey: "twitter",
      header: "Twitter",
      cell: ({ row }) =>
        row.original.twitter ? (
          <a
            href={row.original.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.original.twitter}
          </a>
        ) : null,
    },
    {
      accessorKey: "facebook",
      header: "Facebook",
      cell: ({ row }) =>
        row.original.facebook ? (
          <a
            href={row.original.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.original.facebook}
          </a>
        ) : null,
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background z-10 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Add Data
            </Button>
            <Button variant="outline" size="sm">
              Import CSV
            </Button>
            <Button variant="outline" size="sm">
              Automations
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Input placeholder="Search..." className="max-w-sm" />
          </div>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-grow overflow-auto">
        <DataTable columns={columns} data={data} />
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-background py-2 border-t">
        <div className="text-sm text-muted-foreground">
          {data.length} records
        </div>
      </div>
    </div>
  );
}
