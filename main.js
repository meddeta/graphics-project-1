
var canvas;
var gl;

var program ;

var near = 1;
var far = 100;

// Size of the viewport in viewing coordinates
var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
var controller ;

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );
}

// A helper function that leaves you with the same model matrix that you entered the function with
function undoTransforms(func) {
    gPush();
    func();
    gPop();
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    setColor(materialDiffuse);

    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program);
    Sphere.init(36,program);

    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,"shininess"), materialShininess );

	document.getElementById("sliderXi").oninput = function() {
		RX = this.value ;
		window.requestAnimFrame(render);
	}
		
    
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
        console.log(animFlag) ;
		
		controller = new CameraController(canvas);
		controller.onchange = function(xRot,yRot) {
			RX = xRot ;
			RY = yRot ;
			window.requestAnimFrame(render); };
    };
    render();
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modeling  matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modeling Matrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

// puts the given matrix at the top of the stack MS
function gPut(m) {
	MS.push(m) ;
}

// variables used for bubble timing
var previousTime = 0;
var count = -4;
var prevCount = 4;


// The list of visible (non-destroyed) bubbles
var bubbles = [];


/** A function that deletes bubbles when they should be destroyed
 * and draws the remaining bubbles.
*/
function drawAndUpdateBubbles() {
    bubbles = bubbles.filter(bubble=>!bubble.shouldDestroy());
    for (let bubble of bubbles) {
        bubble.render();
    }
}

// Constants that are used for the character
var variableXYOffset;
const personXOffset = 3.0;
const personZOffset = -3.0;
const personYOffset = 3.0;

const headRadius = 0.2;

const bodyHeight = 1.2;
const bodySideWidth = 0.4;
const bodyFrontWidth = 0.8;

const halfThighFrontWidth = 0.1;
const halfThighSideWidth = 0.1;
const halfThighHeight = 0.3;

const halfCalfFrontWidth = 0.1;
const halfCalfSideWidth = 0.1;
const halfCalfHeight = 0.3;

const halfFootLength = 0.2;
const halfFootWidth = 0.1;
const halfFootHeight = 0.08;

const personOffsetAmplitude = 0.5;
const personMovementPeriod = 13;
const maxBubbleCount = 20;

/**
 * Helper class to implement bubbles
 */
class Bubble {
    constructor(xyOffset, lifeSpan = 12) {
        this.xyOffset = xyOffset;
        this.lifeStartTime = TIME;
        this.lifeSpan = lifeSpan;
    }

    timeAlive() {
        return TIME - this.lifeStartTime;
    }

    shouldDestroy() {
        return this.timeAlive() > this.lifeSpan;
    }

    // Helper function to render a bubble
    render() {
        undoTransforms(() => {
            gTranslate(this.xyOffset, this.timeAlive() * 0.3 + this.xyOffset + bodyHeight / 2 + headRadius, headRadius);
            setColor(vec4(1,1,1,1));
            let scaled = this.timeAlive() * 2;
            // Scaling is adjusted using sinusoid
            gScale(0.02 * Math.sin(scaled) + 0.07, 0.02 * Math.cos(scaled) + 0.07, 0.02 * Math.sin(scaled) + 0.07);
            drawSphere();
        });
    }
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(20,20,20);

    // Start with an empty matrix stack
    MS = [] ; 

    // initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	//projectionMatrix = perspective(45, 1, near, far);

    gRotate(RZ,0,0,1);
    gRotate(RY,0,1,0);
    gRotate(RX,1,0,0);
    
    
    // set all the matrices
    setAllMatrices() ;
    gPush();

    // Function that manages timing of new bubble creation
    const checkCreateBubble = () => {
        if (Math.floor(TIME) != previousTime) {
            count -= 1;

            if (Math.floor(count) != prevCount){
                if (count == -5) count = 4;

                if (count > 0){
                    bubbles.push(new Bubble(variableXYOffset));
                    if (bubbles.count > maxBubbleCount) bubbles.shift();
                }
            }

            previousTime = Math.floor(TIME);
        }
    }
    checkCreateBubble()


