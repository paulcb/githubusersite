import { HashRouter, Routes, Route } from "react-router-dom";


import './App.css'
import Home from './Home'
import AMazeThing from './AMazeThing';
import CacheBlog from './CacheBlog';

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />}>
        </Route>
        <Route path="/amazething" element={<AMazeThing />} />
        <Route path="/cacheblog" element={<CacheBlog />} />
      </Routes>
    </HashRouter>
  );
}

export default App
