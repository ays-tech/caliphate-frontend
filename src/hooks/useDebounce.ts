import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of no changes. Use this to avoid firing
 * API calls on every keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(search, 350);
 * useEffect(() => { fetchBooks(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
