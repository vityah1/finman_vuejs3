# Індикатори завантаження в BankForm

## Огляд

Реалізовані індикатори завантаження та блокування UI під час обробки файлів у компоненті BankForm.vue.

## Покращення UX

### 1. Кнопка Submit
- **Заблокована** під час завантаження (`disabled="isLoading"`)
- **Спінер** показується під час обробки
- **Текст змінюється** з "Submit" на "Обробка..."

```vue
<b-button 
  variant="primary" 
  class="mt-2" 
  @click="handleButtonClick"
  :disabled="isLoading"
>
  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
  {{ isLoading ? 'Обробка...' : 'Submit' }}
</b-button>
```

### 2. Input файлу
- **Заблокований** під час завантаження
- Користувач не може змінити файл під час обробки

```vue
<input 
  type="file" 
  class="form-control" 
  id="amount" 
  @change="handleFileChange" 
  :disabled="isLoading"
/>
```

### 3. Select опцій (Import/Show)
- **Заблокований** під час завантаження
- Користувач не може змінити режим під час обробки

```vue
<select 
  class="form-control mt-2" 
  v-model="selectedOption"
  :disabled="isLoading"
>
  <option value="import">Import</option>
  <option value="show">Show</option>
</select>
```

### 4. Селектор банків
- **Заблокований** під час завантаження
- Візуально затемнений (opacity: 0.6)
- Курсор змінюється на `not-allowed`
- Клік заблокований через `pointer-events: none`

```vue
<div 
  class="bank-option" 
  :class="{ active: selectedBankType === 'revolut', disabled: isLoading }" 
  @click="!isLoading && (selectedBankType = 'revolut')"
>
  <i class="fas fa-euro-sign"></i> Revolut
</div>
```

### 5. Overlay індикатор завантаження
- **Повноекранний overlay** з напівпрозорим фоном
- **Центрований спінер** з повідомленням
- **Блокує всю взаємодію** з інтерфейсом

```vue
<div v-if="isLoading" class="loading-overlay">
  <div class="loading-content">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Завантаження...</span>
    </div>
    <p class="mt-2 mb-0">Обробка файлу...</p>
  </div>
</div>
```

## CSS стилі

### Disabled стан для селектора банків
```css
.bank-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.bank-option.disabled:hover {
  background-color: inherit;
}
```

### Overlay завантаження
```css
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-content p {
  color: #6c757d;
  font-weight: 500;
}
```

## Логіка стану завантаження

### Реактивна змінна isLoading
```typescript
isLoading: computed<boolean>(() => uploadMutation.isPending.value)
```

Стан завантаження автоматично відстежується через TanStack Query mutation:
- `true` - коли мутація виконується
- `false` - коли мутація завершена або не запущена

### Обробка успіху та помилок
```typescript
const uploadMutation = useImportBankStatementApiImportPost({
  mutation: {
    onSuccess: (response) => {
      // Обробка успішного завантаження
      if (myAlert.value) {
        myAlert.value.showAlert("success", "Файл успішно завантажено та оброблено");
      }
    },
    onError: (error: AxiosError) => {
      // Обробка помилок з зрозумілими повідомленнями
      logError(error, "BankForm file upload");
      const errorMessage = getErrorMessage(error, "Помилка завантаження файлу");
      if (myAlert.value) {
        myAlert.value.showAlert("danger", errorMessage);
      }
    }
  }
});
```

## Переваги реалізації

### 1. Зрозумілість для користувача
- Користувач бачить, що відбувається обробка
- Зрозуміло, що потрібно зачекати
- Неможливо випадково натиснути кнопку двічі

### 2. Запобігання помилкам
- Заблокована можливість змінити файл під час обробки
- Заблокована можливість змінити налаштування
- Запобігання повторним запитам

### 3. Професійний вигляд
- Плавні анімації спінерів
- Консистентний дизайн
- Відповідає стандартам UX

### 4. Доступність
- Правильні ARIA атрибути
- Семантичні HTML елементи
- Підтримка screen readers

## Тестування

### Сценарії для тестування:
1. **Завантаження файлу** - перевірити, що всі елементи заблоковані
2. **Спінер на кнопці** - перевірити анімацію та текст
3. **Overlay** - перевірити повноекранний індикатор
4. **Успішне завантаження** - перевірити розблокування після успіху
5. **Помилка завантаження** - перевірити розблокування після помилки

### Як тестувати:
1. Відкрийте BankForm
2. Виберіть файл
3. Натисніть Submit
4. Спостерігайте за індикаторами завантаження
5. Спробуйте взаємодіяти з заблокованими елементами

## Майбутні покращення

1. **Прогрес-бар** для великих файлів
2. **Можливість скасування** завантаження
3. **Детальніші повідомлення** про етапи обробки
4. **Анімації переходів** між станами
