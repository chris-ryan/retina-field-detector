# Retinal Field Detector

a WebAssembly/OpenCV.js based retinal image analyzer.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

* node (tested to work with Node 8 LTS (8.9.1))


### Installing

After cloning the repo, install the dependencies

```
cd retinal-field-detector
npm install
```

### To run

```
node server.js
```

and go to http://localhost:3000 in your browser.
> NOTE: WebAssembly performance is best on Firefox at time of last submit

The top displays the input image, the botton, the transformed output with detection overlay.

## Editing the image analysis code

public/find-disc.js contains the code for importing, transforming and analyzing the image using Hough Circle Transformation

## Built With

* [OpenCV.js](https://huningxin.github.io/opencv_docs/index.html) - OpenCV 3.3.0-dev