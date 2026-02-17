import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'translation',
  title: 'Translations',
  type: 'document',
  fields: [
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
      description: 'Dot notation path (e.g., "hero.title" or "filters.category")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'no',
      title: 'Norwegian (Norsk)',
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
      namespace: 'namespace',
      key: 'key',
      en: 'en',
      no: 'no',
    },
    prepare({ namespace, key, en, no }) {
      return {
        title: `${namespace}.${key}`,
        subtitle: `EN: ${en} | NO: ${no}`,
      }
    },
  },
})
