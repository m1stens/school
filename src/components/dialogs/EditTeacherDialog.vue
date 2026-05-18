<template>
  <Dialog
    v-model:visible="visibleLocal"
    modal
    header="Редактировать данные учителя"
    :closable="true"
    :style="{ width: '90vw', maxWidth: '500px' }"
  >
    <div class="edit-form">
      <!-- О себе -->
      <InputGroup class="field" style="margin-bottom: 1rem;">
        <InputGroupAddon>
          <i class="pi pi-user-edit"></i>
        </InputGroupAddon>
        <FloatLabel>
          <InputText id="bio" v-model="form.bio" placeholder=" " class="w-full" />
          <label for="bio">О себе</label>
        </FloatLabel>
      </InputGroup>

      <!-- Специализация -->
      <InputGroup class="field" style="margin-bottom: 1rem;">
        <InputGroupAddon>
          <i class="pi pi-briefcase"></i>
        </InputGroupAddon>
        <FloatLabel>
          <InputText id="specialization" v-model="form.specialization" placeholder=" " class="w-full" />
          <label for="specialization">Специализация</label>
        </FloatLabel>
      </InputGroup>

      <!-- Опыт -->
      <InputGroup class="field" style="margin-bottom: 1rem;">
        <InputGroupAddon>
          <i class="pi pi-calendar"></i>
        </InputGroupAddon>
        <FloatLabel>
          <InputNumber id="experience_years" v-model="form.experience_years" :min="0" :max="50" class="w-full" />
          <label for="experience_years">Опыт работы (лет)</label>
        </FloatLabel>
      </InputGroup>

      <!-- Образование -->
      <InputGroup class="field" style="margin-bottom: 1rem;">
        <InputGroupAddon>
          <i class="pi pi-graduation-cap"></i>
        </InputGroupAddon>
        <FloatLabel>
          <InputText id="education" v-model="form.education" placeholder=" " class="w-full" />
          <label for="education">Образование</label>
        </FloatLabel>
      </InputGroup>

      <!-- Сертификаты -->
      <InputGroup class="field" style="margin-bottom: 1rem;">
        <InputGroupAddon>
          <i class="pi pi-copy"></i>
        </InputGroupAddon>
        <FloatLabel>
          <Chips
            id="certificates"
            v-model="form.certificates"
            separator=","
            :addOnBlur="true"
            :allowDuplicate="false"
            placeholder="Например: CELTA, TESOL"
            class="w-full"
          />
          <label for="certificates">Сертификаты</label>
        </FloatLabel>
      </InputGroup>

      <!-- Ставка -->
      <InputGroup class="field" style="margin-bottom: 1rem;">
        <InputGroupAddon>
          <i class="pi pi-dollar"></i>
        </InputGroupAddon>
        <FloatLabel>
          <InputNumber
            id="hourly_rate"
            v-model="form.hourly_rate"
            :min="0"
            :max="10000"
            mode="currency"
            currency="RUB"
            locale="ru-RU"
            class="w-full"
          />
          <label for="hourly_rate">Почасовая ставка</label>
        </FloatLabel>
      </InputGroup>
    </div>

    <template #footer>
      <Button label="Отмена" icon="pi pi-times" text @click="close" />
      <Button label="Сохранить" icon="pi pi-check" :loading="savingTeacher" @click="saveTeacher" />
    </template>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, getCurrentInstance } from 'vue'
import axios from 'axios'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Chips from 'primevue/chips'

type TeacherForm = {
  bio: string
  specialization: string
  experience_years: number
  education: string
  certificates: string[]
  hourly_rate: number
}

function mapTeacherRowToForm(t: Record<string, unknown>): TeacherForm {
  const certs = t.certificates
  const certArr = Array.isArray(certs)
    ? (certs as unknown[]).map(String)
    : typeof certs === 'string' && certs
      ? certs.split(',').map((c) => c.trim()).filter(Boolean)
      : []
  return {
    bio: String(t.bio ?? ''),
    specialization: String(t.specialization ?? ''),
    experience_years: Number(t.experience_years) || 0,
    education: String(t.education ?? ''),
    certificates: certArr,
    hourly_rate: Number(t.hourly_rate) || 0,
  }
}

