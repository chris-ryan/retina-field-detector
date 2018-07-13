let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  // define Hough Circle parameters
  const hough = {
    inv_ratio: 1,         // The inverse ratio of resolution
    min_dist: 100,        // Minimum distance between detected centers
    edge_threshold: 60,   // Upper threshold for the internal Canny edge detector (the lower the number the less fussy)
    center_threshold: 40, // Threshold for center detection
    min_radius: 40,       // Minimum radius to be detected
    max_radius: 160       // Maximum radius to be detected
  }

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
    let src = cv.imread(imgElement);
    // Colour-transform the image for maximum disc-retina contrast (get the R channel)
    let rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    let R = rgbaPlanes.get(0);
    // let dst = R.clone();
    // get only the brighter pixels
    let dst = new cv.Mat();
    cv.threshold(R, dst, 190, 200, cv.THRESH_BINARY); 
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let output = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let color = new cv.Scalar(0, 255, 0);  // the colour of the circle to be drawn
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    console.log(contours.size());
    const contourCount = contours.size();
    for (let i=0; i<contourCount; i++) {
      // let result = cv.matchShapes(contours.get(i), contours.get(i+5), 1, 0);
      let contour = contours.get(i);
      let hull = new cv.Mat();
      let defect = new cv.Mat();
      cv.convexHull(contour, hull, false, false);
      cv.convexityDefects(contour, hull, defect);
      for (let i = 0; i < defect.rows; ++i) {
        let start = new cv.Point(contour.data32S[defect.data32S[i * 4] * 2],
                                contour.data32S[defect.data32S[i * 4] * 2 + 1]);
        let end = new cv.Point(contour.data32S[defect.data32S[i * 4 + 1] * 2],
                              contour.data32S[defect.data32S[i * 4 + 1] * 2 + 1]);
        let far = new cv.Point(contour.data32S[defect.data32S[i * 4 + 2] * 2],
                              contour.data32S[defect.data32S[i * 4 + 2] * 2 + 1]);
        cv.line(src, start, end, color, 2, cv.LINE_AA, 0);
        // cv.circle(output, far, 3, color, -1);
      }
      contour.delete(); hull.delete(); defect.delete();
      // cv.drawContours(output, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }
    
    
    
    
    // cv.drawContours(output, contours, -1, color, 1, cv.LINE_8, hierarchy, 100);
    // for (let i = 0; i < contours.size(); ++i) {
    //   console.log(cv.contourArea(contours[i]))
    // }
    let opticDisc = new cv.Mat();
    // (x,y),radius = cv.minEnclosingCircle(contours[i])
    // center = (int(x),int(y))
    // radius = int(radius)
    // cv.circle(img,center,radius,(0,255,0),2)

    // cv.HoughCircles(output, opticDisc, cv.HOUGH_GRADIENT, hough.inv_ratio, hough.min_dist, hough.edge_threshold, hough.center_threshold, hough.min_radius, hough.max_radius);
    // highlight disc
    // for (let i = 0; i < opticDisc.cols; ++i) {
    //   console.log('drawing circle');
    //   let x = opticDisc.data32F[i * 3];
    //   let y = opticDisc.data32F[i * 3 + 1];
    //   let radius = opticDisc.data32F[i * 3 + 2];
    //   let center = new cv.Point(x, y);
    //   cv.circle(output, center, radius, color, 2);
    // }
    cv.imshow('canvasOutput', src);
    // free up Emscripten memory
    src.delete(); dst.delete(); R.delete(); opticDisc.delete(); output.delete(); contours.delete();
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