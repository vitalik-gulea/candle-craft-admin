# Candle Craft — все тексты интерфейса

Источник: `app/lib/i18n.ts` (объект `translations`, локали `ru` и `ro`).
Тексты товаров и категорий (названия, описания, FAQ, цены) в этот файл не входят — они приходят из API/данных, а не из словаря.

Плейсхолдер `{amount}` подставляется суммой в MDL.

---

## 1. Мета (SEO, вкладка браузера)

| Ключ | RU | RO |
| --- | --- | --- |
| meta.title | Candle Craft — товары для создания свечей | Candle Craft — articole pentru confecționarea lumânărilor |
| meta.description | Премиальные материалы, экологичный воск и мастерски составленные ароматы для мастеров по всей Молдове. | Materiale premium, ceară ecologică și arome create cu măiestrie pentru meșteri din toată Moldova. |

## 2. Шапка сайта (Header)

| Ключ | RU | RO |
| --- | --- | --- |
| nav[0] | Магазин | Magazin |
| nav[1] | Воск | Ceară |
| nav[2] | Фитили | Fitiluri |
| nav[3] | Ароматы | Arome |
| nav[4] | Ёмкости | Recipiente |
| nav[5] | Формы | Forme |
| nav[6] | Инструменты | Unelte |
| nav[7] | Аксессуары | Accesorii |
| aria.home | На главную | Pagina principală |
| aria.search | Поиск | Căutare |
| aria.account | Аккаунт | Cont |
| aria.cart | Корзина | Coș |
| aria.openMenu | Открыть меню | Deschide meniul |
| aria.closeMenu | Закрыть меню | Închide meniul |
| aria.language | Выбрать язык | Alege limba |

## 3. Боковое меню (Drawer)

| Ключ | RU | RO |
| --- | --- | --- |
| drawer.accountSettings | Настройки аккаунта | Setările contului |
| drawer.madeWith | Сделано с теплом в Молдове 🇲🇩 | Făcut cu căldură în Moldova 🇲🇩 |

## 4. Главная — Hero

| Ключ | RU | RO |
| --- | --- | --- |
| hero.eyebrow | Товары для свечеварения | Articole pentru lumânărit |
| hero.headline | Создайте то, что стоит зажечь. | Creează ceva demn de aprins. |
| hero.paragraph | Премиальные материалы, экологичный воск и мастерски составленные ароматы — подобрано в Кишинёве для мастеров по всей Молдове. | Materiale premium, ceară ecologică și arome create cu măiestrie — selecționate la Chișinău pentru meșteri din toată Moldova. |
| hero.ctaPrimary | Смотреть материалы | Vezi materialele |
| hero.ctaSecondary | Начать создавать | Începe să creezi |
| hero.videoTitle | Истории ателье | Povești din atelier |
| hero.videoSubtitle | Смотрите нашу поездку за сырьём в Кодры Молдовы (3:20) | Urmărește călătoria noastră după materii prime în Codrii Moldovei (3:20) |

## 5. Главная — Основные категории (CategoryGrid)

| Ключ | RU | RO |
| --- | --- | --- |
| categoryGrid.eyebrow | Основные категории | Categorii principale |
| categoryGrid.heading | Быстрый переход в разделы | Acces rapid la secțiuni |
| categoryGrid.paragraph | Начните с нужного материала и переходите в разделы, которые чаще всего открывают мастера. | Începe cu materialul de care ai nevoie și treci la secțiunile pe care meșterii le accesează cel mai des. |
| categoryGrid.linkCta | Перейти в раздел | Mergi la secțiune |

## 6. Главная — Хиты продаж (BestSellers)

