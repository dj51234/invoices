export default class DeleteModal {
  constructor() {
    // elements
    this.dialogue = document.getElementById('delete-modal')
    this.cancelBtn = document.getElementById('cancel-delete-btn')
    this.confirmBtn = document.getElementById('confirm-delete-btn')
    this.invoiceId = document.getElementById('delete-invoice-id')

    // confirm delete callback
    this.onConfirm = null

    this.init()
  }
  init() {
    this.cancelBtn.addEventListener('click', this.close.bind(this))
    this.dialogue.addEventListener('click', this.closeOnOverlayClick.bind(this))
    this.confirmBtn.addEventListener('click', (e) => {
      e.preventDefault()
      // if confirm callback exists, run it
      if (this.onConfirm) {
        this.onConfirm()
      }

      this.close(e)
    })
  }
  open(invoiceId, confirmCallback) {
    // render invoice id in modal to confirm deletion
    if (this.invoiceId) {
      this.invoiceId.textContent = invoiceId
    }
    // run callback
    this.onConfirm = confirmCallback
    // open modal
    this.dialogue.showModal()
  }
  close(e) {
    e.preventDefault()
    // close modal and reset callback to null
    this.dialogue.close()
    this.onConfirm = null
  }
  closeOnOverlayClick(e) {
    // get bounds of inner modal
    const bounds = e.target.getBoundingClientRect()
    // if click is inside modal
    const clickedInDialogue =
      e.clientY >= bounds.top &&
      e.clientY <= bounds.bottom &&
      e.clientX >= bounds.left &&
      e.clientX <= bounds.right
    // close if outside bounds
    if (!clickedInDialogue) {
      this.close(e)
    }
  }
}
