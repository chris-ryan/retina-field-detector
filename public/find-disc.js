let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  // define Hough Circle parameters
  const hough = {
    inv_ratio: 1,         // The inverse ratio of resolution
    min_dist: 100,        // Minimum distance between detected centers
    edge_threshold: 60,   // Upper threshold for the internal Canny edge detector (the lower the number the less fussy)
    center_threshold: 40, // Threshold for center detection
    min_radius: 60,       // Minimum radius to be detected
    max_radius: 160       // Maximum radius to be detected
  }

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
    let src = cv.imread(imgElement);
    let opticDisc = new cv.Mat();
    let color = new cv.Scalar(255, 0, 0);  // the colour of the circle to be drawn
    // Colour-transform the image for maximum disc-retina contrast (get the R channel)
    let rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    let R = rgbaPlanes.get(0);
    let dst = R.clone();
    cv.bitwise_not(R, dst); // invert the image

    cv.HoughCircles(dst, opticDisc, cv.HOUGH_GRADIENT, hough.inv_ratio, hough.min_dist, hough.edge_threshold, hough.center_threshold, hough.min_radius, hough.max_radius);
    // highlight disc
    for (let i = 0; i < opticDisc.cols; ++i) {
      let x = opticDisc.data32F[i * 3];
      let y = opticDisc.data32F[i * 3 + 1];
      let radius = opticDisc.data32F[i * 3 + 2];
      let center = new cv.Point(x, y);
      cv.circle(dst, center, radius, color, 2);
    }
    cv.imshow('canvasOutput', dst);
    // free up Emscripten memory
    src.delete(); dst.delete(); R.delete(); opticDisc.delete();
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