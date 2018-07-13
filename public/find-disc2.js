let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
  let src = cv.imread(imgElement);
  // Colour-transform the image for maximum optic disc contrast (get the R channel)
  let rgbaPlanes = new cv.MatVector();
  cv.split(src, rgbaPlanes);
  let R = rgbaPlanes.get(0);
  let dst = new cv.Mat();
  // get only the brighter pixels
  cv.threshold(R, dst, 190, 200, cv.THRESH_BINARY); 
  // erode the result
  let kernel = cv.Mat.ones(8, 8, cv.CV_8U);
  let color = new cv.Scalar(0, 255, 0); // green
  cv.erode(dst, dst, kernel, {x: -1, y: -1}, 1, 1, color);  // x: -1, y: -1 refers to the elements center
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  
  let output = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);
  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  cv.drawContours(src, contours, -1, color, 1, cv.LINE_8, hierarchy, 100);


    // highlight disc
    // for (let i = 0; i < opticDisc.cols; ++i) {
    //   let x = opticDisc.data32F[i * 3];
    //   let y = opticDisc.data32F[i * 3 + 1];
    //   let radius = opticDisc.data32F[i * 3 + 2];
    //   let center = new cv.Point(x, y);
    //   cv.circle(dst, center, radius, color, 2);
    // }
    cv.imshow('canvasOutput', src);
    // free up Emscripten memory
    src.delete(); dst.delete(); R.delete(); contours.delete(); hierarchy.delete(); output.delete();
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