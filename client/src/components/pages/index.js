import TemplateContentFullWidth from '../templates/template-content-full-width'
import UserHeader from '../organisms/user-header'
import IndexContent from '../organisms/index-content'

export default function Index({ content, children }) {
  return <TemplateContentFullWidth
    header={<UserHeader />}
    content={<IndexContent />}
  />
}
