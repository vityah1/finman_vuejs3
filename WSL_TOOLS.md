# Інструменти для роботи з проектом finman_vuejs3 у WSL

## Файлова система WSL

### Доступ до файлів проекту
- **Базовий шлях до проекту в WSL:**
  ```
  \\wsl$\Ubuntu\home\vik\pets\finman_vuejs3
  ```

- **Для читання файлу:**
  ```
  read_file(path="\\wsl$\Ubuntu\home\vik\pets\finman_vuejs3\src\components\SomeComponent.vue")
  ```

- **Для запису у файл:**
  ```
  write_file(path="\\wsl$\Ubuntu\home\vik\pets\finman_vuejs3\src\components\SomeComponent.vue", content="...")
  ```

- **Для створення директорій:**
  ```
  create_directory(path="\\wsl$\Ubuntu\home\vik\pets\finman_vuejs3\src\components\NewFolder")
  ```

### Пошук та навігація

- **Пошук файлів за назвою:**
  ```
  search_files(path="\\wsl$\Ubuntu\home\vik\pets\finman_vuejs3", pattern="SomeComponent.vue")
  ```

- **Перегляд вмісту директорії:**
  ```
  list_directory(path="\\wsl$\Ubuntu\home\vik\pets\finman_vuejs3\src\components")
  ```

## Виконання команд проекту через WSL

- **Запуск лінтера:**
  ```
  execute_command(command="wsl -e bash -c \"cd /home/vik/pets/finman_vuejs3 && npm run lint\"")
  ```

- **Запуск тестів:**
  ```
  execute_command(command="wsl -e bash -c \"cd /home/vik/pets/finman_vuejs3 && npm run test:unit\"")
  ```

- **Перевірка статусу git:**
  ```
  execute_command(command="wsl -e bash -c \"cd /home/vik/pets/finman_vuejs3 && git status\"")
  ```

## Примітки

- При виконанні команд через WSL використовуйте структуру:
  ```
  wsl -e bash -c "команда_linux"
  ```

- При роботі з файлами використовуйте шлях Windows:
  ```
  \\wsl$\Ubuntu\шлях_в_Linux
  ```

- У випадку проблем з доступом до файлів, можна перевірити доступність WSL за допомогою:
  ```
  execute_command(command="wsl -l -v")
  ```