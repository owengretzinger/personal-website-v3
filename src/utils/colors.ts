// Generate gradient CSS for hover effects
export const generateGradient = (colors: string[]) => {
  if (!colors || colors.length === 0) return "";
  if (colors.length === 1) {
    return `radial-gradient(circle at 30% -50%, ${colors[0]}40, transparent 60%)`;
  }
  if (colors.length === 2) {
    return `radial-gradient(circle at 20% -60%, ${colors[0]}40, transparent 60%), radial-gradient(circle at 80% 160%, ${colors[1]}35, transparent 60%)`;
  }
  return `radial-gradient(circle at 15% -70%, ${colors[0]}40, transparent 60%), radial-gradient(circle at 50% 50%, ${colors[1]}30, transparent 70%), radial-gradient(circle at 85% 170%, ${colors[2]}30, transparent 60%)`;
};
