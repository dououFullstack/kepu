import moment from 'moment'

export const timeStringToNumber = timeString => {
  const timeArray = timeString.split(':')
  return +timeArray[0] * 60 + +timeArray[1]
}

export const dateToString = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm')
}

export const dateToString2 = (date) => {
  return moment(date).format('YYYY-MM-DD')
}

export const dateToString3 = (date) => {
  return moment(date).format('MM月DD日')
}

export const openDownloadDialog = (url, saveName) => {
  if (typeof url === 'object' && url instanceof window.Blob) {
    url = window.URL.createObjectURL(url)
  }
  const aLink = document.createElement('a')
  aLink.href = url
  aLink.download = saveName || ''
  let event
  if (window.MouseEvent) {
    event = new window.MouseEvent('click')
  } else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}
