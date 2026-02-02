import { wait } from './utils.js'

export default class InvoiceForm {
  constructor(invoiceService) {
    this.service = invoiceService

    // elements
    this.elements = {
      slider: document.querySelector('.slider'),
      form: document.querySelector('#invoice-form'),
      formDrawer: document.querySelector('.form-drawer'),
      formOverlay: document.querySelector('.form-overlay'),
      formWrapper: document.querySelector('.form-wrapper'),
      invoiceList: document.querySelector('#invoice-list'),
      listItemsContainer: document.querySelector('#form-list-items'),
      formTitle: document.querySelector('#form-title'),
      invoiceDetails: document.querySelector('.invoice-details'),
      empty: document.querySelector('.empty'),

      // buttons
      addItemBtn: document.querySelector('.add-item'),
      discardBtn: document.querySelector('.discard-btn'),
      saveSendBtn: document.querySelector('.save-send-btn'),
      deleteItemBtns: document.querySelectorAll('.delete-item'),
      cancelBtn: document.querySelector('.cancel-btn'),
      newInvoiceBtn: document.querySelector('.new-invoice'),
      editInvoiceBtns: document.querySelectorAll('.edit-invoice'),
    }

    // state
    this.state = {
      showingForm: this.elements.formDrawer.classList.contains('is-visible'),
      mode: this.elements.formDrawer.dataset.mode,
    }

    // init event listeners and render invoices
    this.initEventListeners()
    this.renderInvoices()
  }
  initEventListeners() {
    const {
      newInvoiceBtn,
      discardBtn,
      editInvoiceBtns,
      cancelBtn,
      formOverlay,
      addItemBtn,
      saveSendBtn,
      listItemsContainer,
      invoiceList,
    } = this.elements

    // form toggles
    newInvoiceBtn.addEventListener('click', this.toggleForm.bind(this))
    editInvoiceBtns.forEach((btn) => btn.addEventListener('click', this.toggleForm.bind(this)))
    discardBtn.addEventListener('click', this.toggleForm.bind(this))
    cancelBtn.addEventListener('click', this.toggleForm.bind(this))
    formOverlay.addEventListener('click', this.toggleForm.bind(this))

    // form functionality
    addItemBtn.addEventListener('click', (e) => this.addListItem(e))
    saveSendBtn.addEventListener('click', (e) => this.addInvoice(e))
    listItemsContainer.addEventListener('click', (e) => this.deleteListItem(e))
    invoiceList.addEventListener('click', (e) => this.renderInvoiceDetails(e))
  }
  async toggleForm(e) {
    // determine if form is opening or closing and if user scrolled past nav
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

    // if opening form
    if (isOpening) {
      // reset scroll of form
      this.elements.formWrapper.scrollTop = 0
      this.elements.form.reset()
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
    // clear list items on close
    this.elements.listItemsContainer.innerHTML = ''

    // lock background scroll
    if (isOpening) {
      document.body.classList.add('noscroll')
      document.documentElement.classList.add('noscroll')
    } else {
      document.body.classList.remove('noscroll')
      document.documentElement.classList.remove('noscroll')
    }
  }
  addInvoice(e) {
    e.preventDefault()

    // get form data
    const formData = new FormData(this.elements.form)

    // get list items
    const listItems = this.elements.listItemsContainer.querySelectorAll('.form-list-item')

    // convert list items to array of objects
    const listItemData = [...listItems].map((item) => {
      const name = item.querySelector('input[name="item-name"').value
      const qty = item.querySelector('input[name="item-qty"').value
      const price = item.querySelector('input[name="item-price"').value
      return {
        name,
        quantity: qty,
        price,
      }
    })

    // append items array to data
    formData.append('items', JSON.stringify(listItemData))

    // convert items array to parsed array of objects
    const invoice = Object.fromEntries(
      [...formData].map(([key, value]) => {
        if (key === 'items') {
          return [key, JSON.parse(value)]
        }

        return [key, value]
      }),
    )

    // add invoice to service and rerender
    this.service.addInvoice(invoice)
    this.renderInvoices()

    this.toggleForm()
  }
  addListItem(e) {
    e.preventDefault()

    // create list item element and add to form
    const listItemEl = document.createElement('div')
    listItemEl.classList.add('form-list-item', 'form-row', 'form-row--item-list')
    listItemEl.innerHTML = `
    <label for="item-name" class="body-s"
      >Item Name<input type="text" id="item-name" name="item-name"
    /></label>

    <label for="item-qty" class="body-s"
      >Qty<input type="number" id="item-qty" name="item-qty"
    /></label>

    <label for="item-price" class="body-s"
      >Price<input type="number" id="item-price" name="item-price"
    /></label>
    <div class="item-total">
      <label for="item-total" class="body-s">Total</label>
      <p class="h-s">0</p>
    </div>

    <i class="delete-item fa-sharp fa-solid fa-trash-can"></i>
    `
    this.elements.listItemsContainer.appendChild(listItemEl)
  }
  deleteListItem(e) {
    e.preventDefault()

    // remove list item
    const itemToDelete = e.target
    if (itemToDelete.classList.contains('delete-item')) {
      itemToDelete.closest('.form-list-item').remove()
    }
  }
  renderInvoiceDetails(e) {
    e.preventDefault()

    // get invoice id and invoice
    const invoiceId = e.target.closest('.invoice').dataset.id
    const invoice = this.service.getInvoiceById(invoiceId)

    // update details status btn
    const statusBtn = document.querySelector('#invoice-details-status')
    statusBtn.textContent = this.formatStatus(invoice.status)
    statusBtn.classList = `btn-status h-s ${invoice.status}`

    // update invoice details id
    const idEl = document.querySelector('#invoice-details-id')
    idEl.textContent = invoice.id

    // update invoice details description
    const descriptionEl = document.querySelector('#invoice-details-description')
    descriptionEl.textContent = invoice.description

    // update invoice details from address
    const fromAddressEl = document.querySelector('#invoice-details-from-address')
    fromAddressEl.innerHTML = `${invoice.senderAddress.street}<br>${invoice.senderAddress.city}<br>${invoice.senderAddress.zipCode}<br>${invoice.senderAddress.country}`

    // update invoice details date
    const dateEl = document.querySelector('#invoice-details-date')
    dateEl.textContent = this.formatDate(invoice.createdAt)

    // update invoice details payment due
    const paymentDueEl = document.querySelector('#invoice-details-payment-due')
    paymentDueEl.textContent = this.formatDate(invoice.paymentDue)

    // update invoice details client name
    const clientNameEl = document.querySelector('#invoice-details-client-name')
    clientNameEl.textContent = invoice.clientName

    // update invoice details client address
    const clientAddressEl = document.querySelector('#invoice-details-client-address')
    clientAddressEl.innerHTML = `${invoice.clientAddress.street}<br>${invoice.clientAddress.city}<br>${invoice.clientAddress.zipCode}<br>${invoice.clientAddress.country}`

    // update invoice details client email
    const clientEmailEls = document.querySelectorAll('.invoice-details-client-email')
    clientEmailEls.forEach((el) => {
      el.textContent = invoice.clientEmail
    })
  }
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  renderInvoices() {
    // hide or show empty state
    if (this.service.getInvoices().length === 0) {
      this.elements.empty.style.display = 'block'
      this.elements.invoiceList.style.display = 'none'
    } else {
      this.elements.empty.style.display = 'none'
      this.elements.invoiceList.style.display = 'flex'
    }
    // clear list before rendering
    this.elements.invoiceList.innerHTML = ''

    this.service.invoices.forEach((invoice) => {
      const invoiceElement = document.createElement('div')
      invoiceElement.classList.add('invoice')
      invoiceElement.dataset.id = invoice.id
      invoiceElement.innerHTML = `
      <div class="invoice-left">
        <h3 class="h-s"><span class="title-hash">#</span>${invoice.id}</h3>
        <p class="date body-m">${this.formatDate(invoice.paymentDue)}</p>
        <p class="name body-m">${invoice.clientName}</p>
      </div>
      <div class="invoice-right">
        <h3 class="amount h-s">${invoice.total}</h3>
        <button class="btn-status h-s ${invoice.status}">
          <span> <span class="dot"></span> ${this.formatStatus(invoice.status)}</span>
        </button>
        <img src="./assets/icon-arrow-right.svg" alt="" />
      </div>`
      this.elements.invoiceList.appendChild(invoiceElement)
    })
  }
}
