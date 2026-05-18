<template>
  <div class="auth-container">
		<div class="page-header">
    	<h1>Вход в систему</h1>
		</div>
    <form @submit.prevent="handleLogin">
			<div class="edit-form">
      
			<div class="field field--stack">
        <InputGroup class="input-group">
          <InputGroupAddon class="input-group_addon">
            <i class="pi pi-envelope"></i>
          </InputGroupAddon>
            <input
              id="email"
              v-model="form.email"
              type="email"
              :class="{ 'p-invalid': emailError }"
							placeholder="Email"
            />
        </InputGroup>
      </div>
      
      <div class="field field--stack">
        <InputGroup class="input-group">
          <InputGroupAddon class="input-group_addon">
            <i class="pi pi-hashtag"></i>
          </InputGroupAddon>
            <input
              id="password"
              v-model="form.password"
              type="password"
							placeholder="Введите пароль"
            />
        </InputGroup>
      </div>
      
      <button type="submit" :disabled="loading" class="button">
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
      
      <p class="auth-link">
        Нет аккаунта? 
        <a href="#" @click="$router.push('/register')">Зарегистрироваться</a>
      </p>
			</div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import SidebarMenu from '@/components/SidebarMenu.vue';
const API_URL = 'http://localhost:3000/api';

export default {
  name: 'Login',
	components:{SidebarMenu},
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
			isAuthenticated: false
    };
  },
  methods: {
		async checkAuth() {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if(token && user){
				this.currentUser = JSON.parse(user);
        this.isAuthenticated = true;
        console.log(this.currentUser)
				console.log(this.isAuthenticated)
			}
    },
    async handleLogin() {
      this.loading = true;
      
      try {
        const response = await axios.post(`${API_URL}/login`, this.form);
				console.log(response)
        
        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
				localStorage.setItem('isAuthenticated', true)
        this.isAuthenticated = true;
        
        this.checkAuth()
        // Уведомляем родительский компонент об успешном входе
        this.$emit('auth-success', response.data.user);
				this.$router.push('/home')
				
			
      } catch (error) {
        console.error('Ошибка входа:', error);
        const message = error.response?.data?.error || 'Ошибка при входе';
        alert(message);
        this.form.password = ''; // Очищаем поле пароля
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.page-header{
	text-align: center;
  padding: 1rem 0;
	color: var(--text-color);
}
.edit-form{
	display: flex;
	flex-direction: column;
	gap: 30px;
}
.input-group{
	display: flex;
	align-items: center;
	
}
.input-group_addon{
	padding: 14px 0.90rem;
	display: flex;
    align-items: center;
    justify-content: center;
		background-color: #F8F8F9;
    color: #6b7280;
    border-top: 1px solid #d1d5db;
    border-left: 1px solid #d1d5db;
    border-bottom: 1px solid #d1d5db;
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
}
.auth-container {
  max-width: 500px;
    margin: 50px auto;
    padding: 20px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background-color: #fff;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
	height: 46px;
	border-top-right-radius: 6px;
	border-bottom-right-radius: 6px;
	font-size: 16px;
	transition: border-color 0.3s, outline 0.1s;
}
input:hover{
	border-color: #3B82F6;
}
input:focus{
	border-color: #3B82F6;
	outline: none;
  outline: 1px solid #3B82F6;
	
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
}
.button{
	font-family: "Inter var", sans-serif;
	color: #ffffff;
    background: #3B82F6;
    border: 1px solid #3B82F6;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
    border-radius: 6px;
    outline-color: transparent;
}
.auth-link {
  margin-top: 15px;
  text-align: center;
}
</style>