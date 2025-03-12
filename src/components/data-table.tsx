"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Database,
  DotsThreeVertical,
  FileArrowDown,
  FileArrowUp,
  FunnelSimple,
  Gear,
  ListNumbers,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  onSelectionChange?: (info: string | null, copyFn?: () => void) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    defaultColumn: {
      minSize: 240,
      maxSize: 240,
      size: 240,
    },
  });

  // Add state for cell selection
  const [selectionStart, setSelectionStart] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<string | null>(null);

  // Function to check if a cell is within the selection range
  const isCellSelected = (rowIndex: number, colIndex: number) => {
    if (!selectionStart || !selectionEnd) return false;

    const startRow = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex);
    const endRow = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
    const startCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const endCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);

    return (
      rowIndex >= startRow &&
      rowIndex <= endRow &&
      colIndex >= startCol &&
      colIndex <= endCol
    );
  };

  // Function to determine the border styling for selected cells
  const getSelectionBorderStyle = (rowIndex: number, colIndex: number) => {
    if (!selectionStart || !selectionEnd || !isCellSelected(rowIndex, colIndex))
      return "";

    const startRow = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex);
    const endRow = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
    const startCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const endCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);

    const borderClasses = [];

    // Top border
    if (rowIndex === startRow) {
      borderClasses.push("border-t-2 border-t-blue-600");
    }

    // Bottom border
    if (rowIndex === endRow) {
      borderClasses.push("border-b-2 border-b-blue-600");
    }

    // Left border
    if (colIndex === startCol) {
      borderClasses.push("border-l-2 border-l-blue-600");
    }

    // Right border
    if (colIndex === endCol) {
      borderClasses.push("border-r-2 border-r-blue-600");
    }

    return borderClasses.join(" ");
  };

  // Function to copy selected cells to clipboard
  const copySelectedCells = useCallback(() => {
    if (!selectionStart || !selectionEnd) return;

    const startRow = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex);
    const endRow = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
    const startCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const endCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);

    // Get the visible rows and their cells
    const rows = table.getRowModel().rows;

    // Create a 2D array of cell values
    const selectedData: string[][] = [];

    for (let i = startRow; i <= endRow; i++) {
      if (i >= rows.length) continue;

      const rowData: string[] = [];
      const cells = rows[i].getVisibleCells();

      for (let j = startCol; j <= endCol; j++) {
        if (j >= cells.length) continue;

        // Get the cell value - this handles both simple values and rendered components
        const cell = cells[j];
        const cellValue = String(cell.getValue() || "");
        rowData.push(cellValue);
      }

      selectedData.push(rowData);
    }

    // Convert to tab-separated values for clipboard
    const tsv = selectedData.map((row) => row.join("\t")).join("\n");

    // Copy to clipboard
    navigator.clipboard
      .writeText(tsv)
      .then(() => {
        setSelectionInfo(
          `Copied ${selectedData.length} × ${
            selectedData[0]?.length || 0
          } cells to clipboard`
        );
        setTimeout(() => {
          if (selectionStart && selectionEnd) {
            const rowCount = endRow - startRow + 1;
            const colCount = endCol - startCol + 1;
            setSelectionInfo(
              `Selected: ${
                rowCount * colCount
              } cells (${rowCount} × ${colCount})`
            );
          }
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }, [selectionStart, selectionEnd, table]);

  // Handle mouse down to start selection
  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    setSelectionStart({ rowIndex, colIndex });
    setSelectionEnd({ rowIndex, colIndex });
    setIsSelecting(true);
    setSelectionInfo(`Selected: 1 cell`);
  };

  // Handle mouse enter during selection
  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isSelecting) {
      setSelectionEnd({ rowIndex, colIndex });

      // Update selection info
      if (selectionStart) {
        const startRow = Math.min(selectionStart.rowIndex, rowIndex);
        const endRow = Math.max(selectionStart.rowIndex, rowIndex);
        const startCol = Math.min(selectionStart.colIndex, colIndex);
        const endCol = Math.max(selectionStart.colIndex, colIndex);

        const rowCount = endRow - startRow + 1;
        const colCount = endCol - startCol + 1;
        const cellCount = rowCount * colCount;

        setSelectionInfo(
          `Selected: ${cellCount} cells (${rowCount} × ${colCount})`
        );
      }
    }
  };

  // Handle mouse up to end selection
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectionInfo, copySelectedCells);
    }
  }, [selectionInfo, onSelectionChange, copySelectedCells]);

  // Add event listener to handle mouse up outside the table
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
      }
    };

    // Add keyboard shortcut for copy
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "c" &&
        selectionStart &&
        selectionEnd
      ) {
        e.preventDefault();
        copySelectedCells();
      }

      // Clear selection when Escape key is pressed
      if (e.key === "Escape" && (selectionStart || selectionEnd)) {
        e.preventDefault();
        setSelectionStart(null);
        setSelectionEnd(null);
        setSelectionInfo(null);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelecting, selectionStart, selectionEnd, copySelectedCells]);

  return (
    <div className="w-full overflow-auto">
      <Table
        className="w-auto border-collapse table-fixed"
        style={{ minWidth: columns.length * 240 }}
      >
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-medium h-12 border-r last:border-r-0"
                  style={{ width: 240, minWidth: 240, maxWidth: 240 }}
                >
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
            table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-14"
              >
                {row.getVisibleCells().map((cell, colIndex) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "h-14 border-r last:border-r-0 select-none",
                      isCellSelected(rowIndex, colIndex) &&
                        "bg-blue-50/70 dark:bg-blue-900/10",
                      getSelectionBorderStyle(rowIndex, colIndex)
                    )}
                    style={{ width: 240, minWidth: 240, maxWidth: 240 }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(rowIndex, colIndex);
                    }}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                  >
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

