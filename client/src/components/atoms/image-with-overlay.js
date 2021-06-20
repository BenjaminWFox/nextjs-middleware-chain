import Image from 'next/image'
import styles from './image-with-overlay.module.css'

export default function ImageWithOverlay({ title, subtitle, src, layout = 'fill' }) {
  return (
    <div className={[styles.wrapper, 'atom'].join(' ')}>
      <div className={styles.caption}>
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <Image
        src={src}
        layout={layout}
        objectFit="cover"
        objectPosition="center center"
      />
    </div>
  )
}
