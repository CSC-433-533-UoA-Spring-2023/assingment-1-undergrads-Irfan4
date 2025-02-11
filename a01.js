/*
  Basic File I/O for displaying
  Skeleton Author: Joshua A. Levine
  Modified by: Amir Mohammad Esmaieeli Sikaroudi
  Adapted for 433 HW1 Submission by: Irfan Ahmad
  Email: irfana@arizona.edu
*/

//access DOM elements we'll use
var input = document.getElementById("load_image");
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// The width and height of the image
var width = 0;
var height = 0;
// The image data
var ppm_img_data;

let currentAngle = 0; // Current rotation angle

/**
 * Rotates an image perpendicular to the view axis counter-clockwise.
 * 
 * This function moves the image to the origin, rotates the image accordingly,
 * and then moves it back to the original position.  These matrices create the
 * transformation matrix, which is used to re-map all pixels of the image to their
 * new rotated location.  A transformation matrix is created for each frame of the rotation,
 * using the current angle.
 * 
 * @param - None
 * @returns - None
 */
function rotate() {
    // Create a new image data object to hold the new image
    var newImageData = ctx.createImageData(width, height);

    // Move the image to the origin
    const movedToOrigin = GetTranslationMatrix(-width/2, -height/2);

    // Rotate the image
    const rotated = GetRotationMatrix(currentAngle);

    // Return the image back to the original position
    const returnedFromOrigin = GetTranslationMatrix(width/2, height/2);
    
    // Mix the translation and scale matrices
    let transformationMatrix = MultiplyMatrixMatrix(returnedFromOrigin, MultiplyMatrixMatrix(rotated, movedToOrigin));
    
    // Loop through all the pixels in the image and set its color
    for (var i = 0; i < ppm_img_data.data.length; i += 4) {

        // Get the pixel location in x and y with (0,0) being the top left of the image
        var pixel = [Math.floor(i/4) % width, 
                     Math.floor(i/4 / width), 1];

        // Get the location of the sample pixel
        var samplePixel = MultiplyMatrixVector(transformationMatrix, pixel);

        // Floor pixel to integer
        samplePixel[0] = Math.round(samplePixel[0]);
        samplePixel[1] = Math.round(samplePixel[1]);

        // If the pixel is within the image bounds, only then move the pixel
        if (samplePixel[0] >= 0 && samplePixel[0] < width && 
            samplePixel[1] >= 0 && samplePixel[1] < height) {
            setPixelColor(newImageData, samplePixel, i);
        }
    }

    // Draw the new image
    ctx.putImageData(newImageData, canvas.width/2 - width/2, canvas.height/2 - height/2);
    
    // Show the transformation matrix on HTML
    showMatrix(transformationMatrix);
    
    // Update the angle for the next frame
    currentAngle = (currentAngle + 1) % 360;
    
    // Keep rotating the image
    requestAnimationFrame(rotate);
}

//Function to process upload
var upload = function () {
    if (input.files.length > 0) {
        var file = input.files[0];
        console.log("You chose", file.name);
        if (file.type) console.log("It has type", file.type);
        var fReader = new FileReader();
        fReader.readAsBinaryString(file);

        fReader.onload = function(e) {
            //if successful, file data has the contents of the uploaded file
            var file_data = fReader.result;
            parsePPM(file_data);

            // Resize image to 600x600 if needed
            if (width !== 600 || height !== 600) {

                // Create temporary canvas for resizing
                var tempCanvas = document.createElement('canvas');
                tempCanvas.width = 600;
                tempCanvas.height = 600;
                var tempCtx = tempCanvas.getContext('2d');
                
                // Create 600x600 image object
                var tempImageData = tempCtx.createImageData(600, 600);
                
                var scaleX = width / 600;
                var scaleY = height / 600;
                
                // Iterate through every pixel to rescale image
                for (var y = 0; y < 600; y++) {
                    for (var x = 0; x < 600; x++) {
                        // Round down pixel index
                        var sourceX = Math.floor(x * scaleX);
                        var sourceY = Math.floor(y * scaleY);

                        var sourceIndex = (sourceY * width + sourceX) * 4;
                        var targetIndex = (y * 600 + x) * 4;
                        
                        // Assign RGB values in the original image to the resized image
                        tempImageData.data[targetIndex] = ppm_img_data.data[sourceIndex];
                        tempImageData.data[targetIndex + 1] = ppm_img_data.data[sourceIndex + 1];
                        tempImageData.data[targetIndex + 2] = ppm_img_data.data[sourceIndex + 2];
                        tempImageData.data[targetIndex + 3] = 255;
                    }
                }
                
                width = 600;
                height = 600;
                ppm_img_data = tempImageData; // The actual image is now resized
            }

            // Start the rotation animation now that the image is correctly sized
            currentAngle = 0;
            rotate();
        }
    }
}

