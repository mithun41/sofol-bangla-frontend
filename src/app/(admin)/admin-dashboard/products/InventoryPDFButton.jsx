"use client";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InventoryPDFButton({ products = [], filterStatus = "all" }) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!products.length) return;
    setGenerating(true);

    try {
      const doc  = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const now   = new Date();
      const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

      // ── Header ──────────────────────────────────────────────────────────────
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SOFOL BANGLA", 14, 10);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Inventory Report", 14, 16);
      doc.text(`Generated: ${dateStr} ${timeStr}`, pageW - 14, 16, { align: "right" });

      // ── Summary Cards ────────────────────────────────────────────────────────
      const totalProducts = products.length;
      const totalStock    = products.reduce((s, p) => s + Number(p.stock ?? 0), 0);
      const outOfStock    = products.filter((p) => Number(p.stock ?? 0) <= 0).length;
      const lowStock      = products.filter((p) => Number(p.stock ?? 0) > 0 && Number(p.stock ?? 0) < 5).length;
      const totalValue    = products.reduce((s, p) => s + Number(p.price ?? 0) * Number(p.stock ?? 0), 0);

      const summaryY = 28;
      const cards = [
        { label: "Total Products",  value: totalProducts,                        color: [59, 130, 246] },
        { label: "Total Units",     value: totalStock.toLocaleString(),          color: [16, 185, 129] },
        { label: "Out of Stock",    value: outOfStock,                           color: [239, 68,  68] },
        { label: "Low Stock (<5)",  value: lowStock,                             color: [245, 158, 11] },
        { label: "Inventory Value", value: `BDT ${totalValue.toLocaleString()}`, color: [139, 92, 246] },
      ];

      const cardW = (pageW - 28) / cards.length;
      cards.forEach((card, i) => {
        const x = 14 + i * (cardW + 2);
        doc.setFillColor(...card.color);
        doc.roundedRect(x, summaryY, cardW, 14, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.text(card.label, x + cardW / 2, summaryY + 5, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(String(card.value), x + cardW / 2, summaryY + 11, { align: "center" });
      });

      // ── Table ────────────────────────────────────────────────────────────────
      const tableData = products.map((p, idx) => {
        const stock    = Number(p.stock ?? 0);
        const price    = Number(p.price ?? 0);
        const stockVal = price * stock;

        return [
          idx + 1,
          p.name || "—",
          p.category_name || "General",
          stock,
          `BDT ${price.toLocaleString()}`,
          `BDT ${stockVal.toLocaleString()}`,
        ];
      });

      autoTable(doc, {
        startY: summaryY + 20,
        head: [["#", "Product Name", "Category", "Qty", "Unit Price", "Stock Value"]],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          font: "helvetica",
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 12,  halign: "center" },
          1: { cellWidth: 110 },
          2: { cellWidth: 50  },
          3: { cellWidth: 20,  halign: "center" },
          4: { cellWidth: 35,  halign: "right"  },
          5: { cellWidth: 40,  halign: "right"  },
        },
        // Qty কম হলে row টা হালকা লাল করবে
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            const qty = Number(data.cell.raw);
            if (qty <= 0) {
              data.cell.styles.textColor  = [220, 38, 38];
              data.cell.styles.fontStyle  = "bold";
            } else if (qty < 5) {
              data.cell.styles.textColor  = [180, 83, 9];
              data.cell.styles.fontStyle  = "bold";
            }
          }
        },
        foot: [[
          "", "TOTAL", "",
          totalStock.toLocaleString(),
          "",
          `BDT ${totalValue.toLocaleString()}`,
        ]],
        footStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
      });

      // ── Page footer ──────────────────────────────────────────────────────────
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const y = doc.internal.pageSize.getHeight() - 6;
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "normal");
        doc.text("Sofol Bangla — Inventory Report", 14, y);
        doc.text(`Page ${i} of ${pageCount}`, pageW - 14, y, { align: "right" });
      }

      doc.save(`inventory_${now.toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating || !products.length}
      className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed"
    >
      {generating ? (
        <><Loader2 size={16} className="animate-spin" /> Generating...</>
      ) : (
        <><FileDown size={16} /> Export PDF</>
      )}
    </button>
  );
}