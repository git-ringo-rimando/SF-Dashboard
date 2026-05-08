import { NextResponse } from "next/server";
import { loadCredentials, loadCache, loadTags } from "@/lib/store";

export async function GET() {
  const creds = loadCredentials();
  const hasCreds = !!creds;
  const cache = hasCreds ? loadCache() : null;
  const tags = hasCreds ? loadTags() : {};
  const username = creds?.username ?? null;
  return NextResponse.json(
    { hasCreds, cache, username, tags },
    { headers: { "Cache-Control": "no-store" } }
  );
}
