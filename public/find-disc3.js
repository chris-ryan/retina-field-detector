let runOpenCV = function() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';

  let findFirstDisc = (dst, minRadius, maxRadius) => {
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    const contourCount = contours.size();
    for (let i=0; i<contourCount; i++) {
      let contour = contours.get(i);
      let circle = cv.minEnclosingCircle(contour);
      if (circle.radius >= minRadius && circle.radius <= maxRadius) return circle;
      contour.delete();
    }
    contours.delete(); hierarchy.delete();
  } 

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
    let src = cv.imread(imgElement);
    console.log(`loaded image:
    height: ${src.rows} pixels
    width: ${src.cols} pixels`);
    // Colour-transform the image for maximum disc-retina contrast (get the R channel)
    let rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    let R = rgbaPlanes.get(0);
    let retina = new cv.Mat();
  // Crop image to retina border (must be at least 1/2 of the supplied image width)
    cv.threshold(R, retina, 10, 200, cv.THRESH_BINARY);
    let retinalROI = findFirstDisc(retina, src.cols/4, src.cols);
    if (retinalROI !== undefined){
      console.log(`center of retinal image: x:${retinalROI.center.x}, y:${retinalROI.center.y}`);
      let rectROI = new cv.Rect(retinalROI.center.x-retinalROI.radius, retinalROI.center.y-retinalROI.radius, retinalROI.radius*2, retinalROI.radius*2);
      src = src.roi(rectROI);
      R = R.roi(rectROI);
    }
  // Locate the optic disc
    console.log(`cropped image:
    height: ${src.rows} pixels
    width: ${src.cols} pixels`);
    cv.threshold(R, retina, 190, 200, cv.THRESH_BINARY);
    // erode the result
    let kernel = cv.Mat.ones(8, 8, cv.CV_8U);
    let color = new cv.Scalar(255, 0, 0); // red
    // erode x 4, dilate x 2
    cv.erode(retina, retina, kernel, {x: -1, y: -1}, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());  // x: -1, y: -1 refers to the elements center
    cv.morphologyEx(retina, retina, cv.MORPH_OPEN, kernel, {x: -1, y: -1}, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    let opticDisc = findFirstDisc(retina, src.cols/30, src.cols/10.4);
    if (opticDisc !== undefined){
      console.log(`center of optic disc: x:${opticDisc.center.x}, y:${opticDisc.center.y}`);
      cv.circle(src, opticDisc.center, opticDisc.radius, color);
    }
    cv.imshow('canvasOutput', src);
    // free up Emscripten memory
    src.delete(); R.delete(); retina.delete();
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