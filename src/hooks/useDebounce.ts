import { useMemo, useRef } from "react";

// oxlint-disable-next-line typescript/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  return useMemo(() => {
    return (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => callback(...args), delay);
    };
  }, [callback, delay]);
}
