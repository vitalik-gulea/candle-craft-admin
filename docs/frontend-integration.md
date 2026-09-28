# Интеграция фронтенда с Candle Craft API

Справочник для фронтенд-разработчика (админ-панель + сторефронт), который подключается к этому бэкенду. Дополняет [`README.md`](./README.md) и спеки модулей — здесь про **как вызывать API**, а не про бизнес-правила.

## 1. Контракт API (OpenAPI)

При каждом запуске сервера (`bun run start:dev` / `start`) генерируется свежая спека:

- **Swagger UI** — `GET /docs` — интерактивная документация, можно пробовать запросы прямо в браузере (кнопка Authorize для вставки Bearer-токена).
- **Сырой JSON** — `GET /docs-json` (и `/docs-yaml`) — для кодогенерации.
- **Файл на диске** — `openapi.json` в корне репозитория, перезаписывается при каждом старте сервера (в `.gitignore`, не коммитится).

Рекомендуемая кодогенерация типов на фронте:

```bash
npx openapi-typescript http://localhost:3001/docs-json -o src/lib/api/schema.d.ts
# или из локального файла, без поднятого сервера:
npx openapi-typescript ../candle-craft-api/openapi.json -o src/lib/api/schema.d.ts
```

Для полноценного тайпсейф-клиента (методы + типы) подойдёт [`orval`](https://orval.dev) или `openapi-typescript-codegen` — оба умеют схватывать Bearer-авторизацию и RO/RU DTO как есть.

## 2. Базовый URL и CORS

- Dev: `http://localhost:3001` (порт из `PORT`, по умолчанию 3000).
- Сервер сам не задаёт CORS без настройки — на бэке переменная `CORS_ORIGIN` (через запятую можно перечислить несколько адресов: админка + сторефронт). Убедись, что домен фронтенда туда добавлен, иначе браузер срежет запросы.

## 3. Аутентификация

Все роуты требуют `Authorization: Bearer <accessToken>`, кроме явно помеченных **публичными** (см. ниже). Роли — `admin` и `manager`; выше — только `admin`-only роуты у пользователей.

| Метод | Путь | Публичный | Тело | Ответ |
|---|---|---|---|---|
| POST | `/auth/register` | ✅ | `{ email, password }` | `AuthResult` |
| POST | `/auth/login` | ✅ | `{ email, password }` | `AuthResult` |
| GET | `/users/me` | — | — | `User` (текущий профиль) |
| GET | `/users` | — (admin) | — | `User[]` |
| PATCH | `/users/:id/role` | — (admin) | `{ role: 'admin' \| 'manager' }` | `User` |

```ts
interface AuthResult {
  accessToken: string;
  user: { id: string; email: string; role: 'admin' | 'manager' };
}
```

- Токен живёт `JWT_EXPIRES_IN` секунд (по умолчанию 86400 = 24ч). **Refresh-токена нет** — по истечении срока фронт получит 401 и должен отправить пользователя на логин заново.
- Хранить токен — на усмотрение фронта (httpOnly-cookie через свой BFF-роут или localStorage для чистого SPA); бэкенд не выставляет cookie сам, только принимает заголовок.
- Публичные (без токена) роуты во всём API — их всего четыре: `/auth/register`, `/auth/login`, `GET /categories/resolve`, `GET /goods/resolve` (см. §9). Всё остальное — 401 без валидного токена.

## 4. Формат ошибок

Стандартный формат Nest (`ValidationPipe` + встроенные exception filters):

```json
{ "statusCode": 400, "message": "URL \"ceara\" is already used by another category (RO)", "error": "Conflict" }
```

Для ошибок валидации DTO `message` — массив строк (по одной на невалидное поле):

```json
{ "statusCode": 400, "message": ["nameRo should not be empty", "nameRu must be a string"], "error": "Bad Request" }
```

Коды, на которые стоит закладываться в UI:

| Код | Когда | Что показать |
|---|---|---|
| 400 | Невалидный DTO, нарушение бизнес-правила (акционная цена выше обычной, дубль значения вариации и т.п.) | Текст из `message` рядом с полем/формой |
| 401 | Токен отсутствует/невалиден/истёк | Редирект на логин |
| 403 | Роль не подходит (`RolesGuard`) | «Недостаточно прав» |
| 404 | Сущность не найдена | 404-страница/тост |
| 409 | Конфликт: занятый slug/SKU, дубль основной категории и т.п. | Текст из `message` как подсказка, что изменить |

Отдельный случай — `POST /goods/:id/publish`: при незаполненных обязательных полях возвращает 400 с расширенным телом:

```json
{ "message": "Good is not ready to publish", "blockers": ["Missing primary category", "Missing main image"] }
```

`blockers` — готовый список для чек-листа «что нужно доделать перед публикацией».

## 5. Сквозная конвенция RO/RU

Ни одного «просто `name`» — везде пара `nameRo`/`nameRu`, `slugRo`/`slugRu`, `seoTitleRo`/`seoTitleRu` и т.д. Для публичных страниц (резолв URL, см. §9) язык передаётся строчными `ro`/`ru` в query-параметре `lang`.

## 6. Категории — `/categories` (Модуль 1)

| Метод | Путь | Заметки |
|---|---|---|
| GET | `/categories?includeTrashed=` | список (по умолчанию без корзины) |
| GET | `/categories/resolve?lang=&slug=` | **публичный**, для роутинга сторефронта — см. §9 |
| GET | `/categories/:id` | |
| GET | `/categories/:id/breadcrumbs` | цепочка от корня включительно |
| GET | `/categories/:id/deletion-check` | что заблокирует корзину/удаление — дёрни перед показом confirm-модалки |
| GET | `/categories/:id/url-history` | список старых URL (редиректы) |
| GET / PUT | `/categories/:id/faq` | `PUT` — полная замена списком (порядок массива = порядок показа) |
| POST | `/categories` | создание |
| PATCH | `/categories/:id` | `slugRo`/`slugRu` в теле = ручной переименование URL → создаёт редирект 301, не путать со сменой названия |
| PATCH | `/categories/reorder` | пакетный drag&drop: `{ items: [{ id, parentId, sortOrder }] }` |
| PATCH | `/categories/reorder/homepage` | `{ orderedIds: string[] }` |
| DELETE | `/categories/:id` | в корзину (soft) |
| POST | `/categories/:id/restore` | из корзины |
| POST | `/categories/:id/permanently-delete` | см. §10 |

## 7. Товары — `/goods` (Модуль 2)

| Метод | Путь | Заметки |
|---|---|---|
| GET | `/goods?includeTrashed=` | |
| GET | `/goods/resolve?lang=&slug=` | **публичный**, см. §9 |
| GET | `/goods/:id` | |
| GET | `/goods/:id/url-history` | |
| GET / PUT | `/goods/:id/categories` | `PUT` — `{ links: [{ categoryId, isPrimary }] }`, ровно один `isPrimary: true` (или пусто для черновика) |
| GET / PUT | `/goods/:id/images` | `PUT` — полная замена, порядок массива = порядок галереи, максимум один `isMain: true` |
| GET / PUT | `/goods/:id/characteristics` | `PUT` — полная замена, `[{ attributeId, attributeValueId }]` |
| GET | `/goods/:id/variations` | |
| PUT | `/goods/:id/variations` | **upsert**, не replace-all: передай `id` в теле — обновит существующую вариацию, без `id` — создаст новую. Не пересоздавай существующие вариации через удаление+создание — потеряешь связь с будущими заказами |
| DELETE | `/goods/:id/variations/:variationId` | точечное удаление одной вариации |
| POST | `/goods` | создание (можно черновиком почти без полей — см. §11) |
| PATCH | `/goods/:id` | как у категорий: `slugRo`/`slugRu` — ручной рененйм с редиректом |
| PATCH | `/goods/:id/status` | `{ status: 'draft' \| 'hidden' }` — **не** для публикации, см. ниже |
| POST | `/goods/:id/publish` | отдельный эндпоинт с валидацией — см. §4 и §11 |
| DELETE | `/goods/:id` | в корзину |
| POST | `/goods/:id/restore` | |
| POST | `/goods/:id/permanently-delete` | см. §10 |
| POST | `/goods/:id/duplicate` | копия черновиком, без SKU/URL/остатков/бейджа — сразу открой карточку копии на редактирование |

### Справочники

| Модуль | База | Действия |
|---|---|---|
| Единицы продажи | `/good-units` | `GET`, `POST`, `PATCH /:id`, `DELETE /:id` (блокируется, если ещё используется) |
| Характеристики | `/good-attributes` | `GET`, `POST`, `PATCH /:id`, `DELETE /:id` |
| Значения характеристики | `/good-attributes/:id/values`, `/good-attributes/values/:valueId` | `GET`/`POST` на первом пути, `PATCH`/`DELETE` на втором |

Оба справочника нужно подгрузить заранее в формы товара (выпадающие списки единицы продажи, характеристик и их значений) — создавать «на лету» через отдельные простые модалки/квик-крейт в самой форме товара, без ухода со страницы.

## 8. Загрузка изображений — `/uploads`

Файл никогда не идёт через API-сервер — только presigned URL в R2, прямой `PUT` из браузера.

```ts
// 1. Получить presigned URL
const { uploadUrl, publicUrl, key } = await api.post('/uploads/presign', {
  fileName: file.name,
  contentType: file.type, // только image/jpeg|png|webp|avif
  folder: 'goods',        // 'categories' | 'goods' | 'attribute-values'
});

// 2. Залить файл напрямую в R2 (без Authorization-заголовка — он уже "зашит" в подписанный URL)
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

// 3. Сохранить publicUrl в форме товара/категории
await api.put(`/goods/${goodId}/images`, {
  images: [...existingImages, { url: publicUrl, isMain: false }],
});
```

Для удаления файла из R2 (когда админ убирает картинку из галереи): `DELETE /uploads?key=<key из шага 1>` — отдельно от удаления самой ссылки из сущности (`imageUrl` в категории не удаляется из медиатеки автоматически — так и задумано, картинка может использоваться в другом месте).

Presigned URL живёт 5 минут — не кешируй его, запрашивай заново прямо перед загрузкой.

## 9. Резолв URL для сторефронта (публичные роуты)

`GET /categories/resolve?lang=ro&slug=...` и `GET /goods/resolve?lang=ro&slug=...` — **без токена**, дергать напрямую из Next.js catch-all роута публичного сайта.

```ts
type ResolveResult =
  | { kind: 'category' | 'good'; category?: Category; good?: Good }
  | { kind: 'redirect'; target: { type: 'category' | 'good'; category?: Category; good?: Good } | { type: 'path'; path: string } }
  | { kind: 'gone' }
  | { kind: 'not-found' };
```

Логика в `[...slug]/page.tsx` сторефронта:

- `kind: 'category' | 'good'` → рендерить страницу.
- `kind: 'redirect'` → `redirect(target.type === 'path' ? target.path : `/${target.category?.slugRo ?? target.good?.slugRo}`, 301)`.
- `kind: 'gone'` → отдать 410.
- `kind: 'not-found'` → стандартный `notFound()`.

Черновики (`status: draft`) и скрытые товары (`status: hidden`) через этот эндпоинт **не резолвятся** — вернётся `not-found`, это ожидаемо (см. `docs/products.md` §1.4).

## 10. Корзина и окончательное удаление

Паттерн одинаковый у категорий и товаров:

1. `DELETE /:id` — мягкое удаление (`isTrashed: true`), сущность пропадает с публичного сайта, но восстановима.
2. `POST /:id/restore` — возврат из корзины (статус сбрасывается на `draft`, в меню/на витрину сама не возвращается).
3. `POST /:id/permanently-delete` — безвозвратно, тело:

```ts
type PermanentlyDeleteBody =
  | { targetType: 'category' | 'good'; categoryId?: string; goodId?: string } // 301 на другую сущность
  | { targetType: 'path'; path: string }                                     // 301 на произвольный путь
  | { targetType: 'gone' };                                                  // 410
```

Перед показом модалки удаления у категории дёрни `GET /categories/:id/deletion-check` — покажет, есть ли дочерние категории/товары/редиректы, чтобы предупредить админа до подтверждения (сам эндпоинт удаления это не блокирует — блокирует только реальное окончательное удаление на уровне БД, если что-то всё ещё ссылается).

## 11. Черновик → публикация товара

`POST /goods` можно вызвать почти пустым (только `nameRo`/`nameRu`) — сохранится как черновик. Дозаполнение — через `PATCH /goods/:id` и `PUT` на под-ресурсы (`/categories`, `/images`, `/characteristics`, `/variations`).

Публикация — отдельный шаг `POST /goods/:id/publish`, а не `PATCH .../status`. Он проверяет обязательный набор полей (название RO/RU, краткое описание RO/RU, основная категория, единица продажи, главное изображение, и для простого товара — цена+остаток, для вариативного — хотя бы одна активная вариация) и при нехватке возвращает 400 со списком `blockers` (§4) — выведи их как чек-лист прямо в форме, а не общий тост.

`PATCH /goods/:id/status` — только для переключения `draft` ↔ `hidden` (временно снять с публикации без потери статуса «опубликован в прошлом»); попытка выставить `published` через него вернёт 400 с подсказкой использовать `/publish`.

## 12. Постраничность и поиск

Списки (`GET /categories`, `GET /goods`, `GET /good-units`, `GET /good-attributes`) пока **без пагинации** — отдают всё целиком. На фронте на первое время — клиентская фильтрация/поиск/пагинация по уже загруженному массиву; если каталог вырастет настолько, что это станет проблемой, это отдельная доработка бэкенда (не блокер для старта интеграции).

## 13. Набросок API-клиента

Минимальная обвязка, которую стоит сделать один раз:

```ts
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    clearStoredToken();
    redirectToLogin();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? res.statusText, body?.blockers);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
```

Дальше поверх этого — типы из `openapi.json` (§1) и тонкие обёртки по модулям (`categoriesApi.list()`, `goodsApi.publish(id)` и т.д.).
