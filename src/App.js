import "./App.css";
import { useState } from "react";
import Image from "./receipts/1000-receipt.jpg";
import { createWorker } from "tesseract.js";
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [text, setText] = useState([]);

  let getLinesFromPhoto = async () => {
    const worker = await createWorker({
      logger: (m) => console.log(m),
    });

    (async () => {
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { lines }
      } = await worker.recognize(`${Image}`);
      // set text to a cleaned version of lines taken from photo
      await setText(cleanAndOrganize(lines));
      await worker.terminate();
    })();
  };

  function organizeLineIntoObj(line) {
    let obj = {
      quantity: 1,
      item: [],
      price: 0.0,
    }

    line.words.forEach((word) => {
      line.text = line.text.replace(/[^A-Za-z0-9.-\s]+/gm, '')
      const priceReg = /\.\d{2}/gm
      const numCheck = /\d+/gm

      if (priceReg.test(word.text)) {
        obj.price = (+word.text)
      } else if (numCheck.test(word.text)){ 
        obj.quantity = (+word.text) 
      } else {
        obj.item.push(word.text)
      }
    })
    return obj
  }

  function removeLinesWithoutPrice(lines) {
    return lines.filter((line) => {
      let priceReg = /\.\d{2}/gm
      return priceReg.test(line.text)
    })
  }

  function cleanAndOrganize(lines) {
    let pricedLines = removeLinesWithoutPrice(lines)
    let organizeLines = []
    pricedLines.forEach((line) => {
      organizeLines.push(organizeLineIntoObj(line))
    })
    return organizeLines
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  console.log("text", text)

  return (
    <div>
      <h1>Home</h1>

      <button onClick={getLinesFromPhoto}>Submit</button>

      {text.length > 0 ? (
        <div>
          <h2>Receipt</h2>
          {text.map((line) => {
            return (
            <div key={uuidv4()}>
              <span>{line.quantity}: </span>
              <span>{line.item.join(' ')}-- </span>
              <span>{formatter.format(line.price)}</span>
            </div>
            )
          })}
        </div>
      ) : null}
    </div>
  );
}

export default App;