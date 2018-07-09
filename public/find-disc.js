let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  // define Hough Circle parameters
  const hough = {
    inv_ratio: 1,              // The inverse ratio of resolution
    min_dist: 100,         // Minimum distance between detected centers
    edge_threshold: 75,  // Upper threshold for the internal Canny edge detector
    center_threshold: 40,      // Threshold for center detection
    min_radius: 120,            // Minimum radius to be detected
    max_radius: 280            // Maximum radius to be detected
  }

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
    let src = cv.imread(imgElement);
    // copy the image for displaying transformation
    let dst = src.clone();
    let opticDisc = new cv.Mat();
    let color = new cv.Scalar(255, 0, 0);  // the colour of the circle to be drawn
    // convert the image to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
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
    src.delete(); dst.delete(); opticDisc.delete();
  };
  let imgContainer = document.getElementById('imageContainer').appendChild(imgElement);
}

// load opencv.js dependency into the DOM
const openCVScript = document.createElement("script"); // Make a script DOM node
openCVScript.type = 'text/javascript';
openCVScript.src = 'lib/opencv.js';
//openCVScript.addEventListener('onRuntimeInitialized', runOpenCV);
document.body.appendChild(openCVScript); // add it to the page
// timeout before running opencv to give the wasm binary time to load
setTimeout(runOpenCV, 4000);