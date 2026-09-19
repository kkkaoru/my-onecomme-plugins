// Runs with bun.
// Template OneComme plugin. Copy this package to start a new plugin.

const NG_PREFIX = '!ng'

interface OneCommeComment {
  readonly data: {
    readonly comment: string
  }
}

interface OneCommePlugin {
  readonly name: string
  readonly uid: string
  readonly version: string
  readonly author: string
  readonly permissions: readonly string[]
  readonly filterComment: (comment: OneCommeComment) => OneCommeComment | false
}

export const isNgComment = (comment: OneCommeComment): boolean =>
  comment.data.comment.startsWith(NG_PREFIX)

const plugin: OneCommePlugin = {
  author: 'kkkaoru',
  filterComment: (comment) => (isNgComment(comment) ? false : comment),
  name: 'Example Filter',
  permissions: ['filter.comment'],
  uid: 'com.example.my-onecomme-plugins.example-plugin',
  version: '0.0.0',
}

export default plugin
