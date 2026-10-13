export const PageHeading = ({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) => {
  return (
    <div className="page-heading">
      <span className="eyebrow">PROBLEM {number} / FRONTEND</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}
