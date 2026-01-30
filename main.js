import InvoiceForm from './InvoiceForm.js'
import Slider from './Slider.js'

const invoiceForm = new InvoiceForm()
const slider = new Slider()

const toggleBtn = document.querySelector('.mode-toggle')

function toggleMode(e) {
  document.body.classList.toggle('dark-mode')
  const isDarkMode = document.body.classList.contains('dark-mode')
  toggleBtn.querySelector('img').src = isDarkMode
    ? './assets/icon-sun.svg'
    : './assets/icon-moon.svg'
}

toggleBtn.addEventListener('click', toggleMode)
