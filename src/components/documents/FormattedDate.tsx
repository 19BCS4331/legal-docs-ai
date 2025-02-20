'use client'

export function FormattedDate({ date }: { date: string }) {
  return (
    <time dateTime={date}>
      {new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      })}
    </time>
  )
}
