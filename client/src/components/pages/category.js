import TemplateSidebarContent from '../templates/template-sidebar-content'
import UserHeader from '../organisms/user-header'
import CategoryDetails from '../organisms/category-details'
import CategorySidebar from '../organisms/category-sidebar'

export default function Category({ name, description, category, categories, sidenav }) {
  return <TemplateSidebarContent
    header={<UserHeader />}
    sidebar={<CategorySidebar category={category} name={name} description={description} sidenav={sidenav} />}
    content={<CategoryDetails category={category} />}
  />
}
