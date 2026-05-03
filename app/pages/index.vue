<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'

const isMobile = ref(false)

onMounted(() => {
  const mq = window.matchMedia('(max-width: 768px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', (e) => { isMobile.value = e.matches })
})

const calendarOptions = computed(() => ({
  plugins: [
    interactionPlugin,
    timeGridPlugin,
    dayGridPlugin,
    listPlugin
  ],

  locale: esLocale,

  initialView: 'dayGridMonth',

  headerToolbar: isMobile.value
    ? { left: 'prev,next', center: 'title', right: 'today' }
    : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' },

  footerToolbar: isMobile.value
    ? { center: 'dayGridMonth,timeGridDay,listWeek' }
    : undefined,

  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista'
  },

  nowIndicator: true,
  selectable: true,
  editable: true,
  selectMirror: true,
  dayMaxEvents: true,
  height: 'auto',

  slotMinTime: '06:00:00',
  slotMaxTime: '22:00:00',

  select(info: any) {
    console.log('Seleccionado:', info.start, info.end)
  },

  eventClick(info: any) {
    console.log('Evento clickeado:', info.event)
  },

  eventDrop(info: any) {
    console.log('Evento movido:', info.event)
  },

  initialEvents: [
    {
      id: '1',
      title: 'Trabajo',
      start: new Date(),
      allDay: false
    }
  ]
}))
</script>

<template>
  <ClientOnly>
    <div class="rounded-xl shadow p-4">
      <FullCalendar :options="calendarOptions" />
    </div>
  </ClientOnly>
</template>