    /**
     * This function is responsible for creating the full person's body and animating it
     */
    function drawHuman() {
        undoTransforms(() => {
            variableXYOffset = personOffsetAmplitude * Math.cos((2*Math.PI / personMovementPeriod) * TIME); 
            // Move to the person's body's centre
            gTranslate(personXOffset, personYOffset, personZOffset);
            drawAndUpdateBubbles();
            gTranslate(variableXYOffset, variableXYOffset, 0);
            gRotate(-25, 0, 1, 0);
            setColor(vec4(0.5,0.3,0.7,1));

            // draw body box
            undoTransforms(() => {
                gScale(bodyFrontWidth / 2, bodyHeight / 2, bodySideWidth / 2);
                drawCube();
            })

            // draws the head
            undoTransforms(() => {
                // Translate CS up from mid torso to head centre
                gTranslate(0, bodyHeight/2 + headRadius, 0);
                gScale(headRadius, headRadius, headRadius);
                drawSphere();
            });
            
            // Rotational constants 
            const thighRotAmplitude = 8;
            const thighRotMidpointAngle = 45;
            const calfRotAmplitude = 8;
            const calfRotMidpointAngle = 25;
            const rotPeriod = 4;

            // Each leg uses a cosine function to control rotation
            const drawLeg = (xOffset, flipRot) => {
                let k = Math.PI * 2 / rotPeriod;
                undoTransforms(() => {
                    // translate down to middle of pelvis
                    gTranslate(xOffset, -bodyHeight/2, 0);
                    gRotate((flipRot ? -1 : 1) * thighRotAmplitude * Math.cos(k * TIME) + thighRotMidpointAngle, 1, 0, 0)
                    // Move CS to midpoint of thigh
                    gTranslate(0, -halfThighHeight, 0);

                    // Draw thigh
                    undoTransforms(()=>{
                        gScale(halfThighFrontWidth, halfThighHeight, halfThighSideWidth);
                        drawCube();
                    });

                    // Move CS to between thigh and calf and rotate
                    gTranslate(0, -halfThighHeight, 0);
                    gRotate((flipRot ? -1 : 1) * calfRotAmplitude * Math.cos(k * TIME) + calfRotMidpointAngle, 1, 0, 0);
                    gTranslate(0, -halfCalfHeight, 0);

                    // Draw calf
                    undoTransforms(() => {
                        gScale(halfCalfFrontWidth, halfCalfHeight, halfCalfSideWidth);
                        drawCube();
                    });
                    gTranslate(0, -halfCalfHeight, 0);

                    // Draw foot
                    undoTransforms(()=>{
                        gTranslate(0, -halfFootHeight,halfFootLength/2);
                        gScale(halfFootWidth, halfFootHeight, halfFootLength);
                        drawCube();
                    })

                });
            }
            // Draw each leg with different horizontal offsets and amplitude flipped 
            drawLeg(-bodyFrontWidth/4, false);
            drawLeg(bodyFrontWidth/4, true);
        });
    }

    drawHuman();
    
    // Constants to help with modelling
    const groundBoxThickness = 0.1;
    const bigRockRadius = 0.4;
    const smallRockRadius = 0.25;
    const groundBoxScaleXYHalf = 256;

    function drawGroundWithRocks(){
        // Draw the big rock
        undoTransforms(() => {
            gTranslate(0, bigRockRadius + groundBoxThickness/2, 0);
            setColor(vec4(0.3,0.3,0.3,1.0)) ;
            gScale(bigRockRadius, bigRockRadius, bigRockRadius);
            drawSphere();
        });

        
        // Draw the small rock
        undoTransforms(() => {
            gTranslate(0.75, smallRockRadius + groundBoxThickness/2, 0);
            gScale(smallRockRadius, smallRockRadius, smallRockRadius);
            drawSphere();
        });


        // Draw the ground box
        undoTransforms(() =>{
            gTranslate(0, 0, 0);
            setColor(vec4(0.2,0.2,0.2,1.0)) ;
            gScale(groundBoxScaleXYHalf, 0.05, groundBoxScaleXYHalf);
            // draw the ground cube
            drawCube();
        });
    }

