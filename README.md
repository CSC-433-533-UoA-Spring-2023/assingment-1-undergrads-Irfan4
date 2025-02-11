Author: Irfan Ahmad [irfana@arizona.edu]  
Course: Undergrad 433
Date: February 10th, 2025

Executing program: Any web browser with Javascript enabled.


Description:
This project animates an image by rotating it counterclockwise once every approximately 4 seconds.  
This is a 433 undergraduate submission, so the image is not dynamically shrunk to make
its corners fit within the canvas.  It stays the same size consantly and rotates endlessly.
It was noted in the project specifications that having clipped off corners during rotation was acceptable for undergraduate submissions, refer to this:

For Ugrads: The size of the displayed image could stay the same during the animation.
This might mean that depending on the rotation angle θ, not all details of the input
image are shown, and corners might be ’chopped’.

Any ppm image passed in will be resized to 600x600 as per the specification requirements.
Additionally, the functions suggested for use in the specifications were used in this implementation.

Included files (**PLEASE ADD/UPDATE THIS LIST**):
* index.html    -- a sample html file with a canvas
* a01.js        -- a sample javascript file for functionality with the image uploading, and a method to parse PPM images
* MathUtilities.js		-- some math functions that you can use and extend yourself. It contains matrix manipulations
* bunny.ppm     -- a test image


**PLEASE PROVIDE ANY ATTRIBUTION HERE**
* Images obtained from the following sources:
  * bunny: http://graphics.stanford.edu/data/3Dscanrep/  
