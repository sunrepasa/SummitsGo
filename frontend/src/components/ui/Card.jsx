export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-2xl border border-line bg-paper ${className}`} {...props}>
      {children}
    </Tag>
  )
}