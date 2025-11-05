// Integration with Gemini AI - using javascript_gemini blueprint
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PhysicsSolution {
  konu: string;
  istenilen: string;
  verilenler: string;
  cozum: string;
  sonuc: string;
  konuOzet: string;
}

export async function solvePhysicsProblem(parts: any[]): Promise<PhysicsSolution> {
  const systemPrompt = `
Sen TYT/AYT düzeyinde fizik öğretmenisin. Soruyu çözmeden önce Google Arama aracını kullanarak güvenilir kaynaklardan doğrula.
Cevabı JSON olarak ver: {"konu":"...", "istenilen":"...", "verilenler":"...", "cozum", "sonuc":"...", "konuOzet"}.

- konu: Sorunun ana konusu (örn: "Kinematik - Hız ve İvme")
- istenilen: Soruda ne isteniyor (kısa açıklama)
- verilenler: Soruda verilen bilgiler (liste halinde)
- cozum: Adım adım çözüm ve  olabildiğince %100 derecesinde doğru yapılarak (formüller ve açıklamalarla)
- sonuc: Nihai sonuç (sayısal değer ve birim)
- konuOzet:Sorunun ana konusuna ait konu özeti(öğrencinin anlayacağı düzeyde)

Tüm çıktı Türkçe olmalı. Matematiksel ifadeleri açıkça yaz.
  `.trim();

  const schema = {
    type: "object",
    properties: {
      konu: { type: "string", description: "Fizik konusu" },
      istenilen: { type: "string", description: "Soruda istenilen" },
      verilenler: { type: "string", description: "Verilen bilgiler" },
      cozum: { type: "string", description: "Adım adım çözüm" },
      sonuc: { type: "string", description: "Nihai sonuç" },
      konuOzet: { type: "string", description: "Soruya ait konu özeti" },
    },
    required: ["konu", "istenilen", "verilenler", "cozum", "sonuc", "konuOzet"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const rawJson = response.text;
    if (!rawJson) 
