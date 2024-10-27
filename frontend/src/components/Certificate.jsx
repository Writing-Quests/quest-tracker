import { useEffect, useState, useContext } from 'react'
import propTypes from 'prop-types'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import context from '../services/context'

const { LoggedInUserContext } = context

export default function Certificate({project}) {
  const [file, setFile] = useState()
  const user = useContext(LoggedInUserContext)
  useEffect(() => {
    (async () => {
      const res = await fetch('/certificate.pdf')
      const buf = await res.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buf)

      const fontBytes = await (await fetch('/Poppins-Bold.ttf')).arrayBuffer()

      pdfDoc.registerFontkit(fontkit)
      const font = await pdfDoc.embedFont(fontBytes)

      // Get the first page of the document
      const pages = pdfDoc.getPages()
      const page = pages[0]

      // Get the width and height of the first page
      const { width, height } = page.getSize()

      const color = rgb(0.2, 0.2, 0.2)

      let text
      let size
      let textWidth
      let textHeight

      // Draw username
      text = user.username
      size = 30
      textWidth = font.widthOfTextAtSize(text, size);
      textHeight = font.heightAtSize(size);
      page.drawText(text, {
        x: width/2 - textWidth/2,
        y: height/2 - textHeight/2 + 40,
        size, font, color,
      })

      // Draw project name
      text = project.title
      size = 14
      textWidth = font.widthOfTextAtSize(text, size);
      textHeight = font.heightAtSize(size);
      page.drawText(text, {
        x: width/2/2 - textWidth/2 - 28,
        y: height/2 - textHeight/2 - 105,
        size, font, color,
      })

      // Draw project goal
      text = `${Number(project.goals[0].goal).toLocaleString()} ${project.goals[0].units}`
      size = 14
      textWidth = font.widthOfTextAtSize(text, size);
      textHeight = font.heightAtSize(size);
      page.drawText(text, {
        x: (width*3)/4 - textWidth/2 - 12,
        y: height/2 - textHeight/2 - 105,
        size, font, color,
      })

      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save()

      var blob = new Blob([pdfBytes], {type: "application/pdf"});
      var file = window.URL.createObjectURL(blob);
      setFile(file)
    })()
  }, [project, user])
  return <div style={{height: '100%'}}>
    {file && <iframe src={file} style={{width: '100%', height: '100%', border: 'none'}}></iframe>}
  </div>
}
Certificate.propTypes = {
  project: propTypes.object.isRequired,
}
