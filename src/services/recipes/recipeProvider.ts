import { Recipe, RecipeSearchParams } from "@/types/recipe";

// In-memory request cache with TTL (15 minutes)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const queryCache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = queryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    queryCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached<T>(key: string, data: T): void {
  // Cap cache size
  if (queryCache.size > 200) {
    const firstKey = queryCache.keys().next().value;
    if (firstKey) queryCache.delete(firstKey);
  }
  queryCache.set(key, { data, timestamp: Date.now() });
}

export interface IRecipeProvider {
  search(params: RecipeSearchParams): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | null>;
  getRandom(count?: number, tags?: string): Promise<Recipe[]>;
}
