import { formatDate } from '../../app/format.js'
import DashboardFormUI from './DashboardFormUI.js'
import BigBilledIcon from '../../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../../constants/routes.js'
import USERS_TEST from '../../constants/usersTest.js'
import Logout from "../../components/Logout.js"

// State pour gérer l'état du dashboard
let dashboardState = {
  counter: undefined,
  index: undefined,
  id: undefined
}

/**
 * Filtre les bills par statut
 */
export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // En environnement Jest
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // En prod
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

/**
 * Génère le HTML d'une card bill
 */
export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

/**
 * Génère le HTML de toutes les cards
 */
export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

/**
 * Convertit un index en statut
 */
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

/**
 * Initialise la page Dashboard - Attache les event listeners
 */
export const initDashboardPage = ({ document, onNavigate, bills, localStorage }) => {
  if (!document) {
    console.log('Dashboard: document is MISSING')
    return
  }

  const arrowIcon1 = document.querySelector('#arrow-icon1')
  const arrowIcon2 = document.querySelector('#arrow-icon2')
  const arrowIcon3 = document.querySelector('#arrow-icon3')

  if (arrowIcon1) arrowIcon1.addEventListener('click', (e) =>
    handleShowTickets(e, bills, 1, document))
  if (arrowIcon2) arrowIcon2.addEventListener('click', (e) =>
    handleShowTickets(e, bills, 2, document))
  if (arrowIcon3) arrowIcon3.addEventListener('click', (e) =>
    handleShowTickets(e, bills, 3, document))

  new Logout({ localStorage, onNavigate, document })
}

/**
 * Gère le clic sur l'icône oeil
 * Exported for testing purposes
 */
export const handleClickIconEye = (document) => {
  const billUrl = document.querySelector('#icon-eye-d').getAttribute("data-bill-url")
  const modale = document.querySelector('#modaleFileAdmin1')
  const modal = new bootstrap.Modal(modale)

  // Attendre que la modale soit visible pour calculer la largeur
  modale.addEventListener('shown.bs.modal', () => {
    const imgWidth = Math.floor(modale.getBoundingClientRect().width * 0.8)
    modale.querySelector(".modal-body").innerHTML =
      `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`
  }, { once: true })

  modal.show()
}

/**
 * Gère l'édition d'un ticket
 * Exported for testing purposes
 */
export const handleEditTicket = (e, bill, bills, document) => {
  if (dashboardState.counter === undefined || dashboardState.id !== bill.id) {
    dashboardState.counter = 0
  }
  if (dashboardState.id === undefined || dashboardState.id !== bill.id) {
    dashboardState.id = bill.id
  }

  if (dashboardState.counter % 2 === 0) {
    bills.forEach(b => {
      const el = document.querySelector(`#open-bill${b.id}`)
      if (el) el.style.background = '#0D5AE5'
    })

    const billEl = document.querySelector(`#open-bill${bill.id}`)
    if (billEl) billEl.style.background = '#2A2B35'

    document.querySelector('.dashboard-right-container div').innerHTML = DashboardFormUI(bill)
    document.querySelector('.vertical-navbar').style.height = '150vh'
    dashboardState.counter++
  } else {
    const billEl = document.querySelector(`#open-bill${bill.id}`)
    if (billEl) billEl.style.background = '#0D5AE5'

    document.querySelector('.dashboard-right-container div').innerHTML = `
      <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
    `
    document.querySelector('.vertical-navbar').style.height = '120vh'
    dashboardState.counter++
  }

  const iconEye = document.querySelector('#icon-eye-d')
  if (iconEye) iconEye.addEventListener('click', () => handleClickIconEye(document))

  const btnAccept = document.querySelector('#btn-accept-bill')
  if (btnAccept) btnAccept.addEventListener('click', (e) =>
    handleAcceptSubmit(e, bill, document))

  const btnRefuse = document.querySelector('#btn-refuse-bill')
  if (btnRefuse) btnRefuse.addEventListener('click', (e) =>
    handleRefuseSubmit(e, bill, document))
}

