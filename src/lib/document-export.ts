import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } from "docx";
import pptxgen from "pptxgenjs";
import { saveAs } from "file-saver";

/* ─── Markdown Parser Helpers ─── */
interface ParsedBlock {
  type: "h1" | "h2" | "h3" | "p" | "ul" | "ol" | "hr" | "blockquote" | "table";
  content: string;
  items?: string[];
  rows?: string[][];
}

function parseMarkdownToBlocks(md: string): ParsedBlock[] {
  const lines = md.split("\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", content: cleanMd(line.slice(2)) });
    } else if (line.startsWith("## ")) {
      blocks.push({ type: "h2", content: cleanMd(line.slice(3)) });
    } else if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: cleanMd(line.slice(4)) });
    } else if (line.startsWith("---") || line.startsWith("***")) {
      blocks.push({ type: "hr", content: "" });
    } else if (line.startsWith("> ")) {
      blocks.push({ type: "blockquote", content: cleanMd(line.slice(2)) });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(cleanMd(lines[i].slice(2)));
        i++;
      }
      blocks.push({ type: "ul", content: "", items });
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(cleanMd(lines[i].replace(/^\d+\.\s/, "")));
        i++;
      }
      blocks.push({ type: "ol", content: "", items });
      continue;
    } else if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const row = lines[i].split("|").filter(c => c.trim() !== "").map(c => cleanMd(c.trim()));
        if (!row.every(c => /^[-:]+$/.test(c))) rows.push(row);
        i++;
      }
      blocks.push({ type: "table", content: "", rows });
      continue;
    } else if (line.trim()) {
      blocks.push({ type: "p", content: cleanMd(line) });
    }
    i++;
  }
  return blocks;
}

function cleanMd(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`(.*?)`/g, "$1").replace(/\[(.*?)\]\(.*?\)/g, "$1").trim();
}

