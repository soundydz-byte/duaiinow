"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Filter } from "lucide-react"
import { useState } from "react"

interface SearchFilterProps {
  placeholder?: string
  onSearch: (query: string) => void
  onFilterChange?: (filters: Record<string, string>) => void
  filterOptions?: {
    label: string
    key: string
    options: { label: string; value: string }[]
  }[]
  sortOptions?: {
    label: string
    value: string
  }[]
  onSortChange?: (sortBy: string) => void
}

export function SearchFilter({
  placeholder = "ابحث هنا...",
  onSearch,
  onFilterChange,
  filterOptions = [],
  sortOptions = [],
  onSortChange,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleClearAll = () => {
    setSearchQuery("")
    setFilters({})
    setShowFilters(false)
    onSearch("")
    onFilterChange?.({})
  }

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v)

  return (
    <div className="space-y-4 bg-white p-4 rounded-2xl border-2 border-purple-100 shadow-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Filter and Sort Section */}
      {(filterOptions.length > 0 || sortOptions.length > 0) && (
        <>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <Filter className="h-4 w-4" />
            <span>الفلاتر والترتيب</span>
          </button>

          {showFilters && (
            <div className="space-y-3 pl-4 border-l-2 border-purple-200">
              {/* Filter Options */}
              {filterOptions.map((filterGroup) => (
                <div key={filterGroup.key}>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    {filterGroup.label}
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => handleFilterChange(filterGroup.key, "")}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        !filters[filterGroup.key]
                          ? "bg-purple-600 text-white"
                          : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                    >
                      الكل
                    </button>
                    {filterGroup.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleFilterChange(filterGroup.key, option.value)
                        }
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          filters[filterGroup.key] === option.value
                            ? "bg-purple-600 text-white"
                            : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Sort Options */}
              {sortOptions.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    ترتيب حسب
                  </label>
                  <select
                    onChange={(e) => onSortChange?.(e.target.value)}
                    className="w-full mt-2 p-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button
          onClick={handleClearAll}
          variant="outline"
          size="sm"
          className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" />
          مسح جميع الفلاتر
        </Button>
      )}
    </div>
  )
}
