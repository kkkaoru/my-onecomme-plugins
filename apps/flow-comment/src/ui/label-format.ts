// Runs with bun.
// Turns the package's label descriptors into localized text. The package decides
// which label applies; the application decides how it reads.
import type {
  CommentLabel,
  FormatLabel,
  LabelKind,
} from '@my-onecomme-plugins/flow-comment-core/comment'

import type { Translator } from '../i18n'

type Translate = Translator['t']

type LabelText = (label: CommentLabel, t: Translate) => string

const countParams = (count: number): Readonly<Record<string, string>> => ({
  count: String(count),
})

// One row per kind, so a new kind of paid comment is a new row rather than a
// new branch. Amounts and membership names arrive already localized from the
// streaming service, so those rows pass the text through untouched.
const LABEL_TEXT: Readonly<Record<LabelKind, LabelText>> = {
  gift: (label, t) =>
    label.count === undefined ? t('labelGift') : t('labelGiftCount', countParams(label.count)),
  giftReceived: (_label, t) => t('labelGiftReceived'),
  membership: (label) => label.text ?? '',
  paid: (label) => label.text ?? '',
}

export const createLabelFormatter =
  (t: Translate): FormatLabel =>
  (label) =>
    LABEL_TEXT[label.kind](label, t)
