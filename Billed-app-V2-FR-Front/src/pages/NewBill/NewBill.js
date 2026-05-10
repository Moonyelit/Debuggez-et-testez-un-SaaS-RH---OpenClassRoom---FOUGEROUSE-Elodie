import { ROUTES_PATH } from '../../constants/routes.js'
import Logout from "../../components/Logout.js"

// State pour stocker les informations du fichier uploadé
let billFileState = {
  fileUrl: null,
  fileName: null,
  billId: null
}

/**
 * Initialise la page NewBill - Attache les event listeners
 */
export const initNewBillPage = ({ document, onNavigate, store, localStorage }) => {
  const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
  formNewBill.addEventListener("submit", (e) => handleSubmit(e, { onNavigate, store, localStorage }))

  const fileInput = document.querySelector(`input[data-testid="file"]`)
  fileInput.addEventListener("change", (e) => handleChangeFile(e, { store, localStorage }))

  // Initialise le bouton de déconnexion
  new Logout({ document, localStorage, onNavigate })
}

/**
 * Gère le changement de fichier (upload)
 */
const handleChangeFile = (e, { store, localStorage }) => {
  e.preventDefault()

  const file = document.querySelector(`input[data-testid="file"]`).files[0]
  const filePath = e.target.value.split(/\\/g)
  const fileName = filePath[filePath.length - 1]

  const formData = new FormData()
  const email = JSON.parse(localStorage.getItem("user")).email
  formData.append('file', file)
  formData.append('email', email)

  if (store) {
    store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl)
        billFileState.billId = key
        billFileState.fileUrl = fileUrl
        billFileState.fileName = fileName
      })
      .catch(error => console.error(error))
  }
}

/**
 * Gère la soumission du formulaire
 */
const handleSubmit = (e, { onNavigate, store, localStorage }) => {
  e.preventDefault()

  console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value',
    e.target.querySelector(`input[data-testid="datepicker"]`).value)

  const email = JSON.parse(localStorage.getItem("user")).email

  const bill = {
    email,
    type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
    name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
    amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
    date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
    vat: e.target.querySelector(`input[data-testid="vat"]`).value,
    pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
    commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
    fileUrl: billFileState.fileUrl,
    fileName: billFileState.fileName,
    status: 'pending'
  }

  updateBill(bill, { billId: billFileState.billId, store, onNavigate })
}

/**
 * Met à jour la bill dans le store
 */
const updateBill = (bill, { billId, store, onNavigate }) => {
  if (store) {
    store
      .bills()
      .update({ data: JSON.stringify(bill), selector: billId })
      .then(() => {
        onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
  }
}

/**
 * Réinitialise l'état du fichier (utile pour les tests)
 */
export const resetBillFileState = () => {
  billFileState = {
    fileUrl: null,
    fileName: null,
    billId: null
  }
}
