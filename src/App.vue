<template>
  <div id="app">
    <Analytics />
    <!-- Навигационная панель -->
    <nav class="navbar" :class="{ 'scrolled': isScrolled, 'mobile-open': isMobileMenuOpen }">
      <div class="nav-container">
        <!-- Логотип -->
        <router-link to="/" class="nav-logo" @click="closeMobileMenu">
          <div class="logo-avatar">
            <img src="https://plugjsubjcfblzkabjia.supabase.co/storage/v1/object/public/gallery//Avatar.jpg"
                 alt="Fox Taffy Avatar"
                 class="avatar-img">
            <div class="logo-status"></div>
          </div>
          <div class="logo-text">
            <h3>Fox Taffy</h3>
            <span>FoxTaffy.gay</span>
          </div>
        </router-link>

        <!-- Основное меню (десктоп) -->
        <div class="nav-menu">
          <!-- Якорные ссылки для секций главной страницы -->
          <a 
            v-for="section in mainSections" 
            :key="section.anchor"
            :href="section.anchor" 
            class="nav-link"
            :class="{ 'active': activeSection === section.anchor }"
            @click="scrollToSection(section.anchor, $event)"
          >
            <i :class="section.icon"></i>
            <span>{{ section.name }}</span>
            <div class="link-indicator"></div>
          </a>

          <!-- Выпадающее меню "Другое" -->
          <div class="dropdown" 
               :class="{ 'open': isDropdownOpen }" 
               @mouseenter="openDropdown" 
               @mouseleave="startCloseTimer">
            <button class="dropdown-toggle nav-link" :class="{ 'active': isOtherPageActive }">
              <i class="fas fa-ellipsis-h"></i>
              <span>Другое</span>
              <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotated': isDropdownOpen }"></i>
            </button>
            
            <div class="dropdown-menu" @mouseenter="cancelCloseTimer" @mouseleave="startCloseTimer">
              <router-link 
                v-for="page in otherPages" 
                :key="page.path"
                :to="page.path" 
                class="dropdown-item"
                @click="closeMobileMenu"
              >
                <i :class="page.icon"></i>
                <div class="dropdown-item-content">
                  <span class="dropdown-item-title">{{ page.name }}</span>
                  <span class="dropdown-item-description">{{ page.description }}</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Социальные сети -->
        <div class="nav-social">
          <a 
            v-for="social in socialLinks" 
            :key="social.name"
            :href="social.url" 
            target="_blank" 
            class="social-link"
            :title="social.name"
          >
            <i :class="social.icon"></i>
          </a>
        </div>

        <!-- Мобильное меню кнопка -->
        <button class="mobile-toggle" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Мобильное меню -->
      <div class="mobile-menu" :class="{ 'open': isMobileMenuOpen }">
        <div class="mobile-menu-content">
          <!-- Секции главной страницы -->
          <div class="mobile-section">
            <h4 class="mobile-section-title">Секции страницы</h4>
            <a 
              v-for="section in mainSections" 
              :key="section.anchor + '-mobile'"
              :href="section.anchor" 
              class="mobile-nav-link"
              @click="scrollToSection(section.anchor, $event, true)"
            >
              <i :class="section.icon"></i>
              <span>{{ section.name }}</span>
              <i class="fas fa-anchor"></i>
            </a>
          </div>

          <!-- Отдельные страницы -->
          <div class="mobile-section">
            <h4 class="mobile-section-title">Другие страницы</h4>
            <router-link 
              v-for="page in otherPages" 
              :key="page.path + '-mobile'"
              :to="page.path" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <i :class="page.icon"></i>
              <span>{{ page.name }}</span>
              <i class="fas fa-external-link-alt"></i>
            </router-link>
          </div>
          
          <!-- Социальные сети -->
          <div class="mobile-social">
            <h4>Связаться со мной</h4>
            <div class="mobile-social-grid">
              <a 
                v-for="social in socialLinks" 
                :key="social.name + '-mobile'"
                :href="social.url" 
                target="_blank" 
                class="mobile-social-link"
              >
                <i :class="social.icon"></i>
                <span>{{ social.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay для мобильного меню -->
      <div class="mobile-overlay" :class="{ 'visible': isMobileMenuOpen }" @click="closeMobileMenu"></div>
    </nav>
    
    <!-- Основной контент -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { Analytics } from '@vercel/analytics/vue';

export default {
  name: 'App',
  components: {
    Analytics
  },
  data() {
    return {
      isScrolled: false,
      isMobileMenuOpen: false,
      isDropdownOpen: false,
      activeSection: '#header',
      closeTimer: null,
      
      // Секции главной страницы (якорные ссылки)
      mainSections: [
        {
          name: 'Главная',
          anchor: '#header',
          icon: 'fas fa-home'
        },
        {
          name: 'Референс',
          anchor: '#reference',
          icon: 'fas fa-id-card'
        },
        {
          name: 'О себе',
          anchor: '#bio',
          icon: 'fas fa-user'
        },
        {
          name: 'Фурсьют',
          anchor: '#fursuit',
          icon: 'fas fa-mask'
        },
        {
          name: 'Felix',
          anchor: '#felix',
          icon: 'fas fa-heart'
        },
        {
          name: 'Коны',
          anchor: '#events',
          icon: 'fas fa-calendar-alt'
        },
        {
          name: 'Каналы',
          anchor: '#communities',
          icon: 'fas fa-users'
        }
      ],

      // Отдельные страницы (для выпадающего меню)
      otherPages: [
        {
          name: 'История персонажа',
          description: 'Эволюция дизайна с 2019 по 2025',
          path: '/taffy',
          icon: 'fas fa-paw'
        },
        {
          name: 'Галерея артов',
          description: 'Коллекция заказанных артов',
          path: '/gallery',
          icon: 'fas fa-images'
        },
        {
          name: 'Все мероприятия',
          description: 'Подробные отчёты с конов',
          path: '/events',
          icon: 'fas fa-calendar-check'
        },
        {
          name: 'О Felix',
          description: 'История нашей любви',
          path: '/felix',
          icon: 'fas fa-heart-circle'
        }
      ],

      socialLinks: [
        {
          name: 'Telegram',
          url: 'https://t.me/foxtaffy',
          icon: 'fab fa-telegram'
        },
        {
          name: 'VKontakte',
          url: 'https://vk.com/foxtaffy',
          icon: 'fab fa-vk'
        },
        {
          name: 'Twitter',
          url: 'https://x.com/Fox_Taffy621',
          icon: 'fab fa-twitter'
        },
        {
          name: 'Discord',
          url: 'https://discord.gg/foxtaffy',
          icon: 'fab fa-discord'
        }
      ]
    }
  },
  computed: {
    isOtherPageActive() {
      return this.otherPages.some(page => this.$route.path === page.path)
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
    this.updateActiveSection()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    if (this.closeTimer) {
      clearTimeout(this.closeTimer)
    }
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50
      this.updateActiveSection()
    },
    handleResize() {
      if (window.innerWidth > 768 && this.isMobileMenuOpen) {
        this.closeMobileMenu()
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
      document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : ''
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
      document.body.style.overflow = ''
    },
    openDropdown() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer)
        this.closeTimer = null
      }
      this.isDropdownOpen = true
    },
    startCloseTimer() {
      this.closeTimer = setTimeout(() => {
        this.isDropdownOpen = false
        this.closeTimer = null
      }, 300) // Задержка 300ms перед закрытием
    },
    cancelCloseTimer() {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer)
        this.closeTimer = null
      }
    },
    scrollToSection(anchor, event, closeMobile = false) {
      event.preventDefault()
      
      if (closeMobile) {
        this.closeMobileMenu()
      }

      // Если мы не на главной странице, сначала переходим на неё
      if (this.$route.path !== '/') {
        this.$router.push('/').then(() => {
          setTimeout(() => {
            this.performScroll(anchor)
          }, 100)
        })
      } else {
        this.performScroll(anchor)
      }
    },
    performScroll(anchor) {
      const targetId = anchor.replace('#', '')
      const element = document.getElementById(targetId)
      
      if (element) {
        const offsetTop = element.offsetTop - 80 // Учитываем высоту навигации
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    },
    updateActiveSection() {
      if (this.$route.path !== '/') return

      const sections = this.mainSections.map(section => section.anchor.replace('#', ''))
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          this.activeSection = '#' + sections[i]
          break
        }
      }
    }
  }
}
</script>

