import Link from 'next/link'
import BannerImage from '../molecules/banner-image'

export default function IndexContent({ content, children }) {
  return <div className="organism">
    <BannerImage
      height="500px"
      src="/pano.webp"
      title="Welcome to RAIJ"
      subtitle="Make Lists. Soothe the Rage." />
    <h3>This would be some homepage content!</h3>
    <div>
      <ul>
        <li><Link href="/api-route">API Route Test Page</Link></li>
        <li><Link href="/ssr-route">SSR Route Test Page</Link></li>
      </ul>
    </div>
  </div>
}
