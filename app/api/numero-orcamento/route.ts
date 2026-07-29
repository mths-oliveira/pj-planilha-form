import { atualizarNumeroDoOrcamento } from "@/lib/sheets";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { numero } = await request.json();
    await atualizarNumeroDoOrcamento(numero);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
