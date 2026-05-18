<template>
  <div class="auth-container">
		<div class="page-header">
			<h1>Регистрация</h1>
		</div>
    
    <form @submit.prevent="handleRegister">
			<div class="edit-form">
    
			<div class="field field--stack">
        <InputGroup class="input-group">
          <InputGroupAddon class="input-group_addon">
            <i class="pi pi-user"></i>
          </InputGroupAddon>
            <input
              id="name"
              v-model="form.name"
              type="name"
              :class="{ 'p-invalid': emailError }"
							placeholder="Введите ваше имя"
            />
        </InputGroup>
      </div>
      
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
      
      
      <!-- Телефон -->
      <div class="field field--stack">
        <InputGroup class="input-group">
          <InputGroupAddon class="input-group_addon">
            <i class="pi pi-phone"></i>
          </InputGroupAddon>
            <input
              id="phone"
              v-model="form.phone"
              placeholder="Номер телефона"
              @focus="phoneTouched = true"
              @blur="phoneTouched = true"
            />
            
        </InputGroup>

      </div>
      
      <button type="submit" :disabled="loading" class="button">
        {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
      
      <p class="auth-link">
        Уже есть аккаунт? 
        <a href="#" @click ="$router.push('/login')">Войти</a>
      </p>
			</div>
    </form>
  </div>
	
  
    
  
</template>

<script>
import Button from 'primevue/button'
import InputMask from 'primevue/inputmask'
import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default {
  name: 'Register',
  data() {
    return {
      form: {
        name: '',
				phone: '',
        email: '',
        password: '',
        
      },
      loading: false
    };
  },
  methods: {
    async handleRegister() {
      if (this.form.password.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await axios.post(`${API_URL}/register`, this.form);
        
        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert('Регистрация успешна!');
        
        // Переходим на главную или вызываем обновление родительского компонента
        this.$router.push('/home')
        
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        const message = error.response?.data?.error || 'Ошибка при регистрации';
        alert(message);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
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
.edit-form{
	display: flex;
	flex-direction: column;
	gap: 30px;
}
.page-header{
	text-align: center;
  padding: 1rem 0;
	color: var(--text-color);
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
.auth-link {
  margin-top: 15px;
  text-align: center;
}
</style>