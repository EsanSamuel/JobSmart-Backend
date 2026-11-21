import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

export async function CVParser(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
      .promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n\n";
    }

    return text.trim();
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}
