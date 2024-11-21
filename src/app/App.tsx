import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotesList from '@src/pages/NotesList/NotesList'
import NoteEditor from '@pages/NoteEditor/NoteEditor'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<NotesList />} />
        <Route path={'/notes/:id'} element={<NoteEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
