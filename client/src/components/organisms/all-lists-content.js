import BannerImage from '../molecules/banner-image'
import BlockLink from '../atoms/block-link'

export default function AllListsContent({categories}) {
  return (<div className="organism">
    <BannerImage
      height="300px"
      src="/leaves.webp"
      title="All Lists"
    />
    <div style={{ padding: 'var(--spacing-xl) var(--spacing-lg)'}}>
      {categories.map(category => {
        return (
          <div key={categories.name}>
            {category.name}
            <ul>
              {category.lists.map(list => (
                <li key={list.name}>
                  <BlockLink href={`/category/${category.name}/list/${list.name}`}>{list.name}</BlockLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  </div>
  )
}