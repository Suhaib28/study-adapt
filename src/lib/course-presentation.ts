export function courseAccent(course: string) {
  const palette = [
    "#b8cfa0",
    "#a5b8dc",
    "#d7b393",
    "#bca9d7",
    "#8fcac0",
    "#d49fae",
  ];
  const hash = Array.from(course).reduce(
    (sum, letter) => sum + letter.charCodeAt(0),
    0,
  );
  return palette[hash % palette.length];
}
