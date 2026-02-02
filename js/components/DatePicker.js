export default class DatePicker {
  constructor(element) {
    // elements
    this.container = element
    this.dateTrigger = element.querySelector('.date-trigger')
    this.popup = element.querySelector('.calendar-popup')
    this.hiddenInput = element.querySelector('#invoice-date-hidden')
    this.displaySpan = element.querySelector('.selected-date')

    // display
    this.grid = element.querySelector('.calendar-grid')
    this.prevMonthBtn = element.querySelector('.prev-month')
    this.nextMonthBtn = element.querySelector('.next-month')
    this.currentMonthDisplay = element.querySelector('.current-month-display')

    // state
    this.currentDate = new Date()
    this.selectedDate = new Date()

    // view state
    this.viewMonth = this.currentDate.getMonth()
    this.viewYear = this.currentDate.getFullYear()

    this.init()
  }

  init() {
    this.container.addEventListener('click', (e) => {
      e.stopPropagation()
      this.container.classList.toggle('active')
      this.renderCalendar()
    })
    window.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.container.classList.remove('active')
      }
    })
    this.prevMonthBtn.addEventListener('click', (e) => {
      console.log('sup')

      e.stopPropagation()
      this.changeMonth(-1)
    })
    this.nextMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.changeMonth(1)
    })
    this.updateDisplay()
    this.renderCalendar()
  }
  changeMonth(dir) {
    this.viewMonth += dir

    if (this.viewMonth < 0) {
      this.viewMonth = 11
      this.viewYear -= 1
    } else if (this.viewMonth > 11) {
      this.viewMonth = 0
      this.viewYear += 1
    }
    this.renderCalendar()
  }
  updateDisplay() {
    const formattedDate = this.selectedDate.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    this.displaySpan.textContent = formattedDate
    const yyyy = this.selectedDate.getFullYear()
    const mm = String(this.selectedDate.getMonth() + 1).padStart(2, '0')
    const dd = String(this.selectedDate.getDate()).padStart(2, '0')

    this.hiddenInput.value = `${yyyy}-${mm}-${dd}`
  }
  renderCalendar() {
    this.grid.innerHTML = ''

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    this.currentMonthDisplay.textContent = `${months[this.viewMonth]} ${this.viewYear}`

    const firstDayOfMonthIndex = new Date(
      this.viewYear,
      this.viewMonth,
      1,
    ).getDay()
    const totalDaysInMonth = new Date(
      this.viewYear,
      this.viewMonth + 1,
      0,
    ).getDate()

    for (let i = 0; i < firstDayOfMonthIndex; i++) {
      const emptyCell = document.createElement('div')
      emptyCell.classList.add('calendar-day', 'empty')
      this.grid.appendChild(emptyCell)
    }
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const cell = document.createElement('div')
      cell.classList.add('calendar-day')
      cell.textContent = i

      if (
        i === this.selectedDate.getDate() &&
        this.viewMonth === this.selectedDate.getMonth() &&
        this.viewYear === this.selectedDate.getFullYear()
      ) {
        cell.classList.add('selected')
      }

      cell.addEventListener('click', (e) => {
        e.stopPropagation()
        this.selectedDate = new Date(this.viewYear, this.viewMonth, i)
        this.updateDisplay()
        this.container.classList.remove('active')
        this.renderCalendar()
      })
      this.grid.appendChild(cell)
    }
  }
}
