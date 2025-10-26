import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import logger from "../utils/logger";

export async function CVParser(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
      .promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      logger.info(`Parsing pdf page ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n\n";
    }

    return text.trim();
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}