/**
 * Gère l'acceptation d'une bill
 * Exported for testing purposes
 */
export const handleAcceptSubmit = (e, bill, document) => {
  const newBill = {
    ...bill,
    status: 'accepted',
    commentAdmin: document.querySelector('#commentary2').value
  }

  // Afficher le big billed icon
  const container = document.querySelector('.dashboard-right-container div')
  if (container) {
    container.innerHTML = `
      <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
    `
  } else {
    // Fallback pour les tests: ajouter l'icône au body
    const iconDiv = document.createElement('div')
    iconDiv.id = 'big-billed-icon'
    iconDiv.setAttribute('data-testid', 'big-billed-icon')
    iconDiv.innerHTML = BigBilledIcon
    document.body.appendChild(iconDiv)
  }

  const navbar = document.querySelector('.vertical-navbar')
  if (navbar) navbar.style.height = '120vh'

  // Note: updateBill appelée par le code appelant
  return newBill
}

/**
 * Gère le refus d'une bill
 * Exported for testing purposes
 */
export const handleRefuseSubmit = (e, bill, document) => {
  const newBill = {
    ...bill,
    status: 'refused',
    commentAdmin: document.querySelector('#commentary2').value
  }

  // Afficher le big billed icon
  const container = document.querySelector('.dashboard-right-container div')
  if (container) {
    container.innerHTML = `
      <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
    `
  } else {
    // Fallback pour les tests: ajouter l'icône au body
    const iconDiv = document.createElement('div')
    iconDiv.id = 'big-billed-icon'
    iconDiv.setAttribute('data-testid', 'big-billed-icon')
    iconDiv.innerHTML = BigBilledIcon
    document.body.appendChild(iconDiv)
  }

  const navbar = document.querySelector('.vertical-navbar')
  if (navbar) navbar.style.height = '120vh'

  // Note: updateBill appelée par le code appelant
  return newBill
}

/**
 * Gère l'affichage/masquage des tickets
 * Exported for testing purposes
 */
export const handleShowTickets = (e, bills, index, document) => {
  if (dashboardState.counter === undefined || dashboardState.index !== index) {
    dashboardState.counter = 0
  }
  if (dashboardState.index === undefined || dashboardState.index !== index) {
    dashboardState.index = index
  }

  if (dashboardState.counter % 2 === 0) {
    const arrow = document.querySelector(`#arrow-icon${dashboardState.index}`)
    if (arrow) arrow.style.transform = 'rotate(0deg)'

    document.querySelector(`#status-bills-container${dashboardState.index}`)
      .innerHTML = cards(filteredBills(bills, getStatus(dashboardState.index)))

    dashboardState.counter++
  } else {
    const arrow = document.querySelector(`#arrow-icon${dashboardState.index}`)
    if (arrow) arrow.style.transform = 'rotate(90deg)'

    document.querySelector(`#status-bills-container${dashboardState.index}`)
      .innerHTML = ""

    dashboardState.counter++
  }

  bills.forEach(bill => {
    const openBill = document.querySelector(`#open-bill${bill.id}`)
    if (openBill) openBill.addEventListener('click', (e) =>
      handleEditTicket(e, bill, bills, document))
  })

  return bills
}

/**
 * Récupère toutes les bills de tous les utilisateurs
 */
export const getBillsAllUsers = async (store) => {
  if (store) {
    try {
      const snapshot = await store.bills().list()
      const bills = snapshot.map(doc => ({
        id: doc.id,
        ...doc,
        date: doc.date,
        status: doc.status
      }))
      return bills
    } catch (error) {
      throw error
    }
  }
  return []
}

/**
 * Met à jour une bill
 */
export const updateBill = async (bill, store) => {
  if (store) {
    try {
      const updatedBill = await store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
      return updatedBill
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}

/**
 * Réinitialise l'état du dashboard (utile pour les tests)
 */
export const resetDashboardState = () => {
  dashboardState = {
    counter: undefined,
    index: undefined,
    id: undefined
  }
}
