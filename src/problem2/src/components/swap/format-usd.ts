// Keep extra decimal places for tiny USD values so they do not display as $0.00.
export const formatUsd = (value: string | number) => {
  if (Number(value) > 0 && Number(value) < 0.00000001) return '< $0.00000001'
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number(value) > 0 && Number(value) < 0.01 ? 8 : 2,
  })
}
