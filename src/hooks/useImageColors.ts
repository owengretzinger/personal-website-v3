import { useState, useEffect } from "react";
import { boostColor } from "@/utils/colors";

// Extract multiple vibrant colors from image
const extractColorsFromImage = (imageSrc: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(["#888888", "#666666"]);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Collect vibrant colors
      const colorCandidates: Array<{
        r: number;
        g: number;
        b: number;
        saturation: number;
        brightness: number;
      }> = [];

      for (let i = 0; i < data.length; i += 40) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const brightness = max / 255;

        if (saturation > 0.3 && brightness > 0.2) {
          colorCandidates.push({ r, g, b, saturation, brightness });
        }
      }

      // Sort by saturation and pick top 2-3 diverse colors
      colorCandidates.sort((a, b) => b.saturation - a.saturation);

      const selectedColors: string[] = [];
      for (const candidate of colorCandidates) {
        if (selectedColors.length >= 3) break;

        // Check if this color is different enough from already selected
        const isDifferent =
          selectedColors.length === 0 ||
          selectedColors.every((hex) => {
            const existing = parseInt(hex.slice(1), 16);
            const er = (existing >> 16) & 255;
            const eg = (existing >> 8) & 255;
            const eb = existing & 255;
            const diff =
              Math.abs(er - candidate.r) +
              Math.abs(eg - candidate.g) +
              Math.abs(eb - candidate.b);
            return diff > 100; // Colors should be significantly different
          });

        if (isDifferent) {
          const boosted = boostColor(candidate.r, candidate.g, candidate.b);
          const hex = `#${boosted.r.toString(16).padStart(2, "0")}${boosted.g
            .toString(16)
            .padStart(2, "0")}${boosted.b.toString(16).padStart(2, "0")}`;
          selectedColors.push(hex);
        }
      }

      if (selectedColors.length < 2) {
        selectedColors.push("#888888", "#666666");
      }

      resolve(selectedColors.slice(0, 3));
    };

    img.onerror = () => resolve(["#888888", "#666666"]);
  });
};

export const useImageColors = (images: Array<{ name: string; src: string }>) => {
  const [colors, setColors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const extractColors = async () => {
      const colorMap: Record<string, string[]> = {};

      for (const { name, src } of images) {
        try {
          const colorArray = await extractColorsFromImage(src);
          colorMap[name] = colorArray;
        } catch (error) {
          console.error(`Error extracting color from ${name}:`, error);
        }
      }

      setColors(colorMap);
    };

    extractColors();
  }, [images]);

  return colors;
};
