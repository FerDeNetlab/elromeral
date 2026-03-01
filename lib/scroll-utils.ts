export function scrollToBottom(delay = 100) {
  setTimeout(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    })
  }, delay)
}

export function scrollToElement(elementId: string, delay = 100) {
  setTimeout(() => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, delay)
}
