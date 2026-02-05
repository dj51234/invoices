export default class InvoiceService {
  constructor(defaultInvoices = []) {
    const stored = JSON.parse(localStorage.getItem('invoices'))

    // if localstorage has invoices, use those. otherwise use default invoices from data.json
    if (stored) {
      this.invoices = stored
    } else {
      // format default data
      this.invoices = InvoiceService.formatDefaultInvoices(defaultInvoices)
    }
  }

  // static methods
  static formatDefaultInvoices(defaultInvoices) {
    // format default data before rendering
    return defaultInvoices.map((invoice) => {
      const totalRaw = InvoiceService.calculateTotal(invoice.items)
      return {
        ...invoice,
        total: InvoiceService.formatCurrency(totalRaw),
        paymentDue: InvoiceService.calculatePaymentDue(
          invoice.createdAt,
          invoice.paymentTerms
        ),
        items: invoice.items.map((item) => {
          return {
            ...item,
            price: Number(item.price),
            quantity: Number(item.quantity),
            total: Number(item.price) * Number(item.quantity),
          }
        }),
      }
    })
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  static calculatePaymentDue(createdAt, paymentTerms) {
    const date = new Date(createdAt)
    const terms = parseInt(paymentTerms)

    // get day of the month and add the terms day amount to that
    date.setDate(date.getDate() + terms)

    //format new due date
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }
  static calculateTotal(items) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // instance methods
  getInvoices() {
    return this.invoices
  }

  getInvoiceById(id) {
    return this.invoices.find((invoice) => invoice.id === id)
  }
  generateId() {
    const randomLetter = () => Math.floor(Math.random() * 26) + 65
    const randomNum = () =>
      String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `${String.fromCharCode(randomLetter())}${String.fromCharCode(
      randomLetter()
    )}${randomNum()}`
  }

  addInvoice(invoiceData) {
    const totalRaw = InvoiceService.calculateTotal(invoiceData.items)
    const paymentDue = InvoiceService.calculatePaymentDue(
      invoiceData.createdAt,
      invoiceData.paymentTerms
    )

    // need to format the data to replicate json structure
    const newInvoice = {
      id: this.generateId(),
      createdAt: invoiceData.createdAt,
      paymentDue,
      description: invoiceData.description,
      paymentTerms: invoiceData.paymentTerms,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      status: invoiceData.status || 'pending',
      senderAddress: {
        street: invoiceData.senderStreet,
        city: invoiceData.senderCity,
        zipCode: invoiceData.senderZipCode,
        state: invoiceData.senderState,
      },
      clientAddress: {
        street: invoiceData.clientStreet,
        city: invoiceData.clientCity,
        zipCode: invoiceData.clientZipCode,
        state: invoiceData.clientState,
      },
      total: InvoiceService.formatCurrency(totalRaw),
      items: invoiceData.items.map((item) => {
        return {
          ...item,
          price: item.price,
          total: item.price * item.quantity,
        }
      }),
    }

    // push to invoices and save
    this.invoices.push(newInvoice)
    this.saveInvoices()

    return newInvoice
  }
  saveInvoices() {
    // save to local storage
    localStorage.setItem('invoices', JSON.stringify(this.invoices))
  }

  updateInvoice(id, invoiceData) {
    // get index of specified invoice
    const index = this.invoices.findIndex((invoice) => invoice.id === id)
    if (index === -1) return

    // calculate total of invoices items
    const totalRaw = InvoiceService.calculateTotal(invoiceData.items)

    // calculate the due date of the invoice
    const paymentDue = InvoiceService.calculatePaymentDue(
      invoiceData.createdAt,
      invoiceData.paymentTerms
    )

    // update all values
    this.invoices[index] = {
      ...this.invoices[index],
      createdAt: invoiceData.createdAt,
      paymentDue,
      status: invoiceData.status || this.invoices[index].status,
      paymentTerms: invoiceData.paymentTerms,
      description: invoiceData.description,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      senderAddress: {
        street: invoiceData.senderStreet,
        city: invoiceData.senderCity,
        zipCode: invoiceData.senderZipCode,
        state: invoiceData.senderState,
      },
      clientAddress: {
        street: invoiceData.clientStreet,
        city: invoiceData.clientCity,
        zipCode: invoiceData.clientZipCode,
        state: invoiceData.clientState,
      },
      total: InvoiceService.formatCurrency(totalRaw),
      items: invoiceData.items.map((item) => {
        return {
          ...item,
          price: item.price,
          total: item.price * item.quantity,
        }
      }),
    }
    this.saveInvoices()
  }
  deleteInvoice(id) {
    const filteredInvoices = this.invoices.filter(
      (invoice) => invoice.id !== id
    )
    this.invoices = filteredInvoices
    this.saveInvoices()
  }
  updateStatus(id, status) {
    const invoice = this.getInvoiceById(id)

    if (invoice) {
      invoice.status = status
      this.saveInvoices()
    }
  }
}
