// Aplica las preferencias guardadas (color, título) antes de renderizar la app
export default defineNuxtPlugin(() => {
  const { applyAll } = usePreferences()
  applyAll()
})
