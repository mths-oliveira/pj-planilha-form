import { Cliente, DadosDoOrcamentoNoSistema, Representante } from "@/types";
import { Produto } from "@/types/produto";
import { google } from "googleapis";

function createGoogleClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  async function getByRange(range: string) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });
    return response.data.values ?? [];
  }

  async function setByRange(range: string, value: any) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[value]] },
    });
  }

  return { getByRange, setByRange };
}

export async function getClientes(): Promise<Cliente[]> {
  const client = createGoogleClient();
  const rows = await client.getByRange("CLIENTES!A2:I");
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0],
      nome: row[1],
      razaoSocial: row[2],
      cnpj: row[3],
      endereco: row[4],
      cep: row[5],
      contato: row[6],
      email: row[7],
      ultimaCompra: row[8],
    }));
}

export async function getRepresentantes(): Promise<Representante[]> {
  const client = createGoogleClient();
  const rows = await client.getByRange("REPRESENTANTES!A2:K");
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0],
      nome: row[1],
      cnpj: row[2],
      endereco: row[3],
      cep: row[4],
      contato: row[5],
      email: row[6],
      chavePix: row[7],
      banco: row[8],
      agencia: row[9],
      contaCorrente: row[10],
    }));
}

export async function getProdutos(): Promise<Produto[]> {
  const client = createGoogleClient();
  const rows = await client.getByRange("BASE_PRODUTOS!A2:C");
  const data = {} as any;
  for (let i = 0; i < rows.length; i++) {
    const ref = rows[i][0];
    const descricao = rows[i][1];
    const valorUnitario = rows[i][2];
    data[ref] = { ref, descricao, valorUnitario };
  }
  const produtos = [];
  for (const key in data) {
    produtos.push(data[key]);
  }
  return produtos;
}

export interface ProdutoSelecionado extends Produto {
  quantidade: number;
}

type DadosDoOrcamentoPlanilha = Omit<DadosDoOrcamentoNoSistema, "produtos"> & {
  produtos: ProdutoSelecionado[];
};

export async function salvarOrcamentoNaPlanilha(
  orcamento: DadosDoOrcamentoPlanilha,
) {
  const abaNome = "ORCAMENTO";
  const spreadsheetId = "1lX80EtT9R1iGA6FyNvlA5g1pCQs_LRc-Tg1W_4qr01A";

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const linhasProdutos = Array.from({ length: 120 }, () => ["", "", ""]);

  orcamento.produtos.slice(0, 120).forEach((produto, index) => {
    linhasProdutos[index][0] = produto.ref || "";
    linhasProdutos[index][2] = String(
      produto.quantidade > 0 ? produto.quantidade : 1,
    );
  });

  const data = [
    { range: `${abaNome}!E5`, values: [[orcamento.data]] },
    { range: `${abaNome}!E7`, values: [[orcamento.cliente?.id || ""]] },
    { range: `${abaNome}!E8`, values: [[orcamento.representante?.id || ""]] },

    { range: `${abaNome}!A13:C132`, values: linhasProdutos },

    { range: `${abaNome}!B135`, values: [[orcamento.numeroDeParcelas]] },
    { range: `${abaNome}!B136`, values: [[orcamento.prazos]] },
    { range: `${abaNome}!B137`, values: [[orcamento.vencimentos]] },
    { range: `${abaNome}!B139`, values: [[orcamento.formaDePagamento]] },
    {
      range: `${abaNome}!E136`,
      values: [[orcamento.desconto ? `${orcamento.desconto}%` : ""]],
    },
    { range: `${abaNome}!E138`, values: [[orcamento.taxaDeFrente]] },
    { range: `${abaNome}!E139`, values: [[orcamento.outrasDespesas]] },
  ];

  try {
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    });

    console.log("Orçamento salvo na planilha com sucesso!");
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar orçamento na planilha:", error);
    throw error;
  }
}

export async function ajustarLinhasPlanilha(): Promise<void> {
  await fetch(process.env.APPS_SCRIPT_URL!, { method: "POST" });
}

export async function getNumeroDoOrcamento(): Promise<number> {
  const client = createGoogleClient();
  const rows = await client.getByRange("'ORCAMENTO'!E6");
  return Number(rows[0]?.[0] || 1);
}

export async function atualizarNumeroDoOrcamento(
  numero: number,
): Promise<void> {
  const client = createGoogleClient();
  await client.setByRange("'ORCAMENTO'!E6", numero);
}
