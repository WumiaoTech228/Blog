export function getReadingTime(text: string): number {
  if (!text) return 0;
  
  // Strip markdown comments and frontmatter
  const cleanText = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^---[\s\S]*?---/, '');
    
  // Chinese chars (~300 chars/min) and English words (~200 words/min)
  const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;
    
  const totalMinutes = Math.ceil((englishWords / 200) + (chineseChars / 300));
  // For very short content (e.g. only numbers/symbols), return at least 1
  return totalMinutes > 0 ? totalMinutes : 1;
}