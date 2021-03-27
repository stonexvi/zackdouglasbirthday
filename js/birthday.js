const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const XLINKS_NAMESPACE = "http://www.w3.org/1999/xlink";
const CONTAINER_DIMENSION = 1000;
const MAIN_CONTAINER_ID = 'birthdayContainer';
let MAIN_CONTAINER = undefined;

// audio
const AUDIO_FILES = {
    zacky: 'assets/audio/zacky.mp3',
    blowOut: 'assets/audio/blowOutCandles.mp3',
};

const audio = {};

// audio for mic input
let audioContext = null;
let METER = null;
let RAF_ID = null;
let MEDIA_STREAM_SOURCE = null;
let AUDIO_REQUESTED = false;


// drag functionality
let DRAG_ENTITY = null;
let DRAG_OFFSET = null;

// collision detection
const colliders = [];

// entities 
const entities = {};


// scene //

// blowing out candles
const BLOW_MIN = 0.01;
const BLOW_MAX = 0.08;
const BLOW_DURATION = 20;
let blowDuration = 0;
let graceBuffer = 5;

// candles
let CANDLES_UNLIT = 3;

/**
 * Simple Sleep Helper for Async Functions
 * @param {Number} ms 
 */
 function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


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
        registerWindowDragListeners();

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
        flags: {
            // view offset
            viewOffset: {
                x: 500,
                y: 300,
            },

            // data
            svgData: {
                path: 'assets/svg/flags.svg',
            },

            // custom
            visibleHeight: 80,
            hiddenHeight: -110,

            // canvas
            scale: 1.0,
            x: 500,
            y: -110,
        },
        matchBook: {
            // view offset
            viewOffset: {
                x: 700,
                y: 350,
            },

            // data
            svgData: {
                path: 'assets/svg/matchbook.svg',
            },

            // global collider
            collider: {
                circle: {
                    radius: 75,
                },
                onCollision: (colliderId, collidedId) => {
                    lightMatch(colliderId, collidedId);
                }
            },

            // canvas
            scale: 0.18,
            x: 733.4,
            y: 500.8,
        },
        match: {
            // view offset
            viewOffset: {
                x: 339,
                y: 40,
            },

            // data
            svgData: {
                path: 'assets/svg/match.svg',
            },

            // drag
            dragCollider: {
                radius: 45,
            },

            // parenting
            children: {
                // child entity of match
                matchFlame: {            
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
                    scale: 0.07,
                    xOffset: 0,
                    yOffset: 0,
                    visibility: 'hidden',
                },
                matchIgnition: {            
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

                    // canvas
                    scale: 0.07,
                    xOffset: 0,
                    yOffset: 0,
                    visibility: 'hidden',
                },
            },

            // custom
            ignited: false,

            // canvas
            scale: 0.16,
            x: 725,
            y: 435,
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
            scale: 0.08,
            x: 454.5,
            y: 160,
            visibility: 'hidden',
        },
        flameLeftIgnition: {            
            // view offset
            viewOffset: {
                x: 505,
                y: 325,
            },

            // data
            animationData: {
                id: 'ignition',
                loop: false,
            },

            // global collider
            collider: {
                circle: {
                    radius: 30,
                },
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
            scale: 0.08,
            x: 454.5,
            y: 160,
            visibility: 'hidden',
        },

        // center
        flameCenter: {            
            // view offset
            viewOffset: {
                x: 505,
                y: 325,
            },

            // data
            animationData: {
                id: 'flame',
            },

            // canvas
            scale: 0.08,
            x: 495.7,
            y: 152,
            visibility: 'hidden',
        },
        flameCenterIgnition: {            
            // view offset
            viewOffset: {
                x: 505,
                y: 325,
            },

            // data
            animationData: {
                id: 'ignition',
                loop: false,
            },

            // global collider
            collider: {
                circle: {
                    radius: 30,
                },
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
            scale: 0.08,
            x: 495.7,
            y: 152,
            visibility: 'hidden',
        },


        // right 
        flameRight: {            
            // view offset
            viewOffset: {
                x: 505,
                y: 325,
            },

            // data
            animationData: {
                id: 'flame',
            },

            // canvas
            scale: 0.08,
            x: 536.7,
            y: 160,
            visibility: 'hidden',
        },
        flameRightIgnition: {            
            // view offset
            viewOffset: {
                x: 505,
                y: 325,
            },

            // data
            animationData: {
                id: 'ignition',
                loop: false,
            },

            // global collider
            collider: {
                circle: {
                    radius: 30,
                },
                onCollision: (colliderId, collidedId) => {
                    lightCandle(colliderId, collidedId);
                }
            },

            // custom
            ignition: {
                flameEntityId: 'flameRight',
                ignited: false,
            },

            // canvas
            scale: 0.08,
            x: 536.7,
            y: 160,
            visibility: 'hidden',
        },

        // text
        blowOutCandles: {
            // view offset
            viewOffset: {
                x: 500,
                y: 125,
            },

            // data
            animationData: {
                id: 'blowOutCandles',
                loop: false,
            },

            // canvas
            scale: 1.0,
            x: 500,
            y: 65,
        },

        dougs: {
            // view offset
            viewOffset: {
                x: 500,
                y: 125,
            },

            // data
            animationData: {
                id: 'dougs',
                loop: false,
            },

            // canvas
            scale: 1.0,
            x: 500,
            y: 60,
        },

        cantClick: {
            // view offset
            viewOffset: {
                x: 500,
                y: 125,
            },

            // data
            animationData: {
                id: 'cantClick',
                loop: false,
            },

            // canvas
            scale: 1.0,
            x: 500,
            y: 60,
        },

        needToBlow: {
            // view offset
            viewOffset: {
                x: 500,
                y: 125,
            },

            // data
            animationData: {
                id: 'needToBlow',
                loop: false,
            },

            // canvas
            scale: 1.0,
            x: 500,
            y: 60,
        },

    };

    return entitiesConfig;
}

