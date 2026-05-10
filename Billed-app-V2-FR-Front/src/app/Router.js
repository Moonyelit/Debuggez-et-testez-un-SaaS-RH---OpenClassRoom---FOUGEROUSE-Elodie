import store from "./Store.js"
import { initLoginPage, PREVIOUS_LOCATION } from "../pages/Login/Login.js"
import { initBillsPage, getBills } from "../pages/Bills/Bills.js"
import { initNewBillPage } from "../pages/NewBill/NewBill.js"
import { initDashboardPage, getBillsAllUsers } from "../pages/Dashboard/Dashboard.js"

import BillsUI from "../pages/Bills/BillsUI.js"
import DashboardUI from "../pages/Dashboard/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

// ===== Helper Functions =====

/**
 * Met à jour les icônes actives de la navigation
 */
const setActiveIcon = (iconNumber) => {
  const divIcon1 = document.getElementById('layout-icon1')
  const divIcon2 = document.getElementById('layout-icon2')

  if (!divIcon1 || !divIcon2) return

  if (iconNumber === 1) {
    divIcon1.classList.add('active-icon')
    divIcon2.classList.remove('active-icon')
  } else {
    divIcon1.classList.remove('active-icon')
    divIcon2.classList.add('active-icon')
  }
}

// ===== Page Render Functions =====

/**
 * Affiche la page de Login
 */
const renderLogin = (rootDiv) => {
  rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Login'] })
  document.body.style.backgroundColor = "#0E5AE5"
  initLoginPage({ document, localStorage, onNavigate: window.onNavigate, store })
}

/**
 * Affiche la page Bills
 */
const renderBills = async (rootDiv) => {
  // 1. Afficher le loading
  rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Bills'], loading: true })
  setActiveIcon(1)

  try {
    // 2. Charger les données
    const data = await getBills(store)

    // 3. Afficher les données
    rootDiv.innerHTML = BillsUI({ data })
    setActiveIcon(1)

    // 4. Initialiser les event listeners
    initBillsPage({ document, onNavigate: window.onNavigate, store, localStorage })
  } catch (error) {
    // 5. Afficher l'erreur
    rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Bills'], error })
  }
}

/**
 * Affiche la page NewBill
 */
const renderNewBill = (rootDiv) => {
  rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['NewBill'], loading: true })
  setActiveIcon(2)
  initNewBillPage({ document, onNavigate: window.onNavigate, store, localStorage })
}

/**
 * Affiche la page Dashboard
 */
const renderDashboard = async (rootDiv) => {
  rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Dashboard'], loading: true })

  try {
    const bills = await getBillsAllUsers(store)
    rootDiv.innerHTML = DashboardUI({ data: { bills } })
    initDashboardPage({ document, onNavigate: window.onNavigate, bills, localStorage })
  } catch (error) {
    rootDiv.innerHTML = ROUTES({ pathname: ROUTES_PATH['Dashboard'], error })
  }
}

// ===== Main Router =====

export default () => {
  const rootDiv = document.getElementById('root')

  /**
   * Fonction de navigation
   */
  const navigate = async (pathname) => {
    // Mettre à jour l'historique du navigateur
    window.history.pushState({}, pathname, window.location.origin + pathname)

    // Afficher la page correspondante
    switch(pathname) {
      case ROUTES_PATH['Login']:
        renderLogin(rootDiv)
        break
      case ROUTES_PATH['Bills']:
        await renderBills(rootDiv)
        break
      case ROUTES_PATH['NewBill']:
        renderNewBill(rootDiv)
        break
      case ROUTES_PATH['Dashboard']:
        await renderDashboard(rootDiv)
        break
      default:
        renderLogin(rootDiv)
    }
  }

  // Exposer la fonction de navigation globalement
  window.onNavigate = navigate

  // Gérer le bouton "retour" du navigateur
  window.onpopstate = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (window.location.pathname === "/" && !user) {
      renderLogin(rootDiv)
    } else if (user) {
      navigate(PREVIOUS_LOCATION)
    }
  }

  // Initialiser la première page au chargement
  const initialPath = window.location.hash || window.location.pathname

  if (initialPath === "" || initialPath === "/") {
    renderLogin(rootDiv)
  } else if (initialPath.startsWith('#')) {
    // Gérer les routes avec hash (#employee/bills, etc.)
    navigate(initialPath)
  }

  return null
}

