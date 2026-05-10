/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../pages/NewBill/NewBillUI.js"
import { initNewBillPage } from "../pages/NewBill/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be rendered with all required fields", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      // Verify form is present
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()

      // Verify all form fields are present
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })

    test("Then the submit button should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const submitButton = screen.getByText("Envoyer")
      expect(submitButton).toBeTruthy()
      expect(submitButton.type).toBe("submit")
    })

    test("Then the page title should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })

    test("Then the expense type select should have all options", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const expenseTypeSelect = screen.getByTestId("expense-type")
      expect(expenseTypeSelect).toBeTruthy()

      // Verify all expense type options are present
      expect(screen.getByText("Transports")).toBeTruthy()
      expect(screen.getByText("Restaurants et bars")).toBeTruthy()
      expect(screen.getByText("Hôtel et logement")).toBeTruthy()
      expect(screen.getByText("Services en ligne")).toBeTruthy()
      expect(screen.getByText("IT et électronique")).toBeTruthy()
      expect(screen.getByText("Equipement et matériel")).toBeTruthy()
      expect(screen.getByText("Fournitures de bureau")).toBeTruthy()
    })
  })
})