function setupScene() {
    // animations
    // debugCircles();
}

/**
 * Custom Animation for Moving the Flags Down
 */
function animateFlagsDown() {
    const flagsEntity = entities.flags;
    const flagsContainer = flagsEntity.container;

    flagsContainer
        .velocity(
            {
                y: flagsEntity.spaceToContainerY(flagsEntity.visibleHeight + 15),
            },
            { 
                duration: 700, 
                easing: 'ease',
            }
        )
        .velocity(
            {
                y: flagsEntity.spaceToContainerY(flagsEntity.visibleHeight),
            },
            { 
                duration: 400, 
                easing: 'ease',
            }
        );
}

/**
 * Custom Animation for Moving the Flags Back Up
 */
 function animateFlagsUp() {
    const flagsEntity = entities.flags;
    const flagsContainer = flagsEntity.container;

    flagsContainer
        .velocity(
            {
                y: flagsEntity.spaceToContainerY(flagsEntity.hiddenHeight),
            },
            { 
                duration: 500, 
                easing: 'ease',
            }
        );
}

function transitionToTease() {
    // callback heck
    const startTeaseTransition = () => {
        entities.blowOutCandles.container.velocity('fadeOut', {
            duration: 1000,
            complete: dougsTransition,
        });
    };

    const dougsTransition = () => {
        entities.dougs.animation.play();
        entities.dougs.animation.addEventListener('complete', function() {
            entities.dougs.container.velocity('fadeOut', {
                duration: 1000,
                complete: cantClickTransition,
            });
        });
    };

    const cantClickTransition = () => {
        entities.cantClick.animation.play();
        entities.cantClick.animation.addEventListener('complete', function() {
            entities.cantClick.container.velocity('fadeOut', {
                duration: 1000,
                complete: needToBlowTransition,
            });
        });
    };

    const needToBlowTransition = () => {
        entities.needToBlow.animation.play();
        entities.needToBlow.animation.addEventListener('complete', requestMicrophone);
    };

    startTeaseTransition();
}

/**
 * Allow the candle flames to now be clickable
 */
function activateFlameClick() {
    // sort of a hack, should have stored all candle flames in an iterable
    entities.flameLeft.container.click(() => {
        transitionToTease();
    });

    entities.flameCenter.container.click(() => {
        transitionToTease();
    });

    entities.flameRight.container.click(() => {
        transitionToTease();
    });
}

/**
 * Custom animation for the blow out request
 */
function animateBlowOutRequest() {
    const blowOutAnimation = entities.blowOutCandles.animation;
    blowOutAnimation.addEventListener('complete', function() {
        activateFlameClick();
    });

    // play audio and then animation
    audio.blowOut.play();
    blowOutAnimation.play();
}

/**
 * Actions after the cake is lit
 */
async function triggerCakeLit() {
    // fade match group
    entities.match.container.velocity('fadeOut', {
        duration: 2000,
    });
    entities.match.childrenIds.forEach((childId) => {
        entities[childId].container.velocity('fadeOut', {
            duration: 2000,
        });
    });

    // audio
    audio.zacky.addEventListener('ended', async function() {
        animateFlagsUp();
        await sleep(1000);
        animateBlowOutRequest();
    });
    audio.zacky.play();

    // flags
    await sleep(1800);
    animateFlagsDown();
}

