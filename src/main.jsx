import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

let documents = [
  {
    src: "https://cors-anywhere.herokuapp.com/https://www.orimi.com/pdf-test.pdf",
    type: 'pdf'
  }, 
  {
    src: "https://lms-mylearningalliance.s3.amazonaws.com/cms%2Fcertificate%2F673b9171f1a0a95979e3d894%2Fteam%2Fcsaenz%40steltechsolutions.com%2Fchris+saenz+digital.png",
    type: 'image'
  },
  {
    src: "https://cors-anywhere.herokuapp.com/https://www.orimi.com/pdf-test.pdf",
    type: 'pdf'
  }, 
  {
    src: "https://lms-mylearningalliance.s3.amazonaws.com/cms%2Fcertificate%2F673b9171f1a0a95979e3d894%2Fteam%2Fcsaenz%40steltechsolutions.com%2Fchris+saenz+digital.png",
    type: 'image'
  },
  {
    src: "https://cors-anywhere.herokuapp.com/https://www.orimi.com/pdf-test.pdf",
    type: 'pdf'
  }, 
  {
    src: "https://lms-mylearningalliance.s3.amazonaws.com/cms%2Fcertificate%2F673b9171f1a0a95979e3d894%2Fteam%2Fcsaenz%40steltechsolutions.com%2Fchris+saenz+digital.png",
    type: 'image'
  },
]

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App documents={documents} />
  // </StrictMode>,
)
