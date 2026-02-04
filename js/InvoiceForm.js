import { wait } from './utils.js'
import DeleteModal from './components/DeleteModal.js'

export default class InvoiceForm {
  constructor(invoiceService) {
    this.service = invoiceService
    // init modal
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
      totalInvoices: document.querySelector('#total-invoices'),
      filterCheckboxes: document.querySelectorAll('.filter-checkbox'),

      // invoice details elements

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
      invoiceItemsList: document.querySelector('#invoice-items-list'),

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
      markAsPaidBtns: document.querySelectorAll('.mark-paid'),
      saveChangesBtn: document.querySelector('.save-btn'),
      saveDraftBtn: document.querySelector('.save-draft-btn'),
    }

    // state
    this.state = {
      showingForm: this.elements.formDrawer.classList.contains('is-visible'),
      mode: this.elements.formDrawer.dataset.mode,
      activeFilters: [],
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
      markAsPaidBtns,
      saveChangesBtn,
      saveDraftBtn,
      filterCheckboxes,
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
    markAsPaidBtns.forEach((btn) => btn.addEventListener('click', this.markAsPaid.bind(this)))
    saveChangesBtn.addEventListener('click', (e) => this.editInvoice(e))
    saveDraftBtn.addEventListener('click', (e) => this.saveDraft(e))
    filterCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', this.handleFilterChange.bind(this))
    })
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

      // clear list items
      const listItemRows = this.elements.listItemsContainer.querySelectorAll('.form-list-item')
      listItemRows.forEach((row) => row.remove())

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

        const id = this.elements.invoiceDetailsContainer.dataset.id
        const invoice = this.service.getInvoiceById(id)
        this.populateForm(invoice)
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
    const invoiceData = this.getFormData()
    invoiceData.status = 'pending'

    // add invoice to service and rerender
    this.service.addInvoice(invoiceData)
    this.renderInvoices()

    this.toggleForm()
  }
  editInvoice(e) {
    e.preventDefault()
    if (!this.validateForm()) return

    // get invoice id and current invoice data
    const invoiceId = this.elements.invoiceDetailsContainer.dataset.id
    const currentInvoice = this.service.getInvoiceById(invoiceId)

    // get updated form data
    const updatedData = this.getFormData()

    // if current invoice is draft, update status to pending
    if (currentInvoice.status === 'draft') {
      updatedData.status = 'pending'
    }

    // update invoice in service and rerender
    this.service.updateInvoice(invoiceId, updatedData)
    this.renderInvoices()

    // rerender invoice details with hacky event handler
    this.renderInvoiceDetails({
      target: { closest: () => ({ dataset: { id: invoiceId } }) },
    })
    this.toggleForm()
  }
  saveDraft(e) {
    e.preventDefault()

    // get form data
    const invoiceData = this.getFormData()
    invoiceData.status = 'draft'

    // set created at if not set
    if (!invoiceData.createdAt) {
      invoiceData.createdAt = Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date())
    }

    // update draft to pending invoice
    this.service.addInvoice(invoiceData)
    this.renderInvoices()
    this.toggleForm()
  }
  promptDelete() {
    // grab invoice id from details container
    const invoiceId = this.elements.invoiceDetailsContainer.dataset.id

    // open modal and trigger new event for Modal listener with callback to delete invoice and send event
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
    listItemEl.classList.add('form-list-item')

    listItemEl.innerHTML = `
    <div class="field-group name-field">
      <label class="body-s mobile-label">Item Name</label>
      <input type="text" name="item-name" />
    </div>

    <div class="field-group qty-field">
      <label class="body-s mobile-label">Qty.</label>
      <input type="text" name="item-qty" />
    </div>

    <div class="field-group price-field">
      <label class="body-s mobile-label">Price</label>
      <input type="text" name="item-price" />
    </div>

    <div class="field-group total-field">
      <label class="body-s mobile-label">Total</label>
      <div class="item-total">
        <p class="h-s">$0.00</p>
      </div>
    </div>

    <div class="field-group delete-field">
       <i class="delete-item fa-sharp fa-solid fa-trash-can"></i>
    </div>
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
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
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
      invoiceDetailsAmountDue,
      invoiceDetailsContainer,
      markAsPaidBtns,
      invoiceItemsList,
      editInvoiceBtns,
    } = this.elements

    // get invoice id and invoice, set data id to invoice details container
    const invoiceId = e.target.closest('.invoice').dataset.id
    const invoice = this.service.getInvoiceById(invoiceId)
    invoiceDetailsContainer.dataset.id = invoiceId

    // disable mark as paid for draft invoices
    if (invoice.status === 'draft' || invoice.status === 'paid') {
      markAsPaidBtns.forEach((btn) => {
        btn.style.display = 'none'
      })
    } else {
      markAsPaidBtns.forEach((btn) => {
        btn.style.display = 'block'
      })
    }

    // disable edit for paid invoices
    if (invoice.status === 'paid') {
      editInvoiceBtns.forEach((btn) => {
        btn.style.display = 'none'
      })
    } else {
      editInvoiceBtns.forEach((btn) => {
        btn.style.display = 'block'
      })
    }

    // update details status btn
    statusBtn.textContent = this.formatStatus(invoice.status)
    statusBtn.classList = `btn-status h-s ${invoice.status}`

    // update invoice details id
    invoiceDetailsId.textContent = invoice.id

    // update invoice details description
    invoiceDetailsDescription.textContent = invoice.description

    // update invoice details from address
    fromAddress.innerHTML = `${invoice.senderAddress.street}<br>${invoice.senderAddress.city}${invoice.senderAddress.city ? ', ' : ''}${invoice.senderAddress.state}<br>${invoice.senderAddress.zipCode}`

    // update invoice details date
    date.textContent = this.formatDate(invoice.createdAt)

    // update invoice details payment due
    paymentDue.textContent = this.formatDate(invoice.paymentDue)

    // update invoice details client name
    clientName.textContent = invoice.clientName

    // update invoice details client address
    clientAddress.innerHTML = `${invoice.clientAddress.street}<br>${invoice.clientAddress.city}${invoice.clientAddress.city ? ', ' : ''}${invoice.clientAddress.state}<br>${invoice.clientAddress.zipCode}`

    // update invoice details client email
    clientEmails.forEach((el) => {
      el.textContent = invoice.clientEmail
    })

    // clear invoice items
    invoiceItemsList.innerHTML = ''

    // clear add item totals to prevent rerendering on new form toggle
    const totalEls = this.elements.listItemsContainer.querySelectorAll('.item-total p')
    totalEls.forEach((el) => {
      el.textContent = ''
    })

    // for each item in the invoice, render to details table
    invoice.items.forEach((item) => {
      const row = document.createElement('div')
      row.classList.add('item-row')
      row.innerHTML = `
        <div class="item-name-group">
          <p class="h-s name">${item.name}</p>
          <p class="body-m mobile-qty-price">
            ${item.quantity} x ${this.formatCurrency(item.price)}
          </p>
        </div>
        
        <p class="h-s desktop-qty">${item.quantity}</p>
        <p class="h-s desktop-price">${this.formatCurrency(item.price)}</p>
        
        <p class="h-s item-total">${this.formatCurrency(item.total)}</p>
      `

      invoiceItemsList.appendChild(row)
    })

    // update invoice details amount due
    invoiceDetailsAmountDue.textContent = invoice.total
  }

  renderInvoices() {
    // get all current invocies
    const allInvoices = this.service.getInvoices()

    // filter invoices based on checkbox values
    const invoicesToRender = allInvoices.filter((invoice) => {
      if (this.state.activeFilters.length === 0) return true
      return this.state.activeFilters.includes(invoice.status)
    })

    // handle plural nonplural invoice total
    if (this.elements.totalInvoices) {
      this.elements.totalInvoices.textContent = `There ${invoicesToRender.length !== 1 ? 'are' : 'is'} ${invoicesToRender.length} total invoice${invoicesToRender.length !== 1 ? 's' : ''}.`
    }

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

    // render filtered invoices based on boxes checked from active filters
    invoicesToRender.forEach((invoice) => {
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
    // get id of invoice and set the status to paid
    const invoiceId = this.elements.invoiceDetailsContainer.dataset.id
    const invoice = this.service.getInvoiceById(invoiceId)
    invoice.status = 'paid'
    this.service.updateStatus(invoiceId, 'paid')
    this.renderInvoices()
    document.dispatchEvent(new CustomEvent('invoice-paid'))
    // update status btn UI
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
        isValid = false
        this.showInlineError(input)
        errors.push(`${this.getFieldName(input)} can't be empty`)
      }
      if (input.name.toLowerCase().includes('zip') && input.value.trim()) {
        if (!this.validateNumber(input.value)) {
          // not valid, show error, push error to array
          isValid = false
          this.showInlineError(input, 'number')
          errors.push(`${this.getFieldName(input)} must be a number`)
        }
      }
    })

    // get all list items in item list of form
    const formListItems = this.elements.listItemsContainer.querySelectorAll('.form-list-item')

    // if there are none, isvalid is false, push error
    if (formListItems.length === 0) {
      isValid = false
      errors.push('An item must be added')
    } else {
      // for each list item, check if inputs are empty
      formListItems.forEach((row, i) => {
        const nameInput = row.querySelector('input[name="item-name"]')
        const qtyInput = row.querySelector('input[name="item-qty"]')
        const priceInput = row.querySelector('input[name="item-price"]')

        ;[nameInput, qtyInput, priceInput].forEach((input) => {
          // if empty add error border to input
          if (!input.value.trim()) {
            isValid = false
            input.classList.add('error-border')
          }
        })
        // if any value is empty, push error to errors
        if (!nameInput.value || !qtyInput.value || !priceInput.value) {
          if (!errors.includes('All item fields must be filled')) {
            errors.push('All item fields must be filled')
          }
        }
        if (qtyInput.value.trim() && !this.validateNumber(qtyInput.value)) {
          isValid = false
          qtyInput.classList.add('error-border')
          if (!errors.includes('Item quantity must be a number')) {
            errors.push('Item quantity must be a number')
          }
        }
        if (priceInput.value.trim() && !this.validateNumber(priceInput.value)) {
          isValid = false
          priceInput.classList.add('error-border')
          if (!errors.includes('Item price must be a number')) {
            errors.push('Item price must be a number')
          }
        }
      })
    }
    // render any errors if anything is invalid
    if (!isValid) {
      this.renderBottomErrors(errors)
    }
    return isValid
  }

  clearErrors() {
    // get all inputs on form and remove error borders
    const inputs = this.elements.form.querySelectorAll('input')
    inputs.forEach((input) => {
      input.classList.remove('error-border')
    })

    // remove all error messages
    const errorMsgs = this.elements.form.querySelectorAll('.field-error-msg')
    errorMsgs.forEach((msg) => msg.remove())

    // empty errors container
    const errorContainer = this.elements.form.querySelector('.form-errors')
    errorContainer.innerHTML = ''
  }
  showInlineError(input, type = 'empty') {
    input.classList.add('error-border')

    const msg = type === 'number' ? 'Invalid number' : "Can't be empty"

    // search for the Label first
    // We look for a label wrapping the input OR a label in the immediate parent
    let target = input.closest('label') || input.parentElement.querySelector('label')

    if (target && target.classList.contains('mobile-label')) {
      target = null
    }

    if (!target) {
      target = input.parentElement
    }

    // Render the Error
    if (target) {
      // Prevent duplicates
      if (!target.querySelector('.field-error-msg')) {
        const errorSpan = document.createElement('span')
        errorSpan.classList.add('field-error-msg')
        errorSpan.textContent = msg

        target.appendChild(errorSpan)
        target.style.position = 'relative'
      }
    }
  }

  getFieldName(input) {
    // find the label (Standard logic)
    let label = input.closest('label')

    // if not found, check the parent group (Grid layout fallback)
    if (!label) {
      const group = input.closest('.field-group, .form-group')
      if (group) {
        label = group.querySelector('label')
      }
    }

    if (label) {
      // clone it so we don't actually delete the error message from the screen
      const clone = label.cloneNode(true)
      const errorSpan = clone.querySelector('.field-error-msg')

      if (errorSpan) {
        errorSpan.remove()
      }

      return clone.textContent.trim()
    }

    return input.name
  }

  renderBottomErrors(errors) {
    const errorContainer = this.elements.form.querySelector('.form-errors')
    errorContainer.innerHTML = ''

    // Title
    const errorTitle = document.createElement('p')
    errorTitle.classList.add('error-title', 'body-s')
    errorTitle.textContent = '- All fields must be added'
    errorContainer.appendChild(errorTitle)

    // List
    errors.forEach((err) => {
      const errorEl = document.createElement('p')
      errorEl.classList.add('error-list-item', 'body-s')

      errorEl.textContent = `-${err}`

      errorContainer.appendChild(errorEl)
    })
  }

  populateForm(invoice) {
    // get all non custom form fields
    const fields = {
      senderStreet: invoice.senderAddress.street,
      senderCity: invoice.senderAddress.city,
      senderZipCode: invoice.senderAddress.zipCode,
      senderState: invoice.senderAddress.state,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientStreet: invoice.clientAddress.street,
      clientCity: invoice.clientAddress.city,
      clientZipCode: invoice.clientAddress.zipCode,
      clientState: invoice.clientAddress.state,
      description: invoice.description,
    }
    // loop through fields and fill inputs
    Object.entries(fields).forEach(([key, value]) => {
      const input = this.elements.form.querySelector(`input[name="${key}"]`)
      if (input) {
        input.value = value
      }
    })

    // get custom input fields
    // set date input value and visual display
    const dateInput = this.elements.form.querySelector('input[name="createdAt"]')
    dateInput.value = invoice.createdAt

    const dateVisual = this.elements.form.querySelector('.date-trigger .selected-date')
    dateVisual.textContent = this.formatDate(invoice.createdAt)

    // set custom payment terms

    const termsInput = this.elements.form.querySelector('input[name="paymentTerms"]')
    termsInput.value = invoice.paymentTerms

    const termsVisual = this.elements.form.querySelector('.select-trigger .selected-value')
    termsVisual.textContent = `Next ${invoice.paymentTerms} Day${invoice.paymentTerms === 1 ? '' : 's'}`

    // for each form list item that exist in invoice
    invoice.items.forEach((item) => {
      // create a new blank row
      this.addListItem()
      // get the last row
      const rows = this.elements.listItemsContainer.querySelectorAll('.form-list-item')
      const lastRow = rows[rows.length - 1]

      // populate the last row with the correct input values
      lastRow.querySelector('input[name="item-name"]').value = item.name
      lastRow.querySelector('input[name="item-qty"]').value = item.quantity
      lastRow.querySelector('input[name="item-price"]').value = item.price

      // trigger event to pass to handleItemInput to update total for the item
      const fakeEvent = {
        target: lastRow.querySelector('input[name="item-qty"]'),
      }
      this.handleItemInput(fakeEvent)
    })
  }
  // helpers
  getFormData() {
    // get current form data
    const formData = new FormData(this.elements.form)
    // get the item list data
    const listItems = this.elements.listItemsContainer.querySelectorAll('.form-list-item')
    // map through each item to get the item data
    const listItemsData = [...listItems].map((item) => {
      return {
        name: item.querySelector('input[name="item-name"]').value,
        quantity: Number(item.querySelector('input[name="item-qty"]').value),
        price: Number(item.querySelector('input[name="item-price"]').value),
      }
    })
    // convert formdata to object and add items to object
    const invoiceData = Object.fromEntries(formData)
    invoiceData.items = listItemsData
    return invoiceData
  }
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  }

  handleFilterChange() {
    // get the checkboxes that are checked. if it is checked map the value to that checkbox (status: draft, pending or paid)
    const checkedValues = [...this.elements.filterCheckboxes]
      .filter((box) => box.checked)
      .map((box) => box.value)
    // add the status' to active filters
    this.state.activeFilters = checkedValues
    this.renderInvoices()
  }

  formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  formatCurrency(amt) {
    return Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amt)
  }

  handleItemInput(e) {
    // listen for change in any row input and update total
    const row = e.target.closest('.form-list-item')
    const totalEl = row.querySelector('.item-total p')
    const qty = Number(row.querySelector('input[name="item-qty"').value) || 0
    const price = Number(row.querySelector('input[name="item-price"').value) || 0
    const total = qty * price
    totalEl.textContent = this.formatCurrency(total)
  }
  resetCustomFormElements() {
    const today = Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date())

    // reset createdAt
    // reset date picker display
    const dateInput = this.elements.form.querySelector('input[name="createdAt"]')
    dateInput.value = today
    this.elements.form.querySelector('.date-trigger .selected-date').textContent =
      this.formatDate(today)

    // reset payment terms
    this.elements.form.querySelector('select[name="paymentTerms"]').value = '30'
    this.elements.form.querySelector('.select-trigger .selected-value').textContent = 'Next 30 days'
  }
  validateNumber(value) {
    return /^\d+(\.\d{1,2})?$/.test(value) && Number(value) >= 0
  }
}
