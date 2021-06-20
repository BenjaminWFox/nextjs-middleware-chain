import Link from 'next/link'
import styles from './user-avatar.module.css'

export default function UserAvatar({ size, type, display }) {
  return (
    <Link href="/profile" className="atom">
      <a>
        <div
          style={{ padding: `var(--spacing-${size})` }}
          className={styles.userAvatar}>
          BF
        </div>
      </a>
    </Link>
  )
}
