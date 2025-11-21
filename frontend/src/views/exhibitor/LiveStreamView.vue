<template>
  <!-- Full Screen Live Streaming Experience (Exhibitor) -->
  <div class="relative flex h-screen w-full max-w-lg lg:max-w-none mx-auto flex-col lg:flex-row overflow-hidden bg-black">

    <!-- Main Content Area with Video Player (Mobile Only) -->
    <div class="absolute lg:hidden inset-0 h-full w-full">
      <!-- Loading State -->
      <div v-if="loading" class="flex h-full items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>

      <!-- No Booth -->
      <div v-else-if="!booth" class="flex flex-col items-center justify-center h-full p-8 text-center">
        <div class="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Sin booth asignado</h3>
        <p class="text-gray-400 text-sm">Contacta al administrador</p>
      </div>

      <!-- Media Player -->
      <div v-else class="relative flex h-full w-full flex-col bg-black">
        <!-- Video Container -->
        <div
          id="video-container"
          class="relative flex h-full items-center justify-center bg-black bg-cover bg-center"
          :style="!isStreaming && booth.bannerUrl ? `background-image: url(${booth.bannerUrl})` : ''"
        >
          <!-- Local Video (when streaming) -->
          <div v-if="isStreaming || isPublishing" id="local-video" class="w-full h-full"></div>

          <!-- Placeholder when not streaming -->
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white z-10">
              <svg class="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p class="text-lg font-medium opacity-80">Vista Previa</p>
              <p class="text-sm opacity-60 mt-2">Inicia la transmisión para comenzar</p>
            </div>
            <!-- Dark overlay for better text readability -->
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- UI Overlay (Mobile Only) -->
    <div v-if="booth" class="lg:hidden relative z-10 flex h-full w-full flex-col justify-between pointer-events-none">

      <!-- Top App Bar -->
      <div class="flex items-center p-4 pb-2 justify-between bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-auto">
        <div class="flex items-center gap-3">
          <!-- Back Button -->
          <button
            @click="$router.go(-1)"
            class="flex cursor-pointer items-center justify-center rounded-full w-9 h-9 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <!-- Booth Logo/Avatar -->
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 ring-2 ring-white/30"
            :style="`background-image: url(${booth.logo || 'https://via.placeholder.com/40'})`"
          ></div>
          <div>
            <p class="text-white text-base font-bold leading-tight">{{ booth.name }}</p>
            <p v-if="isStreaming" class="text-white/90 text-sm font-medium leading-tight flex items-center gap-1">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              EN VIVO
            </p>
            <p v-else class="text-white/70 text-sm font-normal leading-tight">Offline</p>
          </div>
        </div>
        <!-- Duration (when live) -->
        <div v-if="isStreaming" class="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
          <span class="text-white text-sm font-bold font-mono">{{ streamDuration }}</span>
        </div>
      </div>

      <!-- Center Area: Comments Overlay -->
      <div class="flex flex-1 justify-between p-4 pb-0 pointer-events-none">
        <!-- Comments Overlay (Left Side) -->
        <div class="flex flex-col-reverse self-end h-1/2 max-w-[65%] overflow-hidden pointer-events-auto"
             style="mask-image: linear-gradient(to top, black 60%, transparent 100%)">
          <div class="flex flex-col gap-2">
            <div
              v-for="message in recentMessages"
              :key="message.id"
              class="flex w-full flex-row items-start justify-start gap-2 animate-slide-up"
            >
              <div
                class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-7 h-7 shrink-0"
                :style="`background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(message.user?.name || 'User')}&background=random)`"
              ></div>
              <div class="flex h-full flex-1 flex-col items-start justify-start rounded-lg bg-black/40 p-2 backdrop-blur-sm">
                <p class="text-white text-xs font-bold">{{ message.user?.name || 'Usuario' }}</p>
                <p class="text-white text-sm font-normal leading-snug">{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats (Right Side) -->
        <div v-if="isStreaming" class="flex flex-col gap-2 self-end pointer-events-auto">
          <div class="bg-black/50 backdrop-blur-sm rounded-xl p-3 text-center">
            <div class="text-xl font-bold text-white">{{ viewerCount }}</div>
            <div class="text-xs text-gray-300">Espectadores</div>
          </div>
          <div class="bg-black/50 backdrop-blur-sm rounded-xl p-3 text-center">
            <div class="text-xl font-bold text-white">{{ messageCount }}</div>
            <div class="text-xs text-gray-300">Mensajes</div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls -->
      <div class="p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-auto">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-3">
          <div class="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm font-medium">
            {{ errorMessage }}
          </div>
        </div>

        <!-- Start/Stop Button -->
        <button
          v-if="!isStreaming"
          @click="startStream"
          :disabled="starting"
          class="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-3"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ starting ? 'Iniciando...' : 'Iniciar Transmisión' }}
        </button>

        <button
          v-else
          @click="stopStream"
          :disabled="stopping"
          class="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-3"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          {{ stopping ? 'Deteniendo...' : 'Detener Transmisión' }}
        </button>

        <!-- Stream Controls (when live) -->
        <div v-if="isStreaming" class="grid grid-cols-3 gap-3 mb-3">
          <!-- Mute Audio -->
          <button
            @click="toggleAudio"
            :class="audioEnabled ? 'bg-black/40' : 'bg-red-600'"
            class="text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
          >
            <svg v-if="audioEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span class="text-xs">{{ audioEnabled ? 'Audio' : 'Mute' }}</span>
          </button>

          <!-- Toggle Video -->
          <button
            @click="toggleVideo"
            :class="videoEnabled ? 'bg-black/40' : 'bg-red-600'"
            class="text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
          >
            <svg v-if="videoEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span class="text-xs">{{ videoEnabled ? 'Video' : 'Off' }}</span>
          </button>

          <!-- Switch Camera -->
          <button
            @click="switchCamera"
            class="bg-black/40 text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-xs">Rotar</span>
          </button>
        </div>

        <!-- Chat Input (when live) -->
        <div v-if="isStreaming" class="flex items-center gap-3">
          <input
            v-model="newComment"
            @keyup.enter="sendComment"
            class="h-12 flex-1 rounded-full border-none bg-black/30 px-4 text-white placeholder-white/60 focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
            placeholder="Escribe un comentario..."
            type="text"
          />
          <button
            @click="sendComment"
            :disabled="!newComment.trim()"
            class="flex shrink-0 items-center justify-center rounded-full w-12 h-12 bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Layout (Header + 3 Columns) -->
    <div v-if="booth" class="hidden lg:flex flex-col h-screen w-full">

      <!-- Global Desktop Header -->
      <div class="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <!-- Left: Back Button -->
        <button
          @click="$router.go(-1)"
          class="flex cursor-pointer items-center justify-center rounded-full w-10 h-10 bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Center: Booth Info -->
        <div class="flex items-center gap-3">
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 ring-2 ring-white/30"
            :style="`background-image: url(${booth.logo || 'https://via.placeholder.com/40'})`"
          ></div>
          <div>
            <p class="text-white text-base font-bold leading-tight">{{ booth.name }} - Transmisión en Vivo</p>
            <p v-if="isStreaming" class="text-white/90 text-sm font-medium leading-tight flex items-center gap-1">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              EN VIVO • {{ streamDuration }}
            </p>
            <p v-else class="text-white/70 text-sm font-normal leading-tight">Offline</p>
          </div>
        </div>

        <!-- Right: Stats -->
        <div v-if="isStreaming" class="flex items-center gap-4">
          <div class="text-center">
            <div class="text-white text-xl font-bold">{{ viewerCount }}</div>
            <div class="text-gray-400 text-xs">Espectadores</div>
          </div>
          <div class="text-center">
            <div class="text-white text-xl font-bold">{{ messageCount }}</div>
            <div class="text-gray-400 text-xs">Mensajes</div>
          </div>
        </div>
      </div>

      <!-- 3 Columns Container with Gap -->
      <div class="flex flex-1 gap-6 p-6 overflow-hidden bg-gray-950">

        <!-- Video Column -->
        <div class="flex items-center justify-center w-[40%] bg-black rounded-xl overflow-hidden">
          <div class="aspect-[9/16] w-full max-h-full">
            <!-- Video Container -->
            <div
              id="video-container-desktop"
              class="relative flex h-full items-center justify-center bg-black bg-cover bg-center"
              :style="!isStreaming && booth.bannerUrl ? `background-image: url(${booth.bannerUrl})` : ''"
            >
              <!-- Local Stream (Exhibitor) -->
              <div v-if="isStreaming || isPublishing" id="local-video-desktop" class="w-full h-full"></div>

              <!-- Placeholder when not streaming -->
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <div class="text-center text-white z-10">
                  <svg class="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p class="text-lg font-medium opacity-80">Vista Previa</p>
                  <p class="text-sm opacity-60 mt-2">Inicia la transmisión para comenzar</p>
                </div>
                <!-- Dark overlay -->
                <div class="absolute inset-0 bg-black/40"></div>
              </div>
            </div>

            <!-- Control Buttons Below Video -->
            <div class="p-4 bg-gray-900 space-y-3">
              <!-- Error Message -->
              <div v-if="errorMessage">
                <div class="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm font-medium">
                  {{ errorMessage }}
                </div>
              </div>

              <!-- Start/Stop Button -->
              <button
                v-if="!isStreaming"
                @click="startStream"
                :disabled="starting"
                class="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ starting ? 'Iniciando...' : 'Iniciar Transmisión' }}
              </button>

              <button
                v-else
                @click="stopStream"
                :disabled="stopping"
                class="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                {{ stopping ? 'Deteniendo...' : 'Detener Transmisión' }}
              </button>

              <!-- Stream Controls (when live) -->
              <div v-if="isStreaming" class="grid grid-cols-3 gap-3">
                <!-- Mute Audio -->
                <button
                  @click="toggleAudio"
                  :class="audioEnabled ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'"
                  class="py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <svg v-if="audioEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  <span class="text-xs">{{ audioEnabled ? 'Audio' : 'Mute' }}</span>
                </button>

                <!-- Toggle Video -->
                <button
                  @click="toggleVideo"
                  :class="videoEnabled ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'"
                  class="py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <svg v-if="videoEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span class="text-xs">{{ videoEnabled ? 'Video' : 'Off' }}</span>
                </button>

                <!-- Switch Camera -->
                <button
                  @click="switchCamera"
                  class="bg-gray-800 text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="text-xs">Rotar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Column -->
        <div class="flex flex-col w-[30%] bg-gray-900 rounded-xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800">
            <h3 class="text-white text-lg font-bold">Chat</h3>
          </div>

          <!-- Messages -->
          <div ref="chatContainerDesktop" class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="messages.length === 0" class="text-center text-gray-500 mt-8">
              <p>No hay mensajes aún</p>
            </div>
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex w-full flex-row items-start justify-start gap-2"
            >
              <div
                class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0"
                :style="`background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(message.user?.name || 'User')}&background=random)`"
              ></div>
              <div class="flex h-full flex-1 flex-col items-start justify-start rounded-lg bg-gray-800 p-3">
                <p class="text-white text-sm font-bold">{{ message.user?.name || 'Usuario' }}</p>
                <p class="text-white text-base font-normal leading-snug">{{ message.content }}</p>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="p-4 bg-gray-800 border-t border-gray-700">
            <div class="flex items-center gap-3">
              <input
                v-model="newComment"
                @keyup.enter="sendComment"
                class="h-12 flex-1 rounded-full border-none bg-gray-700 px-4 text-white placeholder-white/60 focus:ring-2 focus:ring-pink-500"
                placeholder="Escribe un comentario..."
                type="text"
              />
              <button
                @click="sendComment"
                :disabled="!newComment.trim()"
                class="flex shrink-0 items-center justify-center rounded-full w-12 h-12 bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Products Column -->
        <div class="flex flex-col w-[30%] bg-gray-900 rounded-xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800">
            <h3 class="text-white text-lg font-bold">Productos</h3>
            <router-link
              :to="`/exhibitor/products`"
              class="text-pink-500 text-sm hover:text-pink-400"
            >
              Gestionar
            </router-link>
          </div>

          <!-- Products List -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="products.length === 0" class="text-center text-gray-500 mt-8">
              <p>No hay productos aún</p>
              <router-link
                :to="`/exhibitor/products`"
                class="text-pink-500 text-sm hover:text-pink-400 mt-2 inline-block"
              >
                Agregar productos
              </router-link>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="product in products"
                :key="product.id"
                class="flex flex-col gap-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all p-3"
              >
                <div
                  class="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-xl"
                  :style="`background-image: url(${product.images?.[0] || 'https://via.placeholder.com/64'})`"
                ></div>
                <div class="flex flex-col">
                  <p class="text-white text-sm font-semibold line-clamp-2">{{ product.name }}</p>
                  <p class="text-pink-400 text-base font-bold mt-1">S/ {{ formatPrice(product.price) }}</p>
                  <p v-if="product.stock > 0" class="text-gray-400 text-xs mt-1">Stock: {{ product.stock }}</p>
                  <p v-else class="text-red-400 text-xs font-medium mt-1">Sin stock</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useBoothsStore } from '@/stores/booths'
