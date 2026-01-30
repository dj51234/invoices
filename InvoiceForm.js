export default class InvoiceForm {
  constructor() {
    this.elements = {
      slider: document.querySelector('.slider'),

      form: document.querySelector('#invoice-form'),
      formDrawer: document.querySelector('.form-drawer'),
      formOverlay: document.querySelector('.form-overlay'),
      formWrapper: document.querySelector('.form-wrapper'),
      newInvoiceBtn: document.querySelector('.new-invoice'),
      editInvoiceBtn: document.querySelector('.edit-invoice'),
      cancelBtn: document.querySelector('.cancel-btn'),
      formTitle: document.querySelector('#form-title'),
      discardBtn: document.querySelector('.discard-btn'),
    }
    this.state = {
      showingForm: this.elements.slider.classList.contains('is-visible'),

      mode: this.elements.formDrawer.dataset.mode,
    }

    this.initEventListeners()
  }
  initEventListeners() {
    const { newInvoiceBtn, discardBtn, editInvoiceBtn, cancelBtn } =
      this.elements

    // form toggle
    newInvoiceBtn.addEventListener('click', this.toggleForm.bind(this))
    editInvoiceBtn.addEventListener('click', this.toggleForm.bind(this))
    discardBtn.addEventListener('click', this.toggleForm.bind(this))
    cancelBtn.addEventListener('click', this.toggleForm.bind(this))
  }
  toggleForm(e) {
    // if new invoice button
    if (e.target === this.elements.newInvoiceBtn) {
      this.state.mode = 'new'
      this.elements.formDrawer.dataset.mode = 'new'
      this.elements.formTitle.textContent = 'New Invoice'
      // if edit button
    } else if (e.target === this.elements.editInvoiceBtn) {
      this.state.mode = 'edit'
      this.elements.formDrawer.dataset.mode = 'edit'
      this.elements.formTitle.textContent = 'Edit Invoice'
    }
    // reset scroll of form
    this.elements.formWrapper.scrollTop = 0

    // toggle form visibility
    this.elements.formDrawer.classList.toggle(
      'is-visible',
      !this.state.showingForm,
    )
    this.elements.formOverlay.classList.toggle(
      'is-visible',
      !this.state.showingForm,
    )
    // flip form visibility state
    this.state.showingForm = !this.state.showingForm
  }
}
