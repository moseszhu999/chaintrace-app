import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

function toCamel(row: Record<string, unknown>) {
  return {
    id: row.id,
    proofMode: row.proof_mode,
    proofType: row.proof_type,
    title: row.title,
    businessName: row.business_name,
    batchId: row.batch_id,
    fileName: row.file_name,
    fileHash: row.file_hash,
    note: row.note,
    walletAddress: row.wallet_address,
    chainId: row.chain_id,
    contractAddress: row.contract_address,
    transactionHash: row.transaction_hash,
    onchainProofId: row.onchain_proof_id,
    demoUrl: row.demo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sql = getSql();

    if (!body.proofMode || !body.proofType || !body.title || !body.businessName || !body.batchId || !body.fileName || !body.fileHash) {
      return NextResponse.json({ error: "Missing required proof fields." }, { status: 400 });
    }

    const rows = await sql`
      insert into proofs (
        proof_mode,
        proof_type,
        title,
        business_name,
        batch_id,
        file_name,
        file_hash,
        note,
        wallet_address,
        chain_id,
        contract_address,
        transaction_hash,
        onchain_proof_id,
        demo_url
      ) values (
        ${body.proofMode},
        ${body.proofType},
        ${body.title},
        ${body.businessName},
        ${body.batchId},
        ${body.fileName},
        ${body.fileHash},
        ${body.note ?? null},
        ${body.walletAddress ?? null},
        ${body.chainId ?? null},
        ${body.contractAddress ?? null},
        ${body.transactionHash ?? null},
        ${body.onchainProofId ?? null},
        ${body.demoUrl ?? null}
      )
      returning *;
    `;

    return NextResponse.json({ item: toCamel(rows[0]) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create proof." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");
    const businessName = searchParams.get("businessName");

    if (walletAddress) {
      const rows = await sql`
        select * from proofs
        where lower(wallet_address) = lower(${walletAddress})
        order by created_at desc
        limit 50;
      `;
      return NextResponse.json({ items: rows.map(toCamel) });
    }

    if (businessName) {
      const rows = await sql`
        select * from proofs
        where lower(business_name) = lower(${businessName})
        order by created_at desc
        limit 50;
      `;
      return NextResponse.json({ items: rows.map(toCamel) });
    }

    const rows = await sql`
      select * from proofs
      order by created_at desc
      limit 50;
    `;

    return NextResponse.json({ items: rows.map(toCamel) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list proofs." },
      { status: 500 }
    );
  }
}
