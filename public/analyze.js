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

  const findLongestVertex = (vertices) => {
    let longest = {point1: {x: 0, y: 0}, point2: {x: 0, y: 0}, dist: 0};
    for (let i = 0; i < 4; i++) {
      let dist = Math.sqrt((vertices[(i + 1) % 4].x - vertices[i].x)**2 + (vertices[(i + 1) % 4].y - vertices[i].y)**2)
      if (dist > longest.dist) {
        longest.point1.x = vertices[i].x;
        longest.point1.y = vertices[i].y;
        longest.point2.x = vertices[(i + 1) % 4].x;
        longest.point2.y = vertices[(i + 1) % 4].y;
        longest.dist = dist;
      }
    }
    return longest;
  } 

  let imgElement = new Image();
  imgElement.src = 'ODR1.jpg';
  imgElement.onload = function() {
    let src = cv.imread(imgElement);
    console.log(`source image:
    height: ${src.rows} pixels
    width: ${src.cols} pixels`);

    // Split the image channels for optimum object detection
    let rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    // red channel for best disc-retina contrast
    let R = rgbaPlanes.get(0);
    // red-free (blue and green) for maximum vessel & macula contrast (red-free)
    let redFree = new cv.MatVector();
    let redMask = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
    redFree.push_back(redMask);
    redFree.push_back(rgbaPlanes.get(1)); // green channel
    redFree.push_back(rgbaPlanes.get(2)); // blue channel
    let vessels = new cv.Mat(src.rows, src.cols, cv.CV_8UC3);
    cv.merge(redFree, vessels);
    rgbaPlanes.delete();

  // Crop image to retina border (must be at least 1/2 of the supplied image width)
    let retina = new cv.Mat();
    cv.threshold(R, retina, 10, 200, cv.THRESH_BINARY);
    let retinalROI = findFirstDisc(retina, src.cols/4, src.cols);
    if (retinalROI !== undefined){
      console.log(`center of retinal image: x:${retinalROI.center.x}, y:${retinalROI.center.y}`);
      let rectROI = new cv.Rect(retinalROI.center.x-retinalROI.radius, retinalROI.center.y-retinalROI.radius, retinalROI.radius*2, retinalROI.radius*2);
      src = src.roi(rectROI);
      R = R.roi(rectROI);
      vessels = vessels.roi(rectROI);
    }

  // Locate the optic disc
    console.log(`cropped image:
    height: ${src.rows} pixels
    width: ${src.cols} pixels`);
    cv.threshold(R, retina, 190, 200, cv.THRESH_BINARY);
    // erode the result
    let discKernel = cv.Mat.ones(8, 8, cv.CV_8U);
    let color = new cv.Scalar(255, 0, 0); // red
    // erode x 4, dilate x 2
    cv.erode(retina, retina, discKernel, {x: -1, y: -1}, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());  // x: -1, y: -1 refers to the elements center
    cv.morphologyEx(retina, retina, cv.MORPH_OPEN, discKernel, {x: -1, y: -1}, 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    let opticDisc = findFirstDisc(retina, src.cols/30, src.cols/10.4);
    if (opticDisc !== undefined){
      console.log(`center of optic disc: x:${opticDisc.center.x}, y:${opticDisc.center.y}`);
      cv.circle(src, opticDisc.center, opticDisc.radius, color);
    }
    // free up Emscripten memory
    discKernel.delete(); R.delete(); retina.delete();

  // Locate the macula and calculate vessel gradients

    // Contrast Limited Adaptive Histogram Equalization
    let tileGridSize = new cv.Size(9, 9);
    let clahe = new cv.CLAHE(25, tileGridSize);
    cv.cvtColor(vessels, vessels, cv.COLOR_RGB2GRAY, 3);
    clahe.apply(vessels, vessels);
    clahe.delete();
    // Threshold
    cv.threshold(vessels, vessels, 45, 140, cv.THRESH_BINARY_INV);
    // Contour detection
    let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
    cv.erode(vessels, vessels, kernel, {x: -1, y: -1}, 5, 1, color);  // x: -1, y: -1 refers to the elements center
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(vessels, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cv.drawContours(vessels, contours, -1, color, 1, cv.LINE_8, hierarchy, 100);
    for (let i=0; i<contours.size(); i++) {
      let contour = contours.get(i);
      let rect = cv.minAreaRect(contour);
      let rectColor = new cv.Scalar(255, 0, 0); // green
      rect.gradLength = 0;
      let vertices = cv.RotatedRect.points(rect);
  
      // get the length (longest edge) and relative height of the rectangle 
      let length = Math.max(rect.size.width, rect.size.height);
      let height = Math.min(rect.size.width, rect.size.height);
      if (length < vessels.cols/3 && length > vessels.cols / 32 && (length / height) < 1.3)  {
        let macula = cv.minEnclosingCircle(contour);
        cv.circle(src, macula.center, macula.radius, color);
        console.log(`macula.center: x:${macula.center.x}, y:${macula.center.y}`);
      }
      // if the length of the rectangle is at least 4 times the height...
      else if (length > 20 && length >= height * 4) {
        let gradLine = findLongestVertex(vertices);
        cv.line(src, gradLine.point1, gradLine.point2, rectColor, 1, cv.LINE_AA, 0);
      }
      contour.delete();
    }
    contours.delete(); hierarchy.delete(); kernel.delete();

    cv.imshow('canvasOutput', src);
    // free up Emscripten memory
    src.delete(); vessels.delete();
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
// invert the image
    // cv.bitwise_not(dst, dst); 