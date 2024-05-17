

(() => {
    let width = screen.width;
    let height = width / (4 / 3);
    let streaming = false;
    let video = null;
    let canvas = null;
    let scantext = null;
    let contibutton = null;
    let sendval = '';
    let unsafe = ["brominated vegetable oil", "butylated hydroxyanisole", "rhodamine b", "calcium sorbate"];
    let diet = ["Vegan", "Keto", "Vegetarian", "Non-Vegetarian"];
    let health = ["sugar", "hydrogenated oils"];
    let allergies = ["lactoglobulin", "arachidonic acid"];
    let allg = true;
    let recogtext = '';
    let startbutton = null;
    let blob = null;
    let Img = null;
  
    function startup() {
      video = document.getElementById("video");
      canvas = document.getElementById("canvas");
      contibutton = document.getElementById("contibutton");
      scantext = document.getElementById("scannedtext");
      startbutton = document.getElementById("startbutton");
      startbutton.style.left = "400px";
      contibutton.style.left = "620px";
      startbutton.style.top = "1300px";
      contibutton.style.top = "1300px";
      Img = document.getElementById("stillImg");
  
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          console.error(`An error occurred: ${err}`);
        });
  
      video.addEventListener(
        "canplay",
        (ev) => {
          if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);
            if (isNaN(height)) {
              height = width / (4 / 3);
            }
            video.setAttribute("width", width);
            video.setAttribute("height", height);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            streaming = true;
          }
        },
        false,
      );
  
      startbutton.addEventListener(
        "click",
        (ev) => {
          takepicture();
          ev.preventDefault();
        },
        false,
      );
    }
    
    function takepicture() {
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, width, height);
      const data = canvas.toDataURL("image/png");
      blob = dataURLtoBlob(data);
      Img.setAttribute("src", data);
      video.remove();
      canvas.remove();
      
      Tesseract.recognize(blob).then(({ data: { text: ocrText } }) => {
        sendval = ocrText;
        scantext.textContent = sendval;
        recogtext = sendval.replace('\n', '');
        let tess = recogtext.split(',');
        tess[0] = tess[0].split(':')[1].trim();
        console.log(tess);
        let allergens = '';
        let healthissue = '';
        
        for (let i of tess) {
          i = i.trim().toLowerCase();
          if (unsafe.includes(i)) {
            console.log(`Unsafe ingredients ${i} used`);
            allg = false;
            break;
          } else if (health.includes(i)) {
            if (i === "hydrogenated oils") {
                healthissue = "Cholesterol";
            } else if (i === "sugar") {
                healthissue = "Diabetes";
            }
            console.log(`${i} can cause problems if you have ${healthissue}. If you don't, then consume it with precaution in controlled quantity.`);
            allg = false;
            break;
          } else if (allergies.includes(i)) {
            if (i === "arachidonic acid") {
              allergens = "Peanut";
            } else if (i === "lactoglobulin") {
              allergens = "Lactose";
            }
            console.log(`${i} can cause problems if you have ${allergens} allergy.`);
            allg = false;
            break;
          }
        }
        
        if (allg) {
          console.log("You are good to go");
        }
      });

      startbutton.style.left = "120px";
      startbutton.textContent = "Scan Again";
      contibutton.style.backgroundColor = "#6153BD";
      startbutton.addEventListener(
        "click",
        (ev) => {
          location.reload();
          ev.preventDefault();
        },
        false,
      );
      contibutton.addEventListener(
        "click",
        (ev) => {
          var a = document.createElement('a');
          a.href = "scanresults.html";
          a.click();
          ev.preventDefault();
        },
        false,
      );
    }
    
    function dataURLtoBlob(dataURL) {
      const parts = dataURL.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    }

    window.addEventListener("load", startup, false);
})();
