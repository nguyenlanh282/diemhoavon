import { auth } from '@/lib/auth'
import { redirect } from '@/i18n/routing'
import { getLocale } from 'next-intl/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getProjects, getCurrentProjectId } from '@/lib/actions/projects'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user) {
    redirect({ href: '/login', locale })
    return null
  }

  // Fetch projects for sidebar
  const [projects, currentProjectId] = await Promise.all([getProjects(), getCurrentProjectId()])

  return (
    <div className="bg-background min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="bg-card fixed top-0 left-0 z-40 hidden h-screen w-64 border-r lg:block">
        <Sidebar
          locale={locale}
          user={session.user}
          projects={projects}
          currentProjectId={currentProjectId}
        />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header user={session.user} locale={locale} />

        {/* Mobile Navigation */}
        <MobileNav locale={locale} user={session.user} />

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
