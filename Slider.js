export default class Slider {
  constructor() {
    this.elements = {
      slider: document.querySelector('.slider'),
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
  toggleSlider() {
    // toggle slider visibility
    this.elements.slider.classList.toggle(
      'show-details',
      !this.state.showingDetails,
    )

    // flip slider visibility state
    this.state.showingDetails = !this.state.showingDetails
  }
}
