<template>
  <div ref="root" class="picker" :class="{ 'is-open': open }">
    <button type="button" class="input picker-trigger" :aria-expanded="open" @click="toggle">
      <i :class="icon"></i>
      <span class="grow">{{ summary }}</span>
      <i class="fas fa-chevron-down"></i>
    </button>

    <div v-if="open" class="picker-menu" @keydown.esc.stop="open = false">
      <label class="field">
        <i class="fas fa-search"></i>
        <input ref="search" v-model="query" type="search" :placeholder="searchPlaceholder" :aria-label="searchPlaceholder" @keydown.enter.prevent="createFromQuery">
      </label>

      <div class="picker-list">
        <label v-for="item in filtered" :key="item.id" class="picker-option">
          <input
            :type="multiple ? 'checkbox' : 'radio'"
            :name="groupName"
            :checked="isSelected(item)"
            @change="choose(item)"
          >
          <AdminAvatar v-if="avatars" :src="item.avatar_url" :name="item.name" size="sm" />
          <span class="grow">{{ item.name }}</span>
          <small>{{ item.count || 0 }}</small>
        </label>

        <button v-if="canCreate" type="button" class="picker-option" @click="createFromQuery">
          <span class="icon-badge icon-badge-round avatar-sm"><i class="fas fa-plus"></i></span>
          <span class="grow">Создать «{{ query.trim() }}»</span>
        </button>

        <p v-if="!filtered.length && !canCreate" class="hint">Ничего не найдено</p>
      </div>

      <div v-if="multiple" class="row is-between">
        <button type="button" class="btn btn-sm" @click="selectVisible">Выбрать найденные</button>
        <button type="button" class="btn btn-sm" :disabled="!selected.length" @click="$emit('update:modelValue', [])">Очистить</button>
      </div>
      <div v-else-if="modelValue" class="row">
        <button type="button" class="btn btn-sm" @click="$emit('update:modelValue', '')">Сбросить выбор</button>
      </div>
    </div>

    <div v-if="multiple && selected.length" class="tag-row">
      <button v-for="name in selected" :key="name" type="button" class="tag" :aria-label="`Убрать ${name}`" @click="remove(name)">
        {{ name }} <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AdminAvatar from './AdminAvatar.vue'

const props = defineProps({
  modelValue: { type: [String, Array], default: '' },
  items: { type: Array, required: true },
  multiple: { type: Boolean, default: false },
  icon: { type: String, default: 'fas fa-tags' },
  placeholder: { type: String, default: 'Выбрать' },
  searchPlaceholder: { type: String, default: 'Поиск…' },
  avatars: { type: Boolean, default: false },
  // Асинхронное создание «на лету»: должно вернуть имя созданной записи или null
  create: { type: Function, default: null }
})
const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const search = ref(null)
const open = ref(false)
const query = ref('')
const groupName = useId()

const selected = computed(() => (props.multiple ? props.modelValue : [props.modelValue].filter(Boolean)))
const isSelected = (item) => selected.value.includes(item.name)

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return term ? props.items.filter(item => item.name.toLowerCase().includes(term)) : props.items
})

const canCreate = computed(() => {
  const term = query.value.trim().toLowerCase()
  return !!props.create && !!term && !props.items.some(item => item.name.toLowerCase() === term)
})

const summary = computed(() => {
  if (!selected.value.length) return props.placeholder
  return props.multiple ? `Выбрано: ${selected.value.length}` : selected.value[0]
})

function toggle() {
  open.value = !open.value
}

function choose(item) {
  if (!props.multiple) {
    emit('update:modelValue', item.name)
    open.value = false
    return
  }
  emit('update:modelValue', isSelected(item)
    ? selected.value.filter(name => name !== item.name)
    : [...selected.value, item.name])
}

const remove = (name) => emit('update:modelValue', selected.value.filter(value => value !== name))
const selectVisible = () => emit('update:modelValue', [...new Set([...selected.value, ...filtered.value.map(item => item.name)])])

async function createFromQuery() {
  if (!canCreate.value) return
  const name = await props.create(query.value.trim())
  if (!name) return
  query.value = ''
  if (props.multiple) emit('update:modelValue', [...new Set([...selected.value, name])])
  else {
    emit('update:modelValue', name)
    open.value = false
  }
}

const closeOnOutsideClick = (event) => {
  if (root.value && !root.value.contains(event.target)) open.value = false
}

watch(open, async (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', closeOnOutsideClick)
    await nextTick()
    search.value?.focus()
  } else {
    document.removeEventListener('pointerdown', closeOnOutsideClick)
    query.value = ''
  }
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))
</script>
