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

  return {
    getByRange,
  };
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
  const abaNome = "ORÇAMENTO";
  const spreadsheetId = "1WkelL4E6XpOzxgvEIMTPwRJTCqsh7TwW5drjSsYwO3o";

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // 2. Preparar os dados dos produtos (A13:C22)
  // Criamos uma matriz de 10 linhas vazias inicialmente
  const linhasProdutos = Array.from({ length: 10 }, () => ["", "", ""]);

  // Preenchemos com os produtos recebidos (limitado a 10 para não estourar o layout A13:A22)
  orcamento.produtos.slice(0, 10).forEach((produto, index) => {
    linhasProdutos[index][0] = produto.ref || ""; // Coluna A (Código)
    // Se precisar da descrição na coluna B, adicione aqui. Ex: linhasProdutos[index][1] = produto.nome || "";
    linhasProdutos[index][2] = String(produto.quantidade || 1); // Coluna C (Quantidade)
  });

  // 3. Mapear cada dado para sua respectiva célula/intervalo
  // O formato do range deve ser: "NomeDaAba!Celula"
  const data = [
    { range: `${abaNome}!E5`, values: [[orcamento.data]] },
    { range: `${abaNome}!E6`, values: [[orcamento.numeroDoOrcamento]] },
    {
      range: `${abaNome}!E7`,
      values: [[orcamento.cliente?.id || orcamento.cliente]],
    }, // Ajuste conforme a estrutura do seu objeto Cliente
    {
      range: `${abaNome}!E8`,
      values: [[orcamento.representante?.id || orcamento.representante]],
    },

    // Bloco de produtos (Atualiza de A13 até C22 de uma vez só)
    { range: `${abaNome}!A13:C22`, values: linhasProdutos },

    { range: `${abaNome}!B25`, values: [[orcamento.prazos]] },
    { range: `${abaNome}!B26`, values: [[orcamento.vencimentos]] }, // Vencimentos (caso mude dinamicamente, insira aqui)
    { range: `${abaNome}!B28`, values: [[orcamento.formaDePagamento]] },
    { range: `${abaNome}!E26`, values: [[orcamento.numeroDeParcelas]] },
    { range: `${abaNome}!E27`, values: [[orcamento.taxaDeFrente]] }, // Nota: Verifique se o nome na interface é taxaDeFrente ou taxaDeFrete
    { range: `${abaNome}!E28`, values: [[orcamento.outrasDespesas]] },
  ];

  console.log({ data, orcamento });

  try {
    // 4. Executar a atualização em lote (batchUpdate)
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED", // Permite que o Google Planilhas interprete números e datas corretamente
        data: data,
      },
    });

    console.log("Orçamento salvo na planilha com sucesso!");
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar orçamento na planilha:", error);
    throw error;
  }
}
