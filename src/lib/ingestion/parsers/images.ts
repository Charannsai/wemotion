/**
 * Image Extraction
 *
 * Scans HTML for <img> tags, resolves their absolute URLs, and scores them
 * based on potential usefulness for a generated video.
 */
import type { ScrapedImage } from '../types';

export function extractImagesFromHtml(html: string, baseUrl: string): ScrapedImage[] {
  const images: ScrapedImage[] = [];
  
  // Naive regex matching for <img> tags
  const imgRegex = /<img[^>]+>/g;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];
    
    // Extract src
    const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) continue;
    let src = srcMatch[1];
    
    // Resolve absolute URL
    try {
      src = new URL(src, baseUrl).href;
    } catch {
      continue;
    }
    
    // Extract alt
    const altMatch = imgTag.match(/alt\s*=\s*["']([^"']+)["']/i);
    const alt = altMatch ? altMatch[1] : '';
    
    // Ignore tracking pixels or tiny icons
    if (src.includes('pixel') || src.includes('tracking')) continue;
    
    // Heuristic score: High if it has a good alt text, medium if it's large (width/height not accessible here so we guess based on path), low if it's likely an icon
    let score = 0.5;
    if (alt && alt.length > 10) score += 0.2;
    if (src.includes('logo') || src.includes('icon')) score -= 0.3;
    if (src.match(/\.(svg|gif)$/i)) score -= 0.2;
    if (src.match(/\.(jpg|jpeg|png|webp)$/i)) score += 0.1;
    
    images.push({
      src,
      alt,
      score: Math.max(0, Math.min(1, score))
    });
  }
  
  // Sort by highest score first
  return images.sort((a, b) => b.score - a.score);
}