/* ─── PDF Export ─── */
export async function exportToPdf(markdown: string, filename = "report") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const blocks = parseMarkdownToBlocks(markdown);
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = 25;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Title bar - DataAfro orange branding
  doc.setFillColor(234, 121, 21); // ~hsl(24 95% 53%)
  doc.rect(0, 0, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DataAfro", margin, 8);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString(), pageW - margin, 8, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y = 22;

  for (const block of blocks) {
    switch (block.type) {
      case "h1":
        checkPage(14);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(block.content, margin, y);
        y += 10;
        doc.setDrawColor(234, 121, 21);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 40, y);
        y += 6;
        break;
      case "h2":
        checkPage(12);
        doc.setFontSize(15);
        doc.setFont("helvetica", "bold");
        doc.text(block.content, margin, y);
        y += 9;
        break;
      case "h3":
        checkPage(10);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(block.content, margin, y);
        y += 8;
        break;
      case "p":
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(block.content, maxW);
        checkPage(lines.length * 5);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 3;
        break;
      case "ul":
      case "ol":
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        for (let j = 0; j < (block.items?.length || 0); j++) {
          const prefix = block.type === "ol" ? `${j + 1}. ` : "• ";
          const itemLines = doc.splitTextToSize(prefix + block.items![j], maxW - 5);
          checkPage(itemLines.length * 5);
          doc.text(itemLines, margin + 5, y);
          y += itemLines.length * 5 + 1;
        }
        y += 3;
        break;
      case "blockquote":
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setDrawColor(234, 121, 21);
        doc.setLineWidth(0.8);
        doc.line(margin, y - 3, margin, y + 4);
        const bqLines = doc.splitTextToSize(block.content, maxW - 8);
        checkPage(bqLines.length * 5);
        doc.text(bqLines, margin + 6, y);
        y += bqLines.length * 5 + 4;
        break;
      case "table":
        if (block.rows && block.rows.length > 0) {
          const cols = block.rows[0].length;
          const colW = maxW / cols;
          doc.setFontSize(9);
          for (let r = 0; r < block.rows.length; r++) {
            checkPage(8);
            for (let c = 0; c < block.rows[r].length; c++) {
              if (r === 0) {
                doc.setFont("helvetica", "bold");
                doc.setFillColor(240, 240, 245);
                doc.rect(margin + c * colW, y - 4, colW, 7, "F");
              } else {
                doc.setFont("helvetica", "normal");
              }
              doc.text(block.rows[r][c] || "", margin + c * colW + 2, y);
            }
            y += 7;
          }
          y += 4;
        }
        break;
      case "hr":
        checkPage(6);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 6;
        break;
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, doc.internal.pageSize.getHeight() - 8, { align: "right" });
    doc.text(`Generated by DataAfro · ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`${filename}.pdf`);
}

/* ─── DOCX Export ─── */
export async function exportToDocx(markdown: string, filename = "report") {
  const blocks = parseMarkdownToBlocks(markdown);
  const children: Paragraph[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "h1":
        children.push(new Paragraph({
          text: block.content,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "EA7915" } },
        }));
        break;
      case "h2":
        children.push(new Paragraph({
          text: block.content,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        }));
        break;
      case "h3":
        children.push(new Paragraph({
          text: block.content,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }));
        break;
      case "p":
        children.push(new Paragraph({
          children: parseBoldItalic(block.content),
          spacing: { after: 120 },
        }));
        break;
      case "ul":
        block.items?.forEach(item => {
          children.push(new Paragraph({
            children: parseBoldItalic(item),
            bullet: { level: 0 },
            spacing: { after: 60 },
          }));
        });
        break;
      case "ol":
        block.items?.forEach((item, idx) => {
          children.push(new Paragraph({
            children: [new TextRun({ text: `${idx + 1}. ` }), ...parseBoldItalic(item)],
            spacing: { after: 60 },
          }));
        });
        break;
      case "blockquote":
        children.push(new Paragraph({
          children: [new TextRun({ text: block.content, italics: true, color: "666666" })],
          indent: { left: 720 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: "EA7915" } },
          spacing: { before: 100, after: 100 },
        }));
        break;
      case "table":
        if (block.rows && block.rows.length > 0) {
          const table = new Table({
            rows: block.rows.map((row, rIdx) => new TableRow({
              children: row.map(cell => new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: cell, bold: rIdx === 0, size: 20 })],
                })],
                width: { size: Math.floor(9000 / row.length), type: WidthType.DXA },
                shading: rIdx === 0 ? { fill: "FFF3E0" } : undefined,
              })),
            })),
          });
          children.push(new Paragraph({ spacing: { before: 100 } }));
          // @ts-ignore - docx accepts table in doc sections
          children.push(table as any);
          children.push(new Paragraph({ spacing: { after: 100 } }));
        }
        break;
      case "hr":
        children.push(new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
          spacing: { before: 200, after: 200 },
        }));
        break;
    }
  }

  // Add footer paragraph
  children.push(new Paragraph({ spacing: { before: 600 } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: `Generated by DataAfro · ${new Date().toLocaleDateString()}`, size: 16, color: "999999", italics: true })],
    alignment: AlignmentType.CENTER,
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

function parseBoldItalic(text: string): TextRun[] {
  // Simple bold/italic parser
  const runs: TextRun[] = [];
  const regex = /\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|([^*`]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) runs.push(new TextRun({ text: match[1], bold: true }));
    else if (match[2]) runs.push(new TextRun({ text: match[2], italics: true }));
    else if (match[3]) runs.push(new TextRun({ text: match[3], font: "Courier New", size: 20 }));
    else if (match[4]) runs.push(new TextRun({ text: match[4] }));
  }
  if (runs.length === 0) runs.push(new TextRun({ text }));
  return runs;
}

