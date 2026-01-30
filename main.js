const slider = document.querySelector('.slider')
let showingDetails = slider.classList.contains('show-details')

const invoiceDetailsBtnBack = document.querySelector(
  '.invoice-details .btn-back',
)
const invoicesDiv = document.querySelector('.invoices')

invoicesDiv.addEventListener('click', (e) => {
  const targetInvoice = e.target.closest('.invoice')
  toggleSlider()
})
invoiceDetailsBtnBack.addEventListener('click', () => {
  toggleSlider()
})

function toggleSlider() {
  slider.classList.toggle('show-details', !showingDetails)
  showingDetails = !showingDetails
}
