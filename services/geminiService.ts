
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialInsights = async (transactions: Transaction[]) => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const dataSummary = transactions.map(t => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    // Fixed: Property 'fundCategory' does not exist on type 'Transaction'. Changed to 'fundId' which is available in the interface.
    fund: t.fundId,
    category: t.category,
    description: t.description
  }));

  const prompt = `
    Analisis data kas kelas yang terbagi menjadi "Kas Anak" dan "Kas Perpisahan".
    Aturan sistem kami: Iuran bulanan otomatis dibagi 50/50 ke kedua kas tersebut.
    Berikan:
    1. Evaluasi saldo Kas Anak (operasional) vs Kas Perpisahan (tabungan acara).
    2. Rekomendasi apakah dana Perpisahan sudah cukup untuk target acara akhir tahun.
    3. 3 tips hemat untuk belanja perlengkapan kelas.
    4. Pesan semangat untuk bendahara.

    Data Transaksi:
    ${JSON.stringify(dataSummary)}

    Gunakan Bahasa Indonesia yang gaul tapi sopan. Gunakan Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah pakar keuangan kelas yang cerdas dan suportif.",
        temperature: 0.7,
      },
    });

    // The .text property returns the generated string directly. Do not call as a function.
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, AI sedang beristirahat. Coba lagi nanti ya!";
  }
};