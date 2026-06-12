export function slugifyTag(tag: string): string {
  if (!tag) return '';
  
  const trimmed = tag.trim().toLowerCase();
  
  // 对整个字符串做特殊替换，避免 "C# Dev" 等被拆散
  let slug = trimmed
    .replace(/\s*\+\+\s*/g, 'pp')
    .replace(/\s*\+\s*/g, 'plus')
    .replace(/\s*#\s*/g, 'sharp')
    .replace(/\.net/g, 'dotnet')
    .replace(/ui\s*\/\s*ux/g, 'ui-ux');
  
  // 精确匹配映射（优先于通用替换，但通用替换已经覆盖）
  const specialMappings: Record<string, string> = {
    'c++': 'cpp',
    'c#': 'csharp',
    'f#': 'fsharp',
    '.net': 'dotnet',
    'ui/ux': 'ui-ux'
  };

  if (specialMappings[slug]) {
    return specialMappings[slug];
  }

  return slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5\-]/g, '');
}