import { useAgora } from '@/composables/useAgora'
import { subscribeToBoothMessages, unsubscribeFromChannel } from '@/services/supabase'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import api from '@/services/api'

const boothsStore = useBoothsStore()

const loading = ref(true)
const booth = ref(null)
const starting = ref(false)
const stopping = ref(false)
const errorMessage = ref('')

// Agora streaming
const {
  client,
  isJoined,
  isPublishing,
  joinChannel,
  leaveChannel,
  startPublishing,
  stopPublishing,
  toggleAudio: toggleAudioTrack,
  toggleVideo: toggleVideoTrack,
  switchCamera: switchCameraDevice
} = useAgora()

const isStreaming = computed(() => booth.value?.isStreaming || false)
const audioEnabled = ref(true)
const videoEnabled = ref(true)

// Statistics
const viewerCount = ref(0)
const messageCount = ref(0)
const streamStartTime = ref(null)
const streamDuration = ref('00:00')
let durationInterval = null

// Chat
const newComment = ref('')
const messages = ref([])
const products = ref([])
let realtimeChannel = null
let messagePollingInterval = null

// Chat auto-scroll for desktop
const chatContainerDesktop = ref(null)

// Only show last 5 messages as overlay
const recentMessages = computed(() => {
  return messages.value.slice(-5)
})