| Ключ | RU | RO |
| --- | --- | --- |
| bestSellers.eyebrow | Выбор мастеров | Alegerea meșterilor |
| bestSellers.heading | Любимое мастерами | Preferatele meșterilor |
| bestSellers.viewAll | Все товары | Toate produsele |
| bestSellers.prevAria | Предыдущий товар | Produsul anterior |
| bestSellers.nextAria | Следующий товар | Produsul următor |
| bestSellers.inStock | В наличии | În stoc |
| bestSellers.outOfStock | Нет в наличии | Indisponibil |
| bestSellers.addToCart | В корзину | Adaugă în coș |
| bestSellers.goToProductAria | Перейти к товару | Mergi la produsul |

## 7. Поиск (SearchModal)

| Ключ | RU | RO |
| --- | --- | --- |
| searchModal.heading | Результаты поиска | Rezultatele căutării |
| searchModal.placeholder | Что вы ищете? | Ce cauți? |
| searchModal.closeAria | Закрыть поиск | Închide căutarea |
| searchModal.clearAria | Очистить поиск | Șterge căutarea |
| searchModal.resultsLabel | Подходящие товары | Produse potrivite |
| searchModal.popularLabel | Популярные товары | Produse populare |
| searchModal.foundPrefix | Найдено товаров: | Produse găsite: |
| searchModal.emptyHeading | Ничего не найдено | Niciun rezultat |
| searchModal.emptyText | Попробуйте изменить запрос | Încearcă o altă căutare |

## 8. Страница магазина (Shop)

| Ключ | RU | RO |
| --- | --- | --- |
| shop.breadcrumbHome | Главная | Acasă |
| shop.breadcrumbCurrent | Магазин | Magazin |
| shop.heading | Товары для изготовления свечей | Articole pentru confecționarea lumânărilor |
| shop.paragraph | Освойте искусство свечеварения с экологичными материалами, мастерски подобранными ароматическими маслами и высокоточными инструментами. | Stăpânește arta lumânăritului cu materiale ecologice, uleiuri aromatice alese cu măiestrie și unelte de precizie. |
| shop.chipAll | Все | Toate |
| shop.filtersButton | Фильтры | Filtre |
| shop.resultsPrefix | Показано | Afișate |
| shop.resultsSuffix | товаров | produse |
| shop.sortLabel | Сортировка: | Sortare: |
| shop.sortOptions.popular | Популярные | Populare |
| shop.sortOptions.price-asc | Сначала дешёвые | Preț crescător |
| shop.sortOptions.price-desc | Сначала дорогие | Preț descrescător |
| shop.sortOptions.rating | По рейтингу | După rating |
| shop.categoryTitle | Категория | Categorie |
| shop.priceTitle | Диапазон цен | Interval de preț |
| shop.availabilityTitle | Наличие | Disponibilitate |
| shop.resetFilters | Сбросить фильтры | Resetează filtrele |
| shop.preorderLabel | Предзаказ | Precomandă |
| shop.addedToCart | Добавлено | Adăugat |
| shop.paginationPrev | Назад | Înapoi |
| shop.paginationNext | Далее | Înainte |
| shop.emptyHeading | Ничего не найдено | Niciun rezultat |
| shop.emptyText | Попробуйте изменить фильтры или сбросить их. | Încearcă să schimbi filtrele sau resetează-le. |

## 9. Страница товара (ProductPage)

| Ключ | RU | RO |
| --- | --- | --- |
| productPage.eyebrowFallback | Премиальный воск | Ceară premium |
| productPage.weightLabel | Выберите вес упаковки | Alege greutatea ambalajului |
| productPage.addToCart | Добавить в корзину | Adaugă în coș |
| productPage.buyNow | Купить сейчас | Cumpără acum |
| productPage.addedToCart | Добавлено | Adăugat |
| productPage.quantityAria | Количество | Cantitate |
| productPage.decreaseAria | Уменьшить количество | Micșorează cantitatea |
| productPage.increaseAria | Увеличить количество | Mărește cantitatea |
| productPage.descriptionTitle | Описание | Descriere |
| productPage.pairsWellTitle | Часто покупают вместе | Cumpărate frecvent împreună |
| productPage.pairsWellSubtitle | Всё необходимое для создания идеальной свечи в одном заказе. | Tot ce ai nevoie pentru lumânarea perfectă, într-o singură comandă. |
| productPage.bundlePriceLabel | Цена набора: | Preț pachet: |
| productPage.addBundleToCart | Добавить набор в корзину | Adaugă pachetul în coș |
| productPage.bundleAdded | Набор добавлен | Pachet adăugat |
| productPage.faqEyebrow | FAQ | Întrebări frecvente |
| productPage.faqHeading | Частые вопросы | Întrebări frecvente |
| productPage.reviewsSuffix | отзыва | recenzii |
| productPage.galleryThumbAria | Изображение товара | Imaginea produsului |

