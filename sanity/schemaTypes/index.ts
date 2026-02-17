import { type SchemaTypeDefinition } from 'sanity'
import translation from './translation'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [translation],
}
