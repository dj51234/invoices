import { wait } from './utils.js'
import DeleteModal from './components/DeleteModal.js'

export default class InvoiceForm {
  constructor(invoiceService) {
    this.service = invoiceService
    this.deleteModal = new DeleteModal()

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
      invoiceDetailsContainer: document.querySelector('.invoice-details'),
      empty: document.querySelector('.empty'),

      // invoice details elements
      invoiceItemNames: document.querySelector('#invoice-item-names'),
      invoiceItemQuantities: document.querySelector('#invoice-item-quantities'),
      invoiceItemPrices: document.querySelector('#invoice-item-prices'),
      invoiceItemTotals: document.querySelector('#invoice-item-totals'),
      invoiceDetailsAmountDue: document.querySelector('#invoice-details-amount-due'),
      statusBtn: document.querySelector('#invoice-details-status'),
      invoiceDetailsId: document.querySelector('#invoice-details-id'),
      invoiceDetailsDescription: document.querySelector('#invoice-details-description'),
      fromAddress: document.querySelector('#invoice-details-from-address'),
      date: document.querySelector('#invoice-details-date'),
      paymentDue: document.querySelector('#invoice-details-payment-due'),
      clientName: document.querySelector('#invoice-details-client-name'),
      clientAddress: document.querySelector('#invoice-details-client-address'),
      clientEmails: document.querySelectorAll('.invoice-details-client-email'),

      // buttons
      addItemBtn: document.querySelector('.add-item'),
      discardBtn: document.querySelector('.discard-btn'),
      saveSendBtn: document.querySelector('.save-send-btn'),
      deleteItemBtns: document.querySelectorAll('.delete-item'),
      cancelBtn: document.querySelector('.cancel-btn'),
      newInvoiceBtn: document.querySelector('.new-invoice'),
      editInvoiceBtns: document.querySelectorAll('.edit-invoice'),
      deleteInvoiceBtns: document.querySelectorAll('.delete-invoice'),
      deleteInvoiceBtns: document.querySelectorAll('.delete-invoice'),
      markAsPaidBtn: document.querySelector('.mark-paid'),
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
      deleteInvoiceBtns,
      markAsPaidBtn,
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

    deleteInvoiceBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        this.promptDelete()
      })
    })

    listItemsContainer.addEventListener('input', (e) => this.handleItemInput(e))
    markAsPaidBtn.addEventListener('click', this.markAsPaid.bind(this))
  }

  // form toggle
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

      // clear inputs and errors
      this.elements.form.reset()
      this.clearErrors()
      this.elements.listItemsContainer.innerHTML = ''

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
    // this.elements.listItemsContainer.innerHTML = ''

    // lock background scroll
    if (isOpening) {
      document.body.classList.add('noscroll')
      document.documentElement.classList.add('noscroll')
    } else {
      document.body.classList.remove('noscroll')
      document.documentElement.classList.remove('noscroll')
    }
  }

  // adding and deleting invoices
  addInvoice(e) {
    e.preventDefault()
    if (!this.validateForm()) return
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
  promptDelete() {
    const invoiceId = this.elements.invoiceDetailsContainer.dataset.id

    this.deleteModal.open(invoiceId, () => {
      this.service.deleteInvoice(invoiceId)
      this.renderInvoices()
      document.dispatchEvent(new Event('invoice-deleted'))
    })
  }

  // details list items logic
  addListItem(e) {
    if (e) e.preventDefault()

    // create list item element and add to form
    const listItemEl = document.createElement('div')
    listItemEl.classList.add('form-list-item', 'form-row', 'form-row--item-list')
    listItemEl.innerHTML = `
    <input type="text" name="item-name"/>
    <input type="number" name="item-qty"/>
    <input type="number" name="item-price"/>
    <div class="item-total">
      <p class="h-s">$0.00</p>
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

  // rendering
  renderInvoiceDetails(e) {
    e.preventDefault()
    const {
      statusBtn,
      invoiceDetailsId,
      invoiceDetailsDescription,
      fromAddress,
      date,
      paymentDue,
      clientName,
      clientAddress,
      clientEmails,
      invoiceItemNames,
      invoiceItemQuantities,
      invoiceItemPrices,
      invoiceItemTotals,
      invoiceDetailsAmountDue,
      invoiceDetailsContainer,
    } = this.elements

    // get invoice id and invoice, set data id to invoice details container
    const invoiceId = e.target.closest('.invoice').dataset.id
    const invoice = this.service.getInvoiceById(invoiceId)
    invoiceDetailsContainer.dataset.id = invoiceId

    // update details status btn
    statusBtn.textContent = this.formatStatus(invoice.status)
    statusBtn.classList = `btn-status h-s ${invoice.status}`

    // update invoice details id
    invoiceDetailsId.textContent = invoice.id

    // update invoice details description
    invoiceDetailsDescription.textContent = invoice.description

    // update invoice details from address
    fromAddress.innerHTML = `${invoice.senderAddress.street}<br>${invoice.senderAddress.city}<br>${invoice.senderAddress.zipCode}<br>${invoice.senderAddress.country}`

    // update invoice details date
    date.textContent = this.formatDate(invoice.createdAt)

    // update invoice details payment due
    paymentDue.textContent = this.formatDate(invoice.paymentDue)

    // update invoice details client name
    clientName.textContent = invoice.clientName

    // update invoice details client address
    clientAddress.innerHTML = `${invoice.clientAddress.street}<br>${invoice.clientAddress.city}<br>${invoice.clientAddress.zipCode}<br>${invoice.clientAddress.country}`

    // update invoice details client email
    clientEmails.forEach((el) => {
      el.textContent = invoice.clientEmail
    })

    // clear invoice items
    invoiceItemNames.innerHTML = ''
    invoiceItemQuantities.innerHTML = ''
    invoiceItemPrices.innerHTML = ''
    invoiceItemTotals.innerHTML = ''

    // clear add item totals to prevent rerendering on new form toggle
    const totalEls = this.elements.listItemsContainer.querySelectorAll('.item-total p')
    totalEls.forEach((el) => {
      el.textContent = ''
    })
    // for each item in the invoice, render to details table
    invoice.items.forEach((item) => {
      const nameEl = document.createElement('p')
      nameEl.classList.add('h-s')
      nameEl.textContent = item.name
      invoiceItemNames.appendChild(nameEl)

      const qtyEl = document.createElement('p')
      qtyEl.classList.add('h-s')
      qtyEl.textContent = item.quantity
      invoiceItemQuantities.appendChild(qtyEl)

      const priceEl = document.createElement('p')
      priceEl.classList.add('h-s')
      priceEl.textContent = item.price
      invoiceItemPrices.appendChild(priceEl)

      const totalEl = document.createElement('p')
      totalEl.classList.add('h-s')
      totalEl.textContent = item.total
      invoiceItemTotals.appendChild(totalEl)
    })

    // update invoice details amount due
    invoiceDetailsAmountDue.textContent = invoice.total
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

    // render invoices
    this.service.invoices.forEach((invoice) => {
      const invoiceElement = document.createElement('div')
      invoiceElement.classList.add('invoice')
      invoiceElement.dataset.id = invoice.id
      invoiceElement.innerHTML = `
      <div class="invoice-left">
        <h3 class="h-s"><span class="title-hash">#</span>${invoice.id}</h3>
        <p class="date body-m">Due ${this.formatDate(invoice.paymentDue)}</p>
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

  markAsPaid() {
    const invoiceId = this.elements.invoiceDetailsContainer.dataset.id
    const invoice = this.service.getInvoiceById(invoiceId)
    invoice.status = 'paid'
    this.service.updateInvoice(invoiceId, invoice)
    this.renderInvoices()

    this.elements.statusBtn.textContent = 'Paid'
    this.elements.statusBtn.classList = 'btn-status h-s paid'
  }

  // error handling

  validateForm() {
    let isValid = true
    const errors = []

    // wipe errors
    this.clearErrors()

    // all non hidden inputs
    const visibleInputs = this.elements.form.querySelectorAll(
      'input:not([type="hidden"]):not(.form-list-item input)',
    )

    // check if input is empty
    visibleInputs.forEach((input) => {
      if (!input.value.trim()) {
        // not valid, show error, push error to array
        isValid = false
        this.showInlineError(input)
        errors.push(this.getFieldName(input))
      }
    })

    const formListItems = this.elements.listItemsContainer.querySelectorAll('.form-list-item')

    if (formListItems.length === 0) {
      isValid = false
      errors.push('An item must be added')
    } else {
      formListItems.forEach((row, i) => {
        const nameInput = row.querySelector('input[name="item-name"]')
        const qtyInput = row.querySelector('input[name="item-qty"]')
        const priceInput = row.querySelector('input[name="item-price"]')

        ;[nameInput, qtyInput, priceInput].forEach((input) => {
          if (!input.value.trim()) {
            isValid = false
            input.classList.add('error-border')
          }
        })

        if (!nameInput.value || !qtyInput.value || !priceInput.value) {
          if (!errors.includes('All item fields must be filled')) {
            errors.push('All item fields must be filled')
          }
        }
      })
    }

    if (!isValid) {
      this.renderBottomErrors(errors)
    }
    return isValid
  }
  clearErrors() {
    const inputs = this.elements.form.querySelectorAll('input')
    inputs.forEach((input) => {
      input.classList.remove('error-border')
    })
    const errorMsgs = this.elements.form.querySelectorAll('.field-error-msg')
    errorMsgs.forEach((msg) => msg.remove())

    const errorContainer = this.elements.form.querySelector('.form-errors')
    errorContainer.innerHTML = ''
  }
  showInlineError(input) {
    input.classList.add('error-border')

    const label = input.closest('label')
    if (label) {
      const errorSpan = document.createElement('span')
      errorSpan.classList.add('field-error-msg')
      errorSpan.textContent = `Can't be empty`
      label.appendChild(errorSpan)
    }
  }
  getFieldName(input) {
    const label = input.closest('label')
    if (label && label.childNodes[0]) {
      return label.childNodes[0].textContent.trim()
    }
    return input.name
  }
  renderBottomErrors(errors) {
    const errorContainer = this.elements.form.querySelector('.form-errors')

    // add container for error title and list
    const errorTittle = document.createElement('p')
    errorTittle.classList.add('error-title', 'body-s')
    errorTittle.textContent = '- All fields must be added'
    errorContainer.appendChild(errorTittle)

    // add individual errors
    errors.forEach((err) => {
      const errorEl = document.createElement('p')
      errorEl.classList.add('error-list-item', 'body-s')
      if (err.includes('must be') || err.includes('must add')) {
        errorEl.textContent = `-${err}`
      } else {
        errorEl.textContent = `-${err} can't be empty`
      }
      errorContainer.appendChild(errorEl)
    })
  }
  // helpers
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

  formatCurrency(amt) {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt)
  }

  handleItemInput(e) {
    const row = e.target.closest('.form-list-item')
    const totalEl = row.querySelector('.item-total p')
    const qty = Number(row.querySelector('input[name="item-qty"').value) || 0
    const price = Number(row.querySelector('input[name="item-price"').value) || 0
    const total = qty * price
    totalEl.textContent = this.formatCurrency(total)
  }
}
