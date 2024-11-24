import { HashRouter, Route, Routes } from 'react-router-dom'
import NotesList from '@src/pages/NotesList/NotesList'
import NoteEditor from '@pages/NoteEditor/NoteEditor'

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path={'/'} element={<NotesList />} />
        <Route path={'/notes/:id'} element={<NoteEditor />} />
      </Routes>
    </HashRouter>
  )
}

export default App