/**
 * Light a Match
 * 
 * @param {string} colliderId 
 * @param {string} collidedId 
 */
 function lightMatch(colliderId, collidedId) {
    // only light for a match
    if (collidedId === 'match') {
        const matchEntity = entities.match;
        const matchFlame = entities.matchFlame;
        const matchIgnition = entities.matchIgnition;
        
        if (!matchEntity.ignited) {
            console.log('IGNITING!!:  ', matchEntity.ignited);
            // now we're ignited
            matchEntity.ignited = true;

            const ignitionAnimation = matchIgnition.animation;
            ignitionAnimation.addEventListener('complete', () => {
                matchFlame.container.attr({
                    visibility: 'visible',
                });
                matchFlame.animation.play();
                matchIgnition.container.attr({
                    visibility: 'hidden',
                });
            });

            matchIgnition.container.attr({
                visibility: 'visible',
            });
            ignitionAnimation.play();
        }
    }
}

/**
 * Light a Candle
 * 
 * @param {string} colliderId 
 * @param {string} collidedId 
 */
function lightCandle(colliderId, collidedId) {
    const ignitionEntity = entities[colliderId];

    // only light for a match
    if (
        collidedId === 'match'
        && entities.match.ignited
    ) {
        const {
            flameEntityId,
            ignited,
        } = ignitionEntity.ignition;
        const flameEntity = entities[flameEntityId];

        if (!ignited) {
            // now we're ignited
            ignitionEntity.ignition.ignited = true;

            // move the match to on top (and the match flame on top of that)
            MAIN_CONTAINER.appendChild(entities.match.container[0]);
            MAIN_CONTAINER.appendChild(entities.matchFlame.container[0]);

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

            // check for all candles lit
            CANDLES_UNLIT -= 1;
            if (CANDLES_UNLIT <= 0) {
                triggerCakeLit();
            }
        }
    }
}

function createEntity(config) {
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
            ...collider,
        };

        // scale
        if (collider.circle) {
            entityCollider.circle.radius = collider.circle.radius * scale;
        }

        if (collider.box) {
            entityCollider.box.xRadius = collider.box.xRadius * scale;
            entityCollider.box.yRadius = collider.box.yRadius * scale;
        }

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

    // check for children
    if (config.children) {
        entity.childrenIds = [];
       Object.entries(config.children).forEach(([id, childConfig]) => {
           childConfig.x = x - childConfig.xOffset;
           childConfig.y = y - childConfig.yOffset;
           loadEntity(id, childConfig);
           entity.childrenIds.push(id);
       });
    }


    return entity;
}

async function loadEntity(id, config) {
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
    const entity = createEntity({
        id,
        svg,
        container,
        animation,
        ...config,
    });

    // set the entity
    entities[id] = entity;
}