// Show transformation matrix on HTML
function showMatrix(matrix){
    for(let i=0;i<matrix.length;i++){
        for(let j=0;j<matrix[i].length;j++){
            matrix[i][j]=Math.floor((matrix[i][j]*100))/100;
        }
    }
    document.getElementById("row1").innerHTML = "row 1:[ " + matrix[0].toString().replaceAll(",",",\t") + " ]";
    document.getElementById("row2").innerHTML = "row 2:[ " + matrix[1].toString().replaceAll(",",",\t") + " ]";
    document.getElementById("row3").innerHTML = "row 3:[ " + matrix[2].toString().replaceAll(",",",\t") + " ]";
}

// Sets the color of a pixel in the new image data
function setPixelColor(newImageData, samplePixel, i){
    var offset = ((samplePixel[1] - 1) * width + samplePixel[0] - 1) * 4;

    // Set the new pixel color
    newImageData.data[i    ] = ppm_img_data.data[offset    ];
    newImageData.data[i + 1] = ppm_img_data.data[offset + 1];
    newImageData.data[i + 2] = ppm_img_data.data[offset + 2];
    newImageData.data[i + 3] = 255;
}

// Load PPM Image to Canvas
// Untouched from the original code
function parsePPM(file_data){
    /*
   * Extract header
   */
    var format = "";
    var max_v = 0;
    var lines = file_data.split(/#[^\n]*\s*|\s+/); // split text by whitespace or text following '#' ending with whitespace
    var counter = 0;
    // get attributes
    for(var i = 0; i < lines.length; i ++){
        if(lines[i].length == 0) {continue;} //in case, it gets nothing, just skip it
        if(counter == 0){
            format = lines[i];
        }else if(counter == 1){
            width = lines[i];
        }else if(counter == 2){
            height = lines[i];
        }else if(counter == 3){
            max_v = Number(lines[i]);
        }else if(counter > 3){
            break;
        }
        counter ++;
    }
    console.log("Format: " + format);
    console.log("Width: " + width);
    console.log("Height: " + height);
    console.log("Max Value: " + max_v);
    /*
     * Extract Pixel Data
     */
    var bytes = new Uint8Array(3 * width * height);  // i-th R pixel is at 3 * i; i-th G is at 3 * i + 1; etc.
    // i-th pixel is on Row i / width and on Column i % width
    // Raw data must be last 3 X W X H bytes of the image file
    var raw_data = file_data.substring(file_data.length - width * height * 3);
    for(var i = 0; i < width * height * 3; i ++){
        // convert raw data byte-by-byte
        bytes[i] = raw_data.charCodeAt(i);
    }
    // update width and height of canvas
    document.getElementById("canvas").setAttribute("width", window.innerWidth);
    document.getElementById("canvas").setAttribute("height", window.innerHeight);
    // create ImageData object
    var image_data = ctx.createImageData(width, height);
    // fill ImageData
    for(var i = 0; i < image_data.data.length; i+= 4){
        let pixel_pos = parseInt(i / 4);
        image_data.data[i + 0] = bytes[pixel_pos * 3 + 0]; // Red ~ i + 0
        image_data.data[i + 1] = bytes[pixel_pos * 3 + 1]; // Green ~ i + 1
        image_data.data[i + 2] = bytes[pixel_pos * 3 + 2]; // Blue ~ i + 2
        image_data.data[i + 3] = 255; // A channel is deafult to 255
    }
    //ppm_img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);   // This gives more than just the image I want??? I think it grabs white space from top left?
    ppm_img_data = image_data;
}

//Connect event listeners
input.addEventListener("change", upload);
