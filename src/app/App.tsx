import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotesList from '@pages/NotesList'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<NotesList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
