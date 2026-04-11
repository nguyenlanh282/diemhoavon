import { Link } from '@/i18n/routing'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DashboardPreview } from '@/components/landing/dashboard-preview'

/* ─── Icon primitives ─────────────────────────────────────────── */
function Icon({
  d,
  size = 18,
  className = '',
}: {
  d: string | string[]
  size?: number
  className?: string
}) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

/* ─── Static data ─────────────────────────────────────────────── */
const FEATURES = [
  {
    id: 'fixed-var',
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z',
    color: 'text-indigo-400',
    ring: 'ring-indigo-500/20',
    glow: 'bg-indigo-500/10',
    title: 'Định phí & Biến phí',
    desc: 'Phân loại chính xác chi phí cố định hàng tháng và chi phí biến đổi theo từng đơn hàng, doanh số.',
  },
  {
    id: 'breakeven',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    color: 'text-blue-400',
    ring: 'ring-blue-500/20',
    glow: 'bg-blue-500/10',
    title: 'Tính điểm hòa vốn',
    desc: 'Tự động tính số đơn hàng và mức doanh thu cần thiết để bù đắp toàn bộ chi phí — real-time.',
  },
  {
    id: 'forecast',
    icon: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z',
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'bg-emerald-500/10',
    title: 'Dự toán bán hàng',
    desc: 'Nhập mục tiêu lợi nhuận hoặc doanh số để biết chính xác cần bán bao nhiêu đơn mỗi tháng.',
  },
  {
    id: 'multi-project',
    icon: 'M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10',
    color: 'text-violet-400',
    ring: 'ring-violet-500/20',
    glow: 'bg-violet-500/10',
    title: 'Đa dự án',
    desc: 'Quản lý nhiều dự án kinh doanh song song, chuyển đổi nhanh và theo dõi riêng biệt từng dự án.',
  },
  {
    id: 'report',
    icon: 'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
    color: 'text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'bg-amber-500/10',
    title: 'Báo cáo PDF & Email',
    desc: 'Xuất báo cáo phân tích điểm hòa vốn dạng PDF hoặc gửi email tới đội nhóm chỉ một cú nhấn.',
  },
  {
    id: 'team',
    icon: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    color: 'text-cyan-400',
    ring: 'ring-cyan-500/20',
    glow: 'bg-cyan-500/10',
    title: 'Quản lý nhóm',
    desc: 'Phân quyền admin / manager / user, cộng tác an toàn trong tổ chức với dữ liệu được bảo vệ.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Nhập chi phí',
    desc: 'Điền định phí hàng tháng (mặt bằng, lương…) và biến phí theo đơn (VAT, hoa hồng…) — dưới 3 phút.',
    accent: 'blue',
  },
  {
    step: '02',
    title: 'Thêm sản phẩm',
    desc: 'Nhập danh mục sản phẩm với giá bán, giá vốn và tỷ lệ cơ cấu bán hàng dự kiến.',
    accent: 'indigo',
  },
  {
    step: '03',
    title: 'Xem kết quả',
    desc: 'Hệ thống tự tính điểm hòa vốn, biên lợi nhuận và dự toán — xuất báo cáo ngay lập tức.',
    accent: 'emerald',
  },
]

const TESTIMONIALS = [
  {
    name: 'Nguyễn Thanh Hà',
    role: 'Chủ cửa hàng F&B, Hà Nội',
    avatar: 'NH',
    content:
      'Trước đây mình dùng Excel mà luôn sai do công thức phức tạp. Giờ chỉ cần nhập số liệu là ra ngay điểm hòa vốn — tiết kiệm hàng giờ mỗi tháng.',
    stars: 5,
  },
  {
    name: 'Trần Minh Khoa',
    role: 'Founder startup thương mại điện tử, TP.HCM',
    avatar: 'TK',
    content:
      'Tính năng dự toán theo mục tiêu lợi nhuận cực kỳ hữu ích khi pitch với nhà đầu tư. Báo cáo PDF trông chuyên nghiệp và đáng tin cậy.',
    stars: 5,
  },
  {
    name: 'Lê Phương Linh',
    role: 'Giám đốc tài chính SME, Đà Nẵng',
    avatar: 'LL',
    content:
      'Quản lý được 5 dự án cùng lúc, phân quyền nhóm rõ ràng. Đây là công cụ tôi muốn có từ lâu thay vì bảng tính chia sẻ loạn xạ qua Zalo.',
    stars: 5,
  },
]

