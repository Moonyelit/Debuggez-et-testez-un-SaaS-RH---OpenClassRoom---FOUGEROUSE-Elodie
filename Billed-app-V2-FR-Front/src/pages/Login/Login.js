import { ROUTES_PATH } from '../../constants/routes.js'

export let PREVIOUS_LOCATION = ''

/**
 * Initialise la page de Login - Attache les event listeners
 */
export const initLoginPage = ({ document, localStorage, onNavigate, store }) => {
  const formEmployee = document.querySelector(`form[data-testid="form-employee"]`)
  formEmployee.addEventListener("submit", (e) => handleSubmitEmployee(e, { localStorage, onNavigate, store }))

  const formAdmin = document.querySelector(`form[data-testid="form-admin"]`)
  formAdmin.addEventListener("submit", (e) => handleSubmitAdmin(e, { localStorage, onNavigate, store }))
}

/**
 * Gère la soumission du formulaire employé
 */
const handleSubmitEmployee = (e, { localStorage, onNavigate, store }) => {
  e.preventDefault()

  const user = {
    type: "Employee",
    email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
    password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
    status: "connected"
  }

  localStorage.setItem("user", JSON.stringify(user))

  login(user, store)
    .catch((err) => createUser(user, store))
    .then(() => {
      onNavigate(ROUTES_PATH['Bills'])
      PREVIOUS_LOCATION = ROUTES_PATH['Bills']
      document.body.style.backgroundColor = "#fff"
    })
}

/**
 * Gère la soumission du formulaire admin
 * BUG FIX: Utilise les bons data-testid (admin au lieu de employee)
 */
const handleSubmitAdmin = (e, { localStorage, onNavigate, store }) => {
  e.preventDefault()

  const user = {
    type: "Admin",
    email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
    password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
    status: "connected"
  }

  localStorage.setItem("user", JSON.stringify(user))

  login(user, store)
    .catch((err) => createUser(user, store))
    .then(() => {
      onNavigate(ROUTES_PATH['Dashboard'])
      PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
      document.body.style.backgroundColor = "#fff"
    })
}

/**
 * Connecte l'utilisateur via le store
 */
const login = (user, store) => {
  if (store) {
    return store
      .login(JSON.stringify({
        email: user.email,
        password: user.password,
      }))
      .then(({ jwt }) => {
        localStorage.setItem('jwt', jwt)
      })
  } else {
    return Promise.resolve()
  }
}

/**
 * Crée un nouvel utilisateur via le store
 */
const createUser = (user, store) => {
  if (store) {
    return store
      .users()
      .create({
        data: JSON.stringify({
          type: user.type,
          name: user.email.split('@')[0],
          email: user.email,
          password: user.password,
        })
      })
      .then(() => {
        console.log(`User with ${user.email} is created`)
        return login(user, store)
      })
  } else {
    return Promise.resolve()
  }
}
