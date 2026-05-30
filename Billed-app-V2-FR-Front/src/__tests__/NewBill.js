/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../pages/NewBill/NewBillUI.js"
import { initNewBillPage, resetBillFileState } from "../pages/NewBill/NewBill.js"
import { ROUTES_PATH } from "../constants/routes.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

// localStorage simple qui ne double-sérialise pas
const buildLocalStorage = (email = "a@a") => ({
  getItem: jest.fn(() => JSON.stringify({ email })),
  setItem: jest.fn(),
})

// ==================== TESTS DE VUE ====================
describe("Étant connecté en tant qu'employé", () => {
  describe("Lorsque je suis sur la page NewBill", () => {
    test("Alors le formulaire doit être rendu avec tous les champs requis", () => {
      document.body.innerHTML = NewBillUI()

      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })

    test("Alors le bouton de soumission doit être rendu", () => {
      document.body.innerHTML = NewBillUI()

      const submitButton = screen.getByText("Envoyer")
      expect(submitButton).toBeTruthy()
      expect(submitButton.type).toBe("submit")
    })

    test("Alors le titre de la page doit être affiché", () => {
      document.body.innerHTML = NewBillUI()

      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })

    test("Alors le select du type de dépense doit contenir toutes les options", () => {
      document.body.innerHTML = NewBillUI()

      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByText("Transports")).toBeTruthy()
      expect(screen.getByText("Restaurants et bars")).toBeTruthy()
      expect(screen.getByText("Hôtel et logement")).toBeTruthy()
      expect(screen.getByText("Services en ligne")).toBeTruthy()
      expect(screen.getByText("IT et électronique")).toBeTruthy()
      expect(screen.getByText("Equipement et matériel")).toBeTruthy()
      expect(screen.getByText("Fournitures de bureau")).toBeTruthy()
    })

    // ==================== TESTS UNITAIRES ====================

    // Test unitaire - initNewBillPage
    describe("Lorsque la page est initialisée", () => {
      test("Alors les listeners sont attachés au formulaire et à l'input fichier", () => {
        // Given
        document.body.innerHTML = NewBillUI()
        const onNavigate = jest.fn()
        const ls = buildLocalStorage()

        const form = screen.getByTestId("form-new-bill")
        const fileInput = screen.getByTestId("file")
        const formSpy = jest.spyOn(form, "addEventListener")
        const fileSpy = jest.spyOn(fileInput, "addEventListener")

        // When
        initNewBillPage({ document, onNavigate, store: mockStore, localStorage: ls })

        // Then
        expect(formSpy).toHaveBeenCalledWith("submit", expect.any(Function))
        expect(fileSpy).toHaveBeenCalledWith("change", expect.any(Function))
      })
    })

    // Test unitaire - handleChangeFile avec extension valide
    describe("Lorsque je télécharge un fichier avec une extension valide (jpg)", () => {
      test("Alors store.bills().create() est appelé et le message d'erreur est masqué", async () => {
        // Given
        document.body.innerHTML = NewBillUI()
        resetBillFileState()
        const onNavigate = jest.fn()
        const ls = buildLocalStorage()
        const createSpy = jest.spyOn(mockStore.bills(), "create")

        initNewBillPage({ document, onNavigate, store: mockStore, localStorage: ls })

        // When
        const fileInput = screen.getByTestId("file")
        Object.defineProperty(fileInput, "files", {
          value: [new File(["content"], "test.jpg", { type: "image/jpeg" })],
          configurable: true,
        })
        Object.defineProperty(fileInput, "value", {
          get: () => "test.jpg",
          configurable: true,
        })
        fireEvent.change(fileInput)

        // Then
        const errorMessage = document.querySelector('[data-testid="file-error"]')
        expect(errorMessage.style.display).toBe("none")
        await waitFor(() => expect(createSpy).toHaveBeenCalled())
      })
    })

    // Test unitaire - handleChangeFile avec extension invalide
    describe("Lorsque je télécharge un fichier avec une extension invalide (pdf)", () => {
      test("Alors le message d'erreur est affiché et store.bills().create() n'est pas appelé", () => {
        // Given
        document.body.innerHTML = NewBillUI()
        const onNavigate = jest.fn()
        const ls = buildLocalStorage()
        const billsMock = { create: jest.fn(), update: jest.fn() }
        const storeMock = { bills: jest.fn(() => billsMock) }

        initNewBillPage({ document, onNavigate, store: storeMock, localStorage: ls })

        // When
        const fileInput = screen.getByTestId("file")
        Object.defineProperty(fileInput, "files", {
          value: [new File(["content"], "test.pdf", { type: "application/pdf" })],
          configurable: true,
        })
        Object.defineProperty(fileInput, "value", {
          get: () => "test.pdf",
          set: jest.fn(),
          configurable: true,
        })
        fireEvent.change(fileInput)

        // Then
        const errorMessage = document.querySelector('[data-testid="file-error"]')
        expect(errorMessage.style.display).toBe("block")
        expect(billsMock.create).not.toHaveBeenCalled()
      })
    })

    // Test unitaire - handleChangeFile avec extension jpeg
    describe("Lorsque je télécharge un fichier avec une extension valide (jpeg)", () => {
      test("Alors store.bills().create() est appelé", async () => {
        // Given
        document.body.innerHTML = NewBillUI()
        resetBillFileState()
        const onNavigate = jest.fn()
        const ls = buildLocalStorage()
        const createSpy = jest.spyOn(mockStore.bills(), "create")

        initNewBillPage({ document, onNavigate, store: mockStore, localStorage: ls })

        // When
        const fileInput = screen.getByTestId("file")
        Object.defineProperty(fileInput, "files", {
          value: [new File(["content"], "test.jpeg", { type: "image/jpeg" })],
          configurable: true,
        })
        Object.defineProperty(fileInput, "value", {
          get: () => "test.jpeg",
          configurable: true,
        })
        fireEvent.change(fileInput)

        // Then
        await waitFor(() => expect(createSpy).toHaveBeenCalled())
      })
    })

    // Test unitaire - handleSubmit + updateBill
    describe("Lorsque je soumets le formulaire avec des données valides", () => {
      test("Alors store.bills().update() est appelé et je suis redirigé vers la page Bills", async () => {
        // Given
        document.body.innerHTML = NewBillUI()
        resetBillFileState()
        const onNavigate = jest.fn()
        const ls = buildLocalStorage()
        const updateSpy = jest.spyOn(mockStore.bills(), "update")

        initNewBillPage({ document, onNavigate, store: mockStore, localStorage: ls })

        fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } })
        fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Vol Paris Londres" } })
        fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2024-01-15" } })
        fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } })
        fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } })
        fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } })
        fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Note de frais test" } })

        // When
        fireEvent.submit(screen.getByTestId("form-new-bill"))

        // Then
        await waitFor(() => {
          expect(updateSpy).toHaveBeenCalled()
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"])
        })
      })
    })
  })
})

