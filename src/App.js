import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { Navbar, NavDropdown, Nav, Container, Row, Col } from 'react-bootstrap';
import SampleData from './sample_data.json';
import Diary from './components/Diary';
import Diaries from './components/Diaries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faBook, faCircleNodes, faHome, faBars } from '@fortawesome/free-solid-svg-icons'
import { TagCloud } from './components/TagCloud';
import Preferences from './components/Preferences';

function App() {
  let appClasses = ["App"]

  const [preferences, setPreferences] = useState("normal")

  const handlePreferencesChanged = (prefs) => {
    console.log(prefs)
    setPreferences(prefs)
  }

  if (preferences.fontStyle && preferences.fontStyle === "fraktur") {
    appClasses.push("font-fraktur")
  }

  return (
    <div className={appClasses.join(" ")}>
      <BrowserRouter>
        <header className="App-header">
          <Navbar variant="dark" bg="dark" expand="md">
            <Container>
              <Navbar.Brand href="#home">
                <img className="logo" src="/tags_im_museum.png" alt='Tags im Museum Logo'/>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav">
                <FontAwesomeIcon icon={faBars} /> 
              </Navbar.Toggle>
              <Navbar.Collapse id="basic-navbar-nav" className='my-2 my-md-0'>
                <Nav className="ms-auto">
                  <NavLink className="nav-link ms-2" to="/">
                    <FontAwesomeIcon icon={faHome} />
                    <span className='ms-2'>Home</span>
                  </NavLink>
                  <NavLink className="nav-link ms-2" to="/diaries">
                    <FontAwesomeIcon icon={faBook} />
                    <span className='ms-2'>Tagebücher</span>
                  </NavLink>
                  <NavLink className="nav-link ms-2" to="/preferences">
                    <FontAwesomeIcon icon={faCog} />
                    <span className='ms-2'>Einstellungen</span>
                  </NavLink>
                  <NavLink className="nav-link ms-2" to="/tagcloud">
                    <FontAwesomeIcon icon={faCircleNodes} />
                    <span className='ms-2'>Tagcloud</span>
                  </NavLink>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <main>
          <Container>
            <Routes>
              <Route path="/entries" element={<Diary />} />
              <Route path="/diaries/:id" element={<Diary />} />
              <Route path="/diaries" element={<Diaries />} />
              <Route path="/preferences" element={<Preferences preferences={preferences} onPreferencesChanged={(prefs) => handlePreferencesChanged(prefs)}/>} />
              <Route path="/tagcloud" element={<TagCloud />} />
              <Route path="/" element={<h5>Start page</h5>} />
            </Routes>
          </Container>
        </main>
        <footer>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