// Sample data based on the image
const sampleData: Company[] = [
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
];

// Create a component for the table with toolbar
export function CompanyDataTable() {
  // Use state for data
  const [data] = useState<Company[]>(sampleData);
  const [tableSelectionInfo, setTableSelectionInfo] = useState<string | null>(
    null
  );
  const [copyCallback, setCopyCallback] = useState<(() => void) | null>(null);

  // Handle selection change from DataTable
  const handleSelectionChange = (info: string | null, copyFn?: () => void) => {
    setTableSelectionInfo(info);
    if (copyFn) {
      setCopyCallback(() => copyFn);
    }
  };

  // Memoize columns to prevent unnecessary recalculations
  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Company",
        size: 240, // Updated to 240px
        cell: ({ getValue }) => (
          <div className="truncate max-w-[220px]" title={String(getValue())}>
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "url",
        header: "Company URL",
        size: 240, // Updated to 240px
        cell: ({ row }) => (
          <a
            href={
              row.original.url.startsWith("http")
                ? row.original.url
                : `https://${row.original.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-[220px] block"
            title={row.original.url}
          >
            {row.original.url}
          </a>
        ),
      },
      {
        accessorKey: "linkedin",
        header: "LinkedIn",
        size: 240, // Updated to 240px
        cell: ({ row }) =>
          row.original.linkedin ? (
            <a
              href={row.original.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate max-w-[220px] block"
              title={row.original.linkedin}
            >
              {row.original.linkedin}
            </a>
          ) : null,
      },
      {
        accessorKey: "twitter",
        header: "Twitter",
        size: 240, // Updated to 240px
        cell: ({ row }) =>
          row.original.twitter ? (
            <a
              href={row.original.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate max-w-[220px] block"
              title={row.original.twitter}
            >
              {row.original.twitter}
            </a>
          ) : null,
      },
      {
        accessorKey: "facebook",
        header: "Facebook",
        size: 240, // Updated to 240px
        cell: ({ row }) =>
          row.original.facebook ? (
            <a
              href={row.original.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate max-w-[220px] block"
              title={row.original.facebook}
            >
              {row.original.facebook}
            </a>
          ) : null,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        size: 240, // Updated to 240px
        cell: ({ getValue }) => (
          <div className="truncate max-w-[220px]" title={String(getValue())}>
            {getValue() as string}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background z-20 py-4 border-b">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="h-9 gap-1.5 px-3">
              <Plus className="h-4 w-4" weight="bold" />
              <span>Add Data</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3">
              <FileArrowUp className="h-4 w-4" />
              <span>Import CSV</span>
            </Button>

            <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3">
              <Gear className="h-4 w-4" />
              <span>Automations</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 px-3"
                >
                  <FileArrowDown className="h-4 w-4" />
                  <span>Export</span>
                  <CaretDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                className="pl-9 h-9 w-64 focus-visible:ring-primary/20"
              />
            </div>

            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <FunnelSimple className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <DotsThreeVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-grow overflow-auto">
        <DataTable
          columns={columns}
          data={data}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      {/* Selection Info */}
      {tableSelectionInfo && (
        <div className="bg-background border-t py-2 px-4 text-xs text-muted-foreground flex items-center justify-between z-30 relative">
          <span>{tableSelectionInfo}</span>
          {copyCallback && (
            <Button
              size="sm"
              className="h-7 ml-2 text-xs"
              onClick={copyCallback}
            >
              Copy
            </Button>
          )}
        </div>
      )}

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-background z-20 py-3 px-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>{data.length} records</span>
            <span className="text-border px-2">|</span>
            <span>Page 1 of 1</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" className="h-8 px-3">
              Page 1
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled
            >
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="mx-2 h-4 border-r border-border"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-3"
                >
                  <ListNumbers className="h-4 w-4" />
                  <span>10 per page</span>
                  <CaretDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>5 per page</DropdownMenuItem>
                <DropdownMenuItem>10 per page</DropdownMenuItem>
                <DropdownMenuItem>25 per page</DropdownMenuItem>
                <DropdownMenuItem>50 per page</DropdownMenuItem>
                <DropdownMenuItem>100 per page</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
