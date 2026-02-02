export default class FilterDropdown {
  constructor(element) {
    this.container = element
    this.trigger = element.querySelector('.filter-trigger')
    this.inputs = element.querySelectorAll('input[type="checkbox"]')

    this.init()
  }
  init() {
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      this.container.classList.toggle('active')
    })
    window.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.container.classList.remove('active')
      }
    })
  }
}