## 10. Корзина (Cart)

| Ключ | RU | RO |
| --- | --- | --- |
| cart.heading | Ваша корзина | Coșul tău |
| cart.closeAria | Закрыть корзину | Închide coșul |
| cart.itemWordOne | товар | produs |
| cart.itemWordFew | товара | produse |
| cart.itemWordMany | товаров | produse |
| cart.freeShippingRemaining | До бесплатной доставки осталось {amount} MDL! | Mai ai nevoie de {amount} MDL pentru livrare gratuită! |
| cart.freeShippingActive | Бесплатная доставка активна! 🎉 | Livrare gratuită activă! 🎉 |
| cart.minOrderTitle | Минимальный заказ — {amount} MDL | Comandă minimă — {amount} MDL |
| cart.minOrderRemaining | Добавьте ещё товаров на сумму {amount} MDL, чтобы оформить заказ. | Mai adaugă produse de {amount} MDL pentru a finaliza comanda. |
| cart.shippingCalculated | Рассчитывается при оформлении | Se calculează la finalizare |
| cart.totalLabel | Итого | Total |
| cart.checkoutCta | Перейти к оформлению | Mergi la finalizare |
| cart.continueShopping | Продолжить покупки | Continuă cumpărăturile |

## 11. Оформление заказа (Checkout)

### Общее

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.breadcrumbCurrent | Оформление заказа | Finalizarea comenzii |
| checkout.heading | Оформление заказа | Finalizarea comenzii |

### Шаг 1. Контакты

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.section1Title | 1. Контактная информация | 1. Informații de contact |
| checkout.b2bToggleLabel | Покупка для бизнеса (B2B) | Cumpărare pentru afaceri (B2B) |
| checkout.nameLabel | Ваше имя | Numele tău |
| checkout.namePlaceholder | Иван Петров | Ion Popescu |
| checkout.emailLabel | Электронная почта | Email |
| checkout.emailPlaceholder | you@example.com | tu@example.com |
| checkout.phoneLabel | Телефон | Telefon |
| checkout.phonePlaceholder | +373 6X XXXXXX | +373 6X XXXXXX |

### B2B-реквизиты

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.b2bSectionTitle | Реквизиты компании (B2B) | Datele companiei (B2B) |
| checkout.companyNameLabel | Название организации | Denumirea organizației |
| checkout.companyNamePlaceholder | S.R.L. Пример | S.R.L. Exemplu |
| checkout.companyTaxIdLabel | ИНН / IDNO | IDNO |
| checkout.companyTaxIdPlaceholder | 1016600012345 | 1016600012345 |
| checkout.companyVatLabel | КПП / Код НДС | Cod TVA |
| checkout.companyVatPlaceholder | 0601245 | 0601245 |
| checkout.companyAddressLabel | Юридический адрес | Adresa juridică |
| checkout.companyAddressPlaceholder | Молдова, г. Кишинёв, ул. Штефан чел Маре 1 | Moldova, Chișinău, str. Ștefan cel Mare 1 |

