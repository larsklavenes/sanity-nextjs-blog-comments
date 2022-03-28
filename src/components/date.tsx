import { isValid, parseISO, format } from 'date-fns'

export default function Date({ dateString }): JSX.Element {
  if (!isValid(parseISO(dateString))) {
    return <>No date</>
  }
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'LLLL	d, yyyy')}</time>
}
