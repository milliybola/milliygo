# API_GAPS — MilliyGo mijoz sayti

Saytda ma'lumot **to'qib chiqarilmaydi**. API'da yo'q narsa kerak bo'lgan joyda `ApiGap` belgisi
(`src/components/common/ApiGap.tsx` — sariq uzuq chiziqli "API" pill, tooltip'da sabab) turadi.
Belgilarni o'chirish: `.env*` da `NEXT_PUBLIC_SHOW_API_GAPS=false` (standart — ko'rinadi).

API bazasi: `https://mytizim.uz` (javoblar `{ success, data }` konvertida).

## 1. Setlar va 1+1 / 2+1 aksiyalar (backendda hali yo'q)

**Yagona kontrakt:** [`D:/Milliy/API_CONTRACT_SETS_PROMOS.md`](../../API_CONTRACT_SETS_PROMOS.md) —
barcha loyihalar (superapp, site, merchant, POS…) shu faylga tayanadi; bu yerda takrorlanmaydi, faqat sayt qanday ishlatishi:

| Kontrakt bandi | Sayt kodi | Hozirgi holat |
|---|---|---|
| `GET /partner/sets/?partner=<uuid>` | `fetchSets` (`src/features/go/lib/api.ts`), "Setlar" bo'limi restoran sahifasida (`RestaurantPage.tsx`), `SetCard`, `ProductSheet` (Set tarkibi) | 404 → bo'lim o'rnida ApiGap. Javob kelsa avtomatik chiqadi (is_active + start/end_date filtrlanadi). |
| `GET /partner/promotions/?partner=<uuid>` | `fetchPromotions` → mahsulotlarga `promotion` biriktiriladi | 404 → "Aksiyalar" sarlavhasi yonida / menyu oxirida ApiGap. |
| `product.promotion { type, buy_quantity, get_quantity, label }` | `normalizePromotionShort`, "1+1"/"2+1" oltin badge (`DealBadges`) | Maydon yo'q → badge chiqmaydi. |
| §3 hisob: `free = floor(qty/(buy+get))*get` | `freeCount`, `lineTotal`, `dealNote` (`lib/utils.ts`) — savat qatorida "1+1 aksiya · 2 tasi bepul", "Tejovingiz" | Faqat ko'rsatish uchun; server qayta hisoblaydi. |
| Buyurtmada set qatori `{ "set": "<uuid>", "quantity": n }` | `CheckoutPage.tsx` → `items` | Mahsulot qatorlari avvalgidek `product_uuid` bilan. |
| Javobda `discount_amount`, `items[].free_quantity` | `normalizeOrder` → buyurtma sahifasida "Chegirma" va "N tasi bepul" | Maydon bo'lmasa ko'rsatilmaydi. |

## 2. Boshqa yetishmayotgan maydon/endpointlar

| # | Nima kerak | Qayerda (UI) | Hozir |
|---|---|---|---|
| 2.1 | `delivery_zones[].estimated_minutes` ko'p zonalarda `null` (masalan Milliy Market) | Hamkor kartasi, restoran sarlavhasi "Yetkazish" | "Yetkazib beriladi" / "—" + ApiGap (kartada). Vaqt to'qib chiqarilmaydi. |
| 2.2 | Sharhlar soni (`reviews_count`) va sharhlar ro'yxati | Restoran sarlavhasi "Reyting" katagi | Faqat `rating` ko'rsatiladi + ApiGap. |
| 2.3 | Onlayn to'lov (Payme/Click/karta): `payment_method` faqat `CASH` | Checkout → "To'lov" | Karta qatori nofaol + ApiGap. |
| 2.4 | WebSocket `wss://mytizim.uz/ws/order/<uuid>/` brauzerda `Authorization` sarlavhasini yubora olmaydi → `?token=` (yoki cookie) qo'llab-quvvatlash kerak. Hozir handshake 500 qaytaradi. | Buyurtma kuzatish (jonli holat + kuryer koordinatasi) | 15 s polling (`GET /orders/<uuid>/`) + ApiGap. Kuryer nuqtasi xaritada faqat WS ishlasa chiqadi. |
| 2.5 | Ochiq kuzatish havolasi (kirishsiz, imzolangan token bilan) — superapp `milliyapp.uz/orders/track/?uuid=` ulashadi, lekin `GET /orders/<uuid>/` avtorizatsiya talab qiladi | `/orders/track/` | Kirish so'raladi + ApiGap. |
| 2.6 | `GET /orders/<uuid>/` va ro'yxatda `partner_uuid` (yoki `partner{uuid}`) va `partner_type` aniq bo'lishi | "Qayta buyurtma", olib ketish sahifasida restoran logotipi/koordinatasi | Nom bo'yicha qidiriladi (ishonchsiz); superapp esa nomdagi "market" so'ziga qarab taxmin qiladi. |
| 2.7 | Sevimlilar (favorites) API | — | Superapp'da faqat lokal; saytda qo'shilmagan. |
| 2.8 | Bildirishnomalar (push/inbox) API | — | Qo'shilmagan. |
| 2.9 | Promo bannerlar `title`/`description` ko'pincha `"."` | Karusel `alt` matni | Bo'sh deb hisoblanadi (`cleanText`). |
| 2.10 | Hamkor `address` ba'zan `"."` | Kartalar, olib ketish | Ko'rsatilmaydi. |
| 2.11 | CORS: `https://milliyapp.uz`, `https://www.milliyapp.uz`, `http://localhost:7080` ruxsat etilgan. Boshqa domen (masalan `milliygo.uz`) yoki preview domenlar bloklanadi | Butun sayt | Deploy domeni CORS ro'yxatida bo'lishi shart. |
| 2.12 | Yaroqsiz access token bilan **ochiq** endpointlar (`/partner/` …) ham 401 qaytaradi | Butun sayt | Interceptor refresh qiladi yoki sessiyani tozalaydi; backend ochiq GET'larda yaroqsiz tokenni e'tiborsiz qoldirsa yaxshi bo'lardi. |
