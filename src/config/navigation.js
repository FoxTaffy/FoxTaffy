// Единый источник навигации: навбар, мобильное меню, командная палитра и шапка.
import boostyIcon from '@/assets/Boosty.svg'
import onlyfansIcon from '@/assets/OnlyFans.svg'

// Якорные секции главной страницы (id секции в HomeView)
export const mainSections = [
  { name: 'Главная', anchor: '#header', icon: 'fas fa-home' },
  { name: 'Референс', anchor: '#reference', icon: 'fas fa-id-card' },
  { name: 'О себе', anchor: '#bio', icon: 'fas fa-user' },
  { name: 'Bloomly', anchor: '#bloomly', icon: 'fas fa-seedling' },
  { name: 'Фурсьют', anchor: '#fursuit', icon: 'fas fa-mask' },
  { name: 'Felix', anchor: '#felix', icon: 'fas fa-heart' },
  { name: 'Коны', anchor: '#events', icon: 'fas fa-calendar-alt' },
  { name: 'Каналы', anchor: '#communities', icon: 'fas fa-users' }
]

export const otherPages = [
  { name: 'История персонажа', description: 'Эволюция дизайна с 2019 по 2025', path: '/taffy', icon: 'fas fa-paw' },
  { name: 'Галерея артов', description: 'Коллекция заказанных артов', path: '/gallery', icon: 'fas fa-images' },
  { name: 'Все мероприятия', description: 'Подробные отчёты с конов', path: '/events', icon: 'fas fa-calendar-check' },
  { name: 'О Felix', description: 'История нашей любви', path: '/felix', icon: 'fas fa-heart' }
]

// nav: true — показывать в навбаре; image — вместо иконки Font Awesome
export const socials = [
  { name: 'X', url: 'https://x.com/Fox_Taffy621', icon: 'fab fa-x-twitter', brand: 'x-twitter', nav: true },
  { name: 'Instagram', url: 'https://instagram.com/foxtaffy', icon: 'fab fa-instagram', brand: 'instagram' },
  { name: 'Telegram', url: 'https://t.me/foxtaffy', icon: 'fab fa-telegram', brand: 'telegram', nav: true },
  { name: 'VK', url: 'https://vk.com/foxtaffy', icon: 'fab fa-vk', brand: 'vk', nav: true },
  { name: 'Discord', url: 'https://discord.gg/foxtaffy', icon: 'fab fa-discord', brand: 'discord', nav: true },
  { name: 'GitHub', url: 'https://github.com/foxtaffy', icon: 'fab fa-github', brand: 'github' },
  { name: 'Twitch', url: 'https://twitch.tv/foxtaffy', icon: 'fab fa-twitch', brand: 'twitch' },
  { name: 'TikTok', url: 'https://tiktok.com/@foxtaffy', icon: 'fab fa-tiktok', brand: 'tiktok' },
  { name: 'Steam', url: 'https://steamcommunity.com/id/foxtaffy', icon: 'fab fa-steam', brand: 'steam' },
  { name: 'Boosty', url: 'https://boosty.to/foxtaffy', image: boostyIcon, brand: 'boosty' },
  { name: 'OnlyFans', url: 'https://onlyfans.wtf/foxtaffy', image: onlyfansIcon, brand: 'onlyfans' }
]

export const navSocials = socials.filter(s => s.nav)
