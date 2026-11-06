import { NextResponse } from "next/server";
import { menu } from "@/app/data/menu";

export function GET() {
  return NextResponse.json(menu);
}