<style>
/* ===============================================
   🎨 ОСНОВНЫЕ ПЕРЕМЕННЫЕ
   =============================================== */
.navbar {
  --bg-dark: #1a1a1a;
  --bg-darker: #121212;
  --text-light: #f2f2f2;
  --text-muted: #a0a0a0;
  --accent-orange: #ff7b25;
  --accent-green: #4caf50;
  --shadow: rgba(0, 0, 0, 0.2);
  --card-bg: #222222;
  --card-hover: #2d2d2d;
  --transition: all 0.3s ease;
}

/* ===============================================
   🧭 ОСНОВНАЯ НАВИГАЦИЯ
   =============================================== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: var(--transition);
  font-family: 'Nunito', sans-serif;
}

.navbar.scrolled {
  background: rgba(26, 26, 26, 0.98);
  box-shadow: 0 5px 20px var(--shadow);
}

.nav-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  height: 70px;
}

/* ===============================================
   🦊 ЛОГОТИП
   =============================================== */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: var(--text-light);
  transition: var(--transition);
}

.nav-logo:hover {
  transform: translateY(-2px);
}

.logo-avatar {
  position: relative;
  width: 45px;
  height: 45px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  padding: 2px;
  transition: var(--transition);
}

.nav-logo:hover .avatar-img {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.3);
}

.logo-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: var(--accent-green);
  border-radius: 50%;
  border: 2px solid var(--bg-dark);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.logo-text h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text span {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 400;
}

