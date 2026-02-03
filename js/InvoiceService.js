export default class InvoiceService {
  constructor() {
    this.invoices = JSON.parse(localStorage.getItem('invoices')) || []
  }

  getInvoices() {
    return this.invoices
  }

  getInvoiceById(id) {
    return this.invoices.find((invoice) => invoice.id === id)
  }
  generateId() {
    const randomLetter = () => Math.floor(Math.random() * 26) + 65
    const randomNum = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `${String.fromCharCode(randomLetter())}${String.fromCharCode(randomLetter())}${randomNum()}`
  }
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  calculatePaymentDue(createdAt, paymentTerms) {
    const date = new Date(createdAt)
    const terms = parseInt(paymentTerms)

    date.setDate(date.getDate() + terms)
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }
  calculateTotal(items) {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }
  addInvoice(invoiceData) {
    const totalRaw = this.calculateTotal(invoiceData.items)
    const paymentDue = this.calculatePaymentDue(invoiceData.createdAt, invoiceData.paymentTerms)

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
      total: this.formatCurrency(totalRaw),
      items: invoiceData.items.map((item) => {
        return {
          ...item,
          price: item.price,
          total: item.price * item.quantity,
        }
      }),
    }

    this.invoices.push(newInvoice)
    this.saveInvoices()

    return newInvoice
  }
  saveInvoices() {
    localStorage.setItem('invoices', JSON.stringify(this.invoices))
  }
  updateInvoice(id, invoiceData) {
    const index = this.invoices.findIndex((invoice) => invoice.id === id)
    if (index === -1) return

    const totalRaw = this.calculateTotal(invoiceData.items)
    const paymentDue = this.calculatePaymentDue(invoiceData.createdAt, invoiceData.paymentTerms)

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
      total: this.formatCurrency(totalRaw),
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
    const filteredInvoices = this.invoices.filter((invoice) => invoice.id !== id)
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
