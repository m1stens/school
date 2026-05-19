<template>
  <div class="profile-page">
    <div class="main-content">
      <div class="page-header">
        <h1>Мой профиль</h1>
        <p>Информация о вашем аккаунте</p>
				
      </div>
			<div v-if="loading" class="loading-overlay">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Загрузка данных профиля...</p>
        </div>
        <div class="profile-header">
          <Avatar
            :label="'U'"
            shape="circle"
            size="xlarge"
            class="profile-avatar"
          />
          <div class="profile-info">
            <h2>
        			{{ currentUser.name }}  
      			</h2>
            <p class="user-role" >
        			 {{ currentUser.role }}  
      			</p>
            <p class="user-status">
              <i class="pi pi-check-circle"></i>
              Активный пользователь
            </p>
          </div>
        </div>
			<div class="detail-section">
            <h3>Личная информация</h3>
            <div class="detail-grid">
             
              <div class="detail-item">
                <label>Имя</label>
									<span >
        						 {{ currentUser.name }}  
      						</span>
                
              </div>
             
              <div class="detail-item">
                <label>Телефон</label>
								<span >
        					 {{ currentUser.phone }} 
      					</span>
                
              </div>
              <div class="detail-item">
                <label>Email</label>
								<span >
        					 {{ currentUser.email }} 
      					</span>
                
              </div>
              <div class="detail-item">
                <label>Роль в системе</label>
								<span>
        					 {{ currentUser.role }}  
      					</span>
                <!-- <span>{{ getUserRoleName() }}</span> -->
              </div>
            </div>

          </div>
					<div v-if="currentUser.role === 'Студент'" class="detail-section">
            <div v-if="loading" class="loading-section">
              <i class="pi pi-spin pi-spinner"></i>
              <p>Загрузка данных студента...</p>
            </div>
            <div v-else>
            <h3>Данные студента</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Уровень</label>
                 <span>{{ student.level || 'Не указан' }}</span> 
              </div>
              <div class="detail-item">
                <label>Предпочитаемые языки</label>
               <span>{{ student.preferred_languages || 'Не указаны' }}</span> 
              </div>
              <div class="detail-item full-width">
                <label>Цели обучения</label>
                <span>{{ student.study_goals || 'Не указаны' }}</span> 
              </div>
            </div>

            </div>
          </div>
					<div v-if="currentUser.role === 'Учитель'" class="detail-section">
            <div v-if="loading" class="loading-section">
              <i class="pi pi-spin pi-spinner"></i>
              <p>Загрузка данных учителя...</p>
            </div>
            <div v-else>
            <h3>Данные учителя</h3>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>О себе</label>
                <span>{{ teacher.bio || 'Не указано' }}</span> 
              </div>
              <div class="detail-item">
                <label>Специализация</label>
                 <span>{{ teacher.specialization || 'Не указана' }}</span> 
              </div>
              <div class="detail-item">
                <label>Опыт работы</label>
                <span>{{ teacher.experience_years || 0 }} лет</span> 
              </div>
              <div class="detail-item">
                <label>Почасовая ставка</label>
                 <span>{{ teacher.hourly_rate || 0 }} ₽</span> 
              </div>
              <div class="detail-item full-width">
                <label>Образование</label>
                 <span>{{ teacher.education || 'Не указано' }}</span> 
              </div>
              <div class="detail-item full-width">
                <label>Сертификаты</label>
                 <span>{{ Array.isArray(teacher.certificates) ? teacher.certificates.join(', ') : teacher.certificates || 'Не указаны' }}</span> 
              </div>
            </div>

            </div>
          </div>
					<div class="detail-section">
            <h3>Действия</h3>
            <div class="actions-grid">
              <Button
                label="Редактировать профиль"
                icon="pi pi-pencil"
                class="action-button"
                @click="openEditProfile"
                outlined
              />
              <Button
                v-if="currentUser.role === 'Студент'"
                label="Редактировать данные студента"
                icon="pi pi-pencil"
                class="action-button"
                @click="openEditStudent"
                outlined
              />
              <Button
                v-if="currentUser.role === 'Учитель' "
                label="Редактировать данные учителя"
                icon="pi pi-pencil"
                class="action-button"
                @click="openEditTeacher"
                outlined
              />
             
              <Button
                label="Связаться с поддержкой"
                icon="pi pi-comments"
                class="action-button"
                outlined
              />
              <Button
                label="Политика конфиденциальности"
                icon="pi pi-file"
                class="action-button"
                outlined
              />
            </div>
          </div>

      <EditProfileDialog
        v-model:visible="editProfileDialog"
        v-model:modelValue="editForm"
        :saving="saving"
        @save="saveProfile"
      />

      <EditStudentDialog
        v-model:visible="editStudentDialog"
        v-model:modelValue="editStudentForm"
        @saved="onStudentSaved"
      />

      <EditTeacherDialog
        v-model:visible="editTeacherDialog"
        v-model:modelValue="editTeacherForm"
        @saved="onTeacherSaved"
      />

      <!-- Данные пользователя -->
      

      <NotificationSettingsDialog
        v-model:visible="notificationSettingsDialog"
        :settings="notificationSettings"
        :loading="savingNotifications"
        @save="saveNotificationSettings"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import type { UserProfile } from '@/types/user.ts'
