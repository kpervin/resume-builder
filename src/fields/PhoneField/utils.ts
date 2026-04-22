export const formatPhoneNumber = (val: string) => {
  const [_, p1, p2, p3] = val.replace(/\D/g, "").match(/^(\d{0,3})(\d{0,3})(\d{0,4})/) || [];
  if (p3) return `(${p1}) ${p2}-${p3}`;
  if (p2) return `(${p1}) ${p2}`;
  return p1 ? `(${p1}` : "";
};
