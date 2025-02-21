"use client";

import { useState, useEffect } from "react";
import { Document, Tag } from "@/types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { createBrowserClient } from "@supabase/ssr";
import { useToast } from "../shared/Toast";

interface DocumentSearchProps {
  onSearch: (query: string) => void;
  onFilter: (status: Document["status"] | "all") => void;
  onSort: (options: {
    field: "title" | "created_at" | "updated_at";
    direction: "asc" | "desc";
  }) => void;
  onTagsChange: (tagIds: string[]) => void;
}

export function DocumentSearch({
  onSearch,
  onFilter,
  onSort,
  onTagsChange,
}: DocumentSearchProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Document["status"] | "all">("all");
  const [sortField, setSortField] = useState<
    "title" | "created_at" | "updated_at"
  >("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { showToast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;

      setAvailableTags(data || []);
    } catch (err) {
      console.error("Error loading tags:", err);
      showToast(
        "error",
        "Error loading tags",
        "Failed to load tags. Please try again."
      );
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleStatusChange = (value: Document["status"] | "all") => {
    setStatus(value);
    onFilter(value);
  };

  const handleSortChange = (field: "title" | "created_at" | "updated_at") => {
    const direction =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
    onSort({ field, direction });
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="block w-full rounded-lg border-0 py-3 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Filter and Sort Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="inline-flex items-center gap-x-1.5 rounded-lg px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon
              className="-ml-0.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {isFiltersOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as Document["status"] | "all"
                  )
                }
                className="mt-2 block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-medium text-gray-700"
              >
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-");
                  onSort({
                    field: field as "title" | "created_at" | "updated_at",
                    direction: direction as "asc" | "desc",
                  });
                }}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="updated_at-desc">Last updated</option>
                <option value="created_at-desc">Date created</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="mt-4">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              selectedTags.includes(tag.id)
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-700"
            } hover:bg-gray-200`}
            style={{
              backgroundColor: selectedTags.includes(tag.id)
                ? tag.color + "33"
                : undefined,
              color: selectedTags.includes(tag.id) ? tag.color : undefined,
            }}
          >
            <TagIcon className="h-4 w-4 mr-1" />
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
