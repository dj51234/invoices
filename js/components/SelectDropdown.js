export default class SelectDropdown {
  constructor(element) {
    this.container = element
    this.optionsContainer = element.querySelector('.select-options')
    this.optionsElements = element.querySelectorAll('option')
    this.trigger = element.querySelector('.select-trigger')
    this.input = element.querySelector('input')
    this.valueDisplay = element.querySelector('.selected-value')
    this.init()
  }
  init() {
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      this.container.classList.toggle('open')
    })
    window.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!this.container.contains(e.target)) {
        this.container.classList.remove('open')
      }
    })
    this.optionsContainer.addEventListener('click', (e) => {
      e.stopPropagation()
      this.valueDisplay.textContent = e.target.textContent
      this.input.value = e.target.dataset.value
      this.container.classList.remove('open')
    })
  }
}
