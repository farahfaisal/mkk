import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Printer,
  RefreshCw
} from 'lucide-react';

interface Column {
  id: string;
  header: string;
  accessor: (row: any) => React.ReactNode;
  sortable?: boolean;
}

interface AdminTableProps {
  title: string;
  data: any[];
  columns: Column[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onAdd?: () => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function AdminTable({
  title,
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  searchPlaceholder = "البحث...",
  emptyMessage = "لا توجد بيانات",
  loading = false,
  error = null,
  onRefresh
}: AdminTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleFilter = (columnId: string, value: string) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[columnId] || [];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [columnId]: currentFilters.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [columnId]: [...currentFilters, value]
        };
      }
    });
  };

  const filteredData = data.filter(row => {
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = columns.some(column => {
        const value = column.accessor(row);
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        } else if (typeof value === 'number') {
          return value.toString().includes(searchLower);
        }
        return false;
      });
      if (!matchesSearch) return false;
    }

    // Apply column filters
    for (const [columnId, filterValues] of Object.entries(selectedFilters)) {
      if (filterValues.length === 0) continue;
      
      const column = columns.find(col => col.id === columnId);
      if (!column) continue;
      
      const cellValue = column.accessor(row);
      if (!filterValues.includes(String(cellValue))) {
        return false;
      }
    }

    return true;
  });

  // Sort data if a sort column is selected
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const column = columns.find(col => col.id === sortColumn);
    if (!column) return 0;
    
    const aValue = column.accessor(a);
    const bValue = column.accessor(b);
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'inactive':
        return 'text-rose-500 bg-rose-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1A1F2E] rounded-xl border border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="تصفية"
            >
              <Filter size={16} className="text-white/60" />
            </button>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                title="تحديث"
              >
                <RefreshCw size={16} className="text-white/60" />
              </button>
            )}
            <button 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="تصدير"
            >
              <Download size={16} className="text-white/60" />
            </button>
            <button 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              title="طباعة"
            >
              <Printer size={16} className="text-white/60" />
            </button>
            {onAdd && (
              <button 
                onClick={onAdd}
                className="bg-[#0AE7F2] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0AE7F2]/90 transition-colors"
              >
                إضافة جديد
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#0AE7F2]/50"
          />
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-[#0A0F1C] rounded-lg border border-white/10">
            <h3 className="text-sm font-medium mb-3">تصفية حسب</h3>
            <div className="flex flex-wrap gap-4">
              {columns.map(column => (
                <div key={column.id} className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1F2E] hover:bg-[#1A1F2E]/80 transition-colors">
                    <span>{column.header}</span>
                    <ChevronDown size={16} className="text-white/60" />
                  </button>
                  
                  {/* Filter dropdown - would be populated with actual filter options */}
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-[#1A1F2E] rounded-lg border border-white/10 shadow-xl hidden group-hover:block">
                    <div className="p-2 space-y-1">
                      {/* Example filter options */}
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
                        <input type="checkbox" className="rounded border-white/20 bg-[#0A0F1C] text-[#0AE7F2]" />
                        <span className="text-sm">خيار 1</span>
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
                        <input type="checkbox" className="rounded border-white/20 bg-[#0A0F1C] text-[#0AE7F2]" />
                        <span className="text-sm">خيار 2</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="p-6 text-center">
          <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl">
            {error}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="underline hover:no-underline mt-2 block w-full"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        </div>
      ) : loading ? (
        <div className="p-6 text-center">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {sortedData.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              {emptyMessage}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map(column => (
                    <th 
                      key={column.id} 
                      className="text-right py-3 px-6 text-sm font-medium text-white/60"
                    >
                      {column.sortable !== false ? (
                        <button 
                          onClick={() => handleSort(column.id)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {column.header}
                          {sortColumn === column.id && (
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} 
                            />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="text-right py-3 px-6 text-sm font-medium text-white/60">
                      إجراءات
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-white/10 last:border-0">
                    {columns.map(column => (
                      <td key={column.id} className="py-3 px-6">
                        {column.accessor(row)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(row)}
                              className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2]"
                              title="تعديل"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              onClick={() => onDelete(row)}
                              className="p-2 hover:bg-rose-500/10 rounded-full transition-colors text-rose-500"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          <button 
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            title="المزيد"
                          >
                            <MoreVertical size={16} className="text-white/60" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div className="text-sm text-white/60">
          إجمالي: {filteredData.length} من {data.length}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-lg bg-[#1A1F2E]/60 text-white/60 hover:bg-[#1A1F2E] transition-colors">
            السابق
          </button>
          <button className="px-3 py-1 rounded-lg bg-[#0AE7F2] text-black">
            1
          </button>
          <button className="px-3 py-1 rounded-lg bg-[#1A1F2E]/60 text-white/60 hover:bg-[#1A1F2E] transition-colors">
            2
          </button>
          <button className="px-3 py-1 rounded-lg bg-[#1A1F2E]/60 text-white/60 hover:bg-[#1A1F2E] transition-colors">
            3
          </button>
          <button className="px-3 py-1 rounded-lg bg-[#1A1F2E]/60 text-white/60 hover:bg-[#1A1F2E] transition-colors">
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}