// Auto-scroll to bottom when new messages arrive (desktop chat)
watch(messages, async () => {
  await nextTick()
  if (chatContainerDesktop.value) {
    chatContainerDesktop.value.scrollTop = chatContainerDesktop.value.scrollHeight
  }
}, { deep: true })

onMounted(async () => {
  try {
    const response = await boothsStore.fetchMyBooth()
    booth.value = response

    // Load products
    await loadProducts()

    // Load messages
    await loadMessages()

    // Subscribe to real-time messages
    subscribeToMessages()

    // If already streaming, rejoin
    if (booth.value.isStreaming) {
      await rejoinStream()
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Error al cargar el booth'
  } finally {
    loading.value = false
  }
})

onUnmounted(async () => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval)
  }
  if (realtimeChannel) {
    unsubscribeFromChannel(realtimeChannel)
  }
  if (isJoined.value) {
    await leaveChannel()
  }
})

// Load products
async function loadProducts() {
  try {
    const response = await api.get(`/products/booth/${booth.value.id}`)
    products.value = response.data.products || []
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

// Load messages
async function loadMessages() {
  try {
    const response = await api.get(`/messages/booth/${booth.value.id}`, {
      params: { limit: 100 }
    })
    messages.value = response.data.messages || []
    messageCount.value = messages.value.length
  } catch (err) {
    console.error('Error loading messages:', err)
  }
}

// Subscribe to real-time messages
function subscribeToMessages() {
  try {
    // Clear any existing interval first to prevent duplicates
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval)
      messagePollingInterval = null
    }

    realtimeChannel = subscribeToBoothMessages(booth.value.id, async () => {
      // Reload messages when new one arrives
      await loadMessages()
    })

    // Always use polling as fallback/supplement (every 2 seconds)
    messagePollingInterval = setInterval(async () => {
      try {
        await loadMessages()
      } catch (error) {
        // Stop polling if we're rate limited
        if (error.response?.status === 429) {
          console.warn('Rate limited, stopping message polling')
          if (messagePollingInterval) {
            clearInterval(messagePollingInterval)
            messagePollingInterval = null
          }
        }
      }
    }, 2000)

    if (!realtimeChannel) {
      console.warn('Real-time chat not available (Supabase not configured), using polling only')
    }
  } catch (error) {
    console.error('Failed to subscribe to messages:', error)
  }
}

