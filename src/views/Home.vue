<script lang="ts">
import { defineComponent, computed } from "vue";
import { useUserStore } from "@/stores/user";
import Button from 'primevue/button';
import { useUiStore } from '@/stores/ui'

export default defineComponent({
  name: "HomePage",
  components: { Button },
	data(){
		return{
			currentUser: '',
			isAuthenticated: false,
		}
	},
  setup() {
    const userStore = useUserStore();
    const ui = useUiStore();
    const isDevMode = import.meta.env.VITE_APP_MODE === 'dev';

    // В dev режиме показываем контент даже без аутентификации
    

    return {
      userStore,
      ui,
      
    };
  },
  methods: {
		async	checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if(token && user){
				this.currentUser = JSON.parse(user);
        this.isAuthenticated = true;
        console.log(this.currentUser)
			}
        
      
    },
		handleStorageChange (event)  {
      // event.key — это ключ, который был изменен
      if (event.key === 'isAuthenticated') {
        // Обновляем reactive-свойство новым значением
        this.localData = event.newValue
      }
    },	
   async goToCalendar() {
      // this.ui.showLoading('Переход к календарю...')
			if(this.isAuthenticated){
      this.$router.push('/calendar')
      // this.ui.hideLoading()
			}else{
				this.$toast.add({
          severity: 'error',
          summary: 'Авторизация',
          detail: 'Войдите чтобы записаться на занятие',
          life: 3000
        })
			}
    },
    goToTeachers() {
      // this.ui.showLoading('Переход к преподавателям...')
      this.$router.push('/teachers')
      // this.ui.hideLoading()
    }
  },
	mounted() {
		this.checkAuth()
		window.addEventListener('storage', this.handleStorageChange);
	},
	beforeDestroy() {
		window.removeEventListener('storage', this.handleStorageChange);
	},
});
</script>

<template>
  <div class="home-page">
    <!-- Основной контент -->
    <div class="main-content">
      <!-- Hero секция -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Добро пожаловать в языковую студию!</h1>
          <p class="hero-subtitle">Изучайте английский и китайский языки с профессиональными преподавателями</p>
          <div class="hero-buttons">
            <Button
              label="Записаться на занятие"
              icon="pi pi-calendar-plus"
              class="primary-button"
              @click="goToCalendar"
            />
            <Button
              label="Узнать больше"
              icon="pi pi-info-circle"
              class="secondary-button"
              text
            />
          </div>
        </div>
        <div class="hero-image">
          <i class="pi pi-globe hero-icon"></i>
        </div>
      </section>

      <!-- О студии -->
      <section class="about-section">
        <h2 class="section-title">О нашей студии</h2>
        <div class="about-grid">
          <div class="about-card">
            <div class="card-icon">
              <i class="pi pi-users"></i>
            </div>
            <h3>Опытные преподаватели</h3>
            <p>Наши преподаватели имеют международные сертификаты и многолетний опыт преподавания</p>
          </div>

          <div class="about-card">
            <div class="card-icon">
              <i class="pi pi-clock"></i>
            </div>
            <h3>Гибкое расписание</h3>
            <p>Занимайтесь в удобное для вас время. Индивидуальные и групповые занятия</p>
          </div>

          <div class="about-card">
            <div class="card-icon">
              <i class="pi pi-star"></i>
            </div>
            <h3>Качественное обучение</h3>
            <p>Современные методики обучения, персональный подход к каждому студенту</p>
          </div>
        </div>
      </section>

      <!-- Языки -->
      <section class="languages-section">
        <h2 class="section-title">Изучаемые языки</h2>
        <div class="languages-grid">
          <div class="language-card english">
            <div class="language-header">
              <div class="flag-icon">🇺🇸</div>
              <h3>Английский язык</h3>
            </div>
            <ul class="language-features">
              <li>Разговорная практика</li>
              <li>Грамматика и лексика</li>
              <li>Подготовка к экзаменам</li>
              <li>Бизнес-английский</li>
            </ul>
            <Button
              label="Выбрать преподавателя"
              class="language-button"
              @click="goToTeachers"
            />
          </div>

          <div class="language-card chinese">
            <div class="language-header">
              <div class="flag-icon">🇨🇳</div>
              <h3>Китайский язык</h3>
            </div>
            <ul class="language-features">
              <li>Иероглифика</li>
              <li>Тональность</li>
              <li>Культура Китая</li>
              <li>HSK подготовка</li>
            </ul>
            <Button
              label="Выбрать преподавателя"
              class="language-button"
              @click="goToTeachers"
            />
          </div>
        </div>
      </section>

      <!-- Преимущества -->
      <section class="benefits-section">
        <h2 class="section-title">Почему выбирают нас</h2>
        <div class="benefits-list">
          <div class="benefit-item">
            <i class="pi pi-check-circle benefit-icon"></i>
            <div class="benefit-content">
              <h4>Индивидуальный подход</h4>
              <p>Программа обучения подбирается под ваши цели и уровень</p>
            </div>
          </div>

          <div class="benefit-item">
            <i class="pi pi-check-circle benefit-icon"></i>
            <div class="benefit-content">
              <h4>Удобное расписание</h4>
              <p>Занимайтесь в любое удобное время, включая выходные</p>
            </div>
          </div>

          <div class="benefit-item">
            <i class="pi pi-check-circle benefit-icon"></i>
            <div class="benefit-content">
              <h4>Результат гарантирован</h4>
              <p>Наши студенты достигают поставленных целей в изучении языков</p>
            </div>
          </div>

          <div class="benefit-item">
            <i class="pi pi-check-circle benefit-icon"></i>
            <div class="benefit-content">
              <h4>Современные материалы</h4>
              <p>Используем актуальные учебники и интерактивные материалы</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA секция -->
      <section class="cta-section">
        <div class="cta-content">
          <h2>Готовы начать изучение языка?</h2>
          <p>Запишитесь на первое занятие и оцените качество нашего обучения</p>
          <Button
            label="Записаться сейчас"
            icon="pi pi-calendar-plus"
            class="cta-button"
            @click="goToCalendar"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--surface-ground);
}

