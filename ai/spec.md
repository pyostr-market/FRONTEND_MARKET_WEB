# API спецификация: Профиль пользователя

## Обзор

API для управления профилем пользователя, сессиями и данными аутентификации.

**Базовый путь:** `/users`

**Аутентификация:** Все эндпоинты требуют JWT токен в заголовке `Authorization: Bearer <token>`

---

## Содержание

1. [Профиль пользователя](#1-профиль-пользователя)
   - [Получение профиля (GetMe)](#11-получение-профиля-getme)
   - [Обновление профиля](#12-обновление-профиля)
2. [Сессии](#2-сессии)
   - [Получение активных сессий](#21-получение-активных-сессий)
   - [Завершение сессии](#22-завершение-сессии)
   - [Завершение всех сессий](#23-завершение-всех-сессий)

---

## 1. Профиль пользователя

### 1.1. Получение профиля (GetMe)

Возвращает агрегированный профиль текущего авторизованного пользователя.

**Endpoint:**
```
GET /users/profile
```

**Заголовки:**
| Название | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| Authorization | string | Да | `Bearer <access_token>` |

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "public_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "is_verified": true,
    "fio": "Иванов Иван Петрович",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-04-03T12:00:00Z",
    "last_login_at": "2026-04-03T08:15:00Z",
    "phones": [
      {
        "id": 1,
        "phone_number": "+79991234567",
        "is_primary": true,
        "is_verified": true,
        "created_at": "2026-01-15T10:30:00Z"
      }
    ],
    "social_accounts": [
      {
        "id": 1,
        "provider": "VK",
        "provider_user_id": "12345678",
        "email": "user@example.com",
        "created_at": "2026-02-01T14:00:00Z"
      }
    ],
    "sessions": [
      {
        "id": 1,
        "refresh_token_id": 1,
        "user_agent": "Mozilla/5.0...",
        "device_info": "Desktop",
        "browser": "Chrome",
        "os": "Windows",
        "ip_address": "192.168.1.1",
        "geo_info": "Москва, Россия",
        "created_at": "2026-04-03T08:15:00Z",
        "last_activity": "2026-04-03T12:00:00Z",
        "is_active": true
      }
    ],
    "individual_profile": {
      "id": 1,
      "user_id": 123,
      "first_name": "Иван",
      "last_name": "Иванов",
      "middle_name": "Петрович"
    },
    "company_profile": {
      "id": 1,
      "user_id": 123,
      "company_name": "ООО Рога и Копыта",
      "tax_id": "1234567890",
      "legal_address": "г. Москва, ул. Ленина, д. 1",
      "actual_address": "г. Москва, ул. Ленина, д. 1"
    }
  }
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | Внутренний ID пользователя |
| public_id | UUID | Публичный идентификатор |
| is_active | boolean | Статус активности аккаунта |
| is_verified | boolean | Статус подтверждения аккаунта |
| fio | string\|null | ФИО пользователя |
| created_at | datetime | Дата создания аккаунта |
| updated_at | datetime | Дата последнего обновления |
| last_login_at | datetime\|null | Дата последнего входа |
| phones | array | Список телефонов |
| social_accounts | array | Список привязанных соц. аккаунтов |
| sessions | array | Список активных сессий |
| individual_profile | object\|null | Профиль физлица (если есть) |
| company_profile | object\|null | Профиль юрлица (если есть) |

**individual_profile:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | ID профиля |
| user_id | integer | ID пользователя |
| first_name | string | Имя |
| last_name | string | Фамилия |
| middle_name | string\|null | Отчество |

**company_profile:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | ID профиля |
| user_id | integer | ID пользователя |
| company_name | string | Название компании |
| tax_id | string | ИНН компании |
| legal_address | string\|null | Юридический адрес |
| actual_address | string\|null | Фактический адрес |

**Ответ (401 Unauthorized):**
```json
{
  "detail": "Not authenticated"
}
```

---

### 1.2. Обновление профиля

Обновляет данные профиля текущего пользователя.

**Endpoint:**
```
PATCH /users/profile
```

**Заголовки:**
| Название | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| Authorization | string | Да | `Bearer <access_token>` |
| Content-Type | string | Да | `application/json` |

**Тело запроса:**
```json
{
  "fio": "Иванов Иван Петрович",
  "individual_profile": {
    "first_name": "Иван",
    "last_name": "Иванов",
    "middle_name": "Петрович"
  },
  "company_profile": {
    "company_name": "ООО Рога и Копыта",
    "tax_id": "1234567890",
    "legal_address": "г. Москва, ул. Ленина, д. 1",
    "actual_address": "г. Москва, ул. Ленина, д. 1"
  }
}
```

**Поля запроса:**

| Поле | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| fio | string\|null | Нет | ФИО пользователя (max 255) |
| individual_profile | object\|null | Нет | Данные профиля физлица |
| company_profile | object\|null | Нет | Данные профиля юрлица |

**individual_profile:**
| Поле | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| first_name | string\|null | Нет* | Имя (max 100). Обязательно при создании |
| last_name | string\|null | Нет* | Фамилия (max 100). Обязательно при создании |
| middle_name | string\|null | Нет | Отчество (max 100) |

**company_profile:**
| Поле | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| company_name | string\|null | Нет* | Название компании (max 255). Обязательно при создании |
| tax_id | string\|null | Нет* | ИНН (max 20). Обязательно при создании |
| legal_address | string\|null | Нет | Юридический адрес (max 500) |
| actual_address | string\|null | Нет | Фактический адрес (max 500) |

*Обязательно только при создании профиля (если профиль ещё не существует).

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "public_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true,
    "is_verified": true,
    "fio": "Иванов Иван Петрович",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-04-03T12:00:00Z",
    "last_login_at": "2026-04-03T08:15:00Z",
    "phones": [...],
    "social_accounts": [...],
    "sessions": [...],
    "individual_profile": {
      "id": 1,
      "user_id": 123,
      "first_name": "Иван",
      "last_name": "Иванов",
      "middle_name": "Петрович"
    },
    "company_profile": {
      "id": 1,
      "user_id": 123,
      "company_name": "ООО Рога и Копыта",
      "tax_id": "1234567890",
      "legal_address": "г. Москва, ул. Ленина, д. 1",
      "actual_address": "г. Москва, ул. Ленина, д. 1"
    }
  }
}
```

**Ответ (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROFILE_DATA",
    "message": "first_name is required",
    "details": {}
  }
}
```

**Ответ (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["body", "individual_profile", "first_name"],
      "msg": "ensure this value has at most 100 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

**Ограничения:**
- Нельзя изменить: `id`, `public_id`, `phone` (номер телефона привязан навсегда)
- При создании `individual_profile` обязательны `first_name` и `last_name`
- При создании `company_profile` обязательны `company_name` и `tax_id`

---

## 2. Сессии

### 2.1. Получение активных сессий

Возвращает список всех активных сессий пользователя.

**Endpoint:**
```
GET /users/profile
```

*Сессии возвращаются в поле `sessions` ответа GetMe (см. [1.1](#11-получение-профиля-getme))*

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    ...
    "sessions": [
      {
        "id": 1,
        "refresh_token_id": 1,
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "device_info": "Desktop",
        "browser": "Chrome",
        "os": "Windows",
        "ip_address": "192.168.1.1",
        "geo_info": "Москва, Россия",
        "created_at": "2026-04-03T08:15:00Z",
        "last_activity": "2026-04-03T12:00:00Z",
        "is_active": true
      },
      {
        "id": 2,
        "refresh_token_id": 2,
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)...",
        "device_info": "Mobile",
        "browser": "Safari",
        "os": "iOS",
        "ip_address": "192.168.1.2",
        "geo_info": "Санкт-Петербург, Россия",
        "created_at": "2026-04-02T10:00:00Z",
        "last_activity": "2026-04-03T11:30:00Z",
        "is_active": true
      }
    ]
  }
}
```

**Поля сессии:**

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | ID сессии |
| refresh_token_id | integer | ID refresh токена |
| user_agent | string\|null | Исходный User-Agent |
| device_info | string\|null | Тип устройства (Desktop, Mobile, Tablet) |
| browser | string\|null | Браузер (Chrome, Firefox, Safari, Edge) |
| os | string\|null | Операционная система |
| ip_address | string\|null | IP адрес клиента |
| geo_info | string\|null | Геолокация (город, страна) |
| created_at | datetime | Дата создания сессии |
| last_activity | datetime\|null | Дата последней активности |
| is_active | boolean | Статус сессии |

---

### 2.2. Завершение сессии

Завершает указанную сессию пользователя по ID сессии.

**Endpoint:**
```
DELETE /users/sessions/{session_id}
```

**Заголовки:**
| Название | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| Authorization | string | Да | `Bearer <access_token>` |

**Параметры пути:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| session_id | integer | ID сессии для завершения |

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": true
}
```

**Ответ (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session not found",
    "details": {}
  }
}
```

**Ответ (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only delete your own sessions",
    "details": {}
  }
}
```

**Примечания:**
- Пользователь может завершить только свои собственные сессии
- При завершении сессии её refresh token отзывается
- Текущая сессия также может быть завершена

---

### 2.3. Завершение всех сессий

Завершает все активные сессии пользователя, кроме текущей.

**Endpoint:**
```
DELETE /users/sessions
```

**Заголовки:**
| Название | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| Authorization | string | Да | `Bearer <access_token>` |

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "terminated_count": 5
  }
}
```

**Поля ответа:**

| Поле | Тип | Описание |
|------|-----|----------|
| terminated_count | integer | Количество завершённых сессий |

**Примечания:**
- Текущая сессия (из которой выполнен запрос) не завершается
- Все refresh токены завершённых сессий отзываются
- Полезно для реализации "Выйти на всех устройствах"

---

## Коды ошибок

| Код | HTTP статус | Описание |
|-----|-------------|----------|
| INVALID_PROFILE_DATA | 400 | Ошибка валидации данных профиля |
| USER_NOT_FOUND | 404 | Пользователь не найден |
| SESSION_NOT_FOUND | 404 | Сессия не найдена |
| FORBIDDEN | 403 | Доступ запрещён |
| UNAUTHORIZED | 401 | Пользователь не авторизован |
| VALIDATION_ERROR | 422 | Ошибка валидации входных данных |

---

## Примеры использования

### Пример 1: Получение профиля

```bash
curl -X GET "http://api.example.com/users/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Пример 2: Создание профиля физлица

```bash
curl -X PATCH "http://api.example.com/users/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fio": "Иванов Иван Петрович",
    "individual_profile": {
      "first_name": "Иван",
      "last_name": "Иванов",
      "middle_name": "Петрович"
    }
  }'
```

### Пример 3: Создание профиля юрлица

```bash
curl -X PATCH "http://api.example.com/users/profile" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "company_profile": {
      "company_name": "ООО Рога и Копыта",
      "tax_id": "1234567890",
      "legal_address": "г. Москва, ул. Ленина, д. 1"
    }
  }'
```

### Пример 4: Завершение конкретной сессии

```bash
curl -X DELETE "http://api.example.com/users/sessions/123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Пример 5: Выйти на всех устройствах

```bash
curl -X DELETE "http://api.example.com/users/sessions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Версионирование

Текущая версия API: **v1**

Изменения в версии:
- **v1.0** (2026-04-03) — начальная версия спецификации
  - GetMe с поддержкой профилей физлиц и юрлиц
  - Обновление профиля
  - Просмотр и управление сессиями
