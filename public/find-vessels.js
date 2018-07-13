let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
  let src = cv.imread(imgElement);
  // Colour-transform the image for maximum vessel contrast (get the G channel)
  let rgbaPlanes = new cv.MatVector();
  cv.split(src, rgbaPlanes);
  let G = rgbaPlanes.get(1);
  let dst = new cv.Mat();
  //cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY);
  cv.adaptiveThreshold(G, dst, 230, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 9, 3);


    // highlight disc
    // for (let i = 0; i < opticDisc.cols; ++i) {
    //   let x = opticDisc.data32F[i * 3];
    //   let y = opticDisc.data32F[i * 3 + 1];
    //   let radius = opticDisc.data32F[i * 3 + 2];
    //   let center = new cv.Point(x, y);
    //   cv.circle(dst, center, radius, color, 2);
    // }
    cv.imshow('canvasOutput', dst);
    // free up Emscripten memory
    src.delete(); dst.delete(); G.delete(); opticDisc.delete();
  };
  let imgContainer = document.getElementById('imageContainer').appendChild(imgElement);
}

// load opencv.js dependency into the DOM
 const openCVScript = document.createElement("script"); // Make a script DOM node
 openCVScript.type = 'text/javascript';
 openCVScript.src = 'lib/opencv.js';
 document.body.appendChild(openCVScript); // add it to the page

 // when opencv_js.wasm has finished loading and calls the init function, run the analysis
let Module = {
  onRuntimeInitialized: function() {
    runOpenCV();
  }
}

// copy the image for displaying transformation
    // let dst = src.clone();
// convert to grayscale
    //cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);