### Шаг 2. Доставка

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.section2Title | 2. Способ доставки | 2. Metoda de livrare |
| deliveryMethods.courier.name | Курьер Кишинёв | Curier Chișinău |
| deliveryMethods.courier.description | В течение 1-2 дней | În 1-2 zile |
| deliveryMethods.mail.name | Почта Молдовы | Poșta Moldovei |
| deliveryMethods.mail.description | По всей стране (2-3 дня) | În toată țara (2-3 zile) |
| deliveryMethods.pickup.name | Самовывоз | Ridicare personală |
| deliveryMethods.pickup.description | Шоурум, Кишинёв | Showroom, Chișinău |

### Шаг 3. Адрес

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.section3Title | 3. Адрес доставки | 3. Adresa de livrare |
| checkout.cityLabel | Город / Район | Oraș / Raion |
| checkout.cityPlaceholder | Кишинёв | Chișinău |
| checkout.streetLabel | Улица, дом, квартира | Stradă, bloc, apartament |
| checkout.streetPlaceholder | ул. Штефан чел Маре, 10 | str. Ștefan cel Mare, 10 |
| checkout.postalLabel | Почтовый индекс | Cod poștal |
| checkout.postalPlaceholder | MD-2000 | MD-2000 |

### Шаг 4. Оплата

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.section4Title | 4. Оплата банковской картой | 4. Plata cu cardul bancar |
| checkout.cardSectionLabel | Кредитная или дебетовая карта | Card de credit sau debit |
| checkout.cardNumberLabel | Номер карты | Numărul cardului |
| checkout.cardNumberPlaceholder | 0000 0000 0000 0000 | 0000 0000 0000 0000 |
| checkout.cardExpiryLabel | Срок действия | Data expirării |
| checkout.cardExpiryPlaceholder | MM / ГГ | LL / AA |
| checkout.cardCvcLabel | CVC / CVV | CVC / CVV |
| checkout.cardCvcPlaceholder | ••• | ••• |

### Сводка заказа

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.summaryTitle | Итого заказа | Totalul comenzii |
| checkout.quantityPrefix | Кол-во: | Cant.: |
| checkout.subtotalLabel | Промежуточный итог | Subtotal |
| checkout.shippingLabel | Доставка | Livrare |
| checkout.freeLabel | Бесплатно | Gratuit |
| checkout.totalLabel | Итого к оплате | Total de plată |
| checkout.freeShippingActive | Бесплатная курьерская доставка активна! 🎉 | Livrare gratuită prin curier activă! 🎉 |
| checkout.freeShippingRemaining | Добавьте товаров ещё на {amount} MDL для бесплатной курьерской доставки | Mai adaugă produse de {amount} MDL pentru livrare gratuită prin curier |
| checkout.submitButton | Оплатить и оформить заказ | Plătește și finalizează comanda |
| checkout.submitting | Оформляем заказ... | Se procesează comanda... |
| checkout.trustBadge1Title | Безопасная оплата 3D-Secure | Plată securizată 3D-Secure |
| checkout.trustBadge1Subtitle | Ваши данные надежно защищены | Datele tale sunt protejate |
| checkout.trustBadge2Title | Официальные чеки и накладные | Chitanțe și facturi oficiale |
| checkout.trustBadge2Subtitle | Полный комплект документов B2B/B2C | Set complet de documente B2B/B2C |

### Пустая корзина и успех

| Ключ | RU | RO |
| --- | --- | --- |
| checkout.emptyHeading | Ваша корзина пуста | Coșul tău este gol |
| checkout.emptyText | Добавьте товары из каталога, чтобы оформить заказ. | Adaugă produse din catalog pentru a finaliza comanda. |
| checkout.emptyCta | Перейти в магазин | Mergi la magazin |
| checkout.successHeading | Заказ оформлен! | Comandă plasată! |
| checkout.successText | Спасибо за покупку — мы отправили детали заказа на вашу почту и скоро свяжемся для подтверждения доставки. | Mulțumim pentru comandă — am trimis detaliile pe email și te vom contacta în curând pentru confirmarea livrării. |
| checkout.successCta | Вернуться в магазин | Înapoi la magazin |

