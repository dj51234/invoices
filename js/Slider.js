import { wait } from './utils.js'

export default class Slider {
  constructor() {
    this.elements = {
      slider: document.querySelector('.slider'),
      panels: document.querySelectorAll('.panel'),
      invoicesDiv: document.querySelector('.invoices'),
      detailsBtnBack: document.querySelector('.invoice-details .btn-back'),
    }
    this.state = {
      showingDetails: this.elements.slider.classList.contains('show-details'),
    }

    this.initEventListeners()
  }
  initEventListeners() {
    const { invoicesDiv, detailsBtnBack } = this.elements

    // details toggle
    invoicesDiv.addEventListener('click', this.toggleSlider.bind(this))
    detailsBtnBack.addEventListener('click', this.toggleSlider.bind(this))
  }
  async toggleSlider() {
    const [listPanel, detailsPanel] = this.elements.panels

    const isClosing = this.state.showingDetails

    if (isClosing) {
      listPanel.classList.remove('panel-invisible')

      detailsPanel.classList.add('panel-invisible')

      this.elements.slider.classList.remove('show-details')
      await wait(500)
      detailsPanel.classList.add('panel-hide')

      this.state.showingDetails = false
    } else {
      detailsPanel.classList.remove('panel-hide')

      detailsPanel.classList.remove('panel-invisible')

      this.elements.slider.classList.add('show-details')

      listPanel.classList.add('panel-invisible')

      this.state.showingDetails = true
    }
  }
}
