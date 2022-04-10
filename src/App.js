import logo from './logo.svg';
import './App.scss';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Navbar, NavDropdown, Nav, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import SampleData from './sample_data.json';
import Diary from './components/Diary';
import Diaries from './components/Diaries';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar variant="dark" bg="dark" expand="lg">
          <Container>
            <Navbar.Brand href="#home">Tags im Museum - Tagebücher</Navbar.Brand>
            {/* <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#link">Link</Nav.Link>
                <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse> */}
          </Container>
        </Navbar>
      </header>
      <main>
        <Container>
          <BrowserRouter>
            <Routes>
              <Route path="/entries" element={<Diary />} />
              <Route path="/diaries/:id" element={<Diary />} />
              <Route path="/diaries" element={<Diaries />} />
              <Route path="/" element={<h5>Start page</h5>} />
            </Routes>
          </BrowserRouter>
        </Container>
      </main>
      <footer>
      </footer>
    </div>
  );
}

export default App;
