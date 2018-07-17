let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
  let src = cv.imread(imgElement);
  // Colour-transform the image for maximum vessel contrast (red-free)
  let rgbaPlanes = new cv.MatVector();
  cv.split(src, rgbaPlanes);
  let redFree = new cv.MatVector();
  let redMask = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
  redFree.push_back(redMask);
  redFree.push_back(rgbaPlanes.get(1)); // green channel
  redFree.push_back(rgbaPlanes.get(2)); // blue channel
  let dst = new cv.Mat(src.rows, src.cols, cv.CV_8UC3);
  cv.merge(redFree, dst);
  cv.cvtColor(dst, dst, cv.COLOR_RGB2GRAY, 3);
  rgbaPlanes.delete(); redFree.delete();

  // Contrast Limited Adaptive Histogram Equalization
  let tileGridSize = new cv.Size(9, 9);
  let clahe = new cv.CLAHE(25, tileGridSize);
  clahe.apply(dst, dst);

  clahe.delete();

   // Threshold
  cv.threshold(dst, dst, 45, 140, cv.THRESH_BINARY);

  let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
  let color = new cv.Scalar(0, 255, 0); // green
  cv.erode(dst, dst, kernel, {x: -1, y: -1}, 5, 1, color);  // x: -1, y: -1 refers to the elements center
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  
  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  cv.drawContours(src, contours, -1, color, 1, cv.LINE_8, hierarchy, 100);

 contours.delete(); hierarchy.delete();

  // Canny Edge detection
  // cv.bitwise_not(dst, dst); // invert the image
  //cv.Canny(dst, dst, 180, 240, 3, false);


  //cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY);
  //cv.adaptiveThreshold(dst, dst, 230, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 9, 3);

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
    src.delete(); dst.delete();
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