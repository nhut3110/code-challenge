import { useEffect, useRef } from 'react'
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SumPage } from './pages/SumPage'
import { SwapPage } from './pages/SwapPage'
import { RefactorPage } from './pages/RefactorPage'

const pages = [
  ['/problem-1', '01', 'Sum to n'],
  ['/problem-2', '02', 'Asset swap'],
  ['/problem-3', '03', 'React refactor'],
]
const Workspace = () => {
  const location = useLocation()
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    document.title = `${pages.find(([path]) => path === location.pathname)?.[2] ?? 'Challenge'} — Nhut Vo`
    window.scrollTo(0, 0)
    main.current?.focus()
  }, [location.pathname])
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <nav aria-label="Problems">
          {pages.map(([path, number, name]) => (
            <NavLink key={path} to={path}>
              <span className="nav-number">{number}</span>
              {name}
            </NavLink>
          ))}
        </nav>
        <a
          className="brief-link"
          href="https://s5tech.notion.site/Code-Challenge-05cdb9e0d1ce432a843f763b5d5f7497"
          target="_blank"
          rel="noreferrer"
        >
          Challenge brief <ArrowUpRight size={14} />
        </a>
      </header>
      <main id="main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/problem-1" element={<SumPage />} />
          <Route path="/problem-2" element={<SwapPage />} />
          <Route path="/problem-3" element={<RefactorPage />} />
          <Route path="*" element={<Navigate replace to="/problem-1" />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>Vo Minh Nhut · FE Developer application</span>
        <span>React / TypeScript / Vite</span>
      </footer>
    </>
  )
}
const App = () => {
  return (
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  )
}
export default App
