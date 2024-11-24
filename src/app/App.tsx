import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotesList from '@src/pages/NotesList/NotesList'
import NoteEditor from '@pages/NoteEditor/NoteEditor'
import { BASE_URL, DEV } from '@src/constants'

const App = () => {
  const basename = DEV ? '/' : BASE_URL
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path={'/'} element={<NotesList />} />
        <Route path={'/notes/:id'} element={<NoteEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