## 12. Подвал (Footer)

| Ключ | RU | RO |
| --- | --- | --- |
| footer.newsletterHeading | Присоединяйтесь к сообществу Candle Craft | Alătură-te comunității Candle Craft |
| footer.newsletterText | Подпишитесь на эксклюзивные уведомления о новинках, советы по рецептурам и истории мастеров Молдовы. | Abonează-te pentru noutăți exclusive, sfaturi despre rețete și povești ale meșterilor din Moldova. |
| footer.emailPlaceholder | Ваш email | Emailul tău |
| footer.subscribe | Подписаться | Abonează-te |
| footer.brandDescription | Премиальный магазин товаров для изготовления свечей в Восточной Европе. Тепло и мастерство с 2021 года. | Magazin premium de produse pentru confecționarea lumânărilor în Europa de Est. Căldură și măiestrie din 2021. |
| footer.madeWith | Сделано с теплом в Молдове 🇲🇩 | Făcut cu căldură în Moldova 🇲🇩 |
| footer.copyright | © 2026 Candle Craft S.R.L. Все права защищены. | © 2026 Candle Craft S.R.L. Toate drepturile rezervate. |
| footer.privacyPolicy | Политика конфиденциальности | Politica de confidențialitate |
| footer.termsOfUse | Условия использования | Termeni de utilizare |

### Колонки ссылок

| Колонка | RU | RO |
| --- | --- | --- |
| 1. Заголовок | Материалы | Materiale |
| 1. Ссылки | Весь воск · Хлопковые фитили Премиум · Деревянные фитили · Ароматическое масло · Янтарные стеклянные банки · Силиконовые формы | Toată ceara · Fitiluri din bumbac Premium · Fitiluri din lemn · Ulei aromatic · Borcane de sticlă chihlimbarie · Forme din silicon |
| 2. Заголовок | Обучение | Învățare |
| 2. Ссылки | Руководство для начинающих · Гид по выбору фитилей · Расчёт ароматов · Журнал мастера · Интерактивный FAQ | Ghid pentru începători · Ghid de alegere a fitilurilor · Calculul aromelor · Jurnalul meșterului · Întrebări frecvente interactive |
| 3. Заголовок | О компании | Despre companie |
| 3. Ссылки | Наша история · Устойчивые закупки · Партнёрские мастер-классы · Карьера · Пресса и запросы | Povestea noastră · Aprovizionare durabilă · Ateliere partenere · Cariere · Presă și solicitări |
| 4. Заголовок | Поддержка | Suport |
| 4. Ссылки | Доставка по Кишинёву · Доставка Почтой Молдовы · Простой возврат · Безопасные платежи · Связаться с нами | Livrare în Chișinău · Livrare prin Poșta Moldovei · Retur simplu · Plăți securizate · Contactează-ne |

---

## Замечания по тексту

- Дублируются: «Сделано с теплом в Молдове 🇲🇩» (drawer.madeWith и footer.madeWith), «Оформление заказа» (checkout.heading и breadcrumbCurrent), «Ничего не найдено» (поиск и магазин), «Добавлено» (shop и productPage), условия бесплатной доставки (cart и checkout).
- RO: `productPage.faqEyebrow` и `faqHeading` совпадают («Întrebări frecvente»), в RU eyebrow — «FAQ». Заголовок получается дважды подряд.
- RU: `reviewsSuffix` = «отзыва» — склоняется только для 2–4, при других числах будет «5 отзыва».
- RU: `cart.itemWord*` склонения есть, в RO `itemWordFew` и `itemWordMany` одинаковые — это нормально.
- RU: `companyTaxIdLabel` «ИНН / IDNO» и `companyVatLabel` «КПП / Код НДС» — российские термины, в Молдове используются IDNO и Cod TVA, как в RO.
- Тексты в `app/lib/i18n.ts` — единственное место, где они хранятся, поэтому правки вносятся там в обе локали сразу.