import EditProfileDialog from '@/components/dialogs/EditProfileDialog.vue'
import EditStudentDialog from '@/components/dialogs/EditStudentDialog.vue'
import EditTeacherDialog from '@/components/dialogs/EditTeacherDialog.vue'
import NotificationSettingsDialog from '@/components/dialogs/NotificationSettingsDialog.vue'
import { NotificationSettings } from '@/types/notification'
import { notificationsApi } from '@/services/api/notification'
import axios from 'axios';

export default defineComponent({
  name: 'ProfilePage',
  components: {
    Avatar,
    Button,
    EditProfileDialog,
    EditStudentDialog,
    EditTeacherDialog,
    NotificationSettingsDialog
  },
  data() {
    return {
			currentUser: {
				name: '',
				phone:'',
				email:'',
				role: '',
			},
      userStore: useUserStore(),
      router: useRouter(),
      editProfileDialog: false,
      editStudentDialog: false,
      editTeacherDialog: false,
      saving: false,
      loading: false,
      dataNotFound: false,
      editForm: {
        name: '',
        phone_number: '',
        email: ''
      },
      editStudentForm: {
        telegram_id: String(useUserStore().userData?.telegram_id || ''),
        study_goals: '',
        level: '',
        preferred_languages: [] as string[]
      },
      editTeacherForm: {
        bio: '',
        specialization: '',
        experience_years: 0,
        education: '',
        certificates: [] as string[],
        hourly_rate: 0
      },
      phoneFocused: false,
      emailFocused: false,
      notificationSettingsDialog: false,
      notificationSettings: null as NotificationSettings | null,
      savingNotifications: false,
			users: [],           // Список пользователей
      newUser: {          // Данные новой формы
        name: '',
        phone: '',
        email: '',
        password: '',
        role: '',
      },
			teacher:{
				bio: '',
				specialization: '',
				experience_years: '',
				education: '',
				certificates: '',
				hourly_rate: '',
			},
			student:{
				level: '',
				preferred_languages: '',
				study_goals: '',
			},
			teachers:[],
			
			isAuthenticated: false,
    }
  },
  computed: {
    isAuthenticated(): boolean {
      return this.userStore.isAuthenticated
    },
    userData(): UserProfile | null {
      return this.userStore.userData
    },
    userRole(): string {
      return this.userStore.userRole
    },
    emailError(): boolean {
      const email = this.editForm.email?.trim()
      if (!email) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !emailRegex.test(email)
    },
    phoneError(): boolean {
      const raw = (this.editForm.phone_number ?? '').replace(/\D/g, '')
      if (raw.length === 0) return false
      if (raw.length === 11 && raw.startsWith('7')) return false
      return !(raw.length === 10)
    },
    isPhoneActive(): boolean {
      return this.phoneFocused || !!(this.editForm.phone_number && this.editForm.phone_number.toString().trim().length)
    },
    isEmailActive(): boolean {
      return this.emailFocused || !!(this.editForm.email && this.editForm.email.toString().trim().length)
    }
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
		async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:3000/api/users');
				//const response1 = await axios.get(`http://localhost:3000/api/teachers/${}`);
        this.users = response.data;
			
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    },
		async fetchStudent(){
			if (!this.currentUser?.id) return;
			try {
				const response1 = await axios.get(`http://localhost:3000/api/students/${this.currentUser.id}`);
				this.student = response1.data;
			} catch (e) {
				if (axios.isAxiosError?.(e) && e.response?.status === 404) {
					this.student = {
						level: '',
						preferred_languages: '',
						study_goals: '',
					};
					return;
				}
				console.error(e);
			}
		},
		async fetchTeacherAndStudent(){
			if (!this.currentUser?.id) return;
			try {
				const response = await axios.get(`http://localhost:3000/api/teachers/${this.currentUser.id}`);
				this.teacher = response.data;
			} catch (e) {
				if (axios.isAxiosError?.(e) && e.response?.status === 404) {
					this.teacher = {
						bio: '',
						specialization: '',
						experience_years: 0,
						education: '',
						certificates: '',
						hourly_rate: 0,
					};
					return;
				}
				console.error(e);
			}
		},
    
    async addUser() {
      try {
        const response = await axios.post('http://localhost:3000/api/users', this.newUser);
        this.users.push(response.data);  // Добавляем нового пользователя в список
        this.newUser = { name: '', phone: '', email: '', password: '', role: '' };  // Очищаем форму
      } catch (error) {
        console.error('Ошибка добавления:', error);
      }
    },
    formatPhoneForMask(raw: string): string {
      const digits = String(raw || '').replace(/\D/g, '')
      if (!digits) return ''
      let d = digits
      if (d.startsWith('8')) d = '7' + d.slice(1)
      if (d[0] !== '7') d = '7' + d
      d = (d + '           ').slice(0, 11)
      // d[0] is country (7)
      return `+7 (${d[1] || ''}${d[2] || ''}${d[3] || ''}) ${d[4] || ''}${d[5] || ''}${d[6] || ''}-${d[7] || ''}${d[8] || ''}-${d[9] || ''}${d[10] || ''}`
    },
    onPhoneInput() {},
    getUserRoleName() {
      const role = this.userRole
      const roleNames: Record<string, string> = {
        admin: 'Администратор',
        teacher: 'Учитель',
        student: 'Студент'
      }
      return roleNames[role || 'student'] || 'Студент'
    },
    getRoleDescription() {
      const role = this.userRole
      const descriptions: Record<string, string> = {
        admin: 'Полный доступ к системе управления',
        teacher: 'Доступ к управлению занятиями и студентами',
        student: 'Доступ к просмотру занятий и календаря'
      }
      return descriptions[role || 'student'] || 'Базовый доступ к системе'
    },
    goToHome() {
      this.router.push('/home')
    },
    
    refreshData() {
      this.loadUserData()
    },
    openEditProfile() {
      const u = this.currentUser as { name?: string; phone?: string; email?: string } | '' | null
      if (!u || typeof u !== 'object') {
        this.$toast.add({
          severity: 'warn',
          summary: 'Вход',
          detail: 'Войдите в аккаунт, чтобы редактировать профиль',
          life: 4000
        })
        return
      }
      this.editForm.name = u.name || ''
      this.editForm.phone_number = this.formatPhoneForMask(u.phone || '')
      this.editForm.email = u.email || ''
      this.editProfileDialog = true
    },
    async saveProfile() {
      if (!(this.editForm.name || '').trim()) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка валидации',
          detail: 'Укажите имя',
          life: 5000
        })
        return
      }
      if (this.emailError) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка валидации',
          detail: 'Пожалуйста, введите корректный email адрес',
          life: 5000
        })
        return
      }
      if (this.phoneError) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка валидации',
          detail: 'Пожалуйста, введите корректный номер телефона',
          life: 5000
        })
        return
      }
      const u = this.currentUser as { id: number; phone?: string } | '' | null
      if (!u || typeof u !== 'object' || !u.id) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось определить пользователя',
          life: 5000
        })
        return
      }
      this.saving = true
      try {
        const rawDigits = (this.editForm.phone_number || '').replace(/\D/g, '')
        const prevDigits = String(u.phone || '').replace(/\D/g, '')
        const phone = rawDigits || prevDigits
        const { data } = await axios.put(`http://localhost:3000/api/users/${u.id}`, {
          name: (this.editForm.name || '').trim(),
          phone,
          email: (this.editForm.email || '').trim()
        })
        this.currentUser = {
          ...u,
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          role: data.role
        }
        localStorage.setItem('user', JSON.stringify(this.currentUser))
        this.editProfileDialog = false
        this.$toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Профиль успешно обновлён!',
          life: 3000
        })
      } catch (error) {
        const detail =
          axios.isAxiosError?.(error) && error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data
            ? String((error.response.data as { error: string }).error)
            : 'Ошибка при обновлении профиля'
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail,
          life: 5000
        })
      } finally {
        this.saving = false
      }
    },
    openEditStudent() {
      this.editStudentDialog = true;
      const s = this.student || ({} as { level?: string; preferred_languages?: string | string[]; study_goals?: string });
      this.editStudentForm.study_goals = s.study_goals || '';
      this.editStudentForm.level = s.level || '';
      const pl = s.preferred_languages;
      if (Array.isArray(pl)) {
        this.editStudentForm.preferred_languages = [...pl];
      } else if (typeof pl === 'string' && pl.trim()) {
        this.editStudentForm.preferred_languages = pl.split(',').map((x) => x.trim()).filter(Boolean);
      } else {
        this.editStudentForm.preferred_languages = [];
      }
    },
    async onStudentSaved() {
      await this.fetchStudent();
      this.$toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Данные студента сохранены',
        life: 3000,
      });
    },
    openEditTeacher() {
      this.editTeacherDialog = true;
      const t = this.teacher || ({} as Record<string, unknown>);
      this.editTeacherForm.bio = String(t.bio ?? '');
      this.editTeacherForm.specialization = String(t.specialization ?? '');
      this.editTeacherForm.experience_years = Number(t.experience_years) || 0;
      this.editTeacherForm.education = String(t.education ?? '');
      const certs = t.certificates;
      if (Array.isArray(certs)) {
        this.editTeacherForm.certificates = certs.map(String);
      } else if (typeof certs === 'string' && certs.trim()) {
        this.editTeacherForm.certificates = certs.split(',').map((c) => c.trim()).filter(Boolean);
      } else {
        this.editTeacherForm.certificates = [];
      }
      this.editTeacherForm.hourly_rate = Number(t.hourly_rate) || 0;
    },
    async onTeacherSaved() {
      await this.fetchTeacherAndStudent();
      this.$toast.add({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Данные учителя сохранены',
        life: 3000,
      });
    },
    async openNotificationSettings() {
      if (!this.userData?.id) return

      try {
        // Загружаем настройки уведомлений
        this.notificationSettings = await notificationsApi.getSettings(this.userData.id)
        this.notificationSettingsDialog = true
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось загрузить настройки уведомлений',
          life: 5000
        })
      }
    },

    async saveNotificationSettings(settings: NotificationSettings) {
      if (!this.userData?.id) return

      this.savingNotifications = true
      try {
        await notificationsApi.updateSettings(this.userData.id, settings)
        this.notificationSettingsDialog = false
        this.$toast.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Настройки уведомлений сохранены',
          life: 3000
        })
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось сохранить настройки уведомлений',
          life: 5000
        })
      } finally {
        this.savingNotifications = false
      }
    }
  },
  mounted() {
		this.checkAuth(),
		this.fetchUsers(),
		this.fetchStudent(),
		this.fetchTeacherAndStudent()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--surface-ground);
}

