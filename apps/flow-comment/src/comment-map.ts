// Runs with bun.
// OneSDK で届いたコメントを、描画側が使う形に変換する。テンプレートはここだけを通す。
import type { FlowComment } from '@my-onecomme-plugins/flow-comment-core/comment'
import type { OneSdkComment, OneSdkCommentData } from '@my-onecomme-plugins/onesdk-types'

// 会員種別は sub（区分）と primary（詳細）の2階層で届く。表示は1行にまとめる。
const membershipLabel = (data: OneSdkCommentData): string | undefined => {
  if (data.membership === undefined) {
    return undefined
  }
  return `${data.membership.sub} ${data.membership.primary}`.trim()
}

export const toFlowComment = (comment: OneSdkComment): FlowComment => ({
  avatarUrl: comment.data.profileImage,
  badges: comment.data.badges,
  colors: comment.data.colors,
  giftCount: comment.data.price ?? comment.data.giftReceivers?.length,
  html: comment.data.comment,
  id: comment.data.id,
  isGift: comment.data.hasGift === true,
  isGiftReceiver: comment.data.isSponsorshipGiftReceiver === true,
  isMember: comment.data.isMember === true,
  membership: membershipLabel(comment.data),
  name: comment.data.displayName ?? comment.data.name,
  paidText: comment.data.paidText,
})
