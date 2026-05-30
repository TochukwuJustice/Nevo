'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import {
  usePoolsStore,
  type Pool,
  type PoolStatus,
  type SortOption,
} from '@/src/store/poolsStore';

const CATEGORY_CONFIG = {
  Education: {
    label: 'Education',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
    activeClassName: 'border-sky-500 bg-sky-100 text-sky-800',
  },
  Healthcare: {
    label: 'Healthcare',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
    activeClassName: 'border-rose-500 bg-rose-100 text-rose-800',
  },
  Emergency: {
    label: 'Emergency',
    className: 'border-red-200 bg-red-50 text-red-700',
    activeClassName: 'border-red-500 bg-red-100 text-red-800',
  },
  Humanitarian: {
    label: 'Humanitarian',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    activeClassName: 'border-emerald-500 bg-emerald-100 text-emerald-800',
  },
  Technology: {
    label: 'Technology',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    activeClassName: 'border-indigo-500 bg-indigo-100 text-indigo-800',
  },
  Environment: {
    label: 'Environment',
    className: 'border-lime-200 bg-lime-50 text-lime-700',
    activeClassName: 'border-lime-500 bg-lime-100 text-lime-800',
  },
  'Animal Welfare': {
    label: 'Animal Welfare',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
    activeClassName: 'border-amber-500 bg-amber-100 text-amber-800',
  },
  Community: {
    label: 'Community',
    className: 'border-teal-200 bg-teal-50 text-teal-700',
    activeClassName: 'border-teal-500 bg-teal-100 text-teal-800',
  },
  'Art & Culture': {
    label: 'Art & Culture',
    className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
    activeClassName: 'border-fuchsia-500 bg-fuchsia-100 text-fuchsia-800',
  },
} as const;

type PoolCategory = keyof typeof CATEGORY_CONFIG;

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as PoolCategory[];

const POOL_TAGS: Record<string, PoolCategory[]> = {
  '1': ['Humanitarian', 'Emergency', 'Community'],
  '2': ['Technology', 'Education'],
  '3': ['Environment', 'Community'],
  '4': ['Animal Welfare', 'Emergency'],
  '5': ['Education', 'Technology'],
};

const POOL_STATUSES: PoolStatus[] = ['Active', 'Completed'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_raised', label: 'Most raised' },
  { value: 'goal_low', label: 'Goal: low to high' },
];

