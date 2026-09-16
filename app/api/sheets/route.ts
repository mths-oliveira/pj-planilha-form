// app/api/sheets/route.ts
import { NextResponse } from "next/server";
import { ajustarLinhasPlanilha, salvarOrcamentoNaPlanilha } from "@/lib/sheets";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await salvarOrcamentoNaPlanilha(body);
    await salvarOrcamentoNaPlanilha(body);
    await ajustarLinhasPlanilha();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
