export default function TopBar({ title, right, children }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-stone px-5 pb-3.5 pt-4 md:hidden">
      {children ?? <h1 className="font-heading text-lg font-bold">{title}</h1>}
      {right}
    </header>
  )
}