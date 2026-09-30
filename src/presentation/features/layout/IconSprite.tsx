import sprite from '../../../../public/icons.svg?raw'

export function IconSprite() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      dangerouslySetInnerHTML={{ __html: sprite }}
    />
  )
}
