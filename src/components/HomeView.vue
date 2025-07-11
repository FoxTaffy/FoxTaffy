<template>
  <div>
    <!-- Добавляем Font Awesome для иконок социальных сетей -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <div class="container">
      <!-- Подключаем компоненты -->
      <HeaderSection />
      <ReferenceSection />
      <BioSection />
      <FursuitSection />
      <PartnerSection />
      <EventsSection />
      <CommunitiesSection />
      
      <div class="footer">
        <p>© 2025 Fox Taffy | FoxTaffy.fun</p>
        <p>Сделано с <span class="heart">❤</span> для фурри-сообщества</p>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderSection from './Base/Header.vue'
import ReferenceSection from './Base/Reference.vue'
import BioSection from './Base/Bio.vue'
import FursuitSection from './Base/Fursuit.vue'
import PartnerSection from './Base/Felix.vue'
import EventsSection from './Base/Events.vue'
import CommunitiesSection from './Base/Communities.vue'

export default {
  name: 'HomeView',
  components: {
    HeaderSection,
    ReferenceSection,
    BioSection,
    FursuitSection,
    PartnerSection,
    EventsSection,
    CommunitiesSection
  }
}
</script>