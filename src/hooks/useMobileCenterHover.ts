import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Detects which item is closest to the center of the viewport on touch devices.
 * Handles edge cases where items can't physically reach center due to scroll limits.
 * Only activates on devices without hover capability.
 */
export function useMobileCenterHover(
  getItems: () => (HTMLElement | null)[],
  isWorkItem: (el: HTMLElement) => boolean
): number | null {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rafId = useRef<number | null>(null);
  const isTouchDevice = useRef<boolean | null>(null);

  const findClosestToCenter = useCallback(() => {
    // Lazy check for touch device
    if (isTouchDevice.current === null) {
      isTouchDevice.current = window.matchMedia("(hover: none)").matches;
    }
    if (!isTouchDevice.current) return;

    const items = getItems();
    if (!items || items.length === 0) return;

    const viewportHeight = window.innerHeight;
    // Work items target: 28% from top
    const workTargetY = viewportHeight * 0.28;
    // Project items target: 28% from bottom (72% from top)
    const projectTargetY = viewportHeight * 0.72;
    // Zone size: how close to target an item must be
    const zoneSize = viewportHeight * 0.1;

    // Find the item closest to its target zone
    let closestIndex: number | null = null;
    let closestDistance = Infinity;

    items.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Skip items not in viewport
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      const itemCenter = rect.top + rect.height / 2;
      const targetY = isWorkItem(el) ? workTargetY : projectTargetY;
      const distance = Math.abs(itemCenter - targetY);

      // Only consider items within their target zone
      if (distance < zoneSize && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, [getItems, isWorkItem]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if touch device
    const isTouch = window.matchMedia("(hover: none)").matches;
    isTouchDevice.current = isTouch;
    if (!isTouch) return;

    // Throttle with requestAnimationFrame
    const handleScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        findClosestToCenter();
        rafId.current = null;
      });
    };

    // Initial calculations to catch refs being populated
    const timeouts = [
      setTimeout(findClosestToCenter, 0),
      setTimeout(findClosestToCenter, 100),
    ];

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", findClosestToCenter);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", findClosestToCenter);
      timeouts.forEach(clearTimeout);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [findClosestToCenter]);

  return activeIndex;
}
