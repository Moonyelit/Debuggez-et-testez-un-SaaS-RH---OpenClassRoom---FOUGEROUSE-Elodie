import LoginUI from "../pages/Login/LoginUI.js"
import BillsUI from "../pages/Bills/BillsUI.js"
import NewBillUI from "../pages/NewBill/NewBillUI.js"
import DashboardUI from "../pages/Dashboard/DashboardUI.js"

export const ROUTES_PATH = {
  Login: '/',
  Bills: '#employee/bills',
  NewBill: '#employee/bill/new',
  Dashboard: '#admin/dashboard'
}

export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (pathname) {
    case ROUTES_PATH['Login']:
      return LoginUI({ data, error, loading })
    case ROUTES_PATH['Bills']:
      return BillsUI({ data, error, loading })
    case ROUTES_PATH['NewBill']:
      return NewBillUI()
    case ROUTES_PATH['Dashboard']:
      return DashboardUI({ data, error, loading })
    default:
      return LoginUI({ data, error, loading })
  }
}

