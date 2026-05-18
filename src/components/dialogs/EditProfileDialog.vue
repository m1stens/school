<template>
  <Dialog
    :visible="visibleLocal"
    modal
    header="Редактировать профиль"
    :closable="true"
    :style="{ width: '90vw', maxWidth: '500px' }"
    @update:visible="onVisibleChange"
  >
    <div class="edit-form">
      <!-- Имя -->
      <div class="field field--stack">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-user"></i>
          </InputGroupAddon>
          <FloatLabel>
            <InputText
              id="name"
              v-model="form.name"
              type="text"
              placeholder=" "
              class="w-full"
              @focus="nameTouched = true"
              @blur="nameTouched = true"
            />
            <label for="name">Имя</label>
          </FloatLabel>
        </InputGroup>
        <small v-if="nameError" class="p-error">Укажите имя</small>
      </div>

      <!-- Телефон -->
      <div class="field field--stack">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-phone"></i>
          </InputGroupAddon>
          <FloatLabel>
            <InputMask
              id="phone"
              v-model="form.phone_number"
              mask="+7 (999) 999-99-99"
              class="w-full"
              @focus="phoneTouched = true"
              @blur="phoneTouched = true"
            />
            <label for="phone">Номер телефона</label>
          </FloatLabel>
        </InputGroup>
        <small v-if="phoneError" class="p-error">
          Пожалуйста, введите корректный номер телефона
        </small>
      </div>

      <!-- Email -->
      <div class="field field--stack">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-envelope"></i>
          </InputGroupAddon>
          <FloatLabel>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              class="w-full"
              placeholder=" "
              :class="{ 'p-invalid': emailError }"
              @focus="emailTouched = true"
              @blur="emailTouched = true"
            />
            <label for="email">Email</label>
          </FloatLabel>
        </InputGroup>
        <small v-if="emailError" class="p-error">
          Пожалуйста, введите корректный email
        </small>
      </div>
    </div>

    <template #footer>
      <Button label="Отмена" icon="pi pi-times" text @click="close" />
      <Button label="Сохранить" icon="pi pi-check" :loading="saving" @click="save" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'

type ProfileForm = { name: string; phone_number: string; email: string }

export default defineComponent({
  name: 'EditProfileDialog',
  components: { Dialog, Button, InputText, InputMask, FloatLabel, InputGroup, InputGroupAddon },
  props: {
    visible: { type: Boolean, required: true },
    modelValue: {
      type: Object as () => ProfileForm,
      required: true,
    },
    saving: { type: Boolean, default: false },
  },
  emits: ['update:visible', 'update:modelValue', 'save'],
  setup(props, { emit }) {
    const visibleLocal = ref(props.visible)

    const form = ref<ProfileForm>({
      name: props.modelValue.name || '',
      phone_number: props.modelValue.phone_number || '',
      email: props.modelValue.email || '',
    })

    const nameTouched = ref(false)
    const phoneTouched = ref(false)
    const emailTouched = ref(false)

    watch(() => props.visible, (val) => {
      visibleLocal.value = val
      if (val) {
        form.value = {
          name: props.modelValue.name || '',
          phone_number: props.modelValue.phone_number || '',
          email: props.modelValue.email || '',
        }
        nameTouched.value = false
        phoneTouched.value = false
        emailTouched.value = false
      }
    })

    const nameError = computed(() => nameTouched.value && !(form.value.name || '').trim())

    const phoneError = computed(() => {
      if (!phoneTouched.value) return false
      const raw = (form.value.phone_number ?? '').replace(/\D/g, '')
      if (!raw) return false
      if (raw.length === 11 && raw.startsWith('7')) return false
      return !(raw.length === 10)
    })

    const emailError = computed(() => {
      if (!emailTouched.value) return false
      const email = (form.value.email ?? '').trim()
      if (!email) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !emailRegex.test(email)
    })

    const close = () => {
      visibleLocal.value = false
      nameTouched.value = false
      phoneTouched.value = false
      emailTouched.value = false
      emit('update:visible', false)
    }

    const save = () => {
      if (nameError.value || phoneError.value || emailError.value) return
      emit('update:modelValue', { ...form.value })
      emit('save')
    }

    const onVisibleChange = (val: boolean) => {
      visibleLocal.value = val
      emit('update:visible', val)
    }

    return {
      visibleLocal,
      form,
      nameTouched,
      phoneTouched,
      emailTouched,
      nameError,
      phoneError,
      emailError,
      close,
      save,
      onVisibleChange,
    }
  },
})
</script>

<style scoped>
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1.25rem;
}

:deep(.p-floatlabel .p-inputicon-left + label),
:deep(.p-floatlabel .p-input-icon-left + label) {
  margin-left: 2.25rem !important;
}

:deep(.p-dialog-content) {
  overflow: visible;
  position: relative;
  z-index: 0;
}

:deep(.p-floatlabel > label) {
  position: absolute;
  z-index: 2;
}

:deep(.p-floatlabel .p-iconfield + label),
:deep(.p-floatlabel .p-input-icon-left + label),
:deep(.p-floatlabel .p-inputicon-left + label) {
  left: 2.25rem !important;
}

:deep(.p-iconfield .p-inputtext),
:deep(.p-iconfield .p-inputmask input),
:deep(.p-input-icon-left .p-inputtext),
:deep(.p-input-icon-left .p-inputmask input),
:deep(.p-inputicon-left .p-inputtext),
:deep(.p-inputicon-left .p-inputmask input) {
  padding-left: 2.25rem;
}

.field-label {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.field-help {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}
</style>
