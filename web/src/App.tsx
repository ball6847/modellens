import { useState, useEffect, useRef, useCallback } from "react";
import { fetchModels, fetchProviders, type Model, type SortField, type SortDir } from "@/api";
import { SearchBox } from "@/components/search-box";
import { ProviderFilter } from "@/components/provider-filter";
import { ModelTable } from "@/components/model-table";
import { ModelDetail } from "@/components/model-detail";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LIMIT = 100;

export function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [total, setTotal] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchParamsRef = useRef({ query: "", provider: null as string | null, sortBy: "name" as SortField, sortDir: "asc" as SortDir, offset: 0 });

  const doFetch = useCallback(async (replace: boolean, params: { query: string; provider: string | null; sortBy: SortField; sortDir: SortDir; offset: number }) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsFetching(true);
    setError(null);
    try {
      const page = await fetchModels({
        query: params.query,
        provider: params.provider ?? undefined,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        offset: replace ? 0 : params.offset,
        limit: LIMIT,
        signal: abortControllerRef.current.signal,
      });
      if (replace) {
        setModels(page.models);
      } else {
        setModels((prev) => [...prev, ...page.models]);
      }
      setTotal(page.total);
      setAllCount((prev) => prev === 0 ? page.total : prev);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch models");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    document.title = "ModelLens - LLM Model Browser";
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const params = fetchParamsRef.current;
    fetchModels({
      query: params.query,
      provider: params.provider ?? undefined,
      sort_by: params.sortBy,
      sort_dir: params.sortDir,
      offset: 0,
      limit: LIMIT,
      signal: controller.signal,
    }).then((page) => {
      setModels(page.models);
      setTotal(page.total);
      setAllCount((prev) => (prev === 0 ? page.total : prev));
      setIsFetching(false);
    }).catch((err) => {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to fetch models");
      setIsFetching(false);
    });

    fetchProviders().then(setProviders).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !isFetching && models.length < total) {
            fetchParamsRef.current.offset += LIMIT;
            doFetch(false, fetchParamsRef.current);
          }
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(currentRef);
    return () => observer.disconnect();
  }, [isFetching, models.length, total, doFetch]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    fetchParamsRef.current = { ...fetchParamsRef.current, query: newQuery, offset: 0 };
    doFetch(true, fetchParamsRef.current);
  }, [doFetch]);

  const handleProviderChange = useCallback((newProvider: string | null) => {
    setProvider(newProvider);
    fetchParamsRef.current = { ...fetchParamsRef.current, provider: newProvider, offset: 0 };
    doFetch(true, fetchParamsRef.current);
  }, [doFetch]);

  const handleSort = useCallback((newSortBy: SortField, newSortDir: SortDir) => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    fetchParamsRef.current = { ...fetchParamsRef.current, sortBy: newSortBy, sortDir: newSortDir, offset: 0 };
    doFetch(true, fetchParamsRef.current);
  }, [doFetch]);

  const handleRetry = useCallback(() => {
    setError(null);
    doFetch(true, fetchParamsRef.current);
  }, [doFetch]);

  const hasMore = models.length < total;
  const isEmpty = !isFetching && !error && models.length === 0 && total === 0 && (query !== "" || provider !== null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 bg-gray-900 text-white px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ModelLens</h1>
            <p className="text-sm text-gray-400">LLM Model Database Browser</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ProviderFilter
              providers={providers}
              value={provider}
              onChange={handleProviderChange}
            />
            <SearchBox
              query={query}
              total={total}
              allCount={allCount}
              onSearch={handleSearch}
            />
          </div>
          <span className="whitespace-nowrap text-sm text-gray-600">
            Showing {total.toLocaleString()} of {allCount.toLocaleString()} models
          </span>
        </div>

        {error && (
          <Card className="mt-4 border-destructive bg-destructive/10">
            <CardContent className="flex items-center justify-between p-4">
              <span className="text-destructive">{error}</span>
              <Button variant="destructive" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {isEmpty && (
          <div className="mt-8 flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg">No models found</p>
          </div>
        )}

        <ModelTable
          models={models}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onRowClick={setSelectedModel}
        />

        {isFetching && (
          <div className="flex justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}

        {hasMore && !isFetching && <div ref={loadMoreRef} className="h-px" />}
      </main>

      {selectedModel && (
        <ModelDetail
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
}

export default App;
