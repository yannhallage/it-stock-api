export const assetSelect = {
  id: true,
  inventoryNumber: true,
  serialNumber: true,
  model: true,
  status: true,
  brand: { select: { id: true, name: true } },
  materialType: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
} as const;
