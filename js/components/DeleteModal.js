export default class DeleteModal {
  constructor() {
    this.dialogue = document.getElementById('delete-modal')
    this.cancelBtn = document.getElementById('cancel-delete-btn')
    this.confirmBtn = document.getElementById('confirm-delete-btn')

    // confirm delete callback
    this.onConfirm = null
    this.init()
  }
  init() {
    this.cancelBtn.addEventListener('click', this.close.bind(this))
    this.dialogue.addEventListener('click', this.closeOnOverlayClick.bind(this))
    this.confirmBtn.addEventListener('click', () => {
      e.preventDefault()

      if (this.onConfirm) {
        this.onConfirm()
      }

      this.close(e)
    })
  }
  open(confirmCallback) {
    this.onConfirm = confirmCallback
    this.dialogue.showModal()
  }
  close(e) {
    e.preventDefault()
    this.dialogue.close()
    this.onConfirm = null
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
