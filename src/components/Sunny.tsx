import blueSun from '../assets/blue-sun.svg'

/** Glowy's mascot: the blue sun from the app icon. It breathes at rest and hops when you save a look. */
export function Sunny({ size = 32, cheer = 0 }: { size?: number; cheer?: number }) {
  return (
    <img
      className="sunny"
      data-cheer={cheer > 0}
      key={cheer}
      src={blueSun}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  )
}
