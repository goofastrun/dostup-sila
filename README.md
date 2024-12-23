# Система контроля доступа

## Архитектура системы

```mermaid
graph TD
    U[Пользователь] --> |HTTP/HTTPS| N[Nginx]
    N --> |Статические файлы| F[Frontend Container]
    N --> |API запросы /api/*| B[Backend Container]
    B --> |Кэширование сессий| R[Redis Container]
    B --> |SQL запросы| DB[Database Container]
    F --> |Запросы к API| N
    
    subgraph Containers
        N
        F[Frontend:<br/>React + Vite<br/>Порт 8080]
        B[Backend:<br/>Node.js + Express<br/>Порт 3000]
        R[Redis:<br/>Кэш + Сессии<br/>Порт 6379]
        DB[Database:<br/>PostgreSQL<br/>Порт 5432]
    end
    
    style U fill:#f9f,stroke:#333,stroke-width:2px
    style N fill:#85C1E9,stroke:#333,stroke-width:2px
    style F fill:#82E0AA,stroke:#333,stroke-width:2px
    style B fill:#F8C471,stroke:#333,stroke-width:2px
    style R fill:#F1948A,stroke:#333,stroke-width:2px
    style DB fill:#BB8FCE,stroke:#333,stroke-width:2px

    classDef container fill:#f5f5f5,stroke:#333,stroke-width:2px
    class N,F,B,R,DB container
```

### Описание взаимодействия контейнеров

1. **Пользователь → Nginx**
   - Все HTTP/HTTPS запросы от пользователя проходят через Nginx
   - Nginx работает как обратный прокси и балансировщик нагрузки

2. **Nginx → Frontend**
   - Перенаправляет запросы к статическим файлам на Frontend контейнер
   - Обслуживает React приложение на порту 8080
   - Обрабатывает все запросы, не начинающиеся с /api

3. **Nginx → Backend**
   - Перенаправляет все API запросы (/api/*) на Backend контейнер
   - Backend работает на порту 3000
   - Обрабатывает аутентификацию, авторизацию и бизнес-логику

4. **Backend → Redis**
   - Хранит сессии пользователей
   - Кэширует часто запрашиваемые данные
   - Ограничивает количество попыток входа
   - Порт 6379

5. **Backend → Database**
   - Хранит все постоянные данные (пользователи, посты)
   - Выполняет SQL запросы
   - PostgreSQL работает на порту 5432

6. **Frontend → Nginx**
   - Frontend отправляет API запросы через Nginx
   - Nginx проксирует эти запросы на Backend