.main-content {
  
  max-width: 900px;
  margin: 0 auto;
	
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.page-header p {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin: 0;
}

/* Профиль пользователя */
.user-profile {
  background: var(--surface-card);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
}

.loading-overlay i {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.loading-overlay p {
  color: var(--text-color-secondary);
  margin: 0;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.loading-section i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.loading-section p {
  margin: 0;
  font-size: 1rem;
}

.profile-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-600) 100%);
  color: white;
  padding: 2rem;
  text-align: center;
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
}

.profile-avatar {
  margin-bottom: 1rem;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-role {
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
  font-size: 1rem;
}

.user-status {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.user-status i {
  color: var(--green-300);
}

/* Детали профиля */
.profile-details {
  padding: 2rem;
}

.detail-section {
  
	padding: 1rem;
	background-color: #fff;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 2px solid var(--surface-border);
  padding-bottom: 0.5rem;
	padding-top: 0.5rem;
}

.detail-grid {
  display: flex;
	flex-direction: column;
  /* grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); */
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 1rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.detail-item span {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 600;
}

.role-badge {
  border-radius: 20px;
  font-size: 0.875rem;
  display: inline-block;
  width: fit-content;
}

/* Информация об аккаунте */
.account-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-section);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}

.info-item i {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.info-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.info-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: var(--surface-section);
  border-radius: 12px;
  border: 1px solid var(--surface-border);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

/* Действия */
.actions-grid {
  display: flex;
	flex-direction: column;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-button {
  width: 100%;
  justify-content: flex-start;
}

/* Если не аутентифицирован */
.auth-required {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-icon {
  font-size: 4rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.auth-required h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.auth-required p {
  font-size: 1.125rem;
  color: var(--text-color-secondary);
  margin: 0 0 2rem 0;
}

/* Адаптация под мобильные устройства */
@media (max-width: 768px) {
  .main-content {
    padding: 0.5rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .profile-header {
    padding: 1.5rem;
  }

  .profile-details {
    padding: 1.5rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
