const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v\.?|via)$/i;

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index > 0 && word.match(smallWords)) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
