import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content/products');

export interface ProductData {
  id: string;
  title: string;
  category: string;
  date: string;
  image?: string;
  status?: string;
  contentHtml: string;
}

export async function getSortedProductsData(): Promise<ProductData[]> {
  // Check if directory exists
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  // Get file names under /content/products
  const fileNames = fs.readdirSync(contentDirectory);
  const allProductsData = await Promise.all(
    fileNames.map(async (fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Use remark to convert markdown into HTML string
      const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
      const contentHtml = processedContent.toString();

      // Combine the data with the id and contentHtml
      return {
        id,
        contentHtml,
        status: matterResult.data.status || null,
        ...(matterResult.data as { date: string; title: string; category: string; image?: string }),
      };
    })
  );

  // Sort products by date
  return allProductsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}