export default function BrowsePoolsPage() {
  const {
    pools,
    filters,
    setSearch,
    toggleCategory,
    toggleStatus,
    clearFilters,
    sortBy,
    setSortBy,
  } = usePoolsStore();
  const [searchInput, setSearchInput] = useState(filters.search);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.categories.length +
    filters.statuses.length;

  const selectedFilters = [
    ...(filters.search
      ? [{ key: 'search', label: `Search: ${filters.search}` }]
      : []),
    ...filters.statuses.map((status) => ({
      key: `status-${status}`,
      label: status,
    })),
    ...filters.categories.map((category) => ({
      key: `category-${category}`,
      label: category,
    })),
  ];

  const handleClearFilters = () => {
    setSearchInput('');
    clearFilters();
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, setSearch]);

  const displayedPools = getDisplayedPools(pools, filters, sortBy);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Pools</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Discover and contribute to transparent, on-chain fundraising
            campaigns.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar / Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <label htmlFor="search-pools" className="sr-only">
                Search pools
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  id="search-pools"
                  className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="Search by name, description, category, or creator..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Statuses</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {POOL_STATUSES.map((status) => {
                  const isActive = filters.statuses.includes(status);
                  return (
                    <button
                      key={`status-${status}`}
                      onClick={() => toggleStatus(status)}
                      className={`rounded-full lg:rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-medium'
                          : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {CATEGORIES.map((category) => {
                  const isActive = filters.categories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      aria-pressed={isActive}
                      className={`rounded-full lg:rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                        isActive
                          ? CATEGORY_CONFIG[category].activeClassName
                          : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)]'
                      }`}
                    >
                      {CATEGORY_CONFIG[category].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--color-text-muted)]">
              Showing {displayedPools.length} pool
              {displayedPools.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="sort-pools">
                Sort pools
              </label>
              <select
                id="sort-pools"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleClearFilters}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                Clear filters
              </button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Applied filters:
              </span>
              {selectedFilters.map((filter) => (
                <span
                  key={filter.key}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    isPoolCategory(filter.label)
                      ? getCategoryClassName(filter.label, true)
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                  }`}
                >
                  {filter.label}
                </span>
              ))}
            </div>
          )}

          {displayedPools.length === 0 ? (
            <EmptyState
              variant="bordered"
              icon="search"
              iconTone="muted"
              title="No results found"
              description="We couldn't find any pools matching your search criteria. Try adjusting your filters or search term."
              action={{
                label: 'Clear search',
                onClick: () => {
                  setSearchInput('');
                  setSearch('');
                },
                variant: 'link',
              }}
              secondaryAction={{
                label: 'Create a Pool',
                href: '/pools/new',
                variant: 'primary',
              }}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {displayedPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  activeCategories={filters.categories}
                  onCategoryClick={toggleCategory}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getPoolTags(pool: Pool): PoolCategory[] {
  const category = isPoolCategory(pool.category) ? pool.category : null;
  return Array.from(new Set([category, ...(POOL_TAGS[pool.id] ?? [])])).filter(
    (tag): tag is PoolCategory => Boolean(tag)
  );
}

function isPoolCategory(value: string): value is PoolCategory {
  return value in CATEGORY_CONFIG;
}

function getCategoryClassName(category: PoolCategory, active = false) {
  return active
    ? CATEGORY_CONFIG[category].activeClassName
    : CATEGORY_CONFIG[category].className;
}

function getDisplayedPools(
  pools: Pool[],
  filters: {
    search: string;
    categories: string[];
    statuses: PoolStatus[];
  },
  sortBy: SortOption
) {
  const searchLower = filters.search.toLowerCase();

  return pools
    .filter((pool) => {
      const tags = getPoolTags(pool);
      const tagText = tags.join(' ').toLowerCase();
      const matchSearch =
        !filters.search ||
        pool.title.toLowerCase().includes(searchLower) ||
        pool.description.toLowerCase().includes(searchLower) ||
        pool.category.toLowerCase().includes(searchLower) ||
        tagText.includes(searchLower) ||
        (pool.creator && pool.creator.toLowerCase().includes(searchLower));
      const matchCategory =
        filters.categories.length === 0 ||
        filters.categories.some(
          (category) => isPoolCategory(category) && tags.includes(category)
        );
      const matchStatus =
        filters.statuses.length === 0 || filters.statuses.includes(pool.status);
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'most_raised') {
        return b.raised - a.raised;
      }
      if (sortBy === 'goal_low') {
        return a.target - b.target;
      }
      const dateA = new Date(a.createdAt ?? '1970-01-01').getTime();
      const dateB = new Date(b.createdAt ?? '1970-01-01').getTime();
      return dateB - dateA;
    });
}

function PoolCard({
  pool,
  activeCategories,
  onCategoryClick,
}: {
  pool: Pool;
  activeCategories: string[];
  onCategoryClick: (category: string) => void;
}) {
  const pct = Math.min(100, Math.round((pool.raised / pool.target) * 100));
  const tags = getPoolTags(pool);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/pools/${pool.id}`}
        className="block h-24 w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        style={{ backgroundColor: pool.imageColor || '#e5e7eb' }}
        aria-label={`View ${pool.title}`}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {tags.map((tag) => {
            const isActive = activeCategories.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => onCategoryClick(tag)}
                aria-pressed={isActive}
                className={`max-w-full rounded-full border px-2.5 py-1 text-xs font-semibold leading-tight transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${getCategoryClassName(
                  tag,
                  isActive
                )}`}
              >
                {CATEGORY_CONFIG[tag].label}
              </button>
            );
          })}
          <span
            className={`ml-auto inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              pool.status === 'Active'
                ? 'bg-success-light text-success-dark'
                : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {pool.status}
          </span>
        </div>
        <Link
          href={`/pools/${pool.id}`}
          className="group/title focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <h3 className="font-bold text-lg leading-tight transition-colors line-clamp-1 group-hover/title:text-brand-600">
            {pool.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] line-clamp-2 flex-1">
          {pool.description}
        </p>

        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
            <span className="text-[var(--color-text)]">
              {pool.raised.toLocaleString()} XLM raised
            </span>
            <span className="text-[var(--color-text-muted)]">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-[var(--color-text-muted)]">
            Goal: {pool.target.toLocaleString()} XLM
          </div>
        </div>
      </div>
    </article>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="size-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}
