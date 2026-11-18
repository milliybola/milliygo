import GoLogin from './GoLogin'

/**
 * Sahifa ichida ko'rsatiladigan kirish kartasi (modalsiz).
 * Login tugagach useSession().isAuthenticated o'zgaradi va sahifa o'z mazmunini ko'rsatadi.
 */
export default function InlineLogin() {
  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-[420px] rounded-[24px] border border-solid border-go-line bg-white p-5">
        <GoLogin />
      </div>
    </div>
  )
}
