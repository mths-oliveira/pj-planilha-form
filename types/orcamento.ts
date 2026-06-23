import { Cliente } from "./cliente";
import { Produto } from "./produto";
import { Representante } from "./representante";

export interface DadosDoOrcamentoNoSistema {
  numeroDoOrcamento: number;
  data: string;
  cliente: Cliente;
  representante: Representante;
  produtos: Produto[];
  taxaDeFrente: number;
  outrasDespesas: number;
  numeroDeParcelas: number;
  prazos: string;
  formaDePagamento: string;
  vencimentos: string;
}

export interface DadosDoOrcamentoNaPlanilha {
  numeroDoOrcamento: string;
  dataDoOrcamento: string;
  nomeDoCliente: string;
  enderecoDoCliente: string;
  contatoDoCliente: string;
  emailDoCliente: string;
  nomeDoRepresentante: string;
  listaDeProdutos: string;
  prazoDePagamento: string;
  vencimentosDasParcelas: string;
  valorDasParcelas: string;
  formaDePagamento: string;
  totalDosProdutos: string;
  numeroDeParcelas: string;
  taxaDeFrente: string;
  outrasDespesas: string;
  totalAPagar: string;
}
