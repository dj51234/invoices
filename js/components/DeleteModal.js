export default class DeleteModal {
  constructor() {
    this.dialogue = document.getElementById('delete-modal')
    this.cancelBtn = document.getElementById('cancel-delete-btn')
    this.confirmBtn = document.getElementById('confirm-delete-btn')
    this.deleteInvoiceBtns = document.querySelectorAll('.delete-invoice')

    this.init()
  }
  init() {
    this.deleteInvoiceBtns.forEach((btn) => btn.addEventListener('click', this.open.bind(this)))
    this.cancelBtn.addEventListener('click', this.close.bind(this))
    this.dialogue.addEventListener('click', this.closeOnOverlayClick.bind(this))
    this.confirmBtn.addEventListener('click', this.deleteInvoice.bind(this))
  }
  open(e) {
    e.preventDefault()
    this.dialogue.showModal()
  }
  close(e) {
    e.preventDefault()
    this.dialogue.close()
  }
  closeOnOverlayClick(e) {
    const bounds = e.target.getBoundingClientRect()
    const clickedInDialogue =
      e.clientY >= bounds.top &&
      e.clientY <= bounds.bottom &&
      e.clientX >= bounds.left &&
      e.clientX <= bounds.right
    if (!clickedInDialogue) {
      this.close(e)
    }
  }
}