export default defineComponent({
  name: 'EditTeacherDialog',
  components: { Dialog, Button, InputText, InputNumber, FloatLabel, InputGroup, InputGroupAddon, Chips },
  props: {
    visible: { type: Boolean, required: true },
    modelValue: {
      type: Object as () => TeacherForm,
      required: true,
    },
    saving: { type: Boolean, default: false },
  },
  emits: ['update:visible', 'update:modelValue', 'saved'],
  setup(props, { emit }) {
    const visibleLocal = ref(false)
    const form = ref<TeacherForm>({ ...props.modelValue })
    const savingTeacher = ref(false)
    const currentUser = ref<{ id: number } | null>(null)

    const toast = () =>
      (getCurrentInstance()?.proxy as { $toast?: { add: (o: Record<string, unknown>) => void } } | undefined)?.$toast

    const loadCurrentUser = () => {
      const raw = localStorage.getItem('user')
      if (!raw) {
        currentUser.value = null
        return
      }
      try {
        currentUser.value = JSON.parse(raw) as { id: number }
      } catch {
        currentUser.value = null
      }
    }

    const fetchTeacher = async () => {
      if (!currentUser.value?.id) return
      try {
        const { data } = await axios.get(`http://localhost:3000/api/teachers/${currentUser.value.id}`)
        form.value = mapTeacherRowToForm(data as Record<string, unknown>)
        emit('update:modelValue', { ...form.value })
      } catch (e) {
        if (axios.isAxiosError?.(e) && e.response?.status === 404) {
          form.value = { ...props.modelValue }
          emit('update:modelValue', { ...form.value })
          return
        }
        console.error(e)
      }
    }

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          loadCurrentUser()
          form.value = { ...props.modelValue }
          visibleLocal.value = true
          void fetchTeacher()
        } else {
          visibleLocal.value = false
        }
      }
    )

    watch(visibleLocal, (val) => {
      emit('update:visible', val)
    })

    watch(
      form,
      (val) => {
        emit('update:modelValue', { ...val })
      },
      { deep: true }
    )

    const close = () => {
      visibleLocal.value = false
      emit('update:visible', false)
      form.value = { ...props.modelValue }
    }

    const validateForm = (): string | null => {
      if (!form.value.specialization?.trim()) return 'Пожалуйста, укажите специализацию'
      const exp = Number(form.value.experience_years)
      if (exp < 0 || exp > 50) return 'Опыт работы должен быть от 0 до 50 лет'
      const rate = Number(form.value.hourly_rate)
      if (rate < 0 || rate > 10000) return 'Почасовая ставка должна быть от 0 до 10000 ₽'
      return null
    }

    const saveTeacher = async () => {
      const err = validateForm()
      if (err) {
        toast()?.add({
          severity: 'error',
          summary: 'Ошибка валидации',
          detail: err,
          life: 5000,
        })
        return
      }
      if (!currentUser.value?.id) return
      savingTeacher.value = true
      try {
        const body = {
          bio: form.value.bio,
          specialization: form.value.specialization,
          experience_years: form.value.experience_years,
          education: form.value.education,
          certificates: form.value.certificates,
          hourly_rate: form.value.hourly_rate,
        }
        const { data } = await axios.post(
          `http://localhost:3000/api/teachers/${currentUser.value.id}`,
          body
        )
        form.value = mapTeacherRowToForm(data as Record<string, unknown>)
        emit('update:modelValue', { ...form.value })
        visibleLocal.value = false
        emit('update:visible', false)
        emit('saved', data)
      } catch (e) {
        console.error(e)
        toast()?.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось сохранить данные учителя',
          life: 5000,
        })
      } finally {
        savingTeacher.value = false
      }
    }

    return { visibleLocal, form, close, saveTeacher, savingTeacher }
  },
})
</script>

<style scoped>
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  position: absolute; /* вернуть дефолт для корректного смещения left */
  z-index: 2;
}

/* Сдвигаем сам label вправо, если слева есть иконка (IconField) */
:deep(.p-floatlabel .p-iconfield + label),
:deep(.p-floatlabel .p-input-icon-left + label),
:deep(.p-floatlabel .p-inputicon-left + label) {
  left: 2.25rem !important;
}

/* Сдвигаем контент input внутрь вправо под иконку IconField */
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
