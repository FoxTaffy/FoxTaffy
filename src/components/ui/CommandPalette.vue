<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="isOpen"
        class="lightbox-overlay palette-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Быстрый поиск"
        @click.self="close"
      >
        <div class="palette card">
          <div class="palette-input">
            <i class="fas fa-search"></i>
            <input
              ref="input"
              v-model="query"
              type="text"
              placeholder="Куда перейти? Секции, страницы, соцсети…"
              autocomplete="off"
              spellcheck="false"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="runActive"
              @keydown.esc.prevent="close"
            >
            <kbd class="tag">Esc</kbd>
          </div>

          <ul v-if="results.length" class="palette-list" role="listbox">
            <li v-for="(item, index) in results" :key="item.id" role="option" :aria-selected="index === active">
              <button
                type="button"
                class="palette-item"
                :class="{ active: index === active }"
                @mousemove="active = index"
                @click="run(item)"
              >
                <span class="icon-badge"><i :class="item.icon"></i></span>
                <span class="link-card-body">
                  <span class="link-card-title">{{ item.name }}</span>
                  <span class="link-card-text">{{ item.hint }}</span>
                </span>
                <span class="tag">{{ item.group }}</span>
              </button>
            </li>
          </ul>
          <p v-else class="section-description palette-empty">Ничего не найдено по запросу «{{ query }}»</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { mainSections, otherPages, socials } from '@/config/navigation'
import { matchesFuzzySearch } from '@/utils/searchUtils'

const COMMANDS = [
  ...mainSections.map(s => ({ id: s.anchor, group: 'Секция', name: s.name, hint: 'Прокрутить главную страницу', icon: s.icon, anchor: s.anchor })),
  ...otherPages.map(p => ({ id: p.path, group: 'Страница', name: p.name, hint: p.description, icon: p.icon, path: p.path })),
  ...socials.map(s => ({ id: s.url, group: 'Соцсеть', name: s.name, hint: s.url.replace(/^https?:\/\//, ''), icon: s.icon || 'fas fa-link', url: s.url }))
]

export default {
  name: 'CommandPalette',
  data() {
    return { isOpen: false, query: '', active: 0 }
  },
  computed: {
    results() {
      const q = this.query.trim()
      if (!q) return COMMANDS
      return COMMANDS.filter(c => matchesFuzzySearch(q, `${c.name} ${c.group} ${c.hint}`))
    }
  },
  watch: {
    query() {
      this.active = 0
    },
    $route() {
      this.close()
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onGlobalKey)
    window.addEventListener('open-command-palette', this.open)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onGlobalKey)
    window.removeEventListener('open-command-palette', this.open)
    document.body.style.overflow = ''
  },
  methods: {
    onGlobalKey(event) {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        this.isOpen ? this.close() : this.open()
      } else if (event.key === '/' && !typing && !this.isOpen) {
        event.preventDefault()
        this.open()
      } else if (event.key === 'Escape' && this.isOpen) {
        this.close()
      }
    },
    open() {
      this.isOpen = true
      this.query = ''
      this.active = 0
      document.body.style.overflow = 'hidden'
      this.$nextTick(() => this.$refs.input?.focus())
    },
    close() {
      this.isOpen = false
      document.body.style.overflow = ''
    },
    move(step) {
      const count = this.results.length
      if (!count) return
      this.active = (this.active + step + count) % count
      this.$nextTick(() => document.querySelector('.palette-item.active')?.scrollIntoView({ block: 'nearest' }))
    },
    runActive() {
      const item = this.results[this.active]
      if (item) this.run(item)
    },
    async run(item) {
      this.close()
      if (item.url) {
        window.open(item.url, '_blank', 'noopener,noreferrer')
      } else if (item.path) {
        this.$router.push(item.path)
      } else {
        if (this.$route.path !== '/') await this.$router.push('/')
        await this.$nextTick()
        document.getElementById(item.anchor.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}
</script>