const FAQS = [
  {
    q: 'Điểm hòa vốn là gì và tại sao tôi cần biết?',
    a: 'Điểm hòa vốn (Break-even point) là mức doanh thu hoặc số lượng sản phẩm bán ra mà tại đó tổng doanh thu bằng tổng chi phí — tức là bạn không lãi cũng không lỗ. Biết điểm này giúp bạn đặt mục tiêu bán hàng thực tế và kiểm soát tài chính chủ động.',
  },
  {
    q: 'Tôi có cần kiến thức kế toán để sử dụng không?',
    a: 'Không. Phần mềm được thiết kế cho chủ doanh nghiệp, không cần kiến thức kế toán. Bạn chỉ cần biết chi phí hàng tháng của mình là bao nhiêu.',
  },
  {
    q: 'Dữ liệu của tôi có được bảo mật không?',
    a: 'Có. Dữ liệu được mã hóa và lưu trữ an toàn. Mỗi tổ chức có không gian dữ liệu riêng biệt, không chia sẻ với người dùng khác.',
  },
  {
    q: 'Tôi có thể quản lý nhiều doanh nghiệp không?',
    a: 'Có. Bạn có thể tạo nhiều dự án (project) riêng biệt trong cùng một tài khoản, mỗi dự án có bộ chi phí, sản phẩm và kết quả phân tích độc lập.',
  },
]

