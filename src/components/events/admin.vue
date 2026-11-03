<template>
  <AdminShell
    title="Мероприятия"
    subtitle="Конвенты, встречи и фестивали: карточки, обзоры, покупки и фото"
    brand="Events Admin"
    icon="fas fa-calendar-check"
  >
    <EventsTab />
  </AdminShell>
</template>

<script setup>
import AdminShell from '@/components/admin/AdminShell.vue'
import EventsTab from '@/components/admin/EventsTab.vue'
</script>
