<template>
  <div class="admin-container">
    <!-- Экран авторизации -->
    <Transition name="fade">
      <div v-if="!isAuthenticated" class="auth-screen">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <i class="fas fa-paw"></i>
            </div>
            <h1 class="auth-title">Fox Taffy Admin</h1>
            <p class="auth-subtitle">Панель управления галереей</p>
          </div>
          
          <form @submit.prevent="authenticate" class="auth-form">
            <div class="input-group">
              <input 
                v-model="authCode" 
                type="password" 
                placeholder="Введите секретный код..."
                class="auth-input"
                :class="{ error: authError }"
                autocomplete="current-password"
              >
              <i class="fas fa-key input-icon"></i>
            </div>
            
            <div v-if="authError" class="error-message">
              {{ authError }}
            </div>
            
            <button type="submit" class="auth-button" :disabled="!authCode.trim()">
              <i class="fas fa-sign-in-alt"></i>
              <span>Войти в систему</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Основной интерфейс -->
    <Transition name="slide">
      <div v-if="isAuthenticated" class="admin-interface">
        <!-- Боковая панель -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="logo">
              <i class="fas fa-paw"></i>
            </div>
            <div class="brand">
              <h2>Fox Admin</h2>
              <span>v3.0</span>
            </div>
          </div>
          
          <nav class="sidebar-nav">
            <div class="nav-section">
              <h3>Основное</h3>
              <button
                v-for="tab in mainTabs"
                :key="tab.id"
                @click="tryChangeTab(tab.id)"
                class="nav-item"
                :class="{ active: activeTab === tab.id }"
              >
                <i :class="tab.icon"></i>
                <span>{{ tab.name }}</span>
                <div v-if="tab.count" class="count-badge">{{ tab.count }}</div>
              </button>
            </div>

            <div class="nav-section">
              <h3>Управление</h3>
              <button
                v-for="tab in manageTabs"
                :key="tab.id"
                @click="tryChangeTab(tab.id)"
                class="nav-item"
                :class="{ active: activeTab === tab.id }"
              >
                <i :class="tab.icon"></i>
                <span>{{ tab.name }}</span>
                <div v-if="tab.count" class="count-badge">{{ tab.count }}</div>
              </button>
            </div>
          </nav>
          
          <div class="sidebar-footer">
            <button @click="refreshData" class="footer-btn" :disabled="refreshing">
              <i class="fas fa-sync-alt" :class="{ spinning: refreshing }"></i>
            </button>
            <button @click="logout" class="footer-btn">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </aside>

        <!-- Основной контент -->
        <main class="main-content">
          <!-- Заголовок -->
          <header class="content-header">
            <div class="header-info">
              <h1>{{ currentTabInfo.title }}</h1>
              <p>{{ currentTabInfo.subtitle }}</p>
            </div>
          </header>

          <!-- Контент вкладок -->
          <div class="tab-content">
            <!-- Dashboard -->
            <div v-if="activeTab === 'dashboard'" class="dashboard">
              <div class="dashboard-compact">
                <!-- Компактная строка статистики -->
                <div class="stats-compact-row">
                  <div class="stat-compact">
                    <i class="fas fa-images"></i>
                    <div>
                      <div class="stat-num">{{ stats.arts }}</div>
                      <div class="stat-lbl">Артов</div>
                    </div>
                  </div>
                  <div class="stat-compact">
                    <i class="fas fa-palette"></i>
                    <div>
                      <div class="stat-num">{{ stats.artists }}</div>
                      <div class="stat-lbl">Художников</div>
                    </div>
                  </div>
                  <div class="stat-compact">
                    <i class="fas fa-tags"></i>
                    <div>
                      <div class="stat-num">{{ stats.tags }}</div>
                      <div class="stat-lbl">Тегов</div>
                    </div>
                  </div>
                  <div class="stat-compact">
                    <i class="fas fa-server"></i>
                    <div>
                      <div class="stat-num">{{ uploadedFilesCount }}</div>
                      <div class="stat-lbl">Файлов S3</div>
                    </div>
                  </div>
                </div>

                <!-- Средняя секция: Арты и Контент -->
                <div class="dashboard-middle">
                  <div class="dashboard-card-mini">
                    <div class="card-header-mini">
                      <h3><i class="fas fa-clock"></i> Последние арты</h3>
                      <button @click="activeTab = 'gallery'" class="view-btn-mini">
                        <i class="fas fa-arrow-right"></i>
                      </button>
                    </div>
                    <div class="recent-arts-mini">
                      <div
                        v-for="art in recentArts.slice(0, 4)"
                        :key="art.id"
                        class="art-mini"
                        @click="viewArt(art)"
                      >
                        <img :src="art.thumbnail_url || art.image_url" :alt="art.title">
                        <div v-if="art.is_nsfw" class="nsfw-badge-mini">NSFW</div>
                        <div class="art-overlay-mini">
                          <i class="fas fa-eye"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="dashboard-card-mini">
                    <h3><i class="fas fa-shield-alt"></i> Контент</h3>
                    <div class="content-mini">
                      <div class="content-row">
                        <i class="fas fa-check-circle" style="color: #22c55e;"></i>
                        <span>SFW: <strong>{{ sfwArtsCount }}</strong></span>
                        <span class="percent-mini">{{ Math.round((sfwArtsCount / stats.arts) * 100) }}%</span>
                      </div>
                      <div class="content-row">
                        <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                        <span>NSFW: <strong>{{ nsfwArtsCount }}</strong></span>
                        <span class="percent-mini">{{ Math.round((nsfwArtsCount / stats.arts) * 100) }}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Нижняя секция: Художники и Теги -->
                <div class="dashboard-bottom">
                  <div class="dashboard-card-mini">
                    <h3><i class="fas fa-crown"></i> Топ художники</h3>
                    <div class="top-list-mini">
                      <div
                        v-for="(artist, index) in topArtists.slice(0, 3)"
                        :key="artist.id"
                        class="list-item-mini"
                      >
                        <div class="rank-mini">{{ index + 1 }}</div>
                        <img
                          :src="artist.avatar_url || getDefaultAvatar(artist.name)"
                          :alt="artist.name"
                          class="avatar-mini"
                        >
                        <div class="info-mini">
                          <div class="name-mini">{{ artist.name }}</div>
                          <div class="count-mini">{{ artist.count }}</div>
                        </div>
                        <i v-if="artist.is_friend" class="fas fa-star star-mini"></i>
                      </div>
                    </div>
                  </div>

                  <div class="dashboard-card-mini">
                    <h3><i class="fas fa-fire"></i> Популярные теги</h3>
                    <div class="tags-mini-grid">
                      <div
                        v-for="tag in popularTags.slice(0, 9)"
                        :key="tag.id"
                        class="tag-mini"
                      >
                        <span>{{ tag.name }}</span>
                        <span>{{ tag.count }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Добавление арта -->
            <div v-if="activeTab === 'add-art'" class="add-art">
              <form @submit.prevent="addArt" class="art-form">
                <!-- Основная информация -->
                <div class="form-section">
                  <h3><i class="fas fa-info-circle"></i> Основная информация</h3>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Название арта *</label>
                      <input 
                        v-model="newArt.title"
                        type="text" 
                        placeholder="Введите название..."
                        class="form-input"
                        required
                      >
                    </div>
                    <div class="form-group">
                      <label>
                        Художник *
                        <span v-if="selectedArtist" class="selected-count">
                          (выбран)
                        </span>
                      </label>
                      
                      <button 
                        type="button"
                        @click="showArtistSelector = !showArtistSelector"
                        class="selector-btn"
                        :class="{ active: showArtistSelector }"
                      >
                        <div class="selector-btn-content">
                          <i class="fas fa-palette"></i>
                          <span v-if="selectedArtist">{{ selectedArtist }}</span>
                          <span v-else>Выбрать художника</span>
                        </div>
                        <i class="fas fa-chevron-down" :class="{ rotated: showArtistSelector }"></i>
                      </button>
                      
                      <div v-if="showArtistSelector" class="selector-dropdown">
                        <div class="selector-header">
                          <input 
                            v-model="artistSearchQuery"
                            type="text"
                            placeholder="Поиск художников..."
                            class="search-input"
                          >
                          <div class="selector-actions">
                            <button type="button" @click="clearArtist">Очистить</button>
                          </div>
                        </div>
                        
                        <div class="selector-list">
                          <label 
                            v-for="artist in filteredArtistsForSelector" 
                            :key="artist.id"
                            class="selector-item artist-item"
                            :class="{ selected: selectedArtist === artist.name }"
                          >
                            <input
                              type="radio"
                              :value="artist.name"
                              v-model="selectedArtist"
                              name="artist"
                              @change="showArtistSelector = false"
                            >
                            <img 
                              :src="artist.avatar_url || getDefaultAvatar(artist.name)"
                              :alt="artist.name"
                              class="item-avatar"
                            >
                            <div class="artist-info">
                              <span class="item-name">{{ artist.name }}</span>
                              <div class="artist-meta">
                                <span class="item-count">{{ artist.count || 0 }} артов</span>
                                <div v-if="artist.is_friend" class="friend-indicator">
                                  <i class="fas fa-star"></i>
                                  <span>Друг</span>
                                </div>
                              </div>
                            </div>
                          </label>
                          
                          <div v-if="artistSearchQuery && !availableArtists.find(a => a.name.toLowerCase() === artistSearchQuery.toLowerCase())" class="new-item">
                            <button 
                              type="button"
                              @click="createAndSelectArtist(artistSearchQuery)"
                              class="new-btn"
                            >
                              <i class="fas fa-plus"></i>
                              Создать художника "{{ artistSearchQuery }}"
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="selectedArtist" class="selected-artist-preview">
                        <div class="selected-artist-card">
                          <img 
                            :src="getSelectedArtistAvatar()"
                            :alt="selectedArtist"
                            class="selected-avatar"
                          >
                          <div class="selected-artist-info">
                            <span class="selected-name">{{ selectedArtist }}</span>
                            <div class="selected-meta">
                              <span>{{ getSelectedArtistCount() }} артов</span>
                              <div v-if="getSelectedArtistFriend()" class="friend-badge-small">
                                <i class="fas fa-star"></i>
                                Друг
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button"
                            @click="clearArtist"
                            class="clear-artist-btn"
                          >
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Загрузка изображения -->
                <div class="form-section">
                  <h3><i class="fas fa-cloud-upload-alt"></i> Загрузка изображения</h3>
                  
                  <div class="upload-tabs">
                    <button 
                      type="button"
                      @click="uploadMethod = 's3'" 
                      class="upload-tab"
                      :class="{ active: uploadMethod === 's3' }"
                    >
                      <i class="fas fa-cloud-upload-alt"></i>
                      S3 Загрузка
                    </button>
                    <button 
                      type="button"
                      @click="uploadMethod = 'url'" 
                      class="upload-tab"
                      :class="{ active: uploadMethod === 'url' }"
                    >
                      <i class="fas fa-link"></i>
                      URL изображения
                    </button>
                  </div>
                  
                  <div v-if="uploadMethod === 's3'" class="upload-area">
                    <FileUploader
                      v-model="newArt.imageUrl"
                      folder="arts"
                      :auto-upload="false"
                      :create-thumbnail="true"
                      @file-uploaded="onFileUploaded"
                      @file-removed="onFileRemoved"
                      @upload-progress="onUploadProgress"
                      @error="onUploadError"
                    />
                  </div>
                  
                  <div v-if="uploadMethod === 'url'" class="url-input">
                    <input 
                      v-model="newArt.imageUrl"
                      type="url" 
                      placeholder="https://example.com/image.jpg"
                      class="form-input"
                      required
                    >
                    <div v-if="newArt.imageUrl && isValidImageUrl" class="image-preview">
                      <img :src="newArt.imageUrl" :alt="newArt.title || 'Превью'">
                    </div>
                  </div>
                </div>

                <!-- Метаданные -->
                <div class="form-section">
                  <h3><i class="fas fa-tags"></i> Метаданные</h3>
                  
                  <!-- NSFW чекбокс -->
                  <div class="nsfw-checkbox">
                    <label class="checkbox-label">
                      <input 
                        v-model="newArt.isNsfw"
                        type="checkbox" 
                        class="checkbox"
                      >
                      <span class="checkmark"></span>
                      <span class="checkbox-text">
                        <i class="fas fa-exclamation-triangle"></i>
                        Контент 18+ (NSFW)
                      </span>
                    </label>
                    <div v-if="newArt.isNsfw" class="nsfw-warning">
                      <i class="fas fa-info-circle"></i>
                      Убедитесь, что контент соответствует правилам
                    </div>
                  </div>

                  <div class="form-row">
                    <!-- Селектор тегов -->
                    <div class="form-group">
                      <label>
                        Теги
                        <span v-if="selectedTags.length > 0" class="selected-count">
                          ({{ selectedTags.length }} выбрано)
                        </span>
                      </label>
                      
                      <button 
                        type="button"
                        @click="showTagSelector = !showTagSelector"
                        class="selector-btn"
                        :class="{ active: showTagSelector }"
                      >
                        <i class="fas fa-tags"></i>
                        <span>Выбрать теги</span>
                        <i class="fas fa-chevron-down" :class="{ rotated: showTagSelector }"></i>
                      </button>
                      
                      <div v-if="showTagSelector" class="selector-dropdown">
                        <div class="selector-header">
                          <input 
                            v-model="tagSearchQuery"
                            type="text"
                            placeholder="Поиск тегов..."
                            class="search-input"
                          >
                          <div class="selector-actions">
                            <button type="button" @click="selectAllTags">Выбрать все</button>
                            <button type="button" @click="clearTags">Очистить</button>
                          </div>
                        </div>
                        
                        <div class="selector-list">
                          <label 
                            v-for="tag in filteredTags" 
                            :key="tag.id"
                            class="selector-item"
                          >
                            <input 
                              type="checkbox"
                              :value="tag.name"
                              v-model="selectedTags"
                            >
                            <span class="item-name">{{ tag.name }}</span>
                            <span class="item-count">({{ tag.count || 0 }})</span>
                          </label>
                          
                          <div v-if="tagSearchQuery && !availableTags.find(t => t.name.toLowerCase() === tagSearchQuery.toLowerCase())" class="new-item">
                            <button 
                              type="button"
                              @click="createAndSelectTag(tagSearchQuery)"
                              class="new-btn"
                            >
                              <i class="fas fa-plus"></i>
                              Создать "{{ tagSearchQuery }}"
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="selectedTags.length > 0" class="selected-items">
                        <span 
                          v-for="tag in selectedTags" 
                          :key="tag"
                          class="selected-tag"
                          @click="removeTag(tag)"
                        >
                          {{ tag }}
                          <i class="fas fa-times"></i>
                        </span>
                      </div>
                    </div>

                    <!-- Селектор персонажей -->
                    <div class="form-group">
                      <label>
                        Персонажи
                        <span v-if="selectedCharacters.length > 0" class="selected-count">
                          ({{ selectedCharacters.length }} выбрано)
                        </span>
                      </label>
                      
                      <button 
                        type="button"
                        @click="showCharacterSelector = !showCharacterSelector"
                        class="selector-btn"
                        :class="{ active: showCharacterSelector }"
                      >
                        <i class="fas fa-paw"></i>
                        <span>Выбрать персонажей</span>
                        <i class="fas fa-chevron-down" :class="{ rotated: showCharacterSelector }"></i>
                      </button>
                      
                      <div v-if="showCharacterSelector" class="selector-dropdown">
                        <div class="selector-header">
                          <input 
                            v-model="characterSearchQuery"
                            type="text"
                            placeholder="Поиск персонажей..."
                            class="search-input"
                          >
                          <div class="selector-actions">
                            <button type="button" @click="selectAllCharacters">Выбрать все</button>
                            <button type="button" @click="clearCharacters">Очистить</button>
                          </div>
                        </div>
                        
                        <div class="selector-list">
                          <label 
                            v-for="character in filteredCharacters" 
                            :key="character.id"
                            class="selector-item"
                          >
                            <input 
                              type="checkbox"
                              :value="character.name"
                              v-model="selectedCharacters"
                            >
                            <img 
                              :src="character.avatar_url || getDefaultCharacterAvatar(character.name)"
                              :alt="character.name"
                              class="item-avatar"
                            >
                            <span class="item-name">{{ character.name }}</span>
                            <span class="item-count">({{ character.count || 0 }})</span>
                          </label>
                          
                          <div v-if="characterSearchQuery && !availableCharacters.find(c => c.name.toLowerCase() === characterSearchQuery.toLowerCase())" class="new-item">
                            <button 
                              type="button"
                              @click="createAndSelectCharacter(characterSearchQuery)"
                              class="new-btn"
                            >
                              <i class="fas fa-plus"></i>
                              Создать "{{ characterSearchQuery }}"
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="selectedCharacters.length > 0" class="selected-items">
                        <span 
                          v-for="character in selectedCharacters" 
                          :key="character"
                          class="selected-character"
                          @click="removeCharacter(character)"
                        >
                          <img 
                            :src="getCharacterAvatarByName(character)"
                            :alt="character"
                            class="character-avatar"
                          >
                          {{ character }}
                          <i class="fas fa-times"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" @click="resetForm" class="btn secondary">
                    <i class="fas fa-undo"></i>
                    Сбросить
                  </button>
                  
                  <button type="submit" class="btn primary" :disabled="isSubmitting || !isFormValid">
                    <span v-if="isSubmitting">
                      <i class="fas fa-spinner spinning"></i>
                      Загружаем...
                    </span>
                    <span v-else>
                      <i class="fas fa-cloud-upload-alt"></i>
                      Добавить арт
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Управление художниками -->
            <div v-if="activeTab === 'artists'" class="management-page">
              <div class="management-header">
                <div class="search-bar">
                  <i class="fas fa-search"></i>
                  <input 
                    v-model="artistSearch" 
                    type="text" 
                    placeholder="Поиск художников..."
                  >
                </div>
                <button @click="openModal('artist')" class="btn primary">
                  <i class="fas fa-plus"></i>
                  Добавить художника
                </button>
              </div>

              <div class="items-grid">
                <div 
                  v-for="artist in filteredArtists" 
                  :key="artist.id"
                  class="item-card"
                >
                  <div class="item-header">
                    <img 
                      :src="artist.avatar_url || getDefaultAvatar(artist.name)" 
                      :alt="artist.name"
                      class="item-avatar"
                    >
                    <div class="item-info">
                      <h4>{{ artist.name }}</h4>
                      <p>{{ artist.count }} артов</p>
                      <div v-if="artist.is_friend" class="friend-badge">
                        <i class="fas fa-star"></i>
                        Друг
                      </div>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button @click="editArtist(artist)" class="action-btn">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('artist', artist)" class="action-btn danger">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Управление тегами -->
            <div v-if="activeTab === 'tags'" class="management-page">
              <div class="management-header">
                <div class="search-bar">
                  <i class="fas fa-search"></i>
                  <input 
                    v-model="tagSearch" 
                    type="text" 
                    placeholder="Поиск тегов..."
                  >
                </div>
                <button @click="openModal('tag')" class="btn primary">
                  <i class="fas fa-plus"></i>
                  Добавить тег
                </button>
              </div>

              <div class="items-grid">
                <div 
                  v-for="tag in filteredTagsList" 
                  :key="tag.id"
                  class="item-card"
                >
                  <div class="item-header">
                    <div class="tag-icon">
                      <i class="fas fa-tag"></i>
                    </div>
                    <div class="item-info">
                      <h4>{{ tag.name }}</h4>
                      <p>{{ tag.count }} использований</p>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button @click="editTag(tag)" class="action-btn">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('tag', tag)" class="action-btn danger">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Управление персонажами -->
            <div v-if="activeTab === 'characters'" class="management-page">
              <div class="management-header">
                <div class="search-bar">
                  <i class="fas fa-search"></i>
                  <input 
                    v-model="characterSearch" 
                    type="text" 
                    placeholder="Поиск персонажей..."
                  >
                </div>
                <button @click="openModal('character')" class="btn primary">
                  <i class="fas fa-plus"></i>
                  Добавить персонажа
                </button>
              </div>

              <div class="items-grid">
                <div 
                  v-for="character in filteredCharactersList" 
                  :key="character.id"
                  class="item-card"
                >
                  <div class="item-header">
                    <img 
                      :src="character.avatar_url || getDefaultCharacterAvatar(character.name)" 
                      :alt="character.name"
                      class="item-avatar"
                    >
                    <div class="item-info">
                      <h4>{{ character.name }}</h4>
                      <p>{{ character.count }} появлений</p>
                    </div>
                  </div>
                  <div class="item-actions">
                    <button @click="editCharacter(character)" class="action-btn">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('character', character)" class="action-btn danger">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Галерея артов -->
            <div v-if="activeTab === 'gallery'" class="gallery-page">
              <div class="gallery-header">
                <div class="search-bar">
                  <i class="fas fa-search"></i>
                  <input 
                    v-model="artSearch" 
                    type="text" 
                    placeholder="Поиск артов..."
                  >
                </div>
                
                <div class="gallery-controls">
                  <label class="nsfw-toggle">
                    <input 
                      type="checkbox" 
                      v-model="showAdminNsfw"
                      @change="loadRecentArts"
                    >
                    <span class="toggle-slider"></span>
                    <span>Показать NSFW</span>
                  </label>
                  
                  <select v-model="gallerySortOrder" @change="loadRecentArts" class="sort-select">
                    <option value="newest">Новые сначала</option>
                    <option value="oldest">Старые сначала</option>
                    <option value="alphabetical">По алфавиту</option>
                  </select>
                </div>
              </div>

              <div class="arts-grid">
                <div 
                  v-for="art in filteredArtsList" 
                  :key="art.id"
                  class="art-card"
                  :class="{ nsfw: art.is_nsfw }"
                >
                  <div class="art-image">
                    <img :src="art.thumbnail_url || art.image_url" :alt="art.title">
                    
                    <div v-if="art.is_nsfw" class="nsfw-indicator">NSFW</div>
                    <div v-if="isS3Url(art.image_url)" class="s3-indicator">S3</div>
                    
                    <div class="art-overlay">
                      <button @click="viewArt(art)" class="overlay-btn">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button @click="editArt(art)" class="overlay-btn edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="confirmDelete('art', art)" class="overlay-btn danger">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div class="art-info">
                    <h4>{{ art.title }}</h4>
                    <p>{{ art.artist_name }}</p>
                    <div class="art-meta">
                      <span>{{ formatDate(art.created_date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Transition>

    <!-- Модальные окна -->
    <Teleport to="body">
      <!-- Модалка редактирования -->
      <Transition name="modal">
        <div v-if="modal.show" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>
                <i :class="modal.icon"></i>
                {{ modal.title }}
              </h3>
              <button @click="closeModal" class="modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <form @submit.prevent="saveData" class="modal-form">
              <div class="modal-body">
                <!-- Поля для художника -->
                <div v-if="modal.type === 'artist'">
                  <div class="form-group">
                    <label>Никнейм *</label>
                    <input 
                      v-model="modal.data.nickname"
                      type="text" 
                      placeholder="Введите никнейм..."
                      class="form-input"
                      required
                    >
                  </div>
                  
                  <div class="form-group">
                    <AvatarUploader
                      v-model="modal.data.avatar_url"
                      label="Аватар"
                      folder="avatars"
                    />
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        v-model="modal.data.is_friend"
                        type="checkbox"
                        class="checkbox"
                      >
                      <span class="checkmark"></span>
                      <span class="checkbox-text">
                        <i class="fas fa-star"></i>
                        Отметить как друга
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Поля для тега -->
                <div v-if="modal.type === 'tag'">
                  <div class="form-group">
                    <label>Название тега *</label>
                    <input 
                      v-model="modal.data.name"
                      type="text" 
                      placeholder="Введите название..."
                      class="form-input"
                      required
                    >
                  </div>
                </div>

                <!-- Поля для персонажа -->
                <div v-if="modal.type === 'character'">
                  <div class="form-group">
                    <label>Имя персонажа *</label>
                    <input
                      v-model="modal.data.name"
                      type="text"
                      placeholder="Например: Felix"
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <AvatarUploader
                      v-model="modal.data.avatar_url"
                      label="Аватар персонажа"
                      folder="avatars"
                    />
                  </div>
                </div>

                <!-- Поля для арта -->
                <div v-if="modal.type === 'art'">
                  <div class="form-group">
                    <label>Название арта *</label>
                    <input
                      v-model="modal.data.title"
                      type="text"
                      placeholder="Введите название арта..."
                      class="form-input"
                      required
                    >
                  </div>

                  <div class="form-group">
                    <label>
                      Художник *
                      <span v-if="modal.data.artist_nickname" class="selected-count">
                        (выбран)
                      </span>
                    </label>

                    <button
                      type="button"
                      @click="modalArtistSelectorOpen = !modalArtistSelectorOpen"
                      class="selector-btn"
                      :class="{ active: modalArtistSelectorOpen }"
                    >
                      <div class="selector-btn-content">
                        <i class="fas fa-palette"></i>
                        <span v-if="modal.data.artist_nickname">{{ modal.data.artist_nickname }}</span>
                        <span v-else>Выбрать художника</span>
                      </div>
                      <i class="fas fa-chevron-down" :class="{ rotated: modalArtistSelectorOpen }"></i>
                    </button>

                    <div v-if="modalArtistSelectorOpen" class="selector-dropdown">
                      <div class="selector-header">
                        <input
                          v-model="modalArtistSearch"
                          type="text"
                          placeholder="Поиск художников..."
                          class="search-input"
                        >
                        <div class="selector-actions">
                          <button type="button" @click="modal.data.artist_nickname = ''; modalArtistSearch = ''">Очистить</button>
                        </div>
                      </div>

                      <div class="selector-list">
                        <label
                          v-for="artist in filteredModalArtists"
                          :key="artist.id"
                          class="selector-item artist-item"
                          :class="{ selected: modal.data.artist_nickname === artist.name }"
                        >
                          <input
                            type="radio"
                            :value="artist.name"
                            v-model="modal.data.artist_nickname"
                            name="modal-artist"
                            @change="modalArtistSelectorOpen = false"
                          >
                          <img
                            :src="artist.avatar_url || getDefaultAvatar(artist.name)"
                            :alt="artist.name"
                            class="item-avatar"
                          >
                          <div class="artist-info">
                            <span class="item-name">{{ artist.name }}</span>
                            <div class="artist-meta">
                              <span class="item-count">{{ artist.count || 0 }} артов</span>
                              <div v-if="artist.is_friend" class="friend-indicator">
                                <i class="fas fa-star"></i>
                                <span>Друг</span>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Дата создания</label>
                    <input
                      v-model="modal.data.created_date"
                      type="date"
                      class="form-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Теги</label>
                    <div class="tags-selector">
                      <label
                        v-for="tag in availableTags"
                        :key="tag.id"
                        class="tag-checkbox"
                        :class="{ selected: modal.data.tags?.includes(tag.name) }"
                      >
                        <input
                          type="checkbox"
                          :value="tag.name"
                          v-model="modal.data.tags"
                        >
                        <span class="tag-label">{{ tag.name }}</span>
                      </label>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>
                      Персонажи
                      <span v-if="modal.data.characters?.length" class="selected-count">
                        ({{ modal.data.characters.length }} выбрано)
                      </span>
                    </label>

                    <button
                      type="button"
                      @click="modalCharacterSelectorOpen = !modalCharacterSelectorOpen"
                      class="selector-btn"
                      :class="{ active: modalCharacterSelectorOpen }"
                    >
                      <div class="selector-btn-content">
                        <i class="fas fa-paw"></i>
                        <span v-if="modal.data.characters?.length">
                          {{ modal.data.characters.length }} персонаж{{ modal.data.characters.length === 1 ? '' : (modal.data.characters.length < 5 ? 'а' : 'ей') }}
                        </span>
                        <span v-else>Выбрать персонажей</span>
                      </div>
                      <i class="fas fa-chevron-down" :class="{ rotated: modalCharacterSelectorOpen }"></i>
                    </button>

                    <div v-if="modalCharacterSelectorOpen" class="selector-dropdown">
                      <div class="selector-header">
                        <input
                          v-model="modalCharacterSearch"
                          type="text"
                          placeholder="Поиск персонажей..."
                          class="search-input"
                        >
                        <div class="selector-actions">
                          <button type="button" @click="modal.data.characters = []; modalCharacterSearch = ''">Очистить</button>
                        </div>
                      </div>

                      <div class="selector-list">
                        <label
                          v-for="character in filteredModalCharacters"
                          :key="character.id"
                          class="selector-item character-item"
                          :class="{ selected: modal.data.characters?.includes(character.name) }"
                        >
                          <input
                            type="checkbox"
                            :value="character.name"
                            v-model="modal.data.characters"
                          >
                          <img
                            :src="character.avatar_url || getDefaultCharacterAvatar(character.name)"
                            :alt="character.name"
                            class="item-avatar"
                          >
                          <div class="character-info">
                            <span class="item-name">{{ character.name }}</span>
                            <div class="character-meta">
                              <span class="item-count">{{ character.count || 0 }} появлений</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        v-model="modal.data.is_nsfw"
                        type="checkbox"
                        class="checkbox"
                      >
                      <span class="checkmark"></span>
                      <span class="checkbox-text">
                        <i class="fas fa-exclamation-triangle"></i>
                        NSFW контент
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" @click="closeModal" class="btn secondary">
                  Отмена
                </button>
                <button 
                  type="submit" 
                  class="btn primary" 
                  :disabled="submitting || !isModalFormValid"
                >
                  <span v-if="submitting">
                    <i class="fas fa-spinner spinning"></i>
                    Сохраняем...
                  </span>
                  <span v-else>
                    <i class="fas fa-save"></i>
                    Сохранить
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>

      <!-- Модалка удаления -->
      <Transition name="modal">
        <div v-if="deleteModal.show" class="modal-overlay" @click="cancelDelete">
          <div class="modal-content delete-modal" @click.stop>
            <div class="modal-header">
              <h3>
                <i class="fas fa-exclamation-triangle"></i>
                Подтверждение удаления
              </h3>
              <button @click="cancelDelete" class="modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="modal-body">
              <div class="delete-warning">
                <div class="delete-icon">
                  <i class="fas fa-trash"></i>
                </div>
                <div class="delete-text">
                  <h4>Удалить {{ getDeleteItemName() }}?</h4>
                  <p>{{ getDeleteWarning() }}</p>
                  
                  <div class="delete-item">
                    <img 
                      v-if="getDeleteItemAvatar()" 
                      :src="getDeleteItemAvatar()" 
                      :alt="getDeleteItemDisplayName()"
                      class="delete-avatar"
                    >
                    <div v-else class="delete-placeholder">
                      <i :class="getDeleteItemIcon()"></i>
                    </div>
                    <div>
                      <span class="delete-name">{{ getDeleteItemDisplayName() }}</span>
                      <span class="delete-type">{{ getDeleteItemTypeName() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button @click="cancelDelete" class="btn secondary">
                Отменить
              </button>
              <button 
                @click="executeDelete" 
                class="btn danger" 
                :disabled="deleting"
              >
                <span v-if="deleting">
                  <i class="fas fa-spinner spinning"></i>
                  Удаляем...
                </span>
                <span v-else>
                  <i class="fas fa-trash"></i>
                  Удалить
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Модальное окно подтверждения выхода -->
      <Transition name="modal">
        <div v-if="confirmExitModal.show" class="modal-overlay" @click.self="cancelExit">
          <div class="modal-content confirm-exit-modal" @click.stop>
            <div class="modal-header">
              <h3>
                <i class="fas fa-exclamation-circle"></i>
                Несохраненные изменения
              </h3>
              <button @click="cancelExit" class="modal-close">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="confirm-exit-content">
                <div class="confirm-exit-icon">
                  <i class="fas fa-save"></i>
                </div>
                <div class="confirm-exit-text">
                  <h4>У вас есть несохраненные данные</h4>
                  <p>Вы заполнили форму добавления арта, но не сохранили её. Если вы покинете эту страницу, все введенные данные будут потеряны.</p>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button @click="cancelExit" class="btn secondary">
                <i class="fas fa-arrow-left"></i>
                Вернуться к форме
              </button>
              <button @click="confirmExit" class="btn danger">
                <i class="fas fa-trash"></i>
                Покинуть без сохранения
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Уведомления -->
    <Teleport to="body">
      <div class="notifications">
        <Transition name="notification">
          <div v-if="notification.show" class="notification" :class="notification.type">
            <div class="notification-icon">
              <i :class="getNotificationIcon()"></i>
            </div>
            <span>{{ notification.message }}</span>
            <button @click="closeNotification" class="notification-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { furryApi } from '@/config/supabase.js'
import FileUploader from '@/components/FileUploader.vue'
import AvatarUploader from '@/components/AvatarUploader.vue'

// Константы
const ADMIN_CODE = import.meta.env.VITE_ADMIN_SECRET_CODE || 'FoxTaffy621'

// Состояние авторизации
const isAuthenticated = ref(false)
const authCode = ref('')
const authError = ref('')

// Состояние UI
const activeTab = ref('dashboard')
const refreshing = ref(false)
const submitting = ref(false)
const isSubmitting = ref(false)
const deleting = ref(false)

// Поиск
const artistSearch = ref('')
const tagSearch = ref('')
const characterSearch = ref('')
const artSearch = ref('')
const gallerySortOrder = ref('newest')
const showAdminNsfw = ref(true)

// Данные
const availableArtists = ref([])
const availableTags = ref([])
const availableCharacters = ref([])
const recentArts = ref([])
const stats = reactive({ arts: 0, artists: 0, tags: 0, characters: 0 })

// Форма добавления арта
const newArt = reactive({
  title: '',
  artistNickname: '',
  imageUrl: '',
  isNsfw: false
})

// Селекторы
const selectedTags = ref([])
const selectedCharacters = ref([])
const selectedArtist = ref('')
const showTagSelector = ref(false)
const showCharacterSelector = ref(false)
const showArtistSelector = ref(false)
const tagSearchQuery = ref('')
const characterSearchQuery = ref('')
const artistSearchQuery = ref('')

// Загрузка файлов
const uploadMethod = ref('s3')
const uploadProgress = ref(0)
const uploadedFileInfo = ref(null)
const isValidImageUrl = ref(false)

// Модальные окна
const modal = reactive({
  show: false,
  type: '',
  title: '',
  icon: '',
  data: {
    nickname: '',
    avatar_url: '',
    is_friend: false,
    name: '',
    title: '',
    artist_nickname: '',
    is_nsfw: false,
    created_date: '',
    tags: [],
    characters: []
  },
  editing: null
})

const deleteModal = reactive({
  show: false,
  type: '',
  item: null
})

// Модальное окно подтверждения выхода
const confirmExitModal = reactive({
  show: false,
  pendingTab: ''
})

// Селекторы в модальном окне
const modalArtistSelectorOpen = ref(false)
const modalArtistSearch = ref('')
const modalCharacterSelectorOpen = ref(false)
const modalCharacterSearch = ref('')

// Уведомления
const notification = reactive({
  show: false,
  message: '',
  type: 'info'
})

// Вычисляемые свойства
const mainTabs = computed(() => [
  { id: 'dashboard', name: 'Дашборд', icon: 'fas fa-tachometer-alt' },
  { id: 'add-art', name: 'Добавить арт', icon: 'fas fa-cloud-upload-alt' },
  { id: 'gallery', name: 'Галерея', icon: 'fas fa-images', count: stats.arts }
])

const manageTabs = computed(() => [
  { id: 'artists', name: 'Художники', icon: 'fas fa-palette', count: stats.artists },
  { id: 'tags', name: 'Теги', icon: 'fas fa-tags', count: stats.tags },
  { id: 'characters', name: 'Персонажи', icon: 'fas fa-paw', count: stats.characters }
])

const currentTabInfo = computed(() => {
  const tabMap = {
    dashboard: { title: 'Дашборд', subtitle: 'Обзор системы с S3 Storage' },
    'add-art': { title: 'Добавить арт', subtitle: 'Загрузка через S3 или URL' },
    artists: { title: 'Художники', subtitle: 'Управление художниками и авторами' },
    tags: { title: 'Теги', subtitle: 'Управление тегами и категориями' },
    characters: { title: 'Персонажи', subtitle: 'Управление персонажами и фурсонами' },
    gallery: { title: 'Галерея', subtitle: 'Просмотр и управление артами' }
  }
  return tabMap[activeTab.value] || { title: 'Fox Admin', subtitle: 'Панель управления' }
})

const uploadedFilesCount = computed(() => {
  return recentArts.value.filter(art => isS3Url(art.image_url)).length
})

const nsfwArtsCount = computed(() => {
  return recentArts.value.filter(art => art.is_nsfw).length
})

const sfwArtsCount = computed(() => {
  return recentArts.value.filter(art => !art.is_nsfw).length
})

const topArtists = computed(() => {
  return [...availableArtists.value]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 10)
})

const popularTags = computed(() => {
  return [...availableTags.value]
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 15)
})

const isFormValid = computed(() => {
  return newArt.title.trim().length >= 3 &&
         selectedArtist.value &&
         newArt.imageUrl.trim() &&
         (uploadMethod.value === 's3' ? uploadedFileInfo.value : isValidImageUrl.value)
})

// Проверка наличия несохраненных изменений в форме добавления арта
const hasUnsavedChanges = computed(() => {
  return newArt.title.trim() !== '' ||
         selectedArtist.value !== '' ||
         newArt.imageUrl.trim() !== '' ||
         selectedTags.value.length > 0 ||
         selectedCharacters.value.length > 0 ||
         newArt.isNsfw === true
})

const isModalFormValid = computed(() => {
  if (!modal.show) return false

  switch (modal.type) {
    case 'artist':
      return modal.data.nickname && modal.data.nickname.trim()
    case 'tag':
      return modal.data.name && modal.data.name.trim()
    case 'character':
      return modal.data.name && modal.data.name.trim()
    case 'art':
      return modal.data.title && modal.data.title.trim() && modal.data.artist_nickname
    default:
      return false
  }
})

// Фильтрованные списки
const filteredTags = computed(() => {
  if (!tagSearchQuery.value) return availableTags.value
  return availableTags.value.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchQuery.value.toLowerCase())
  )
})

const filteredCharacters = computed(() => {
  if (!characterSearchQuery.value) return availableCharacters.value
  return availableCharacters.value.filter(character => 
    character.name.toLowerCase().includes(characterSearchQuery.value.toLowerCase())
  )
})

const filteredArtistsForSelector = computed(() => {
  if (!artistSearchQuery.value) return availableArtists.value
  return availableArtists.value.filter(artist =>
    artist.name.toLowerCase().includes(artistSearchQuery.value.toLowerCase())
  )
})

const filteredModalArtists = computed(() => {
  if (!modalArtistSearch.value) return availableArtists.value
  return availableArtists.value.filter(artist =>
    artist.name.toLowerCase().includes(modalArtistSearch.value.toLowerCase())
  )
})

const filteredModalCharacters = computed(() => {
  if (!modalCharacterSearch.value) return availableCharacters.value
  return availableCharacters.value.filter(character =>
    character.name.toLowerCase().includes(modalCharacterSearch.value.toLowerCase())
  )
})

const filteredArtists = computed(() => {
  if (!artistSearch.value) return availableArtists.value
  return availableArtists.value.filter(artist => 
    artist.name.toLowerCase().includes(artistSearch.value.toLowerCase())
  )
})

const filteredTagsList = computed(() => {
  if (!tagSearch.value) return availableTags.value
  return availableTags.value.filter(tag => 
    tag.name.toLowerCase().includes(tagSearch.value.toLowerCase())
  )
})

const filteredCharactersList = computed(() => {
  if (!characterSearch.value) return availableCharacters.value
  return availableCharacters.value.filter(character => 
    character.name.toLowerCase().includes(characterSearch.value.toLowerCase())
  )
})

const filteredArtsList = computed(() => {
  let filtered = recentArts.value
  
  if (artSearch.value) {
    filtered = filtered.filter(art => 
      art.title.toLowerCase().includes(artSearch.value.toLowerCase()) ||
      art.artist_name.toLowerCase().includes(artSearch.value.toLowerCase())
    )
  }
  
  if (!showAdminNsfw.value) {
    filtered = filtered.filter(art => !art.is_nsfw)
  }
  
  return filtered
})

// Методы
const getDefaultAvatar = (name) => {
  const colors = ['FF7B25', '4CAF50', '2196F3', '9C27B0', 'FF5722']
  const colorIndex = name ? name.length % colors.length : 0
  const color = colors[colorIndex]
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  
  return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=ffffff&size=64&bold=true&format=png`
}

const getDefaultCharacterAvatar = (name) => {
  const emojis = ['🦊', '🐱', '🐺', '🐲', '🦝', '🐰', '🐻', '🦌']
  const emojiIndex = name ? name.length % emojis.length : 0
  const emoji = emojis[emojiIndex]
  
  return `https://ui-avatars.com/api/?name=${emoji}&background=FF7B25&color=ffffff&size=64&bold=true&format=png`
}

const getCharacterAvatarByName = (characterName) => {
  const character = availableCharacters.value.find(c => c.name === characterName)
  return character?.avatar_url || getDefaultCharacterAvatar(characterName)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isS3Url = (url) => {
  if (!url) return false
  return url.includes('supabase.co/storage') || url.includes('gallery/')
}

// Авторизация
const authenticate = () => {
  if (authCode.value === ADMIN_CODE) {
    isAuthenticated.value = true
    authError.value = ''
    localStorage.setItem('fox_admin_auth', 'true')
    loadInitialData()
  } else {
    authError.value = 'Неверный код доступа!'
    authCode.value = ''
  }
}

const logout = () => {
  isAuthenticated.value = false
  authCode.value = ''
  localStorage.removeItem('fox_admin_auth')
  activeTab.value = 'dashboard'
}
const setActiveTab = (tabName) => {
  activeTab.value = tabName
}
// Загрузка данных
const loadInitialData = async () => {
  refreshing.value = true
  
  try {
    const [artists, tags, characters, arts] = await Promise.all([
      furryApi.getFurryArtists(),
      furryApi.getFurryTags(),
      furryApi.getSpecies(),
      furryApi.getFurryArts({ limit: 100, showNsfw: true })
    ])
    
    availableArtists.value = artists
    availableTags.value = tags
    availableCharacters.value = characters
    recentArts.value = arts
    
    stats.artists = artists.length
    stats.tags = tags.length
    stats.characters = characters.length
    stats.arts = arts.length
    
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error)
    showNotification('Ошибка загрузки данных: ' + error.message, 'error')
  } finally {
    refreshing.value = false
  }
}

const loadRecentArts = async () => {
  try {
    const arts = await furryApi.getFurryArts({ 
      limit: 100, 
      sort: gallerySortOrder.value,
      showNsfw: showAdminNsfw.value
    })
    recentArts.value = arts
    stats.arts = arts.length
  } catch (error) {
    console.error('❌ Ошибка загрузки артов:', error)
  }
}

const refreshData = async () => {
  await loadInitialData()
  showNotification('Данные обновлены! 🔄', 'success')
}

// Обработчики загрузки файлов
const onFileUploaded = (fileInfo) => {
  uploadedFileInfo.value = fileInfo
  newArt.imageUrl = fileInfo.url
  isValidImageUrl.value = true
  showNotification('Файл успешно загружен в S3! 📤', 'success')
}

const onFileRemoved = () => {
  uploadedFileInfo.value = null
  newArt.imageUrl = ''
  isValidImageUrl.value = false
  uploadProgress.value = 0
}

const onUploadProgress = (progress) => {
  uploadProgress.value = progress
}

const onUploadError = (error) => {
  console.error('❌ Ошибка загрузки файла:', error)
  showNotification('Ошибка загрузки: ' + error.message, 'error')
  uploadedFileInfo.value = null
  uploadProgress.value = 0
}

// Методы для селекторов
const selectAllTags = () => {
  selectedTags.value = filteredTags.value.map(tag => tag.name)
}

const clearTags = () => {
  selectedTags.value = []
}

const removeTag = (tagName) => {
  selectedTags.value = selectedTags.value.filter(name => name !== tagName)
}

const createAndSelectTag = async (tagName) => {
  try {
    const newTag = await furryApi.createTag({ name: tagName.trim() })
    availableTags.value.push({
      id: newTag.id,
      name: newTag.name,
      count: 0
    })
    
    if (!selectedTags.value.includes(newTag.name)) {
      selectedTags.value.push(newTag.name)
    }
    
    tagSearchQuery.value = ''
    showNotification(`Тег "${newTag.name}" создан и добавлен! 🏷️`, 'success')
    
  } catch (error) {
    console.error('❌ Ошибка создания тега:', error)
    showNotification('Ошибка создания тега: ' + error.message, 'error')
  }
}

const selectAllCharacters = () => {
  selectedCharacters.value = filteredCharacters.value.map(char => char.name)
}

const clearCharacters = () => {
  selectedCharacters.value = []
}

const removeCharacter = (characterName) => {
  selectedCharacters.value = selectedCharacters.value.filter(name => name !== characterName)
}

const createAndSelectCharacter = async (characterName) => {
  try {
    const newCharacter = await furryApi.createCharacter({ name: characterName.trim() })
    availableCharacters.value.push({
      id: newCharacter.id,
      name: newCharacter.name,
      avatar_url: newCharacter.avatar_url,
      count: 0
    })
    
    if (!selectedCharacters.value.includes(newCharacter.name)) {
      selectedCharacters.value.push(newCharacter.name)
    }
    
    characterSearchQuery.value = ''
    showNotification(`Персонаж "${newCharacter.name}" создан и добавлен! 🦊`, 'success')
    
  } catch (error) {
    console.error('❌ Ошибка создания персонажа:', error)
    showNotification('Ошибка создания персонажа: ' + error.message, 'error')
  }
}

// Методы для работы с художниками
const clearArtist = () => {
  selectedArtist.value = ''
  newArt.artistNickname = ''
}

const createAndSelectArtist = async (artistName) => {
  try {
    const newArtist = await furryApi.createArtist({ 
      nickname: artistName.trim(),
      avatar_url: '',
      is_friend: false
    })
    
    availableArtists.value.push({
      id: newArtist.id,
      name: newArtist.nickname,
      avatar_url: newArtist.avatar_url,
      is_friend: newArtist.is_friend,
      count: 0
    })
    
    selectedArtist.value = newArtist.nickname
    newArt.artistNickname = newArtist.nickname
    
    artistSearchQuery.value = ''
    showArtistSelector.value = false
    showNotification(`Художник "${newArtist.nickname}" создан и выбран! 🎨`, 'success')
    
  } catch (error) {
    console.error('❌ Ошибка создания художника:', error)
    showNotification('Ошибка создания художника: ' + error.message, 'error')
  }
}

const getSelectedArtistAvatar = () => {
  const artist = availableArtists.value.find(a => a.name === selectedArtist.value)
  return artist?.avatar_url || getDefaultAvatar(selectedArtist.value)
}

const getSelectedArtistCount = () => {
  const artist = availableArtists.value.find(a => a.name === selectedArtist.value)
  return artist?.count || 0
}

const getSelectedArtistFriend = () => {
  const artist = availableArtists.value.find(a => a.name === selectedArtist.value)
  return artist?.is_friend || false
}

// Добавление арта
const addArt = async () => {
  if (!isFormValid.value) {
    showNotification('Проверьте правильность заполнения формы', 'warning')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const artData = {
      title: newArt.title.trim(),
      artist_nickname: selectedArtist.value,
      image_url: newArt.imageUrl.trim(),
      thumbnail_url: uploadedFileInfo.value?.thumbnailUrl || newArt.imageUrl.trim(),
      is_nsfw: newArt.isNsfw
    }
    
    const result = await furryApi.addFurryArt(artData)
    
    // Добавляем теги
    if (selectedTags.value.length > 0) {
      try {
        await furryApi.addArtTags(result.id, selectedTags.value)
      } catch (tagError) {
        console.warn('⚠️ Ошибка добавления тегов:', tagError)
      }
    }
    
    // Добавляем персонажей
    if (selectedCharacters.value.length > 0) {
      try {
        await furryApi.addArtCharacters(result.id, selectedCharacters.value)
      } catch (characterError) {
        console.warn('⚠️ Ошибка добавления персонажей:', characterError)
      }
    }
    
    showNotification('Арт успешно добавлен! 🎨✨', 'success')
    resetForm()
    await refreshData()
    activeTab.value = 'gallery'
    
  } catch (error) {
    console.error('❌ Ошибка добавления арта:', error)
    showNotification('Ошибка: ' + error.message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.assign(newArt, {
    title: '',
    artistNickname: '',
    imageUrl: '',
    isNsfw: false
  })
  
  selectedTags.value = []
  selectedCharacters.value = []
  selectedArtist.value = ''
  showTagSelector.value = false
  showCharacterSelector.value = false
  showArtistSelector.value = false
  tagSearchQuery.value = ''
  characterSearchQuery.value = ''
  artistSearchQuery.value = ''
  
  isValidImageUrl.value = false
  uploadedFileInfo.value = null
  uploadProgress.value = 0
}

// Модальные окна
const openModal = async (type, item = null) => {
  modal.type = type
  modal.editing = item

  // Сбрасываем свойства перед заполнением (не заменяя весь объект!)
  modal.data.nickname = ''
  modal.data.avatar_url = ''
  modal.data.is_friend = false
  modal.data.name = ''
  modal.data.title = ''
  modal.data.artist_nickname = ''
  modal.data.is_nsfw = false
  modal.data.created_date = ''
  modal.data.tags = []
  modal.data.characters = []

  switch (type) {
    case 'artist':
      modal.title = item ? 'Редактировать художника' : 'Добавить художника'
      modal.icon = 'fas fa-palette'
      // Явное присваивание свойств для правильной реактивности
      modal.data.nickname = item ? item.name : ''
      modal.data.avatar_url = item ? (item.avatar_url || '') : ''
      modal.data.is_friend = item ? (item.is_friend || false) : false
      break

    case 'tag':
      modal.title = item ? 'Редактировать тег' : 'Добавить тег'
      modal.icon = 'fas fa-tags'
      modal.data.name = item ? item.name : ''
      break

    case 'character':
      modal.title = item ? 'Редактировать персонажа' : 'Добавить персонажа'
      modal.icon = 'fas fa-paw'
      modal.data.name = item ? item.name : ''
      modal.data.avatar_url = item ? (item.avatar_url || '') : ''
      break

    case 'art':
      modal.title = 'Редактировать арт'
      modal.icon = 'fas fa-image'

      // Загружаем теги и персонажей арта
      const [artTags, artCharacters] = await Promise.all([
        furryApi.getArtTags(item.id),
        furryApi.getArtCharacters(item.id)
      ])

      modal.data.title = item.title || ''
      modal.data.artist_nickname = item.artist_name || ''
      modal.data.is_nsfw = item.is_nsfw || false
      modal.data.created_date = item.upload_date ? new Date(item.upload_date).toISOString().split('T')[0] : ''
      modal.data.tags = artTags || []
      modal.data.characters = artCharacters || []
      break
  }

  // Открываем модальное окно только после заполнения данных
  modal.show = true
}

const closeModal = () => {
  modal.show = false
  modal.type = ''
  modal.editing = null
  // Сбрасываем свойства, не заменяя весь объект (для сохранения реактивности)
  modal.data.nickname = ''
  modal.data.avatar_url = ''
  modal.data.is_friend = false
  modal.data.name = ''
  modal.data.title = ''
  modal.data.artist_nickname = ''
  modal.data.is_nsfw = false
  modal.data.created_date = ''
  modal.data.tags = []
  modal.data.characters = []
  modalArtistSelectorOpen.value = false
  modalArtistSearch.value = ''
  modalCharacterSelectorOpen.value = false
  modalCharacterSearch.value = ''
}

const editArtist = (artist) => openModal('artist', artist)
const editTag = (tag) => openModal('tag', tag)
const editCharacter = (character) => openModal('character', character)
const editArt = (art) => openModal('art', art)

const saveData = async () => {
  submitting.value = true
  
  try {
    let result
    
    switch (modal.type) {
      case 'artist':
        if (modal.editing) {
          result = await furryApi.updateArtist(modal.editing.id, modal.data)
          showNotification('Художник обновлен! 🎨', 'success')
          const index = availableArtists.value.findIndex(item => item.id === modal.editing.id)
          if (index !== -1) {
            availableArtists.value[index] = {
              ...availableArtists.value[index],
              name: modal.data.nickname,
              avatar_url: modal.data.avatar_url,
              is_friend: modal.data.is_friend
            }
          }
        } else {
          result = await furryApi.createArtist(modal.data)
          showNotification('Художник добавлен! 🎨', 'success')
          availableArtists.value.push({
            id: result.id,
            name: result.nickname,
            avatar_url: result.avatar_url,
            is_friend: result.is_friend,
            count: 0
          })
          stats.artists = availableArtists.value.length
        }
        break
        
      case 'tag':
        if (modal.editing) {
          result = await furryApi.updateTag(modal.editing.id, modal.data)
          showNotification('Тег обновлен! 🏷️', 'success')
          const index = availableTags.value.findIndex(item => item.id === modal.editing.id)
          if (index !== -1) {
            availableTags.value[index] = {
              ...availableTags.value[index],
              name: modal.data.name
            }
          }
        } else {
          result = await furryApi.createTag(modal.data)
          showNotification('Тег добавлен! 🏷️', 'success')
          availableTags.value.push({
            id: result.id,
            name: result.name,
            count: 0
          })
          stats.tags = availableTags.value.length
        }
        break
        
      case 'character':
        if (modal.editing) {
          result = await furryApi.updateCharacter(modal.editing.id, modal.data)
          showNotification('Персонаж обновлен! 🦊', 'success')
          const index = availableCharacters.value.findIndex(item => item.id === modal.editing.id)
          if (index !== -1) {
            availableCharacters.value[index] = {
              ...availableCharacters.value[index],
              name: modal.data.name,
              avatar_url: modal.data.avatar_url
            }
          }
        } else {
          result = await furryApi.createCharacter(modal.data)
          showNotification('Персонаж добавлен! 🦊', 'success')
          availableCharacters.value.push({
            id: result.id,
            name: result.name,
            avatar_url: result.avatar_url,
            count: 0
          })
          stats.characters = availableCharacters.value.length
        }
        break

      case 'art':
        result = await furryApi.updateArt(modal.editing.id, modal.data)
        showNotification('Арт обновлен! 🎨', 'success')
        const artIndex = recentArts.value.findIndex(item => item.id === modal.editing.id)
        if (artIndex !== -1) {
          recentArts.value[artIndex] = {
            ...recentArts.value[artIndex],
            title: modal.data.title,
            artist_name: modal.data.artist_nickname,
            is_nsfw: modal.data.is_nsfw,
            created_date: modal.data.created_date || recentArts.value[artIndex].created_date
          }
        }
        await loadRecentArts()
        break
    }

    closeModal()
  } catch (error) {
    console.error('❌ Ошибка сохранения:', error)
    showNotification('Ошибка: ' + error.message, 'error')
  } finally {
    submitting.value = false
  }
}

// Удаление
const confirmDelete = (type, item) => {
  deleteModal.type = type
  deleteModal.item = item
  deleteModal.show = true
}

const cancelDelete = () => {
  deleteModal.show = false
  deleteModal.type = ''
  deleteModal.item = null
}

const executeDelete = async () => {
  if (!deleteModal.item || !deleteModal.type) return
  
  deleting.value = true
  
  try {
    const itemName = getDeleteItemDisplayName()
    
    switch (deleteModal.type) {
      case 'artist':
        await furryApi.deleteArtist(deleteModal.item.id)
        showNotification(`Художник "${itemName}" удален! 🗑️`, 'success')
        availableArtists.value = availableArtists.value.filter(item => item.id !== deleteModal.item.id)
        stats.artists = availableArtists.value.length
        break
        
      case 'tag':
        await furryApi.deleteTag(deleteModal.item.id)
        showNotification(`Тег "${itemName}" удален! 🗑️`, 'success')
        availableTags.value = availableTags.value.filter(item => item.id !== deleteModal.item.id)
        stats.tags = availableTags.value.length
        break
        
      case 'character':
        await furryApi.deleteCharacter(deleteModal.item.id)
        showNotification(`Персонаж "${itemName}" удален! 🗑️`, 'success')
        availableCharacters.value = availableCharacters.value.filter(item => item.id !== deleteModal.item.id)
        stats.characters = availableCharacters.value.length
        break
        
      case 'art':
        await furryApi.deleteArt(deleteModal.item.id)
        showNotification(`Арт "${itemName}" удален! 🗑️`, 'success')
        recentArts.value = recentArts.value.filter(item => item.id !== deleteModal.item.id)
        stats.arts = recentArts.value.length
        break
    }
    
    cancelDelete()
    
  } catch (error) {
    console.error('❌ Ошибка удаления:', error)
    showNotification('Ошибка удаления: ' + error.message, 'error')
  } finally {
    deleting.value = false
  }
}

const getDeleteItemName = () => {
  const typeNames = {
    artist: 'художника',
    tag: 'тег',
    character: 'персонажа', 
    art: 'арт'
  }
  return typeNames[deleteModal.type] || 'элемент'
}

const getDeleteItemDisplayName = () => {
  if (!deleteModal.item) return ''
  
  switch (deleteModal.type) {
    case 'artist':
      return deleteModal.item.name
    case 'tag':
      return deleteModal.item.name
    case 'character':
      return deleteModal.item.name
    case 'art':
      return deleteModal.item.title
    default:
      return 'Неизвестно'
  }
}

const getDeleteItemTypeName = () => {
  const typeNames = {
    artist: 'Художник',
    tag: 'Тег',
    character: 'Персонаж',
    art: 'Арт'
  }
  return typeNames[deleteModal.type] || 'Элемент'
}

const getDeleteItemIcon = () => {
  const icons = {
    artist: 'fas fa-palette',
    tag: 'fas fa-tag',
    character: 'fas fa-paw',
    art: 'fas fa-image'
  }
  return icons[deleteModal.type] || 'fas fa-question'
}

const getDeleteItemAvatar = () => {
  if (!deleteModal.item) return ''
  
  switch (deleteModal.type) {
    case 'artist':
      return deleteModal.item.avatar_url || getDefaultAvatar(deleteModal.item.name)
    case 'character':
      return deleteModal.item.avatar_url || getDefaultCharacterAvatar(deleteModal.item.name)
    case 'art':
      return deleteModal.item.thumbnail_url || deleteModal.item.image_url
    default:
      return ''
  }
}

const getDeleteWarning = () => {
  switch (deleteModal.type) {
    case 'artist':
      return 'Все связанные арты также будут удалены.'
    case 'tag':
      return 'Тег будет удален со всех артов.'
    case 'character':
      return 'Персонаж будет удален со всех артов.'
    case 'art':
      return 'Это действие нельзя отменить.'
    default:
      return 'Это действие нельзя отменить.'
  }
}

// Функции для подтверждения выхода из формы
const tryChangeTab = (tabId) => {
  if (activeTab.value === 'add-art' && hasUnsavedChanges.value && tabId !== 'add-art') {
    confirmExitModal.pendingTab = tabId
    confirmExitModal.show = true
  } else {
    activeTab.value = tabId
  }
}

const confirmExit = () => {
  resetForm()
  activeTab.value = confirmExitModal.pendingTab
  confirmExitModal.show = false
  confirmExitModal.pendingTab = ''
}

const cancelExit = () => {
  confirmExitModal.show = false
  confirmExitModal.pendingTab = ''
}

const viewArt = (art) => {
  const imageUrl = art.image_url || art.thumbnail_url
  if (imageUrl) {
    window.open(imageUrl, '_blank', 'noopener,noreferrer')
  } else {
    showNotification('Изображение не найдено', 'error')
  }
}

// Уведомления
const showNotification = (message, type = 'info') => {
  notification.message = message
  notification.type = type
  notification.show = true
  
  setTimeout(() => {
    notification.show = false
  }, 4000)
}

const closeNotification = () => {
  notification.show = false
}

const getNotificationIcon = () => {
  switch (notification.type) {
    case 'success': return 'fas fa-check-circle'
    case 'error': return 'fas fa-exclamation-circle'
    case 'warning': return 'fas fa-exclamation-triangle'
    default: return 'fas fa-info-circle'
  }
}

// Жизненный цикл
onMounted(() => {
  if (localStorage.getItem('fox_admin_auth') === 'true') {
    isAuthenticated.value = true
    loadInitialData()
  }
  
  // Закрытие селекторов при клике снаружи
  document.addEventListener('click', (event) => {
    const selectorElements = document.querySelectorAll('.selector-btn, .selector-dropdown')
    const clickedInside = Array.from(selectorElements).some(el => el.contains(event.target))

    if (!clickedInside) {
      showTagSelector.value = false
      showCharacterSelector.value = false
      showArtistSelector.value = false
      modalArtistSelectorOpen.value = false
      modalCharacterSelectorOpen.value = false
    }
  })
})

// Синхронизация селектора художника с формой
watch(selectedArtist, (newValue) => {
  newArt.artistNickname = newValue
})

watch(activeTab, () => {
  artistSearch.value = ''
  tagSearch.value = ''
  characterSearch.value = ''
  artSearch.value = ''
})
</script>

<style scoped>
/* Базовые стили */
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #ffffff;
}

/* Экран авторизации */
.auth-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1a1a1a 0%, #0f0f0f 100%);
  z-index: 9999;
}

.auth-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-subtitle {
  color: #888;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.auth-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.auth-input:focus {
  outline: none;
  border-color: #ff6b35;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.auth-input.error {
  border-color: #ef4444;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #ff6b35;
}

.error-message {
  color: #ef4444;
  font-size: 0.9rem;
  text-align: left;
  margin: 0;
}

.auth-button {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(255, 107, 53, 0.4);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Основной интерфейс */
.admin-interface {
  display: flex;
  min-height: 100vh;
}

/* Боковая панель */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.brand h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.brand span {
  color: #888;
  font-size: 0.8rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section h3 {
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem 0;
  padding: 0 1.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
  position: relative;
}

.nav-item:hover {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.05);
}

.nav-item.active {
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.1);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #ff6b35;
}

.nav-item i {
  width: 20px;
  text-align: center;
}

.count-badge {
  background: #ff6b35;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  margin-left: auto;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 1rem;
}

.footer-btn {
  flex: 1;
  height: 45px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn:hover:not(:disabled) {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Основной контент */
.main-content {
  flex: 1;
  overflow-x: hidden;
}

.content-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-info p {
  margin: 0;
  color: #888;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 120px;
}

.stat-card i {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 107, 53, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b35;
  font-size: 1.2rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
}

/* Контент вкладок */
.tab-content {
  padding: 0.75rem;
  overflow: hidden;
}

/* Dashboard Compact */
.dashboard-compact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.stats-compact-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-compact {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.stat-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-compact:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.15);
  border-color: rgba(255, 107, 53, 0.3);
}

.stat-compact:hover::before {
  opacity: 1;
}

.stat-compact i {
  font-size: 2rem;
  color: #ff6b35;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.2) 100%);
  border-radius: 14px;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.15);
}

.stat-num {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-lbl {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.35rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard-middle,
.dashboard-bottom {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.dashboard-card-mini {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.dashboard-card-mini::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.dashboard-card-mini:hover::before {
  opacity: 1;
}

.dashboard-card-mini:hover {
  border-color: rgba(255, 107, 53, 0.2);
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.1);
}

.dashboard-card-mini h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
}

.dashboard-card-mini h3 i {
  color: #ff6b35;
  font-size: 0.9rem;
}

.card-header-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-header-mini h3 {
  margin: 0;
}

.view-btn-mini {
  background: rgba(255, 107, 53, 0.1);
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  color: #ff6b35;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn-mini:hover {
  background: rgba(255, 107, 53, 0.2);
}

.recent-arts-mini {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.art-mini {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.art-mini:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.25);
}

.art-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nsfw-badge-mini {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
}

.art-overlay-mini {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(247, 147, 30, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 1.5rem;
  backdrop-filter: blur(4px);
}

.art-mini:hover .art-overlay-mini {
  opacity: 1;
}

.content-mini {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.content-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 10px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.content-row:hover {
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  border-color: rgba(255, 107, 53, 0.2);
}

.content-row i {
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 8px;
}

.percent-mini {
  margin-left: auto;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.2));
  border-radius: 6px;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.top-list-mini {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.list-item-mini {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.list-item-mini:hover {
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
  border-color: rgba(255, 107, 53, 0.2);
  transform: translateX(4px);
}

.rank-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  object-fit: cover;
  border: none;
  position: relative;
  box-shadow:
    0 0 0 2px rgba(255, 107, 53, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.avatar-mini:hover {
  transform: scale(1.1) rotate(2deg);
  box-shadow:
    0 0 0 2px rgba(255, 107, 53, 0.8),
    0 8px 24px rgba(255, 107, 53, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.info-mini {
  flex: 1;
  min-width: 0;
}

.name-mini {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-mini {
  font-size: 0.75rem;
  color: rgba(255, 107, 53, 0.8);
  font-weight: 500;
}

.star-mini {
  color: #ffd700;
  font-size: 0.75rem;
}

.tags-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.tag-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.65rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  color: #818cf8;
  font-size: 0.75rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.tag-mini:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
}

.tag-mini span:first-child {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-mini span:last-child {
  font-weight: 700;
  font-size: 0.7rem;
  margin-left: 0.35rem;
  padding: 0.15rem 0.35rem;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 6px;
}
.quick-actions-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.quick-actions-card h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 2rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
}

.quick-actions-card h3 i {
  color: #ff6b35;
  font-size: 1.1rem;
}

.quick-actions-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  width: 100%;
  min-height: 70px;
}

.quick-action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.quick-action-btn:hover::before {
  opacity: 1;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.quick-action-btn:active {
  transform: translateY(0);
}

/* Варианты кнопок */
.quick-action-btn.primary {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: white;
}

.quick-action-btn.primary:hover {
  box-shadow: 0 12px 40px rgba(255, 107, 53, 0.4);
  background: linear-gradient(135deg, #ff7b45 0%, #f8a32e 100%);
}

.quick-action-btn.secondary {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.quick-action-btn.secondary:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.3) 100%);
  box-shadow: 0 12px 40px rgba(34, 197, 94, 0.3);
}

.quick-action-btn.tertiary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.quick-action-btn.tertiary:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
}

.quick-action-btn.quaternary {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(126, 34, 206, 0.2) 100%);
  border: 1px solid rgba(147, 51, 234, 0.3);
  color: #9333ea;
}

.quick-action-btn.quaternary:hover {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(126, 34, 206, 0.3) 100%);
  box-shadow: 0 12px 40px rgba(147, 51, 234, 0.3);
}

/* Элементы кнопки */
.btn-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.quick-action-btn.primary .btn-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.quick-action-btn.secondary .btn-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.quick-action-btn.tertiary .btn-icon {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.quick-action-btn.quaternary .btn-icon {
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
}

.btn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.btn-title {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
  color: inherit;
}

.btn-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.3;
  color: inherit;
}

.quick-action-btn.primary .btn-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.btn-arrow {
  flex-shrink: 0;
  font-size: 1rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.quick-action-btn:hover .btn-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.quick-action-btn:hover .btn-icon {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.2);
}

.quick-action-btn.secondary:hover .btn-icon {
  background: rgba(34, 197, 94, 0.3);
}

.quick-action-btn.tertiary:hover .btn-icon {
  background: rgba(59, 130, 246, 0.3);
}

.quick-action-btn.quaternary:hover .btn-icon {
  background: rgba(147, 51, 234, 0.3);
}

/* Адаптивность */
@media (min-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .quick-action-btn {
    min-height: 80px;
    padding: 1.5rem 2rem;
  }
  
  .btn-icon {
    width: 52px;
    height: 52px;
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .quick-action-btn {
    padding: 1rem;
    min-height: 60px;
  }
  
  .btn-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
}
.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 107, 53, 0.3);
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.storage-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.storage-item i {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
}

.storage-item span {
  font-weight: 600;
}

.storage-item small {
  color: #888;
  font-size: 0.8rem;
}

.recent-arts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.recent-art {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.recent-art:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

.recent-art img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.art-info {
  padding: 0.65rem;
}

.art-info h4 {
  margin: 0 0 0.35rem 0;
  font-size: 0.85rem;
  font-weight: 600;
}

.art-info p {
  margin: 0;
  color: #888;
  font-size: 0.8rem;
}

.nsfw-badge {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: inline-block;
}

/* Формы */
.art-form {
  max-width: 800px;
}

.form-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 2rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-section h3 i {
  color: #ff6b35;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
}

.selected-count {
  color: #ff6b35;
  font-weight: 600;
  font-size: 0.85rem;
}

.form-input,
.form-select {
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.tag-checkbox {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-checkbox input[type="checkbox"] {
  display: none;
}

.tag-checkbox .tag-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.tag-checkbox:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 123, 37, 0.3);
}

.tag-checkbox.selected {
  background: rgba(255, 123, 37, 0.2);
  border-color: rgba(255, 123, 37, 0.5);
}

.tag-checkbox.selected .tag-label {
  color: #ff7b25;
  font-weight: 600;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #ff6b35;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.select-group {
  display: flex;
  gap: 0.75rem;
}

.select-group .form-select {
  flex: 1;
}

.add-btn {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: rgba(255, 107, 53, 0.2);
}

/* Загрузка файлов */
.upload-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
}

.upload-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #888;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.3s ease;
}

.upload-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.upload-tab.active {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
}

.upload-area,
.url-input {
  margin-top: 1rem;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

/* NSFW чекбокс */
.nsfw-checkbox {
  grid-column: 1 / -1;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem;
  border-radius: 12px;
  transition: background 0.3s ease;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.checkbox-label:hover {
  background: rgba(239, 68, 68, 0.15);
}

.checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkmark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform-origin: center;
  transition: transform 0.2s ease;
}

.checkbox:checked + .checkmark {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-color: #ff6b35;
}

.checkbox:checked + .checkmark::after {
  transform: translate(-50%, -50%) scale(1) rotate(45deg);
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: white;
}

.nsfw-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  color: #f59e0b;
  font-size: 0.85rem;
}

/* Селекторы - базовые стили */
.selector-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
  gap: 0.75rem;
}

.selector-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.selector-btn.active {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.3);
  color: #ff6b35;
}

.selector-btn i.fa-chevron-down {
  transition: transform 0.3s ease;
}

.selector-btn i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

/* Селекторы - улучшенные стили */
.selector-btn-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.artist-item {
  padding: 1rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.artist-item:last-child {
  border-bottom: none;
}

.artist-item.selected {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.2);
}

.artist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.artist-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.friend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
}

.selected-artist-preview {
  margin-top: 0.75rem;
}

.selected-artist-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.selected-artist-card:hover {
  background: rgba(255, 107, 53, 0.15);
}

.selected-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  border: none;
  position: relative;
  box-shadow:
    0 0 0 3px rgba(255, 107, 53, 0.5),
    0 6px 20px rgba(255, 107, 53, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.selected-avatar:hover {
  transform: scale(1.08);
  box-shadow:
    0 0 0 3px rgba(255, 107, 53, 0.9),
    0 10px 32px rgba(255, 107, 53, 0.5),
    inset 0 2px 0 rgba(255, 255, 255, 0.25);
}

.selected-artist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selected-name {
  font-weight: 600;
  color: #ff6b35;
}

.selected-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: #888;
}

.friend-badge-small {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.clear-artist-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 107, 53, 0.3);
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.clear-artist-btn:hover {
  background: rgba(255, 107, 53, 0.2);
  transform: scale(1.1);
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 8px;
  color: #ff6b35;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgba(255, 107, 53, 0.2);
  transform: translateX(2px);
}

/* Статистика */
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(255, 107, 53, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b35;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.stat-icon.artists {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.stat-icon.tags {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.stat-progress {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #f7931e);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-bar.artists {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.progress-bar.tags {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

/* Хранилище */
.storage-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.storage-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #22c55e;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.storage-stats {
  text-align: right;
}

.storage-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  display: block;
}

.storage-label {
  font-size: 0.8rem;
  color: #888;
}

.storage-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Контент статистика */
.content-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid;
}

.content-item.sfw {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.content-item.nsfw {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.content-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.content-item.sfw .content-icon {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.content-item.nsfw .content-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.content-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.content-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.content-label {
  font-size: 0.75rem;
  color: #888;
}

.content-percentage {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.content-item.sfw .content-percentage {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.content-item.nsfw .content-percentage {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Последние арты */
.recent-arts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.recent-art {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.recent-art:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.art-image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.art-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recent-art:hover .art-image-container img {
  transform: scale(1.05);
}

.recent-art:hover .art-overlay {
  opacity: 1;
}

.art-date {
  font-size: 0.7rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Топ художники */
.top-artists {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.top-artist-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.top-artist-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.artist-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.artist-mini-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.artist-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.artist-name {
  font-weight: 600;
  color: white;
  font-size: 0.85rem;
}

.artist-count {
  font-size: 0.75rem;
  color: #888;
}

.friend-mini-badge {
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  padding: 0.3rem;
  border-radius: 6px;
  font-size: 0.8rem;
}

/* Популярные теги */
.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.popular-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.6rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  color: #3b82f6;
  font-size: 0.75rem;
  min-width: 70px;
  transition: all 0.3s ease;
}

.popular-tag:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.tag-name {
  font-weight: 500;
}

.tag-uses {
  background: rgba(59, 130, 246, 0.2);
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.selector-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.selector-btn.active {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.3);
  color: #ff6b35;
}

.selector-btn i.fa-chevron-down {
  transition: transform 0.3s ease;
}

.selector-btn i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: rgba(15, 15, 15, 0.98);
  border: 1px solid rgba(255, 123, 37, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 123, 37, 0.1);
  max-height: min(400px, calc(100vh - 300px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

/* Dropdown внутри модального окна - ограничиваем позиционирование */
.modal-body .selector-dropdown {
  position: absolute;
  max-height: min(280px, calc(100vh - 400px));
}

.modal-body .form-group {
  position: relative;
}

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

.selector-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9rem;
  font-family: inherit;
  margin-bottom: 0.75rem;
}

.search-input:focus {
  outline: none;
  border-color: #ff6b35;
  background: rgba(255, 255, 255, 0.08);
}

.selector-actions {
  display: flex;
  gap: 0.5rem;
}

.selector-actions button {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

.selector-actions button:hover {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.selector-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  max-height: 250px;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.selector-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.selector-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #ff6b35;
}

.item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  object-fit: cover;
  border: none;
  flex-shrink: 0;
  position: relative;
  box-shadow:
    0 0 0 2px rgba(255, 107, 53, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-avatar:hover {
  transform: scale(1.12) rotate(-2deg);
  box-shadow:
    0 0 0 2px rgba(255, 107, 53, 0.7),
    0 8px 24px rgba(255, 107, 53, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.item-name {
  flex: 1;
  font-weight: 500;
  font-size: 0.9rem;
}

.item-count {
  color: #888;
  font-size: 0.8rem;
  margin-left: auto;
}

.new-item {
  padding: 0.5rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px dashed rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  background: rgba(255, 107, 53, 0.05);
  color: #ff6b35;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.3s ease;
}

.new-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.5);
}

.selected-items {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 107, 53, 0.15);
  color: #ff6b35;
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-tag:hover {
  background: rgba(255, 107, 53, 0.25);
  transform: translateY(-1px);
}

.selected-tag i {
  font-size: 0.7rem;
  opacity: 0.7;
}

.selected-tag i:hover {
  opacity: 1;
}

.selected-character {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(147, 51, 234, 0.15);
  color: #9333ea;
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-character:hover {
  background: rgba(147, 51, 234, 0.25);
  transform: translateY(-1px);
}

.character-avatar {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  object-fit: cover;
  border: none;
  box-shadow:
    0 0 0 2px rgba(147, 51, 234, 0.5),
    0 2px 8px rgba(147, 51, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.character-avatar:hover {
  transform: scale(1.15);
  box-shadow:
    0 0 0 2px rgba(147, 51, 234, 0.8),
    0 4px 16px rgba(147, 51, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.selected-character i {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 0.25rem;
}

.selected-character i:hover {
  opacity: 1;
}

/* Кнопки формы */
.form-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(34, 197, 94, 0.3);
}

.btn.secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.9);
}

.btn.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn.danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(239, 68, 68, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Страницы управления */
.management-page {
  max-width: 1200px;
}

.management-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  z-index: 2;
}

.search-bar input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-bar input:focus {
  outline: none;
  border-color: #ff6b35;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.item-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-card .item-avatar {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  object-fit: cover;
  border: none;
  box-shadow:
    0 0 0 3px rgba(255, 107, 53, 0.4),
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.12);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-card:hover .item-avatar {
  transform: scale(1.08) rotate(-3deg);
  box-shadow:
    0 0 0 3px rgba(255, 107, 53, 0.8),
    0 12px 36px rgba(255, 107, 53, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
}

.tag-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.15);
  border: 2px solid rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b35;
  font-size: 1.2rem;
}

.item-info h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
}

.item-info p {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.friend-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 215, 0, 0.15);
  color: #ffd700;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.item-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: rgba(255, 107, 53, 0.1);
  color: #ff6b35;
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Галерея */
.gallery-page {
  max-width: 1200px;
}

.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.gallery-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nsfw-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.nsfw-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #22c55e;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.nsfw-toggle input:checked + .toggle-slider {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.nsfw-toggle input:checked + .toggle-slider::before {
  transform: translateX(26px);
  background: #ef4444;
}

.nsfw-toggle span {
  font-weight: 500;
  color: white;
  font-size: 0.9rem;
}

.sort-select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: inherit;
  cursor: pointer;
}

.arts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.art-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.art-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.art-card.nsfw {
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.art-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.art-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nsfw-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  z-index: 5;
}

.s3-indicator {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(34, 197, 94, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  z-index: 5;
}

.art-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(5px);
  color: white;
  font-size: 1.5rem;
}

.art-card:hover .art-overlay {
  opacity: 1;
}

.overlay-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
}

.overlay-btn:hover {
  background: white;
  transform: scale(1.1);
}

.overlay-btn.danger {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.overlay-btn.danger:hover {
  background: #ef4444;
}

.overlay-btn.edit {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.overlay-btn.edit:hover {
  background: #3b82f6;
}

.art-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #888;
  font-size: 0.8rem;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  margin: auto;
  display: flex;
  flex-direction: column;
}

.delete-modal {
  max-width: 450px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ff6b35;
  font-size: 1.3rem;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-form {
  display: flex;
  flex-direction: column;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* Удаление */
.delete-warning {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.delete-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #ef4444;
  flex-shrink: 0;
}

.delete-text {
  flex: 1;
}

.delete-text h4 {
  margin: 0 0 0.75rem 0;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.delete-text p {
  margin: 0 0 1.5rem 0;
  color: #888;
  line-height: 1.5;
}

.delete-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 12px;
}

.delete-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  border: none;
  flex-shrink: 0;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.5),
    0 6px 20px rgba(239, 68, 68, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.1);
}

.delete-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 1.3rem;
  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.4),
    0 6px 20px rgba(239, 68, 68, 0.2);
}

.delete-name {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.delete-type {
  color: #888;
  font-size: 0.85rem;
}

/* Модальное окно подтверждения выхода */
.confirm-exit-modal {
  max-width: 480px;
}

.confirm-exit-content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.confirm-exit-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #f59e0b;
  flex-shrink: 0;
}

.confirm-exit-text {
  flex: 1;
}

.confirm-exit-text h4 {
  margin: 0 0 0.75rem 0;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.confirm-exit-text p {
  margin: 0;
  color: #888;
  line-height: 1.6;
}

/* Уведомления */
.notifications {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 20000;
  pointer-events: none;
}

.notification {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  pointer-events: all;
  border-left: 4px solid;
  color: white;
}

.notification.success {
  border-left-color: #22c55e;
}

.notification.error {
  border-left-color: #ef4444;
}

.notification.warning {
  border-left-color: #f59e0b;
}

.notification.info {
  border-left-color: #3b82f6;
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.notification.success .notification-icon {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.notification.error .notification-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.notification.warning .notification-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.notification.info .notification-icon {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.notification-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active,
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .header-stats {
    grid-template-columns: 1fr;
  }
  
  .recent-arts {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .stats-grid {
    gap: 1rem;
  }
  
  .content-stats {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .admin-interface {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    order: 2;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 1rem;
  }
  
  .nav-section {
    display: flex;
    margin: 0;
    min-width: max-content;
  }
  
  .nav-section h3 {
    display: none;
  }
  
  .nav-item {
    white-space: nowrap;
    padding: 0.75rem 1rem;
    margin-right: 0.5rem;
    border-radius: 8px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-card {
    flex: 1;
    min-width: auto;
    padding: 0.75rem;
  }
  
  .tab-content {
    padding: 1.5rem;
  }
  
  .management-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-bar {
    max-width: none;
  }
  
  .items-grid,
  .arts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-width: none;
    width: 100%;
    max-height: calc(100vh - 1rem);
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-actions {
    padding: 1rem 1.5rem 1.5rem;
  }
  
  .notifications {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
  
  .notification {
    max-width: none;
  }
  
  .auth-card {
    padding: 2rem;
  }
  
  .auth-title {
    font-size: 1.8rem;
  }
  
  .gallery-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .gallery-controls {
    justify-content: space-between;
  }
  
  .selector-dropdown {
    position: fixed;
    top: 10%;
    left: 1rem;
    right: 1rem;
    max-height: 80vh;
    z-index: 10000;
  }
  
  .selected-artist-card {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .selected-avatar {
    width: 40px;
    height: 40px;
  }
  
  .recent-arts {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  
  .top-artists {
    gap: 0.75rem;
  }
  
  .top-artist-item {
    padding: 0.5rem;
    gap: 0.75rem;
  }
  
  .artist-mini-avatar {
    width: 32px;
    height: 32px;
  }
  
  .popular-tags {
    gap: 0.4rem;
  }
  
  .popular-tag {
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
    min-width: 70px;
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 1.5rem;
  }
  
  .brand {
    display: none;
  }
  
  .header-info h1 {
    font-size: 1.5rem;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stat-card {
    flex: none;
  }
  
  .dashboard-card {
    padding: 1.5rem;
  }
  
  .form-section h3 {
    font-size: 1.1rem;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .delete-warning {
    flex-direction: column;
    text-align: center;
  }
  
  .delete-icon {
    align-self: center;
  }
  
  .selected-items {
    justify-content: center;
  }
  
  .stats-grid {
    gap: 1rem;
  }
  
  .stat-item {
    gap: 0.75rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .storage-status {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .content-stats {
    gap: 1rem;
  }
  
  .content-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .content-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .content-number {
    font-size: 1.3rem;
  }
  
  .recent-arts {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>