import "./App.css";
import { useState } from "react";
import Image from "./receipts/1000-receipt.jpg";
import { createWorker } from "tesseract.js";

function App() {
  const [text, setText] = useState([]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   Tesseract.recognize(`${testImg}`, "eng", {
  //     logger: (m) => console.log(m),
  //   }).then(({ data: { lines } }) => {
  //     setText(lines);
  //     console.log(lines);
  //   });
  // };

  let test = async () => {
    const worker = await createWorker({
      logger: (m) => console.log(m),
    });

    (async () => {
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { lines }
      } = await worker.recognize(`${Image}`);
      lines.forEach((line) => {
        line.text = line.text.replace(/[^A-Za-z0-9.-\s]+/gm, '')
      })
      console.log(lines);
      await setText(lines);
      await worker.terminate();
    })();
  };

  function parseData(line) {
    let obj = {
      quantity: 1,
      item: '',
      price: 0.0,
    }

    line.words.forEach((word) => {
      const priceReg = /\.\d{2}/gm
      const numCheck = /\d+/gm

      if (priceReg.test(word.text)) {
        obj.price = (+word.text)
      } else if (numCheck.test(word.text)){ 
        obj.quantity = (+word.text) 
      } else {
        obj.item += (word.text + " ")
      }
    })
    console.log(obj)
  }

  return (
    <div>
      <h1>Home</h1>

      <button onClick={test}>Submit</button>

      {text.length > 0 ? (
        <div>
          <h2>Receipt</h2>
          {text.map((line) => {
            let priceReg = /\.\d{2}/gm
            return priceReg.test(line.text) ? (
              <p
                onClick={() => {
                  parseData(line);
                }}
              >
                {line.text}
              </p>
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}

export default App;