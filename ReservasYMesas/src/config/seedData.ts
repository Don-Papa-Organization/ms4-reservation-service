import { Mesa } from "../domain/models";

type MesaSeedItem = {
  tipo: "VIP" | "Salon" | "Barra" | "Varios";
  numero: number;
};

const MESA_SEED_PLAN: MesaSeedItem[] = [
  ...Array.from({ length: 4 }, (_, i) => ({ tipo: "VIP" as const, numero: i + 1 })),
  ...Array.from({ length: 6 }, (_, i) => ({ tipo: "Salon" as const, numero: i + 1 })),
  ...Array.from({ length: 6 }, (_, i) => ({ tipo: "Barra" as const, numero: i + 1 })),
  ...Array.from({ length: 2 }, (_, i) => ({ tipo: "Varios" as const, numero: i + 1 })),
];

export async function runMesaSeed(): Promise<void> {
  let creadas = 0;
  let existentes = 0;

  for (const mesaPlan of MESA_SEED_PLAN) {
    const mesaExistente = await Mesa.findOne({
      where: {
        tipo: mesaPlan.tipo,
        numero: mesaPlan.numero,
      },
    });

    if (mesaExistente) {
      existentes++;
      continue;
    }

    await Mesa.create({
      tipo: mesaPlan.tipo,
      numero: mesaPlan.numero,
      estado: "Disponible",
    } as any);

    creadas++;
  }

  console.log(`[SEED][MESAS] Creadas: ${creadas}, existentes: ${existentes}`);
}
