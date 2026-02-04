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

    // event listener for deleting invoices to toggle slider on delete
    document.addEventListener('invoice-deleted', () => {
      if (this.state.showingDetails) {
        this.toggleSlider()
      }
    })
    document.addEventListener('invoice-paid', () => {
      if (this.state.showingDetails) {
        this.toggleSlider()
      }
    })
  }

  async toggleSlider() {
    // handle divs being unequal height.
    // if one invoice exists the div should be short, not tall bc of the details div
    // invoices panel and details panel
    const [listPanel, detailsPanel] = this.elements.panels

    // if we are going from details to invoices div
    if (this.state.showingDetails) {
      // opacity classes for smooth transitions
      // remove opacity class from invoices div
      listPanel.classList.remove('panel-invisible')
      // add opacity to details
      detailsPanel.classList.add('panel-invisible')

      // slide slider
      this.elements.slider.classList.remove('show-details')

      // wait for slider animation to finish
      await wait(500)

      // display none to details panel
      detailsPanel.classList.add('panel-hide')

      // no longer showing details
      this.state.showingDetails = false
    } else {
      // add display block to details div
      detailsPanel.classList.remove('panel-hide')
      // opacity 1 to details panel
      detailsPanel.classList.remove('panel-invisible')
      // slide slider
      this.elements.slider.classList.add('show-details')
      // opacity 0 to invoices div
      listPanel.classList.add('panel-invisible')

      // we are now showing details
      this.state.showingDetails = true
    }
  }
}
