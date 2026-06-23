// app/api/sheets/route.ts
import { NextResponse } from "next/server";
import { salvarOrcamentoNaPlanilha } from "@/lib/sheets";

export async function POST(request: Request) {
  const body = await request.json();

  salvarOrcamentoNaPlanilha(body);

  return NextResponse.json({ success: true });
}