    drawGroundWithRocks();


    /**
     * Seaweed is a hierarchical structure in which each
     * ellipse moves relative to the ellipse below it.
     * The rotation of the ellipse is dependent on its
     * distance along the chain (d = i * l, where i is the 
     * index along the chain and l is the height of the
     * ellipse). and time, and can be given by
     * a sinusoid: sin(d + t).
     * 
     * I find that a limit of +-5 degrees works well, so we
     * can use 5 sin(d + t)
     * 
     * Through testing, I believe the seaweed looks better if
     * the seaweed visually has a full period of the sinusoid at any one time.
     * The period of a sine wave is given by 2pi/k for sin(kx).
     * The full length of the 10 ellipse seaweed is (10 * l),
     * so a scalar value k that gives (10 * l) is 2pi/(10*l) or pi/(5 * l).
     * */

    function drawSeaweed() {
        setColor(vec4(0.0,0.3,0.1,1.0));

        // Constants for rotation and modelling
        const ellipseCount = 10;
        const ellipseHalfHeight = 0.25;
        const ellipseHalfWidth = 0.07;
        const ellipseHeight = ellipseHalfHeight * 2;
        const k = Math.PI / (5 * ellipseHeight);
        undoTransforms(()=>{
            const recursiveHelper = (n) => {
                if (n != 0) {
                    undoTransforms(()=>{
                        let chainIndex = n - ellipseCount;
                        gRotate(5 * Math.sin(k * (chainIndex * (ellipseHeight)) + TIME), 0, 0, 1);
                        undoTransforms(()=>{
                            gScale(ellipseHalfWidth, ellipseHalfHeight, ellipseHalfWidth);
                            drawSphere();
                        })
                        gTranslate(0, ellipseHeight, 0);
                        recursiveHelper(n-1);
                    })
                }
            }
            gTranslate(0, ellipseHalfHeight, 0);
            recursiveHelper(ellipseCount)
        })
    }

    /**
     * Draws 3 strands of seaweed on the large rock at different locations
     */
    function drawAllSeaweed(){
        undoTransforms(()=>{
            gTranslate(0, bigRockRadius * 2, 0);
            drawSeaweed();
        });

        undoTransforms(()=>{
            gTranslate(bigRockRadius, bigRockRadius, 0);
            drawSeaweed();
        });

        undoTransforms(()=>{
            gTranslate(-bigRockRadius, bigRockRadius, 0);
            drawSeaweed();
        });
    }

    drawAllSeaweed();
    
