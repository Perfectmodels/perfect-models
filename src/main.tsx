
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Add the 'light' class to the document by default
// The ThemeProvider will update this as needed
document.documentElement.classList.add('light');

createRoot(document.getElementById("root")!).render(<App />);
