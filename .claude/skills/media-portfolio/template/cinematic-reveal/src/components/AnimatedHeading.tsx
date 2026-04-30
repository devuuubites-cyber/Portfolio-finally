import { useEffect, useState } from "react"

interface AnimatedHeadingProps {
  text: string
  /** Delay before the animation starts (ms). */
  delay?: number
  /** Per-character stagger (ms). */
  charDelay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * Splits `text` into per-character spans. Each character starts at
 * opacity:0 + translateX(-18px) and animates in with a stagger of
 * lineIndex * line.length * charDelay + charIndex * charDelay ms.
 *
 * Newlines split into separate flex rows so wrapping stays sane.
 * Spaces are preserved with U+00A0 so flexbox doesn't collapse them.
 */
export function AnimatedHeading({
  text,
  delay = 0,
  charDelay = 18,
  className,
  as: Tag = "div",
}: AnimatedHeadingProps) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setActive(true), delay)
    return () => window.clearTimeout(t)
  }, [delay])

  const lines = text.split("\n")

  return (
    <Tag className={className}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="flex flex-wrap justify-center">
          {Array.from(line).map((ch, charIndex) => {
            const totalDelay =
              lineIndex * line.length * charDelay + charIndex * charDelay
            return (
              <span
                key={`${lineIndex}-${charIndex}`}
                className="inline-block transition-all duration-500"
                style={{
                  opacity: active ? 1 : 0,
                  transform: `translateX(${active ? 0 : -18}px)`,
                  transitionDelay: `${totalDelay}ms`,
                }}
              >
                {ch === " " ? " " : ch}
              </span>
            )
          })}
        </div>
      ))}
    </Tag>
  )
}
