import { PedidoForm } from "@/components/forms/PedidoForm";
import {
  getClientes,
  getNumeroDoOrcamento,
  getProdutos,
  getRepresentantes,
} from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 60; // revalida a cada 60 segundos em vez de toda requisição
export default async function Home() {
  const [clientes, representantes, produtos, numeroDoOrcamento] =
    await Promise.all([
      getClientes(),
      getRepresentantes(),
      getProdutos(),
      getNumeroDoOrcamento(),
    ]);

  return (
    <PedidoForm
      clientes={clientes}
      representantes={representantes}
      produtos={produtos}
      numeroDoOrcamento={numeroDoOrcamento}
    />
  );
}
