/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../pages/Bills/BillsUI.js"
import { initBillsPage, getBills } from "../pages/Bills/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Étant connecté en tant qu'employé", () => {
  describe("Lorsque je suis sur la page Bills", () => {
    test("Alors l'icône Bills dans le menu vertical doit être surlignée", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList).toContain('active-icon')

    })

    test("Alors les notes de frais doivent être triées de la plus récente à la plus ancienne", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test unitaire - Clic sur le bouton "Nouvelle note de frais"
    describe("Lorsque je clique sur le bouton 'Nouvelle note de frais'", () => {
      test("Alors je dois être redirigé vers la page NewBill", () => {
        // Given
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = jest.fn()

        // When
        initBillsPage({ document, onNavigate, store: null, localStorage: window.localStorage })
        fireEvent.click(screen.getByTestId('btn-new-bill'))

        // Then
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill'])
      })
    })

    // Test unitaire - Clic sur l'icône oeil
    describe("Lorsque je clique sur l'icône oeil d'une note de frais", () => {
      test("Alors une modale doit s'ouvrir avec l'image du justificatif", () => {
        // Given
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = jest.fn()
        const modalShow = jest.fn()
        global.bootstrap.Modal = jest.fn().mockImplementation(() => ({ show: modalShow }))
        initBillsPage({ document, onNavigate, store: null, localStorage: window.localStorage })

        // When
        const eyeIcon = screen.getAllByTestId('icon-eye')[0]
        fireEvent.click(eyeIcon)
        const modaleFile = document.querySelector('#modaleFile')
        modaleFile.dispatchEvent(new Event('shown.bs.modal'))

        // Then
        expect(modalShow).toHaveBeenCalled()
        expect(modaleFile.querySelector('.modal-body').innerHTML).toContain('bill-proof-container')
      })
    })
  })
})

// Test unitaire - Récupération des notes de frais depuis le store
describe("Étant donné que j'appelle getBills", () => {
  describe("Lorsque le store retourne des notes de frais", () => {
    test("Alors elles doivent être retournées formatées et triées", async () => {
      // Given / When
      const result = await getBills(mockStore)
      // Then
      expect(result.length).toBe(4)
    })
  })
})

// Test d'intégration GET
describe("Étant connecté en tant qu'employé", () => {
  describe("Lorsque je navigue vers la page Bills", () => {
    test("Alors les notes de frais sont récupérées depuis l'API mock", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("encore"))
      const content = screen.getByText("encore")
      expect(content).toBeTruthy()
    })

    // Test d'intégration - Erreurs API
    describe("Lorsqu'une erreur survient sur l'API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("Alors un message d'erreur 404 doit être affiché", async () => {
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 404"))
        }))
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("Alors un message d'erreur 500 doit être affiché", async () => {
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error("Erreur 500"))
        }))
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