/* ─── PPTX Export ─── */
export async function exportToPptx(markdown: string, filename = "report") {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "DataAfro";

  // Define master slide
  pres.defineSlideMaster({
    title: "DATAAFRO",
    background: { color: "FFFFFF" },
    objects: [
      { rect: { x: 0, y: 0, w: "100%", h: 0.5, fill: { color: "EA7915" } } },
      { text: { text: "DataAfro", options: { x: 0.5, y: 0.05, w: 3, h: 0.4, color: "FFFFFF", fontSize: 12, fontFace: "Arial", bold: true } } },
      { text: { text: `${new Date().toLocaleDateString()}`, options: { x: 10, y: 0.05, w: 3, h: 0.4, color: "FFF3E0", fontSize: 9, align: "right", fontFace: "Arial" } } },
    ],
  });

  const blocks = parseMarkdownToBlocks(markdown);
  
  // Title slide
  const titleSlide = pres.addSlide({ masterName: "DATAAFRO" });
  const titleBlock = blocks.find(b => b.type === "h1");
  titleSlide.addShape(pres.ShapeType.rect, { x: 0, y: 1.5, w: "100%", h: 3, fill: { color: "1E40AF" } });
  titleSlide.addText(titleBlock?.content || "Project Report", { x: 1, y: 2, w: 11, h: 1.5, color: "FFFFFF", fontSize: 36, bold: true, fontFace: "Arial" });
  titleSlide.addText("Generated by DataAfro AI", { x: 1, y: 3.5, w: 11, h: 0.8, color: "CCCCFF", fontSize: 16, fontFace: "Arial" });

  // Content slides - group by h2 sections
  let currentSlide: pptxgen.Slide | null = null;
  let yPos = 1.0;
  const slideMaxY = 6.8;

  for (const block of blocks) {
    if (block.type === "h1") continue; // already used in title

    if (block.type === "h2" || !currentSlide || yPos > slideMaxY) {
      currentSlide = pres.addSlide({ masterName: "DATAAFRO" });
      yPos = 0.8;
      if (block.type === "h2") {
        currentSlide.addText(block.content, { x: 0.5, y: yPos, w: 12, h: 0.6, fontSize: 24, bold: true, color: "1E40AF", fontFace: "Arial" });
        currentSlide.addShape(pres.ShapeType.line, { x: 0.5, y: yPos + 0.65, w: 3, h: 0, line: { color: "1E40AF", width: 2 } });
        yPos += 1.0;
        continue;
      }
    }

    switch (block.type) {
      case "h3":
        if (yPos + 0.5 > slideMaxY) { currentSlide = pres.addSlide({ masterName: "DATAAFRO" }); yPos = 0.8; }
        currentSlide.addText(block.content, { x: 0.5, y: yPos, w: 12, h: 0.5, fontSize: 18, bold: true, color: "333333", fontFace: "Arial" });
        yPos += 0.6;
        break;
      case "p":
        if (yPos + 0.5 > slideMaxY) { currentSlide = pres.addSlide({ masterName: "DATAAFRO" }); yPos = 0.8; }
        const lines = Math.ceil(block.content.length / 100);
        const height = Math.max(0.4, lines * 0.3);
        currentSlide.addText(block.content, { x: 0.5, y: yPos, w: 12, h: height, fontSize: 14, color: "444444", fontFace: "Arial", lineSpacingMultiple: 1.2 });
        yPos += height + 0.15;
        break;
      case "ul":
      case "ol":
        block.items?.forEach((item, idx) => {
          if (yPos + 0.35 > slideMaxY) { currentSlide = pres.addSlide({ masterName: "DATAAFRO" }); yPos = 0.8; }
          const bullet = block.type === "ol" ? `${idx + 1}. ` : "• ";
          currentSlide!.addText(bullet + item, { x: 0.8, y: yPos, w: 11.5, h: 0.35, fontSize: 13, color: "444444", fontFace: "Arial" });
          yPos += 0.35;
        });
        yPos += 0.15;
        break;
      case "blockquote":
        if (yPos + 0.6 > slideMaxY) { currentSlide = pres.addSlide({ masterName: "DATAAFRO" }); yPos = 0.8; }
        currentSlide.addShape(pres.ShapeType.rect, { x: 0.5, y: yPos, w: 12, h: 0.5, fill: { color: "E8EAF6" }, rectRadius: 0.05 });
        currentSlide.addText(block.content, { x: 0.8, y: yPos + 0.05, w: 11.5, h: 0.4, fontSize: 12, italic: true, color: "555555", fontFace: "Arial" });
        yPos += 0.65;
        break;
      case "table":
        if (block.rows && block.rows.length > 0) {
          if (yPos + block.rows.length * 0.35 > slideMaxY) { currentSlide = pres.addSlide({ masterName: "DATAAFRO" }); yPos = 0.8; }
          const tableRows: pptxgen.TableRow[] = block.rows.map((row, rIdx) =>
            row.map(cell => ({
              text: cell,
              options: {
                fontSize: 11,
                bold: rIdx === 0,
                color: rIdx === 0 ? "FFFFFF" : "333333",
                fill: { color: rIdx === 0 ? "1E40AF" : rIdx % 2 === 0 ? "F5F5F5" : "FFFFFF" },
                border: [{ type: "solid" as const, pt: 0.5, color: "CCCCCC" }, { type: "solid" as const, pt: 0.5, color: "CCCCCC" }, { type: "solid" as const, pt: 0.5, color: "CCCCCC" }, { type: "solid" as const, pt: 0.5, color: "CCCCCC" }],
                fontFace: "Arial",
              },
            }))
          );
          currentSlide.addTable(tableRows, { x: 0.5, y: yPos, w: 12, colW: Array(block.rows[0].length).fill(12 / block.rows[0].length) });
          yPos += block.rows.length * 0.35 + 0.3;
        }
        break;
    }
  }

  await pres.writeFile({ fileName: `${filename}.pptx` });
}
