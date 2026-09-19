const EUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const EUR_SIGNED = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
})

export function formatMoney(amount: number): string {
  return EUR.format(amount)
}

export function formatSignedMoney(amount: number): string {
  return EUR_SIGNED.format(amount)
}
