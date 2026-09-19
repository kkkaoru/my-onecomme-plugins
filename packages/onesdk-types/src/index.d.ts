// OneComme テンプレート SDK (OneSDK) の型定義。
// テンプレート側の実装から独立させ、複数のテンプレートで共有できるようにする。
//
// OneSDK はテンプレートの HTML で
//   <script src="../__origin/js/onesdk.js"></script>
// として読み込まれる前提で、npm からは取得しない。
// そのため宣言だけを置き、実体はブラウザのグローバルを参照する。

/** メンバーシップの種別。sub が主区分、primary が詳細。 */
export interface OneSdkMembership {
  readonly primary: string
  readonly sub: string
}

/** バッジ。url が無い場合は label を文字で表示する。 */
export interface OneSdkBadge {
  readonly label: string
  readonly url?: string
}

/** YouTube が指定する配色。スパチャやギフトのカードに使う。 */
export interface OneSdkColors {
  readonly authorNameTextColor?: string
  readonly bodyBackgroundColor?: string
  readonly bodyTextColor?: string
  readonly headerBackgroundColor?: string
  readonly headerTextColor?: string
}

/** コメント本文と付随情報。 */
export interface OneSdkCommentData {
  readonly badges?: readonly OneSdkBadge[]
  readonly colors?: OneSdkColors
  readonly comment: string
  readonly displayName?: string
  readonly giftReceivers?: readonly OneSdkBadge[]
  readonly hasGift?: boolean
  readonly id: string
  readonly isMember?: boolean
  readonly isSponsorshipGiftReceiver?: boolean
  readonly membership?: OneSdkMembership
  readonly name: string
  readonly paidText?: string
  readonly price?: number
  readonly profileImage?: string
}

/** コメント1件。data に実データが入る。 */
export interface OneSdkComment {
  readonly data: OneSdkCommentData
}

/** setup() に渡すオプション。 */
export interface OneSdkSetupOptions {
  readonly disabledDelay?: boolean
  readonly mode?: string
  readonly permissions: readonly string[]
}

/** subscribe() に渡す購読定義。 */
export interface OneSdkSubscription {
  readonly action: string
  readonly callback: (comments: readonly OneSdkComment[]) => void
}

/** 使用するデータ種別。 */
export interface OneSdkPermissions {
  readonly COMMENT: string
}

/** OneSDK 本体。onesdk.js が定義するグローバル。 */
export interface OneSdkStatic {
  readonly PERM: OneSdkPermissions
  readonly connect: () => void
  readonly ready: () => Promise<void>
  readonly setup: (options: OneSdkSetupOptions) => void
  readonly subscribe: (subscription: OneSdkSubscription) => void
  readonly usePermission: (permissions: readonly string[]) => readonly string[]
}

/** ブラウザのグローバルとして定義される OneSDK。 */
declare global {
  // eslint-disable-next-line no-var
  var OneSDK: OneSdkStatic
}
