import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'translation',
  title: 'Translations',
  type: 'document',
  fields: [
    defineField({
      name: 'locale',
      title: 'Locale',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Norwegian', value: 'no' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'namespace',
      title: 'Namespace',
      type: 'string',
      options: {
        list: [
          { title: 'Navigation', value: 'navigation' },
          { title: 'Browse', value: 'browse' },
          { title: 'Product', value: 'product' },
          { title: 'Common', value: 'common' },
          { title: 'Home', value: 'home' },
          { title: 'Content', value: 'content' },
          { title: 'Vendors', value: 'vendors' },
          { title: 'About', value: 'about' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'key',
      title: 'Translation Key',
      type: 'string',
      description: 'Dot notation path (e.g., "home.hero.title" or "browse.filters.category")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Translation Value',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Context or notes about this translation',
    }),
  ],
  preview: {
    select: {
      locale: 'locale',
      namespace: 'namespace',
      key: 'key',
      value: 'value',
    },
    prepare({ locale, namespace, key, value }) {
      return {
        title: `[${locale}] ${namespace}.${key}`,
        subtitle: value,
      }
    },
  },
})
