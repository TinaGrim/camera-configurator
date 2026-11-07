export const TELEGRAM = {
  shopName: 'MIRAGE',
  username: 'PanMengLy',
  siteUrl: 'https://mirage.cam',
}

export const telegramProfileUrl = `https://t.me/${TELEGRAM.username}`

export const telegramShareUrl = (orderText) =>
  `https://t.me/share/url?url=${encodeURIComponent(
    TELEGRAM.siteUrl,
  )}&text=${encodeURIComponent(orderText)}`

/** Opens @username with the message pre-filled via the `?text=` deep link. */
export const telegramChatOrderUrl = (orderText) =>
  `https://t.me/${TELEGRAM.username}?text=${encodeURIComponent(orderText)}`