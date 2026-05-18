<template>
  <div class="container">
    <div v-if="loading" class="loading">
      Загрузка...
    </div>
    
    <div v-else>
      <div class="content">
        <p>Последнее обновление: {{ lastUpdated }}</p>
        <p>Данные: {{ data }}</p>
      </div>
    </div>
    
    <div class="buttons">
      <button @click="refresh" :disabled="loading">
        🔄 Обновить
      </button>
      
      <button @click="hardRefresh" :disabled="loading">
        ⚡ Полное обновление
      </button>
      
      <button @click="refreshWithDelay" :disabled="loading">
        ⏱ Обновить с задержкой
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
      loading: false,
      lastUpdated: null,
      componentKey: 0
    }
  },
  
  mounted() {
    this.loadInitialData()
  },
  
  methods: {
    async loadInitialData() {
      await this.fetchData()
    },
    
    async fetchData() {
      this.loading = true
      
      try {
        // Имитация API запроса
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({
              data: {
                value: Math.random(),
                timestamp: new Date().toLocaleTimeString()
              }
            })
          }, 1000)
        })
        
        this.data = response.data
        this.lastUpdated = new Date().toLocaleString()
        
      } catch (error) {
        console.error('Ошибка:', error)
        this.data = { error: 'Ошибка загрузки' }
      } finally {
        this.loading = false
      }
    },
    
    // Обычное обновление
    async refresh() {
      await this.fetchData()
    },
    
    // Полное обновление через key
    hardRefresh() {
      this.componentKey++
    },
    
    // Обновление с дополнительными действиями
    async refreshWithDelay() {
      this.loading = true
      
      // Показываем сообщение
      this.$emit('show-message', 'Обновление через 2 секунды...')
      
      setTimeout(async () => {
        await this.fetchData()
        this.$emit('show-message', 'Данные обновлены!')
      }, 2000)
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  background: #f0f0f0;
}

.buttons button {
  margin: 10px;
  padding: 10px 20px;
  cursor: pointer;
}

.buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>