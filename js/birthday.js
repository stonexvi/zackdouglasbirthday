const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XLINKS_NAMESPACE = "http://www.w3.org/1999/xlink";
const CONTAINER_DIMENSION = 1000;
const MAIN_CONTAINER_ID = 'birthdayContainer';
let MAIN_CONTAINER = undefined;

// audio
const AUDIO_FILES = {
    baker: 'assets/audio/baker.mp3',
};

const audio = {};

// collision detection
const colliders = [
    // {
    //     radius: 10,
    //     x: 500,
    //     y: 175,
    //     collisionEvent: () => {
    //         const collided = animations.flameCenter;
    //         collided.container.attr({
    //             visibility: 'visible',
    //         });
    //         collided.animation.play();
    //         audio.baker.play();
    //     },
    // }
];

// animations
const ANIMATION_CONFIGS = [
    {
        id: 'flameCenter',
        animationDataId: 'flame',
        scale: 12,
        // playOnIdClick: 'wickCenter',
        x: 450,
        y: 75,
        visibility: 'hidden',
    },
    {
        id: 'flameBottom',
        animationDataId: 'flame',
        scale: 12,
        x: 450,
        y: 200,
    },
];
const animations = {};

// entities 
const entities = {};


// test 
/**
 * Create global accessible variables that will be modified later
 */
 var audioContext = null;
 var meter = null;
 var rafID = null;
 var mediaStreamSource = null;
 let AUDIO_REQUESTED = false;

/**
 * Start 'er up
 */
$(document).ready(function () {
    'use strict';

    // set global elements
    MAIN_CONTAINER = document.getElementById(MAIN_CONTAINER_ID);

    // initialize
    loadEntities().then(() => {
        setupScene();
        // Retrieve AudioContext with all the prefixes of the browsers
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        // Get an audio context
        audioContext = new AudioContext();
    });

});

/**
 * Get the configs for all entities
 * 
 * This is the MAIN configuration hub of the site
 */
 function getEntityConfigs() {
    const entitiesConfig = {
        cake: {
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            svgData: {
                path: 'assets/svg/cake.svg',
            },

            // canvas
            scale: 0.60,
            x: 500,
            y: 350,
        },
        match: {
            // view offset
            viewOffset: {
                x: 69.5,
                y: 488,
            },

            // data
            svgData: {
                path: 'assets/svg/match.svg',
            },

            // drag
            dragCollider: {
                radius: 65,
            },

            // canvas
            scale: 0.20,
            x: 500,
            y: 350,
        },

        // candle flames
        
        // left
        flameLeft: {            
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            animationData: {
                id: 'flame',
            },

            // canvas
            scale: 0.16,
            x: 360,
            y: 150,
            visibility: 'hidden',
        },
        flameLeftIgnition: {            
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            animationData: {
                id: 'ignition',
                loop: false,
            },

            // global collider
            collider: {
                radius: 50,
                onCollision: (colliderId, collidedId) => {
                    lightCandle(colliderId, collidedId);
                }
            },

            // custom
            ignition: {
                flameEntityId: 'flameLeft',
                ignited: false,
            },

            // canvas
            scale: 0.16,
            x: 360,
            y: 150,
            visibility: 'hidden',
        },

        // center
        flameCenter: {            
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            animationData: {
                id: 'flame',
            },

            // canvas
            scale: 0.16,
            x: 505,
            y: 150,
            visibility: 'hidden',
        },
        flameCenterIgnition: {            
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            animationData: {
                id: 'ignition',
                loop: false,
            },

            // global collider
            collider: {
                radius: 50,
                onCollision: (colliderId, collidedId) => {
                    lightCandle(colliderId, collidedId);
                }
            },

            // custom
            ignition: {
                flameEntityId: 'flameCenter',
                ignited: false,
            },

            // canvas
            scale: 0.16,
            x: 505,
            y: 150,
            visibility: 'hidden',
        },


        // right 
        flameRight: {            
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            animationData: {
                id: 'flame',
            },

            // canvas
            scale: 0.16,
            x: 650,
            y: 150,
            visibility: 'hidden',
        },
        flameRightIgnition: {            
            // view offset
            viewOffset: {
                x: 500,
                y: 325,
            },

            // data
            animationData: {
                id: 'ignition',
                loop: false,
            },

            // global collider
            collider: {
                radius: 50,
                onCollision: (colliderId, collidedId) => {
                    lightCandle(colliderId, collidedId);
                    if (!AUDIO_REQUESTED) {
                        requestMicrophone();
                    }
                }
            },

            // custom
            ignition: {
                flameEntityId: 'flameRight',
                ignited: false,
            },

            // canvas
            scale: 0.16,
            x: 650,
            y: 150,
            visibility: 'hidden',
        },

    };

    return entitiesConfig;
}

function setupScene() {
    // animations
    // debugColliders();
}

