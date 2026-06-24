import { PedidoForm } from "@/components/forms/PedidoForm";
import { getClientes, getProdutos, getRepresentantes } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const clientes = await getClientes();
  const representantes = await getRepresentantes();
  const produtos = await getProdutos();

  return (
    <main>
      <PedidoForm
        clientes={clientes}
        representantes={representantes}
        produtos={produtos}
      />
    </main>
  );
}
