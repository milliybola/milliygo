# REDESIGN_NOTES — MilliyGo sayti superapp uslubida

Branch: `redesign/superapp-style` (commit qilinmagan, push qilinmagan).
Manba: Flutter superapp (`D:\Milliy\SuperApp\superapp`, faqat o'qildi).

## Holat
- `npm run build` — ✅ o'tadi (statik eksport, `out/`).
- `npm run lint` — ✅ "Lint passed" (yangi TS kod uchun `typescript-eslint` bloki qo'shildi; `out/` ignore qilindi).
- `tsc --noEmit` — yangi kodda 0 xato. Eski (emehmon/sayohat) kodda 61 ta oldindan mavjud xato qoldi
  (yo'q modullar: `features/HotelsItem`, `FindAPlane`…); `next.config.js` dagi `ignoreBuildErrors: true` sabab build'ga ta'sir qilmaydi.
- Mobil (390px) va desktop (1366px) Playwright skrinshotlari bilan tekshirildi: home, restoranlar/olib ketish ro'yxati,
  restoran, do'kon, mahsulot varaqasi, savat, checkout, kuzatish (yetkazish + olib ketish), buyurtmalar, profil.
  Set/1+1 oqimi test vaqtida mock javoblar bilan tekshirildi (60 000 set + 30 000 burger + 3× cola 1+1 = 100 000, tejov 15 000 — to'g'ri).

## Arxitektura (yangi)
`src/features/go/`
- `lib/types.ts` — Partner, DeliveryZone, Product, **ProductSet**, **Promotion/PromotionShort**, CartLine, Order, Courier…
- `lib/normalize.ts` — API javoblarini normallashtirish (`{success,data}` konverti, `"."` manzillar, koordinata almashuvi, kuryer maydonlari — superapp `_applyCourierData` bilan bir xil).
- `lib/api.ts` — barcha endpointlar; ixtiyoriy (hali yo'q) endpointlar uchun "jim" klient (404 da bildirishnoma chiqmaydi).
- `lib/utils.ts` — narx formati, `dd-MM-yyyy` sana, ish vaqti/ochiqlik (tungi smena), zona poligonlari, ETA (faqat API vaqtidan), yetkazish narxi, **1+1/2+1 hisobi (kontrakt §3)**, qaytim kupyuralari.
- `lib/cart.ts` — zustand, har hamkorga alohida savat; restoran/do'kon savatlari alohida; rejim `DELIVERY|PICKUP` (do'konda doim DELIVERY); izoh, anjomlar.
- `lib/status.ts` — status → matn/bosqich (superapp `OrderStatusInfo` nusxasi, olib ketish varianti bilan).
- `lib/useOrderSocket.ts` — WS urinish + polling fallback.
- `ui/` — dizayn primitivlari (Card, Chip, Segment, Stepper "+"→"− N +", **Sheet** = telefonda bottom sheet / desktopda modal, StickyBar…), SVG ikonlar.
- `components/`, `layout/` (yangi header/footer/pastki menyu), `pages/`.
- `src/components/common/ApiGap.tsx` — API bo'shliqlari belgisi (`NEXT_PUBLIC_SHOW_API_GAPS`).

## Sahifalar
| URL | Nima |
|---|---|
| `/` | Manzil, qidiruv, Taomlar/Do'konlar kartalari, faol buyurtmalar, promo karusel (sana filtri), "Yaqin atrofdagi restoranlar" (filtrlar), do'konlar to'ri, qo'llanma stories, "Tez kunda", yordam; kuryerni baholash oynasi |
| `/restaurants/` (`?mode=pickup`) | Yetkazish / O'zi olib ketish, toifalar, filtrlar, nofaol (yopiq/zonadan tashqari) oxirida |
| `/restaurant/?id=<uuid>` | Restoran: info, rejim tugmasi, sticky toifa tablari, **Setlar**, **Aksiyalar**, menyu, qidiruv, sticky oltin savat paneli |
| `/store/` , `/store/?id=<uuid>` | Do'konlar ro'yxati / Yandex-uslub do'kon (4 ustunli toifa plitkalari, "−18%", qizil narx + chizilgan eski narx, toifa ichi) |
| `/cart/` | Taomlar/Do'konlar tablari, hamkor chiplari, rejim, qatorlar (bepul donalar, set tarkibi), izoh, anjomlar, tejov, bepul yetkazish progressi, "Yana nimadir kerakmi?" |
| `/checkout/?partner=` | Manzil (+ saqlangan manzillar), podyezd/qavat/kvartira/domofon, olib ketish joyi + xarita, oluvchi (contact_name), naqd + "Qaytim kerakmi?", narx tafsiloti, validatsiya, tasdiqlash |
| `/orders/track/?uuid=` | Yetkazish: bosqichlar, Yandex xarita, kuryer (ism, telefon, rang+marka+model, davlat raqami); Olib ketish: "Buyurtmangiz tayyor!", MG-raqam, "Restoranga borish" (xarita ilovasi) |
| `/orders/` | Qidiruv, tablar (Faol/Yakunlangan/Olib ketish/Bekor), qayta buyurtma |
| `/profile/` | Profil tahriri, manzillar (qo'shish/o'chirish/asosiy), yordam, chiqish |
| `/search/` | `/search/?q=` — maskanlar va mahsulotlar, oxirgi qidiruvlar |
| `/auth/login/` + global oyna | Telegram bot (@MilliyGoApp_bot) 6 xonali kod |

## Topilgan va tuzatilgan xatolar
1. **Token yangilash eski serverga ketardi** (`auth.emehmon.xdevs.uz/.../account/me/refresh/`) → `https://mytizim.uz/api/token/refresh/` (superapp bilan bir xil), `{data:{access,refresh}}` konverti o'qiladi, refresh token aylantiriladi.
2. Refresh xatosida `localStorage.clear()` — **savat, manzil, sozlamalar o'chib ketardi** → faqat auth kalitlari tozalanadi; tarmoq/5xx xatosida sessiya saqlanadi.
3. Har qanday 503 javobda `window.history.back()` — foydalanuvchi sahifadan otib yuborilardi → olib tashlandi.
4. 401 + refresh token yo'q holatda UI "kirgan" bo'lib qolardi → auth holati tozalanadi.
5. Telegram login javobi `res.access` deb o'qilardi (backend `{data:{access}}` qaytaradi) → `extractTokens`; login'dan keyin majburiy `/profile` ga yo'naltirish olib tashlandi; parol/kod login `/account/account-management` (mavjud bo'lmagan sahifa, 404) ga yo'naltirardi.
6. **`src/proxy.ts` (middleware) statik eksportda ishlamaydi**, lekin Next har navigatsiyada `_next/data/*.json` so'rab 404 olardi (ortiqcha so'rovlar / to'liq qayta yuklanish) → o'chirildi.
7. `useFallbackMessage` 20 ta til JSON'ini (~3.2 MB) `_app` bundle'iga qo'shardi → faqat `uz`; xabarlar endi sahifa props'iga 144 KB dan inline qilinmaydi.
8. Ishlab chiqarishda **react-scan** profiler skripti yuklanardi → olib tashlandi. ReactQueryDevtools va bo'sh SupportChat olib tashlandi; ishlatilmaydigan Outfit shrifti olib tashlandi (Onest ishlatiladi).
9. **antd v5 + React 19**: patch yo'qligi sabab `Modal.confirm`/`message` statik metodlari ishlamasligi mumkin edi → `@ant-design/v5-patch-for-react-19` (kichik) qo'shildi.
10. Restoran sahifasi `getStaticPaths` + `fallback:false` — **build'dan keyin qo'shilgan restoranlar ochilmasdi** (Netlify `/* → /index.html` qoidasi sabab bosh sahifa ko'rinardi) → asosiy havolalar `?id=` ko'rinishiga o'tdi; `/restaurant/*`, `/store/*` uchun qayta yozish qoidalari (`public/_redirects`, `netlify.toml`, `vercel.json`); noma'lum yo'llar 404.
11. Sanalar `new Date("dd-MM-yyyy HH:mm:ss")` bilan o'qilardi → Invalid Date (bosh sahifadagi baholash oynasi mantiqi buzuq) → `parseApiDate`.
12. Mahsulotlar `/products/?partner=` bilan alohida so'ralardi; `/partner/category/?partner=` allaqachon mahsulotlarni beradi → bitta so'rov.
13. Bitta savat cheklovi (boshqa restoran savatda bo'lsa qo'shib bo'lmasdi) → superapp kabi har hamkorga alohida savat; do'kon va restoran savatlari ajratildi; do'konda olib ketish yo'q.
14. Buyurtmada `delivery_type`, `payment_method: CASH`, `contact_name`, qaytim, podyezd/qavat… yuborilmasdi → superapp payload'i bilan bir xil.
15. `body { overflow-x: hidden }` sticky elementlarni buzardi → `overflow-x: clip`. Brend rangi ko'kdan yashilga (#15803D); antd theme moslandi.
16. `NODE_TLS_REJECT_UNAUTHORIZED = '0'` (xavfsiz emas) olib tashlandi. `npm run lint` `out/` ni tekshirib 830 "xato" berardi → tuzatildi.
17. Location modal oltin rangi brend yashiliga o'tkazildi.

O'chirilgan eski modullar (yangilari bilan almashtirildi): `features/Cart`, `features/Orders`, `features/Restaurant`, `features/StoreItem`, `features/Stores`, `features/Main/components`, `store/cartStore.ts`, `BottomNavigation`, `SupportChat`. Foydalanuvchi brauzeridagi eski `food-cart-storage` savati ko'chirilmaydi (yangi kalit `milliygo-carts-v1`).

## Qolgan muammolar
- Eski emehmon/sayohat kodi (`features/Account/*`, `HotelsItem` havolalari, `CHeader/index.tsx`, `sign-up.tsx` …) — ishlatilmaydi, lekin repoda; 61 ta tsc xatosi shu yerda. Tozalash tavsiya etiladi.
- `jobs`, `faq`, `privacy`, `services`, `delete-account` sahifalari eski uslubda (faqat yangi header/footer ichida).
- Sevimlilar, bildirishnomalar, PIN/biometrika (superapp'da bor) — saytda yo'q (API yo'q yoki mobilga xos).
- Onboarding/manzil qo'yish: mavjud LocationModal qayta ishlatildi (Yandex xarita, mahalla chegaralari) — dizayni to'liq superapp'dagidek emas.
- `antd` statik `Modal.confirm` theme kontekstini olmaydi (ogohlantirish) — `App.useApp()` ga o'tkazish mumkin.
- Hydration ogohlantirishi (`/restaurants/?mode=pickup` — atribut farqi) kuzatildi; funksionallikka ta'sir qilmaydi.
- `/restaurant/[slug]` va `/store/[slug]` eski havolalar uchun qoldirilgan (build vaqtida API'dan olinadi).

## Ishga tushirishni bloklovchi masalalar (launch blockers)
1. **WebSocket brauzerdan ulanmaydi** (`?token=` qo'llab-quvvatlanmaydi, handshake 500) — jonli kuryer kuzatuvi yo'q, faqat 15 s polling.
2. **Ochiq kuzatish havolasi ishlamaydi** — superapp ulashgan `milliyapp.uz/orders/track/?uuid=` kirmagan odamga 401; endpoint kerak.
3. **CORS** — deploy domeni API ro'yxatida bo'lishi shart (hozir `milliyapp.uz`, `www.milliyapp.uz`, `localhost:7080`).
4. `.env.development` / `.env.production` repoda **JWT (`NEXT_PUBLIC_TEMP_TOKEN`)** saqlangan — bekor qilish va repodan olib tashlash kerak.
5. Refresh endpoint `/api/token/refresh/` superapp'dan olingan; sayt uchun real token bilan sinab ko'rilmagan (test akkaunt yo'q). Telegram kod bilan kirish va `POST /orders/` jonli tekshirilmadi (haqiqiy buyurtma yaratmaslik uchun).
6. Set/1+1 backend tayyor bo'lgach `{ "set": uuid }` buyurtma qatorini server qabul qilishi va `discount_amount`/`free_quantity` qaytarishi kerak (kontrakt).
7. Ishga tushirishdan oldin `NEXT_PUBLIC_SHOW_API_GAPS=false` qo'yish (aks holda foydalanuvchilarga "API" belgilari ko'rinadi).