/* ===============================================
   📋 ОСНОВНОЕ МЕНЮ
   =============================================== */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: var(--transition);
  overflow: hidden;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  color: var(--text-light);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.nav-link.active {
  color: var(--text-light);
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.2);
}

.nav-link i {
  font-size: 1rem;
  transition: var(--transition);
}

.nav-link:hover i {
  transform: scale(1.1);
}

.link-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-orange), var(--accent-green));
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-link.active .link-indicator {
  width: 80%;
}

/* ===============================================
   📂 ВЫПАДАЮЩЕЕ МЕНЮ
   =============================================== */
.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-arrow {
  font-size: 0.8rem;
  margin-left: 0.3rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 26, 26, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem 0;
  min-width: 280px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
  margin-top: 0.5rem;
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: var(--text-muted);
  transition: var(--transition);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  padding-left: 2rem;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  color: var(--accent-orange);
}

.dropdown-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dropdown-item-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.dropdown-item-description {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dropdown-item:hover .dropdown-item-description {
  color: var(--text-muted);
}

/* ===============================================
   🌐 СОЦИАЛЬНЫЕ СЕТИ
   =============================================== */
.nav-social {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  text-decoration: none;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.05);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  z-index: -1;
}

.social-link:hover::before {
  width: 100%;
  height: 100%;
}

.social-link:hover {
  color: white;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 5px 15px rgba(255, 123, 37, 0.3);
}

.social-link i {
  font-size: 1.1rem;
  z-index: 1;
}

/* ===============================================
   📱 МОБИЛЬНОЕ МЕНЮ
   =============================================== */
.mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.mobile-toggle span {
  width: 100%;
  height: 3px;
  background: var(--text-light);
  border-radius: 2px;
  transition: var(--transition);
  transform-origin: center;
}

.mobile-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
  background: var(--accent-orange);
}

.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
  background: var(--accent-orange);
}

.mobile-menu {
  position: fixed;
  top: 70px;
  right: -100%;
  width: 320px;
  height: calc(100vh - 70px);
  background: rgba(26, 26, 26, 0.98);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: right 0.3s ease;
  z-index: 999;
  overflow-y: auto;
}

.mobile-menu.open {
  right: 0;
}

.mobile-menu-content {
  padding: 2rem;
}

.mobile-section {
  margin-bottom: 2rem;
}

.mobile-section-title {
  color: var(--text-light);
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(45deg, var(--accent-orange), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: var(--transition);
}

.mobile-nav-link:hover {
  color: var(--text-light);
  padding-left: 1rem;
}

.mobile-nav-link i:last-child {
  font-size: 0.8rem;
  color: var(--accent-orange);
  transition: var(--transition);
}

.mobile-nav-link:hover i:last-child {
  transform: translateX(5px);
}

.mobile-social {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-social h4 {
  color: var(--text-light);
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.mobile-social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mobile-social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: var(--transition);
}

.mobile-social-link:hover {
  color: var(--accent-orange);
  background: rgba(255, 255, 255, 0.05);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 998;
}

.mobile-overlay.visible {
  opacity: 1;
  visibility: visible;
}

/* ===============================================
   📄 ОСНОВНОЙ КОНТЕНТ
   =============================================== */
.main-content {
  margin-top: 70px;
  min-height: calc(100vh - 70px);
}

/* ===============================================
   📱 АДАПТИВНОСТЬ
   =============================================== */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  .nav-menu,
  .nav-social {
    display: none;
  }
  
  .mobile-toggle {
    display: flex;
  }
  
  .logo-text span {
    display: none;
  }
}

@media (max-width: 480px) {
  .mobile-menu {
    width: 100%;
    right: -100%;
  }
  
  .mobile-menu.open {
    right: 0;
  }
  
  .nav-container {
    height: 60px;
  }
  
  .mobile-menu {
    top: 60px;
    height: calc(100vh - 60px);
  }
  
  .main-content {
    margin-top: 60px;
    min-height: calc(100vh - 60px);
  }
  
  .logo-avatar {
    width: 35px;
    height: 35px;
  }
}

/* ===============================================
   ✨ ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ
   =============================================== */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar {
  animation: slideDown 0.3s ease;
}

/* Плавное появление элементов меню */
.nav-link,
.social-link {
  animation: slideDown 0.3s ease;
  animation-fill-mode: both;
}

.nav-link:nth-child(1) { animation-delay: 0.1s; }
.nav-link:nth-child(2) { animation-delay: 0.2s; }
.nav-link:nth-child(3) { animation-delay: 0.3s; }
.nav-link:nth-child(4) { animation-delay: 0.4s; }
.nav-link:nth-child(5) { animation-delay: 0.5s; }
.nav-link:nth-child(6) { animation-delay: 0.6s; }
.nav-link:nth-child(7) { animation-delay: 0.7s; }

.social-link:nth-child(1) { animation-delay: 0.8s; }
.social-link:nth-child(2) { animation-delay: 0.9s; }
.social-link:nth-child(3) { animation-delay: 1.0s; }
.social-link:nth-child(4) { animation-delay: 1.1s; }
</style>