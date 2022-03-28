import { TagIcon } from '@sanity/icons'

const category = {
  name: 'category',
  title: 'Category',
  icon: TagIcon,
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
}

export default category