/* ─── Page ────────────────────────────────────────────────────── */
export default async function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-50">
      {/* ── Navbar ── */}
      <nav className="fixed top-4 right-4 left-4 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-900/80 px-5 py-3 shadow-lg shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/30">
              <Icon d={['M3 3v18h18', 'm19 9-5 5-4-4-3 3']} size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-100">
              Điểm Hòa Vốn
            </span>
          </div>

          <div className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a
              href="#features"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-200"
            >
              Tính năng
            </a>
            <a
              href="#how-it-works"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-200"
            >
              Cách dùng
            </a>
            <a
              href="#pricing"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-200"
            >
              Bảng giá
            </a>
            <a
              href="#faq"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-200"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <button className="hidden cursor-pointer text-sm text-slate-300 transition-colors duration-200 hover:text-white sm:block">
                Đăng nhập
              </button>
            </Link>
            <Link href="/register">
              <button className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-500">
                Dùng miễn phí
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 pt-40 pb-20">
        {/* Background glows */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="pointer-events-none absolute top-32 left-1/4 h-[300px] w-[400px] rounded-full bg-indigo-600/6 blur-[100px]" />
        <div className="pointer-events-none absolute top-48 right-1/4 h-[250px] w-[350px] rounded-full bg-cyan-600/5 blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto max-w-6xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Công cụ tài chính dành riêng cho doanh nghiệp Việt Nam
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Biết chính xác cần bán
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
              bao nhiêu để có lãi
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Nhập chi phí, thêm sản phẩm — phần mềm tự động tính điểm hòa vốn, dự toán doanh số và
            xuất báo cáo chuyên nghiệp trong vài phút.
          </p>

          {/* CTA buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <button className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/40 sm:w-auto">
                Bắt đầu miễn phí ngay
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
            <Link href="/login">
              <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/30 px-8 py-4 text-base text-slate-300 transition-all duration-200 hover:border-slate-500 hover:bg-slate-800/60 hover:text-white sm:w-auto">
                <Icon
                  d={['M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4', 'M10 17 15 12 10 7', 'M15 12H3']}
                  size={16}
                />
                Đăng nhập
              </button>
            </Link>
          </div>

          {/* Trust row */}
          <div className="mb-16 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            {[
              {
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
                text: 'Miễn phí vĩnh viễn',
              },
              { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', text: 'Bảo mật dữ liệu 100%' },
              { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', text: 'Thiết lập trong 5 phút' },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-1.5">
                <Icon d={item.icon} size={14} className="text-emerald-500" />
                {item.text}
              </span>
            ))}
          </div>

          {/* Stats bar */}
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-6 rounded-2xl border border-slate-700/40 bg-slate-900/50 p-6 backdrop-blur-sm">
            {[
              { value: '500+', label: 'Doanh nghiệp tin dùng' },
              { value: '< 5 phút', label: 'Thiết lập ban đầu' },
              { value: '99.9%', label: 'Uptime đảm bảo' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-white sm:text-2xl">{stat.value}</div>
                <div className="mt-1 text-xs leading-snug text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="px-4 pb-28">
        <div className="mx-auto max-w-5xl">
          <DashboardPreview />
        </div>
      </section>

      {/* ── Problem → Solution ── */}
      <section className="relative overflow-hidden px-4 py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Problem */}
            <div>
              <span className="mb-4 block text-xs font-semibold tracking-widest text-red-400 uppercase">
                Vấn đề hiện tại
              </span>
              <h2 className="mb-6 text-3xl leading-tight font-bold text-white sm:text-4xl">
                Bảng tính Excel không đủ để quyết định kinh doanh
              </h2>
              <div className="space-y-4">
                {[
                  'Công thức phức tạp dễ sai, khó kiểm tra lại',
                  'Cập nhật thủ công tốn hàng giờ mỗi tháng',
                  'Không có cách tính nhanh "nếu tăng giá thì sao?"',
                  'Chia sẻ file qua Zalo/Email gây nhầm lẫn phiên bản',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/15">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm leading-relaxed text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Solution */}
            <div>
              <span className="mb-4 block text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                Giải pháp của chúng tôi
              </span>
              <h2 className="mb-6 text-3xl leading-tight font-bold text-white sm:text-4xl">
                Công cụ chuyên biệt cho phân tích hòa vốn
              </h2>
              <div className="space-y-4">
                {[
                  'Tính toán tự động, không lo sai công thức',
                  'Cập nhật real-time khi thay đổi bất kỳ con số nào',
                  'Dự toán "what-if" với mục tiêu lợi nhuận linh hoạt',
                  'Cộng tác nhóm với phân quyền, mọi người xem đúng phiên bản',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <span className="text-sm leading-relaxed text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button className="mt-8 flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-500">
                  Thử ngay miễn phí
                  <Icon d="M5 12h14M12 5l7 7-7 7" size={15} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-900/30 px-4 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 block text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Tính năng
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Tất cả những gì bạn cần
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-slate-400">
              Từ nhập chi phí đến phân tích điểm hòa vốn và xuất báo cáo — mọi thứ trong một nơi,
              không cần phần mềm bên ngoài.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.id}
                className="cursor-default rounded-2xl border border-slate-700/40 bg-slate-800/20 p-6 transition-all duration-200 hover:border-slate-600/60 hover:bg-slate-800/40"
              >
                <div
                  className={`h-11 w-11 rounded-xl ${f.glow} ring-1 ${f.ring} mb-5 flex items-center justify-center`}
                >
                  <Icon d={f.icon} size={18} className={f.color} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-4 py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <span className="mb-3 block text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Cách hoạt động
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Bắt đầu trong 3 bước đơn giản
            </h2>
            <p className="text-slate-400">Không cần kiến thức kế toán. Không cần Excel phức tạp.</p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-8 right-[calc(33.33%+1rem)] left-[calc(33.33%+1rem)] hidden h-px bg-gradient-to-r from-blue-500/40 via-indigo-500/40 to-emerald-500/40 sm:block" />

            {STEPS.map((step) => {
              const colors = {
                blue: {
                  text: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                  ring: 'ring-blue-500/30',
                },
                indigo: {
                  text: 'text-indigo-400',
                  bg: 'bg-indigo-500/10',
                  ring: 'ring-indigo-500/30',
                },
                emerald: {
                  text: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                  ring: 'ring-emerald-500/30',
                },
              }
              const c = colors[step.accent as keyof typeof colors]
              return (
                <div key={step.step} className="relative text-center">
                  <div
                    className={`h-14 w-14 rounded-2xl ${c.bg} ring-1 ${c.ring} mx-auto mb-5 flex items-center justify-center`}
                  >
                    <span className={`${c.text} text-base font-bold`}>{step.step}</span>
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-slate-900/30 px-4 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="mb-3 block text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Đánh giá
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Được tin dùng bởi doanh nghiệp Việt
            </h2>
            <p className="mx-auto max-w-lg text-slate-400">
              Hơn 500 chủ doanh nghiệp đang kiểm soát tài chính tốt hơn mỗi ngày.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-2xl border border-slate-700/40 bg-slate-800/30 p-6"
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#fbbf24"
                      stroke="none"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-300">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-700/40 pt-2">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20">
                    <span className="text-xs font-bold text-blue-400">{t.avatar}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-4 py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <span className="mb-3 block text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Bảng giá
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Đơn giản, minh bạch</h2>
            <p className="text-slate-400">
              Bắt đầu hoàn toàn miễn phí. Nâng cấp khi doanh nghiệp phát triển.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-8">
              <div className="mb-6">
                <h3 className="mb-1 text-xl font-bold text-white">Miễn phí</h3>
                <p className="text-sm text-slate-400">Phù hợp cho cá nhân và startup</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">0₫</span>
                <span className="ml-2 text-sm text-slate-400">/ mãi mãi</span>
              </div>
              <div className="mb-8 space-y-3">
                {[
                  '1 dự án',
                  'Tính điểm hòa vốn cơ bản',
                  'Tối đa 10 sản phẩm',
                  'Xuất báo cáo PDF',
                  '1 thành viên',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button className="w-full cursor-pointer rounded-xl border border-slate-600 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-slate-400 hover:text-white">
                  Bắt đầu miễn phí
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/60 to-slate-900 p-8 shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  Phổ biến nhất
                </span>
              </div>
              <div className="mb-6">
                <h3 className="mb-1 text-xl font-bold text-white">Pro</h3>
                <p className="text-sm text-slate-400">Dành cho doanh nghiệp đang tăng trưởng</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">199K₫</span>
                <span className="ml-2 text-sm text-slate-400">/ tháng</span>
              </div>
              <div className="mb-8 space-y-3">
                {[
                  'Dự án không giới hạn',
                  'Tất cả tính năng Free',
                  'Sản phẩm không giới hạn',
                  'Báo cáo qua Email tự động',
                  'Tối đa 10 thành viên',
                  'Hỗ trợ ưu tiên',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-slate-200">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-500">
                  Dùng thử 14 ngày miễn phí
                </button>
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Cần gói Enterprise cho tổ chức lớn?{' '}
            <a
              href="mailto:hello@diemhoavon.vn"
              className="cursor-pointer text-blue-400 transition-colors hover:text-blue-300"
            >
              Liên hệ chúng tôi
            </a>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-slate-900/30 px-4 py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <span className="mb-3 block text-xs font-semibold tracking-widest text-blue-400 uppercase">
              FAQ
            </span>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Câu hỏi thường gặp</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-6">
                <h3 className="mb-3 text-base leading-snug font-semibold text-white">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-4 py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40 p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(59,130,246,0.12)_0%,_transparent_65%)]" />
            <div className="absolute top-6 left-6 h-2 w-2 rounded-full bg-blue-500/30" />
            <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-blue-500/30" />
            <div className="absolute bottom-6 left-6 h-2 w-2 rounded-full bg-indigo-500/30" />
            <div className="absolute right-6 bottom-6 h-2 w-2 rounded-full bg-indigo-500/30" />

            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                Bắt đầu ngay hôm nay
              </div>

              <h2 className="mb-5 text-3xl leading-tight font-bold text-white sm:text-4xl">
                Kiểm soát tài chính doanh nghiệp
                <br />
                chưa bao giờ dễ đến vậy
              </h2>

              <p className="mx-auto mb-8 max-w-md leading-relaxed text-slate-400">
                Tạo tài khoản miễn phí, nhập số liệu và xem ngay điểm hòa vốn của doanh nghiệp bạn.
              </p>

              <Link href="/register">
                <button className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500">
                  Tạo tài khoản miễn phí
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>

              <p className="mt-4 text-sm text-slate-600">
                Không cần thẻ tín dụng · Miễn phí vĩnh viễn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/80 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-8 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                  <Icon d={['M3 3v18h18', 'm19 9-5 5-4-4-3 3']} size={14} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-300">Điểm Hòa Vốn</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                Công cụ tài chính chuyên biệt giúp doanh nghiệp Việt Nam tính điểm hòa vốn và kiểm
                soát chi phí hiệu quả.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                Sản phẩm
              </h4>
              <ul className="space-y-2.5">
                {['Tính năng', 'Bảng giá', 'Cách hoạt động', 'Cập nhật mới'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="cursor-pointer text-sm text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                Hỗ trợ
              </h4>
              <ul className="space-y-2.5">
                {['Hướng dẫn sử dụng', 'FAQ', 'Liên hệ', 'Chính sách bảo mật'].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="cursor-pointer text-sm text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/60 pt-6 sm:flex-row">
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Điểm Hòa Vốn. Được xây dựng cho doanh nghiệp Việt
              Nam.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <a href="#" className="cursor-pointer transition-colors hover:text-slate-400">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="cursor-pointer transition-colors hover:text-slate-400">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