function lightCandle(colliderId, collidedId) {
    const ignitionEntity = entities[colliderId];

    // only light for a match
    if (collidedId === 'match') {
        const {
            flameEntityId,
            ignited,
        } = ignitionEntity.ignition;
        const flameEntity = entities[flameEntityId];

        if (!ignited) {
            // now we're ignited
            ignitionEntity.ignition.ignited = true;

            const ignitionAnimation = ignitionEntity.animation;
            ignitionAnimation.addEventListener('complete', () => {
                flameEntity.container.attr({
                    visibility: 'visible',
                });
                flameEntity.animation.play();
                ignitionEntity.container.attr({
                    visibility: 'hidden',
                });
            });

            ignitionEntity.container.attr({
                visibility: 'visible',
            });
            ignitionAnimation.play();
        }
    }
}

function loadEntity(config) {
    const {
        // required
        id,
        container,
        svg,
        viewOffset,

        // optional
        parentContainerElement = MAIN_CONTAINER,
        scale = 100,
        x = 0,
        y = 0,
        visibility = 'visible',

        // very optional (would be different classes in true OOP)
        collider = null,
        dragCollider = null,
    } = config;

    // set the svg (we care about the internal width and height here)
    const offset = getEntityOffset({
        scale,
        viewOffset,
    });

    const spaceToContainerX = (x) => x - offset.x;
    const spaceToContainerY = (y) => y - offset.y;

    const containerToSpaceX = (x) => x + offset.x;
    const containerToSpaceY = (y) => y + offset.y;

    svg.attr({
        width: `${scale * 100}%`,
        height: `${scale * 100}%`,
    });

    // set the wrapper container used for positioning
    container.attr({
        id,
        x: spaceToContainerX(x),
        y: spaceToContainerY(y),
        visibility,
    });
    
    // add the element's container to the parent container
    parentContainerElement.appendChild(container[0]);


    // create the entity
    const entity = {
        ...config,

        // functions to get container x and y (from space)
        spaceToContainerX,
        spaceToContainerY,

        // function to get the space x and y (from container)
        containerToSpaceX,
        containerToSpaceY,
    };

    // add collider
    if (collider) {
        const entityCollider = {
            entityId: id,
            radius: collider.radius * scale,
            onCollision: collider.onCollision,
        };

        colliders.push(entityCollider);
        entity.collider = entityCollider;
    }

    // check for drag
    if (dragCollider) {
        entity.dragCollider = {
            radius: dragCollider.radius * scale,
        };
        makeDraggable(entity);
    }


    return entity;
}

/**
 * Load all entities
 */
 async function loadEntities() {
     const entityConfigs = getEntityConfigs();
     for (const [id, config] of Object.entries(entityConfigs)) {
         // load the data
         let container = null;
         let svg = null;
         let animation = null;

        if (config.svgData) {
            const loadedData = await loadSvgData(config.svgData);
            ({
                container,
                svg,
                animation
             } = loadedData);
         } else if (config.animationData) {
            const loadedData = loadAnimationData(config.animationData); 
            ({
                container,
                svg,
                animation,
             } = loadedData);
         }

         // create the entity 
         const entity = loadEntity({
             id,
             svg,
             container,
             animation,
             ...config,
         });

         // set the entity
         entities[id] = entity;
    };

    // load audio
    loadAudio();
 }

 /**
 * Load the SVG Data into a container entity
 */
function loadSvgData(config) {
    const {
        // required
        path,
    } = config;
    
    // load the svg data as a promise
    const svgPromise = new Promise((resolve, reject) => {
        $.get(path, (svgElement) => {
            const svg = $(svgElement.documentElement);
            console.log('SVG Element is: ', svgElement);
            console.log('SVG is: ', svg);
            
            // get the wrapper container used for positioning
            const svgContainerElement = document.createElementNS(SVG_NAMESPACE, 'svg');
            const container = $(svgContainerElement);
            svgContainerElement.appendChild(svg[0]);

            resolve({
                svg,
                container,
            });
        });
    });

    return svgPromise;
}

/**
 * Load and initialize a single animation from the config
 * 
 * @param {Object} config 
 */
 function loadAnimationData(config) {
    const {
        // required
        path,
        id,

        // optional
        loop = true,
        autoplay = false,
    } = config;

    // get the wrapper container used for positioning
    const svgContainerElement = document.createElementNS(SVG_NAMESPACE, 'svg');
    const svgContainer = $(svgContainerElement);

    const animation = lottie.loadAnimation({
        container: svgContainerElement,
        renderer: 'svg',
        loop,
        autoplay,
        animationData: getAnimationData(id),
    });

    // get the animation svg we just appended
    const animationSvg = svgContainer.children().eq(0);

    return {
        container: svgContainer,
        svg: animationSvg,
        animation,
    };
}

 /**
 * Get the Entity Offset
 */
