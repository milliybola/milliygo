/**
 * Barcha yangi sahifalar uchun getStaticProps.
 * Xabarlar (uz.json) _app'da statik import qilingan — har sahifaga 144 KB JSON
 * inline qilinmasligi uchun bu yerda props bo'sh.
 */
export async function goStaticProps() {
  return { props: {} }
}