    /**
     * Function that both draws and animates the fish.
     * The fish moves along a circular path around the seaweed
     * with a vertical displacement that ocillates around a midpoint.
     * We can implement the cicular path movement by rotating the
     * fish about an axis that is vertical along the seaweed/rock.
     * Since the large rock has been cebtered at (0, 0, 0), we can simply
     * rotate about (0, 1, 0)
     */
    function drawFish() {

        // Modelling and animation constants constants
        const fishHorizontalDistanceFromMidpoint = 2;
        const fishHeightMidpoint = 2;
        const fishBodyWidthScale = 0.3;
        const fishFaceHeightScale = 0.5;
        const fishBodyHeightScale = 1.25;
        const upperTailHeightScale = 0.7;
        const lowerTailHeightScale = 0.6;
        const upperTailWidthScale = 0.16;
        const lowerTailWidthScale = 0.13;
        const upperTailRotation = -45;
        const lowerTailRotation = 45;
        const tailSwimRotationAmplitude = 45;
        const tailSwimRotationPeriod = 1;
        const timeScale = 15;
        const amplitude = 0.5;
        const eyeSphereScale = 0.08

        // Model CS centered in world space
        undoTransforms(()=>{
            gRotate(-TIME * timeScale, 0, 1, 0);
            gTranslate(fishHorizontalDistanceFromMidpoint, amplitude * Math.sin(TIME) + fishHeightMidpoint, 0)
            // Model matrix is now centered at the middle point between the fish's head and body
            undoTransforms(()=>{
                undoTransforms(()=>{
                    gTranslate(0, 0, fishFaceHeightScale / 2);

                    // Draw face
                    undoTransforms(()=>{
                        gScale(fishBodyWidthScale, fishBodyWidthScale, fishFaceHeightScale);
                        setColor(vec4(0.3,0.3,0.3,1.0));
                        drawCone();
                    })
                    
                    // Helper function to draw a single eye
                    const drawEye = ()=>{
                        setColor(vec4(1,1,1,1.0)) ;
                        undoTransforms(()=> {
                            gScale(eyeSphereScale, eyeSphereScale, eyeSphereScale);
                            drawSphere();
                            gTranslate(0, 0, 0.3);
                            gScale(0.8, 0.8, 0.8);
                            setColor(vec4(0,0,0,1.0));
                            drawSphere();
                        })
                    }

                    // Draw both eyes on the head
                    undoTransforms(()=>{
                        gTranslate(-0.13, 0.2, -0.1);
                        drawEye();
                        gTranslate(0.26, 0, 0);
                        drawEye();
                    });
                        
                
                });

                setColor(vec4(0.4,0,0,1.0));
                gRotate(180, 0, 1, 0);

                // Draw fish body
                undoTransforms(()=>{
                    gTranslate(0, 0, fishBodyHeightScale / 2);
                    gScale(fishBodyWidthScale, fishBodyWidthScale, fishBodyHeightScale)
                    drawCone();
                });

                // Model matrix CS centered around end of fish body
                undoTransforms(()=>{
                    // Model matrix CS centered around base of fish tail
                    gTranslate(0, 0, fishBodyHeightScale)
                    gRotate(tailSwimRotationAmplitude * Math.sin( (Math.PI * 2)/tailSwimRotationPeriod * TIME), 0, 1, 0);

                    // draw upper part of tail
                    undoTransforms(()=>{
                        gRotate(upperTailRotation, 1, 0, 0);
                        gTranslate(0, 0, upperTailHeightScale/2);
                        gScale(upperTailWidthScale, upperTailWidthScale, upperTailHeightScale);
                        drawCone();
                    })
                    
                    // draw lower part of tail
                    undoTransforms(()=>{
                        gRotate(lowerTailRotation, 1, 0, 0);
                        gTranslate(0, 0, lowerTailHeightScale/2);
                        gScale(lowerTailWidthScale, lowerTailWidthScale, lowerTailHeightScale);
                        drawCone();
                    })
                    
                })

            })

        })
        
    }
    
    drawFish();
    
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() / 1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }
   
    
    if( animFlag )
        window.requestAnimFrame(render);
    
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
	var controller = this;
	this.onchange = null;
	this.xRot = 0;
	this.yRot = 0;
	this.scaleFactor = 3.0;
	this.dragging = false;
	this.curX = 0;
	this.curY = 0;
	
	// Assign a mouse down handler to the HTML element.
	element.onmousedown = function(ev) {
		controller.dragging = true;
		controller.curX = ev.clientX;
		controller.curY = ev.clientY;
	};
	
	// Assign a mouse up handler to the HTML element.
	element.onmouseup = function(ev) {
		controller.dragging = false;
	};
	
	// Assign a mouse move handler to the HTML element.
	element.onmousemove = function(ev) {
		if (controller.dragging) {
			// Determine how far we have moved since the last mouse move
			// event.
			var curX = ev.clientX;
			var curY = ev.clientY;
			var deltaX = (controller.curX - curX) / controller.scaleFactor;
			var deltaY = (controller.curY - curY) / controller.scaleFactor;
			controller.curX = curX;
			controller.curY = curY;
			// Update the X and Y rotation angles based on the mouse motion.
			controller.yRot = (controller.yRot + deltaX) % 360;
			controller.xRot = (controller.xRot + deltaY);
			// Clamp the X rotation to prevent the camera from going upside
			// down.
			if (controller.xRot < -90) {
				controller.xRot = -90;
			} else if (controller.xRot > 90) {
				controller.xRot = 90;
			}
			// Send the onchange event to any listener.
			if (controller.onchange != null) {
				controller.onchange(controller.xRot, controller.yRot);
			}
		}
	};
}