// ==================== TEST D'INTÉGRATION POST ====================
describe("Étant connecté en tant qu'employé", () => {
  describe("Lorsque je soumets une nouvelle note de frais", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
      document.body.innerHTML = ""
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("Alors la note de frais est envoyée via l'API mock et je suis redirigé vers Bills", async () => {
      // Given
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId("form-new-bill"))
      resetBillFileState()

      const updateSpy = jest.spyOn(mockStore.bills(), "update")

      // When
      fireEvent.submit(screen.getByTestId("form-new-bill"))

      // Then
      await waitFor(() => expect(updateSpy).toHaveBeenCalled())
    })

    // Test d'intégration POST - Erreurs API lors de l'upload (create)
    describe("Lorsqu'une erreur survient sur l'API lors de l'upload du fichier", () => {
      test("Alors l'erreur 404 est capturée sans faire planter la page", async () => {
        // Given
        mockStore.bills.mockImplementationOnce(() => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
          update: jest.fn(() => Promise.resolve()),
        }))

        window.onNavigate(ROUTES_PATH.NewBill)
        await waitFor(() => screen.getByTestId("form-new-bill"))
        resetBillFileState()

        const fileInput = screen.getByTestId("file")
        Object.defineProperty(fileInput, "files", {
          value: [new File(["content"], "test.jpg", { type: "image/jpeg" })],
          configurable: true,
        })
        Object.defineProperty(fileInput, "value", {
          get: () => "test.jpg",
          configurable: true,
        })

        // When
        fireEvent.change(fileInput)
        await new Promise(process.nextTick)

        // Then — le formulaire est toujours présent (pas de crash)
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })

      test("Alors l'erreur 500 est capturée sans faire planter la page", async () => {
        // Given
        mockStore.bills.mockImplementationOnce(() => ({
          create: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
          update: jest.fn(() => Promise.resolve()),
        }))

        window.onNavigate(ROUTES_PATH.NewBill)
        await waitFor(() => screen.getByTestId("form-new-bill"))
        resetBillFileState()

        const fileInput = screen.getByTestId("file")
        Object.defineProperty(fileInput, "files", {
          value: [new File(["content"], "test.jpg", { type: "image/jpeg" })],
          configurable: true,
        })
        Object.defineProperty(fileInput, "value", {
          get: () => "test.jpg",
          configurable: true,
        })

        // When
        fireEvent.change(fileInput)
        await new Promise(process.nextTick)

        // Then — le formulaire est toujours présent (pas de crash)
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })
    })

    // Test d'intégration POST - Erreurs API lors de la soumission (update)
    describe("Lorsqu'une erreur survient sur l'API lors de la soumission du formulaire", () => {
      test("Alors l'erreur 404 est capturée et l'utilisateur reste sur la page", async () => {
        // Given
        mockStore.bills.mockImplementationOnce(() => ({
          create: jest.fn(() => Promise.resolve({ fileUrl: "https://localhost/test.jpg", key: "1234" })),
          update: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
        }))

        window.onNavigate(ROUTES_PATH.NewBill)
        await waitFor(() => screen.getByTestId("form-new-bill"))
        resetBillFileState()

        // When
        fireEvent.submit(screen.getByTestId("form-new-bill"))
        await new Promise(process.nextTick)

        // Then — aucune navigation, le formulaire reste présent (erreur gérée par catch)
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })

      test("Alors l'erreur 500 est capturée et l'utilisateur reste sur la page", async () => {
        // Given
        mockStore.bills.mockImplementationOnce(() => ({
          create: jest.fn(() => Promise.resolve({ fileUrl: "https://localhost/test.jpg", key: "1234" })),
          update: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
        }))

        window.onNavigate(ROUTES_PATH.NewBill)
        await waitFor(() => screen.getByTestId("form-new-bill"))
        resetBillFileState()

        // When
        fireEvent.submit(screen.getByTestId("form-new-bill"))
        await new Promise(process.nextTick)

        // Then — aucune navigation, le formulaire reste présent (erreur gérée par catch)
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })
    })
  })
})
