// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s, l };
};

// Convert HSL to RGB
export const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Adjust color for gradient
export const boostColor = (r: number, g: number, b: number) => {
  const { h, s } = rgbToHsl(r, g, b);
  // Reduce saturation for more subtle gradients, fixed lightness for consistency
  const adjustedS = Math.min(0.5, s * 0.6);
  const adjustedL = 0.55;
  return hslToRgb(h, adjustedS, adjustedL);
};

// Generate gradient CSS for hover effects
export const generateGradient = (colors: string[]) => {
  if (colors.length === 0) return "";
  if (colors.length === 1) {
    return `radial-gradient(circle at 30% -50%, ${colors[0]}40, transparent 60%)`;
  }
  if (colors.length === 2) {
    return `radial-gradient(circle at 20% -60%, ${colors[0]}40, transparent 60%), radial-gradient(circle at 80% 160%, ${colors[1]}35, transparent 60%)`;
  }
  return `radial-gradient(circle at 15% -70%, ${colors[0]}40, transparent 60%), radial-gradient(circle at 50% 50%, ${colors[1]}30, transparent 70%), radial-gradient(circle at 85% 170%, ${colors[2]}30, transparent 60%)`;
};
