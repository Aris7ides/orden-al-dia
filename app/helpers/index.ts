function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function formatMonto(n: number) {
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function duracionHoras(start: string, end: string) {
  const h = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`
}

export { formatFecha, formatMonto, toDatetimeLocal, duracionHoras }