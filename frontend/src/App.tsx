import { BrowserRouter } from 'react-router-dom';
import { ChatPage } from './pages/ChatPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <ChatPage />
      </div>
    </BrowserRouter>
  );
}

export default App;