// Send comment
async function sendComment() {
  if (!newComment.value.trim()) return

  try {
    await api.post('/messages', {
      boothId: booth.value.id,
      content: newComment.value.trim()
    })
    newComment.value = ''
    // Reload messages immediately
    await loadMessages()
  } catch (err) {
    console.error('Error sending message:', err)
    errorMessage.value = 'Error al enviar mensaje'
    setTimeout(() => errorMessage.value = '', 3000)
  }
}

async function startStream() {
  starting.value = true
  errorMessage.value = ''

  try {
    // Start streaming on backend
    const response = await api.post(`/booths/${booth.value.id}/stream/start`)
    const { booth: updatedBooth, streaming } = response.data

    booth.value = updatedBooth
    // Update store so ExhibitorLayout can react
    boothsStore.myBooth = updatedBooth

    // Join Agora channel as host
    await joinChannel(streaming.appId, streaming.channel, streaming.token, streaming.uid, 'host')

    // Set up event listeners for viewer count
    if (client.value) {
      client.value.on('user-joined', (user) => {
        console.log('👤 Viewer joined:', user.uid)
        viewerCount.value = client.value.remoteUsers?.length || 0
      })

      client.value.on('user-left', (user) => {
        console.log('👋 Viewer left:', user.uid)
        viewerCount.value = client.value.remoteUsers?.length || 0
      })
    }

    // Channel is now fully ready (joinChannel already waited 2s internally)
    // Start publishing (try both mobile and desktop containers)
    const videoContainer = document.getElementById('local-video') || document.getElementById('local-video-desktop')
    await startPublishing(videoContainer?.id || 'local-video')

    // Start duration counter
    streamStartTime.value = Date.now()
    startDurationCounter()

    // Reset stats
    viewerCount.value = 0
  } catch (error) {
    console.error('Start stream error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al iniciar la transmisión'
  } finally {
    starting.value = false
  }
}

async function stopStream() {
  stopping.value = true
  errorMessage.value = ''

  try {
    // Stop publishing
    await stopPublishing()

    // Leave channel
    await leaveChannel()

    // Stop message polling
    if (messagePollingInterval) {
      clearInterval(messagePollingInterval)
      messagePollingInterval = null
    }

    // Unsubscribe from realtime channel
    if (realtimeChannel) {
      unsubscribeFromChannel(realtimeChannel)
      realtimeChannel = null
    }

    // Stop streaming on backend
    await api.post(`/booths/${booth.value.id}/stream/stop`)
    booth.value.isStreaming = false
    // Update store so ExhibitorLayout can react
    if (boothsStore.myBooth) {
      boothsStore.myBooth.isStreaming = false
    }

    // Stop duration counter
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
    streamDuration.value = '00:00'
  } catch (error) {
    console.error('Stop stream error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al detener la transmisión'
  } finally {
    stopping.value = false
  }
}

async function rejoinStream() {
  try {
    // Get stream token
    const response = await api.get(`/booths/${booth.value.id}/stream-token`)
    const { appId, channel, token, uid } = response.data

    // Join as host
    await joinChannel(appId, channel, token, uid, 'host')

    // Start publishing
    const videoContainer = document.getElementById('local-video') || document.getElementById('local-video-desktop')
    await startPublishing(videoContainer?.id || 'local-video')

    // Estimate stream start time
    if (booth.value.streamStarted) {
      streamStartTime.value = new Date(booth.value.streamStarted).getTime()
      startDurationCounter()
    }
  } catch (error) {
    console.error('Rejoin stream error:', error)
    errorMessage.value = 'Error al reconectar con la transmisión'
  }
}

async function toggleAudio() {
  audioEnabled.value = !audioEnabled.value
  await toggleAudioTrack(!audioEnabled.value)
}

async function toggleVideo() {
  videoEnabled.value = !videoEnabled.value
  await toggleVideoTrack(videoEnabled.value)
}

async function switchCamera() {
  try {
    await switchCameraDevice()
  } catch (error) {
    console.error('Switch camera error:', error)
  }
}

function startDurationCounter() {
  if (durationInterval) {
    clearInterval(durationInterval)
  }

  durationInterval = setInterval(async () => {
    if (!streamStartTime.value) return

    const elapsed = Date.now() - streamStartTime.value
    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    const displayMinutes = minutes % 60
    const displaySeconds = seconds % 60

    if (hours > 0) {
      streamDuration.value = `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
    } else {
      streamDuration.value = `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
    }

    // Update real viewer count from Agora (remote users count)
    if (client.value) {
      viewerCount.value = client.value.remoteUsers?.length || 0
    }
  }, 1000)
}

function formatPrice(price) {
  return parseFloat(price).toFixed(2)
}
</script>

<style scoped>
/* Slide up animation for new messages */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
