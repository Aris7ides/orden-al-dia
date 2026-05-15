const STORAGE_KEY = 'app:preferences'

const COLORES_DISPONIBLES = [
  { label: 'Púrpura', value: 'purple' },
  { label: 'Azul', value: 'blue' },
  { label: 'Índigo', value: 'indigo' },
  { label: 'Violeta', value: 'violet' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Rojo', value: 'red' },
  { label: 'Naranja', value: 'orange' },
  { label: 'Ámbar', value: 'amber' },
  { label: 'Verde', value: 'green' },
  { label: 'Esmeralda', value: 'emerald' },
  { label: 'Cian', value: 'cyan' },
  { label: 'Cielo', value: 'sky' },
]

interface Preferences {
  color: string
  appTitle: string
}

function loadFromStorage(): Preferences {
  if (!import.meta.client) return { color: 'purple', appTitle: 'ORDEN AL DÍA' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { color: 'purple', appTitle: 'ORDEN AL DÍA', ...JSON.parse(raw) }
  } catch {}
  return { color: 'purple', appTitle: 'ORDEN AL DÍA' }
}

export const usePreferences = () => {
  const appConfig = useAppConfig()

  const color = useState<string>('prefs:color', () => loadFromStorage().color)
  const appTitle = useState<string>('prefs:title', () => loadFromStorage().appTitle)

  function applyColor(val: string) {
    color.value = val
    appConfig.ui.colors.primary = val
    persist()
  }

  function applyTitle(val: string) {
    appTitle.value = val
    persist()
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ color: color.value, appTitle: appTitle.value }))
  }

  function applyAll() {
    if (!import.meta.client) return
    const prefs = loadFromStorage()
    color.value = prefs.color
    appTitle.value = prefs.appTitle
    appConfig.ui.colors.primary = prefs.color
  }

  return {
    color,
    appTitle,
    colores: COLORES_DISPONIBLES,
    applyColor,
    applyTitle,
    applyAll,
  }
}
