// mobile: blok penuh dengan garis pemisah; desktop: kartu terpisah
export default function Section({ title, className = '', children }) {
  return (
    <section
      className={`border-b border-line px-5 py-4 md:rounded-[18px] md:border md:bg-paper md:p-[22px] ${className}`}
    >
      {title && (
        <h2 className="mb-2.5 font-heading text-[14.5px] font-bold md:mb-3.5 md:text-[17px]">{title}</h2>
      )}
      {children}
    </section>
  )
}
