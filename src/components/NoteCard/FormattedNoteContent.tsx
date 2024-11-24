import { MENTION_REGEX } from '@src/utils'

const FormattedNoteContent = ({
  content,
  maxLength = 300,
}: {
  content: string
  maxLength: number
}) => {
  // this method will split text into segments with mentions and regular text
  const formatText = (text: string) => {
    const segments = []
    let lastIndex = 0
    let match
    let truncated = text

    //truncation
    if (text.length > maxLength) {
      truncated = text.slice(0, maxLength) + '...'
    }

    //find all mentions in the text
    while ((match = MENTION_REGEX.exec(truncated)) !== null) {
      //add the text before the mention
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: truncated.slice(lastIndex, match.index),
          key: `text-${lastIndex}`,
        })
      }

      //mention goes next here
      segments.push({
        type: 'mention',
        content: match[1],
        key: `mention-${match.index}`,
      })

      lastIndex = match.index + match[1].length
    }

    // remainig text after last mention
    if (lastIndex < truncated.length) {
      segments.push({
        type: 'text',
        content: truncated.slice(lastIndex),
        key: `text-${lastIndex}`,
      })
    }

    return segments
  }

  const segments = formatText(content)

  return (
    <div>
      {segments.map((segment) => (
        <span
          key={segment.key}
          className={segment.type === 'mention' ? 'bg-blue-100 text-blue-700 rounded px-1' : ''}
        >
          {segment.content}
        </span>
      ))}
    </div>
  )
}

export default FormattedNoteContent