/**
 * Load all entities
 */
 async function loadEntities() {
     const entityConfigs = getEntityConfigs();
     for (const [id, config] of Object.entries(entityConfigs)) {
         await loadEntity(id, config);
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
            // const svg = $(svgElement);
            
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
 * Register Window Listeners for Drag
 */
function registerWindowDragListeners() {
    // desktop
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onEndDrag);
    window.addEventListener('mouseleave', onEndDrag);

    // mobile
    window.addEventListener('touchmove', onDrag);
    window.addEventListener('touchend', onEndDrag);
    window.addEventListener('touchleave', onEndDrag);
    window.addEventListener('touchcancel', onEndDrag);
}

/**
 * Check for collisions
 */
function checkCollisions(dragEntity) {
    // check collisions
    colliders.forEach((collider) => {
        const colliderEntity = entities[collider.entityId];
        let collided = false;

        // box
        if (collider.box) {
            const {
                xRadius,
                yRadius,
            } = collider.box;

            const xDistance = Math.abs(colliderEntity.x - dragEntity.x) - dragEntity.dragCollider.radius;
            const yDistance = Math.abs(colliderEntity.y - dragEntity.y) - dragEntity.dragCollider.radius;

            console.log('xDistance: ', xDistance);
            console.log('yDistance: ', yDistance);

            if (
                xDistance < xRadius
                && yDistance < yRadius
            ) {
                collided = true
            }
        }

        // circle
        if (collider.circle) {
            collided = (Math.hypot(dragEntity.x - colliderEntity.x, dragEntity.y - colliderEntity.y) < (dragEntity.dragCollider.radius + collider.circle.radius));
        }

        // trigger the collider's collision callback if we've collided with it
        if (collided) {
            collider.onCollision(collider.entityId, dragEntity.id);
        }
    });
}

/**
 * Handle Drag Event
 * 
 * @param {Event} evt 
 */
function onDrag(evt) {
    if (DRAG_ENTITY) {
        // get drag entity container
        const container = DRAG_ENTITY.container[0];

        evt.preventDefault();
        const coord = getCanvasMousePosition(evt);
        const canvasX = coord.x - DRAG_OFFSET.x;
        const canvasY = coord.y - DRAG_OFFSET.y;
        DRAG_ENTITY.x = DRAG_ENTITY.containerToSpaceX(canvasX);
        DRAG_ENTITY.y = DRAG_ENTITY.containerToSpaceY(canvasY);
        container.setAttributeNS(null, "x", canvasX);
        container.setAttributeNS(null, "y", canvasY);

        if (DRAG_ENTITY.childrenIds) {
            DRAG_ENTITY.childrenIds.forEach((id) => {
                const childEntity = entities[id];
                const childContainer = childEntity.container[0];
                childEntity.x = DRAG_ENTITY.x - childEntity.xOffset;
                childEntity.y = DRAG_ENTITY.y - childEntity.yOffset;
                childContainer.setAttributeNS(null, "x", childEntity.spaceToContainerX(childEntity.x));
                childContainer.setAttributeNS(null, "y", childEntity.spaceToContainerY(childEntity.y));
            });
        }

        if (DRAG_ENTITY.debugCircle) {
            DRAG_ENTITY.debugCircle.setAttributeNS(null, 'cx', DRAG_ENTITY.x);
            DRAG_ENTITY.debugCircle.setAttributeNS(null, 'cy', DRAG_ENTITY.y);
        }

        checkCollisions(DRAG_ENTITY);
    }
}

/**
 * Handle End-Of-Drag Event
 * 
 * @param {Event} evt 
 */
function onEndDrag(evt) {
    DRAG_ENTITY = null;
    DRAG_OFFSET = null;
}

/**
 * Make an SVG draggable
 */
function makeDraggable(entity) {
    const container = entity.container[0];

    // desktop
    container.addEventListener('mousedown', startDrag);

    // mobile
    container.addEventListener('touchstart', startDrag);

    function startDrag(evt) {
        DRAG_ENTITY = entity;
        DRAG_OFFSET = getCanvasMousePosition(evt);
        DRAG_OFFSET.x -= parseFloat(container.getAttributeNS(null, "x"));
        DRAG_OFFSET.y -= parseFloat(container.getAttributeNS(null, "y"));
    }
}

function debugCircles() {
    Object.entries(entities).forEach(([id, entity]) => {
        const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
        circle.setAttributeNS(null, 'id', `${id}-circle`);
        circle.setAttributeNS(null, 'cx', entity.x);
        circle.setAttributeNS(null, 'cy', entity.y);

        // default radius
        let radius = 3;

        if (
            entity.collider
            && entity.collider.circle
        ) {
            radius = entity.collider.circle.radius;
        } else if (entity.dragCollider) {
            radius = entity.dragCollider.radius;
        }
        circle.setAttributeNS(null, 'r', radius);
        circle.setAttributeNS(null, 'style', 'fill: blue;' );
        MAIN_CONTAINER.appendChild(circle);
        entity.debugCircle = circle;
    });
}
 
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
     MEDIA_STREAM_SOURCE = audioContext.createMediaStreamSource(stream);
     // Create a new volume meter and connect it.
     METER = createAudioMeter(audioContext);
     MEDIA_STREAM_SOURCE.connect(METER);
 
     // Trigger callback that checks for blowing out the candles
     checkBlowLevel();
 }

 /**
  * Blow out all candles (by turning off their visibility for now)
  */
 function triggerBlowOut() {
     entities.flameRight.animation.stop();
     entities.flameRight.container.attr({
         visibility: 'hidden',
     });

     entities.flameCenter.animation.stop();
     entities.flameCenter.container.attr({
         visibility: 'hidden',
     });

     entities.flameLeft.animation.stop();
     entities.flameLeft.container.attr({
         visibility: 'hidden',
     });
 }
 
 /**
  * Continually check the blow level until the candles are blown out
  */
 function checkBlowLevel(time) {
     if (
         METER.volume > BLOW_MIN
         && METER.volume < BLOW_MAX
     ) {
         blowDuration += 1;
     } else {
         graceBuffer -= 1
         if (graceBuffer <= 0) {
            blowDuration = 0;
            graceBuffer = 30;
         }
     }

     if (blowDuration >= BLOW_DURATION) {
         triggerBlowOut();

         // exit the level check
         return;
     }
 
     // set up the next callback
     RAF_ID = window.requestAnimationFrame(checkBlowLevel);
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