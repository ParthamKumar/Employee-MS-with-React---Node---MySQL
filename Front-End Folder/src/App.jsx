import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Components/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './Components/Dashboard'
import Home from './Components/Home'
import Employee from './Components/Employee'
import Category from './Components/Category'
import Profile from './Components/Profile'
import AddCategory from './Components/AddCategory'
import AddEmployee from './Components/AddEmployee'
import EditEmployee from './Components/EditEmployee'
import Start from './Components/Start'
import EmployeeLogin from './Components/EmployeeLogin'
import EmployeeDetail from './Components/EmployeeDetail'
import PrivateRoute from './Components/PrivateRoute'

import Register from './Components/Register';

import Projects from './Components/projects/project'  // Projects List
import ProjectForm from './Components/projects/ProjectForm'  // Add Project Form
import ProjectDetail from './Components/projects/ProjectDetail'  // Project Details Page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />}></Route>
        <Route path="/register" element={<Register />} />
        <Route path="/adminlogin" element={<Login />}></Route>
        <Route path="/employee_login" element={<EmployeeLogin />}></Route>
        <Route path="/employee_detail/:id" element={<EmployeeDetail />}></Route>
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }>
          <Route path="" element={<Home />}></Route>
          <Route path="/dashboard/employee" element={<Employee />}></Route>
          <Route path="/dashboard/category" element={<Category />}></Route>
          <Route path="/dashboard/profile" element={<Profile />}></Route>
          
          {/* List of Projects */}
          <Route path="/dashboard/projects" element={<Projects />}></Route>
          
          {/* Add New Project Form */}
          <Route path="/dashboard/projectForm" element={<ProjectForm />}></Route>
          
          {/* Project Details by ID */}
          <Route path="/dashboard/project/:id" element={<ProjectDetail />}></Route>

          <Route path="/dashboard/add_category" element={<AddCategory />}></Route>
          <Route path="/dashboard/add_employee" element={<AddEmployee />}></Route>
          <Route path="/dashboard/edit_employee/:id" element={<EditEmployee />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
