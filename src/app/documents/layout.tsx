export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex-1 pb-8">
      {children}
    </main>
  )
}
