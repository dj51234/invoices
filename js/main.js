import InvoiceForm from './InvoiceForm.js'
import Slider from './Slider.js'
import DatePicker from './components/DatePicker.js'
import FilterDropdown from './components/FilterDropdown.js'
import SelectDropdown from './components/SelectDropdown.js'
import InvoiceService from './InvoiceService.js'

// fetch default invoices
const defaultInvoices = await fetchInvoices()

// create invoice service instance
const invoiceService = new InvoiceService(defaultInvoices)
new InvoiceForm(invoiceService)

// instantiate slider
new Slider()

// instantiate custom inputs
const datePickerEl = document.querySelector('#invoice-date-picker')
const filterDropdownEl = document.querySelector('.filter-dropdown')
const selectDropdownEl = document.querySelector('.custom-select')

if (datePickerEl) {
  new DatePicker(datePickerEl)
}

if (filterDropdownEl) {
  new FilterDropdown(filterDropdownEl)
}

if (selectDropdownEl) {
  new SelectDropdown(selectDropdownEl)
}

// functions

// get default invoices from data.json
async function fetchInvoices() {
  const res = await fetch('./data.json')
  const data = await res.json()

  return data
}

// toggle light dark mode
const toggleBtn = document.querySelector('.mode-toggle')

function toggleMode(e, btn) {
  document.body.classList.toggle('dark-mode')
  const isDarkMode = document.body.classList.contains('dark-mode')
  toggleBtn.querySelector('img').src = isDarkMode
    ? './assets/icon-sun.svg'
    : './assets/icon-moon.svg'
}

toggleBtn.addEventListener('click', toggleMode)