/* Hero секция */
.hero-section {
  display: flex;
  align-items: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  min-height: 60vh;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1rem 0 1rem 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.primary-button {
  background: white !important;
  color: var(--primary-color) !important;
  border: none !important;
  font-weight: 600;
}

.secondary-button {
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-icon {
  font-size: 8rem;
  opacity: 0.2;
}

/* Секции */
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  color: var(--text-color);
}

/* О студии */
.about-section {
  padding: 4rem 1.5rem;
  background: var(--surface-card);
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.about-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon i {
  font-size: 2rem;
  color: white;
}

.about-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.about-card p {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

/* Языки */
.languages-section {
  padding: 4rem 1.5rem;
  background: var(--surface-ground);
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.language-card {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid var(--surface-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.language-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.language-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.flag-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
}

.language-card h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.language-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.language-features li {
  padding: 0.5rem 0;
  color: var(--text-color-secondary);
  position: relative;
  padding-left: 1.5rem;
}

.language-features li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

.language-button {
  width: 100%;
  background: var(--primary-color) !important;
  border: none !important;
}

/* Преимущества */
.benefits-section {
  padding: 4rem 1.5rem;
  background: var(--surface-card);
}

.benefits-list {
  max-width: 800px;
  margin: 0 auto;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--surface-section);
  border: 1px solid var(--surface-border);
}

.benefit-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.benefit-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.benefit-content p {
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.6;
}

/* CTA секция */
.cta-section {
  padding: 4rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.cta-content p {
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.cta-button {
  background: white !important;
  color: var(--primary-color) !important;
  border: none !important;
  font-weight: 600;
  font-size: 1.125rem;
  padding: 1rem 2rem;
}

/* Ошибки */
.error-container,
.auth-error {
  text-align: center;
  padding: 2rem;
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 2rem;
}

.error-container h2,
.auth-error h2 {
  color: var(--red-500);
  margin-bottom: 1rem;
}

.error-container p,
.auth-error p {
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

/* Адаптация под мобильные устройства */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-icon {
    font-size: 4rem;
    margin-top: 2rem;
  }

  .about-grid,
  .languages-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .cta-content h2 {
    font-size: 1.75rem;
  }
}
</style>
