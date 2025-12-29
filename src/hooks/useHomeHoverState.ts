import { useRef, useCallback, useMemo } from "react";
import { useMobileCenterHover } from "./useMobileCenterHover";

export const useHomeHoverState = (
  previousExpCount: number,
  displayedProjectCount: number
) => {
  // Refs for all hoverable items
  // Index layout: [currentExp, ...previousExp, ...projects]
  const currentExpRef = useRef<HTMLDivElement | null>(null);
  const previousExpRefs = useRef<(HTMLLIElement | null)[]>([]);
  const projectRefs = useRef<(HTMLLIElement | null)[]>([]);

  const getItems = useCallback((): (HTMLElement | null)[] => {
    // Ensure previousExpRefs has correct length even when collapsed
    // This keeps index positions consistent with previousExpCount
    const prevRefs: (HTMLLIElement | null)[] = [];
    for (let i = 0; i < previousExpCount; i++) {
      prevRefs.push(previousExpRefs.current[i] ?? null);
    }
    return [
      currentExpRef.current,
      ...prevRefs,
      ...projectRefs.current,
    ];
  }, [previousExpCount]);

  const isWorkItem = useCallback((el: HTMLElement) => {
    if (el === currentExpRef.current) return true;
    if (previousExpRefs.current.includes(el as HTMLLIElement)) return true;
    return false;
  }, []);

  const activeIndex = useMobileCenterHover(getItems, isWorkItem);

  // Compute which item is active from index
  const { isCurrentExpActive, previousExpActiveIndex, projectActiveIndex } = useMemo(() => {
    if (activeIndex === null) {
      return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: null };
    }

    if (activeIndex === 0) {
      return { isCurrentExpActive: true, previousExpActiveIndex: null, projectActiveIndex: null };
    }

    if (activeIndex <= previousExpCount) {
      return { isCurrentExpActive: false, previousExpActiveIndex: activeIndex - 1, projectActiveIndex: null };
    }

    const projIndex = activeIndex - 1 - previousExpCount;
    if (projIndex < displayedProjectCount) {
      return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: projIndex };
    }

    return { isCurrentExpActive: false, previousExpActiveIndex: null, projectActiveIndex: null };
  }, [activeIndex, previousExpCount, displayedProjectCount]);

  return {
    currentExpRef,
    previousExpRefs,
    projectRefs,
    isCurrentExpActive,
    previousExpActiveIndex,
    projectActiveIndex,
  };
};