function getEntityOffset(config) {
    const {
        viewOffset,
        scale,
    } = config;


    return {
        x: viewOffset.x * scale,
        y: viewOffset.y * scale,
    };
}

/**
 * Load all audio into memory
 */
function loadAudio() {
    Object.entries(AUDIO_FILES).forEach(([id, file]) => {
        const audioFile = new Audio(file);
        audio[id] = audioFile;
    });
}

/**
 * Get the SVG mouse position from the mouse event
 * 
 * @param {Event} evt 
 * @returns 
 */
function getCanvasMousePosition(evt, svg = MAIN_CONTAINER) {
    const CTM = svg.getScreenCTM();
    
    // check touches for mobile
    const event = evt.touches ? evt.touches[0] : evt;

    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d
    };
  }

/**
 * Make an SVG draggable
 */
function makeDraggable(entity) {
    // turn local variables into state storage via closure
    let selectedElement = null;
    let offset = null;

    const container = entity.container[0];

    // desktop
    container.addEventListener('mousedown', startDrag);
    container.addEventListener('mousemove', drag);
    container.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);

    // mobile
    container.addEventListener('touchstart', startDrag);
    container.addEventListener('touchmove', drag);
    container.addEventListener('touchend', endDrag);
    container.addEventListener('touchleave', endDrag);
    container.addEventListener('touchcancel', endDrag);

    function startDrag(evt) {
        selectedElement = container;
        offset = getCanvasMousePosition(evt);
        offset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
        offset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));
      }

    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            const coord = getCanvasMousePosition(evt);
            const canvasX = coord.x - offset.x;
            const canvasY = coord.y - offset.y;
            entity.x = entity.containerToSpaceX(canvasX);
            entity.y = entity.containerToSpaceY(canvasY);
            selectedElement.setAttributeNS(null, "x", canvasX);
            selectedElement.setAttributeNS(null, "y", canvasY);

            if (entity.debugCollider) {
                entity.debugCollider.setAttributeNS(null, 'cx', entity.x);
                entity.debugCollider.setAttributeNS(null, 'cy', entity.y);
            }

            // check collisions
            colliders.forEach((collider) => {
                const colliderEntity = entities[collider.entityId];
                const collided = (Math.hypot(entity.x - colliderEntity.x, entity.y - colliderEntity.y) < (entity.dragCollider.radius + collider.radius));

                if (collided) {
                    collider.onCollision(collider.entityId, entity.id);
                }
            });
        }
    }

    function endDrag(evt) {
        selectedElement = null;
    }
}

function debugColliders() {
    colliders.forEach((collider) => {
        const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
        const colliderEntity = entities[collider.entityId];
        circle.setAttributeNS(null, 'cx', colliderEntity.x);
        circle.setAttributeNS(null, 'cy', colliderEntity.y);
        circle.setAttributeNS(null, 'r', collider.radius);
        circle.setAttributeNS(null, 'style', 'fill: blue;' );
        MAIN_CONTAINER.appendChild(circle);
    });

    const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
        const matchEntity = entities.match;
        circle.setAttributeNS(null, 'cx', matchEntity.x);
        circle.setAttributeNS(null, 'cy', matchEntity.y);
        circle.setAttributeNS(null, 'r', matchEntity.dragCollider.radius);
        circle.setAttributeNS(null, 'style', 'fill: blue;' );
        MAIN_CONTAINER.appendChild(circle);
    matchEntity.debugCollider = circle;

}



// test
 
 /**
  * Callback triggered if the microphone permission is denied
  */
 function onMicrophoneDenied() {
     alert('Stream generation failed.');
 }
 
 /**
  * Callback triggered if the access to the microphone is granted
  */
 function onMicrophoneGranted(stream) {
     audioContext.resume();
     // Create an AudioNode from the stream.
     mediaStreamSource = audioContext.createMediaStreamSource(stream);
     // Create a new volume meter and connect it.
     meter = createAudioMeter(audioContext);
     mediaStreamSource.connect(meter);
 
     // Trigger callback that shows the level of the "Volume Meter"
     onLevelChange();
 }
 
 /**
  * This function is executed repeatedly
  */
 function onLevelChange(time) {
     // check if we're currently clipping
 
     if (meter.checkClipping()) {
         console.warn(meter.volume);
     } else {
         console.log(meter.volume);
     }
 
     // set up the next callback
     rafID = window.requestAnimationFrame(onLevelChange);
 }
 

 function requestMicrophone() {
    AUDIO_REQUESTED = true;
    // Try to get access to the microphone
    try {
    
        // Retrieve getUserMedia API with all the prefixes of the browsers
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
        // Ask for an audio input
        navigator.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            },
            onMicrophoneGranted,
            onMicrophoneDenied
        );
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	x = buf[i];
    	if (Math.abs(x)>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}