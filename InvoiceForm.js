import { wait } from './utils.js'

export default class InvoiceForm {
  constructor() {
    this.elements = {
      slider: document.querySelector('.slider'),

      form: document.querySelector('#invoice-form'),
      formDrawer: document.querySelector('.form-drawer'),
      formOverlay: document.querySelector('.form-overlay'),
      formWrapper: document.querySelector('.form-wrapper'),
      newInvoiceBtn: document.querySelector('.new-invoice'),
      editInvoiceBtns: document.querySelectorAll('.edit-invoice'),
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
    const { newInvoiceBtn, discardBtn, editInvoiceBtns, cancelBtn } =
      this.elements

    // form toggle
    newInvoiceBtn.addEventListener('click', this.toggleForm.bind(this))
    editInvoiceBtns.forEach((btn) =>
      btn.addEventListener('click', this.toggleForm.bind(this)),
    )
    discardBtn.addEventListener('click', this.toggleForm.bind(this))
    cancelBtn.addEventListener('click', this.toggleForm.bind(this))
  }
  async toggleForm(e) {
    const isOpening = !this.state.showingForm
    const isScrolled = window.scrollY > 80

    // remove scroll lock on every toggle
    document.body.classList.remove('noscroll')
    document.documentElement.classList.remove('noscroll')

    // scroll to top if opening and user is beyond nav height
    if (isScrolled && isOpening) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }

    if (isOpening) {
      // reset scroll of form
      this.elements.formWrapper.scrollTop = 0

      // if new invoice button
      if (e.target === this.elements.newInvoiceBtn) {
        this.state.mode = 'new'
        this.elements.formDrawer.dataset.mode = 'new'
        this.elements.formTitle.textContent = 'New Invoice'

        // if edit button
      } else if ([...this.elements.editInvoiceBtns].includes(e.target)) {
        this.state.mode = 'edit'
        this.elements.formDrawer.dataset.mode = 'edit'
        this.elements.formTitle.textContent = 'Edit Invoice'
      }
    }

    // toggle form visibility
    this.elements.formDrawer.classList.toggle('is-visible', isOpening)
    this.elements.formOverlay.classList.toggle('is-visible', isOpening)

    // flip form visibility state
    this.state.showingForm = isOpening

    // wait for form to finish animating to avoid noscroll blocking scrollTo
    await wait(1000)

    // lock background scroll
    if (isOpening) {
      document.body.classList.add('noscroll')
      document.documentElement.classList.add('noscroll')
    } else {
      document.body.classList.remove('noscroll')
      document.documentElement.classList.remove('noscroll')
    }
  }
}
