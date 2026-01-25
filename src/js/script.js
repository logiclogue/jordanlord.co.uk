import { CPU6502, ReadWrite } from "https://cdn.jsdelivr.net/npm/6502-emulator@1.0.0/+esm";
import { assemble } from "https://cdn.jsdelivr.net/npm/jsasm6502@1.1.2/+esm";
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import * as msgpack from "https://cdn.jsdelivr.net/npm/@msgpack/msgpack@3.0.0-beta2/+esm";
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({
    startOnLoad: true,
    theme: "dark"
});

// logiclogue-fade component
(function () {
    const fadeElements = document.querySelectorAll(".logiclogue-fade");
    const originalTexts = {};

    fadeElements.forEach((el, index) => {
        // Store original text and clear the element's text
        originalTexts[index] = el.textContent;
        el.textContent = el.textContent.replace(/[^\r\n]/g, ".");

        // Function to reintroduce characters
        function reintroduceCharacters() {
            let currentText = el.textContent;
            let remainingChars = originalTexts[index].split("").filter(char => !currentText.includes(char));

            if (currentText !== originalTexts[index]) {
                el.textContent = el.textContent.split("").map((char, i) => {
                    const rand = Math.random();

                    if (rand > 0.999 && char !== "\n") {
                        return String.fromCharCode(char.charCodeAt(0) + 1);
                    } else if (rand > 0.9) {
                        return originalTexts[index][i];
                    }

                    return char;
                }).join("");
            } else {
                clearInterval(intervalId); // Clear interval when done
            }
        }

        // Start the interval
        let intervalId = setInterval(reintroduceCharacters, 100); // Adjust the tick rate as needed
    });
}());

// Attribution - code inspired by https://github.com/atornblad/zx-spectrumizer
function ZXScreen() {
    const screenWidth = 256;
    const screenHeight = 192;

     // 6144 for bitmap + 768 for attributes
    function getEmptyZxScreen() {
        return new Uint8Array(6912);
    };

    function attrByteToObj(attr) {
        return {
            flash: (attr & 0b10000000) !== 0,
            bright: (attr & 0b01000000) !== 0,
            paper: (attr & 0b00111000) >>> 3,
            ink: attr & 0b00000111
        };
    }

    function displayScreen(ctx, arScr, scrX, scrY, offset = 0) {
        const imageData = ctx.createImageData(screenWidth, screenHeight);
        const data = imageData.data;

        for (let area = 0; area < 3; area++) {
            for (let line = 0; line < 8; line++) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 32; col++) {
                        const index = area * 2048 + (line * 8 + row) * 32 + col;
                        const byte = arScr[offset + index];

                        const attrIndex = area * 256 + row * 32 + col;
                        const attr = arScr[offset + 6144 + attrIndex];
                        const oAttr = attrByteToObj(attr);

                        for (let bit = 0; bit < 8; bit++) {
                            //ctx.fillStyle = getColour(oAttr, (byte >>> (7 - bit)) & 1);
                            const colour = getColour(oAttr, (byte >>> (7 - bit)) & 1);
                            const x = scrX + (col * 8 + bit);
                            const y = scrY + (area * 64 + row * 8 + line);
                            //ctx.fillRect(x, y, 1, 1);

                            const pos = (y * screenWidth + x) * 4;
                            data[pos + 0] = colour.r; // Red
                            data[pos + 1] = colour.g; // Green
                            data[pos + 2] = colour.b; // Blue
                            data[pos + 3] = 255;     // Alpha
                        }
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function getColour(oAttr, bInk) {
        const zxColour = bInk ? oAttr.ink : oAttr.paper;

        return colour(zxColour, oAttr.bright);
    }

    function drawZXScreenDataToCanvas(ctx, screenData, offset) {
        displayScreen(ctx, screenData, 0, 0, offset);
    }

    function getZXScreenIndexes(x, y) {
        // Validate x, y coordinates
        if (x < 0 || x >= screenWidth || y < 0 || y >= screenHeight) {
            throw new Error(`Coordinates out of bounds. ${x}, ${y}`);
        }

        // Calculate area, row, and column
        let area = Math.floor(y / 64);
        let row = Math.floor((y % 64) / 8);
        let col = Math.floor(x / 8);
        let line = y - (area * 64 + row * 8);

        // Pixel data index
        //let pixelIndex = area * 2048 + row * 256 + col * 8 + y % 8;
        let pixelIndex = area * 2048 + (line * 8 + row) * 32 + col;

        // Colour attribute index
        let attrIndex = 6144 + area * 256 + row * 32 + col;

        return { pixelIndex, attrIndex };
    }

    function colour(i, bright) {
        const high = (bright || i > 7) ? 255 : 208;

        // Custom background colour to blend into the website background
        if (i === 0 && (bright === true || bright === false)) {
            return {
                i: 0,
                r: 27,
                g: 29,
                b: 30
            };
        }

        return {
            i: i,
            r: (i & 2) ? high : 0,
            g: (i & 4) ? high : 0,
            b: (i & 1) ? high : 0
        };
    };

    function incrementing(n) {
        return new Array(n).fill().map((_, i) => i);
    };

    const range = function* (start, count) {
        for (let i = start; i < start + count; i++) {
            yield i;
        }
    }

    const colours = incrementing(16).map(colour);

    function rgbToHue(r, g, b) {
        r /= 255, g /= 255, b /= 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const d = max - min;
        const h = (max === min) ? 0 : (max === r) ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : (max === g) ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;

        return h;
    }

    function colourDistance(r, g, b, c) {
        return Math.sqrt(Math.pow(c.r - r, 2) + Math.pow(c.g - g, 2) + Math.pow(c.b - b, 2));
    };

    function colourDistanceWithHue(r, g, b, c) {
        const inputHue = rgbToHue(r, g, b);
        const compareHue = rgbToHue(c.r, c.g, c.b);
        const absDist = Math.abs(inputHue - compareHue);
        const dist = (absDist > 180) ? 360 - absDist : absDist;

        return colourDistance(r, g, b, c) + dist;
    };

    function closestColour(r, g, b, cols) {
        const coloursUsed = cols ?? colours;
        const distance = c => colourDistanceWithHue(r, g, b, c);

        return coloursUsed.reduce((a, b) => distance(a) <= distance(b) ? a : b);
    };

    function convertCanvasToZXScreen(canvas, ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const zxScreenData = getEmptyZxScreen();

        function aToXY(a, p) {
            const { ax, ay } = a;
            const { px, py } = p;

            const x = ax * 8 + px;
            const y = ay * 8 + py;

            const index = (y * canvas.width + x) * 4;

            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];

            const mono = Math.floor((r + g + b) / 3);

            return { x, y, index, r, g, b, mono };
        }

        // Loop through each 8x8 block for attributes
        for (let ay = 0; ay < 24; ay++) {
            for (let ax = 0; ax < 32; ax++) {
                const coloursByIndex = incrementing(16).map(i => 0);

                // Which colours are used in this block?
                for (let py = 0; py < 8; py++) {
                    for (let px = 0; px < 8; px++) {
                        const { x, y, r, g, b, index } = aToXY({ ax, ay }, { px, py });

                        const colour = closestColour(r, g, b);
                        coloursByIndex[colour.i]++;
                    }
                }

                // Are there more bright colours than dark colours?
                const darkPixels = Array.from(range(1,7)).map(i => coloursByIndex[i]).reduce((a, b) => a + b);
                const brightPixels = Array.from(range(9,7)).map(i => coloursByIndex[i]).reduce((a, b) => a + b);
                const bright = brightPixels > darkPixels;

                const localColours = bright ? colours.slice(8, 16) : colours.slice(0, 8);

                // Which colors are used in this block?
                const localColoursByIndex = incrementing(8).map(i => ({
                    i: localColours[i].i,
                    count: 0
                }));

                for (let py = 0; py < 8; py++) {
                    for (let px = 0; px < 8; px++) {
                        const { x, y, r, g, b, index } = aToXY({ ax, ay }, { px, py });
                        const colour = closestColour(r, g, b);

                        localColoursByIndex[colour.i & 7].count++;
                    }
                }

                localColoursByIndex.sort((a, b) => b.count - a.count);

                const blockColours = [colours[localColoursByIndex[0].i], colours[localColoursByIndex[1].i]];

                // Draw the block
                // The most common should be the "zero" bit (the PAPER color)
                const paper = blockColours[0].i;
                const ink = blockColours[1].i;

                const attrByte = (bright ? 0x40 : 0) | ((paper & 0x07) << 3) | (ink & 0x07);

                // Loop through each pixel in the 8x8 block
                for (let py = 0; py < 8; py++) {
                    let pixelByte = 0;
                    const { x, y } = aToXY({ ax, ay }, { px: 0, py });

                    for (let px = 0; px < 8; px++) {
                        const { x, y, r, g, b } = aToXY({ ax, ay }, { px, py });

                        const colour = closestColour(r, g, b, blockColours);

                        if (colour.i == ink) {
                            pixelByte |= 1 << (7 - px);
                        }
                    }

                    const { pixelIndex } = getZXScreenIndexes(x, y);

                    zxScreenData[pixelIndex] = pixelByte;
                }

                const { x, y } = aToXY({ ax, ay }, { px: 0, py: 0 });

                const { attrIndex } = getZXScreenIndexes(x, y);

                zxScreenData[attrIndex] = attrByte;
            }
        }

        return zxScreenData;
    }

    return {
        drawZXScreenDataToCanvas,
        convertCanvasToZXScreen,
        getEmptyZxScreen,
        getZXScreenIndexes
    };
};

const PENTAGON_SCREEN_WIDTH = 256;
const PENTAGON_SCREEN_HEIGHT = 192;
const PENTAGON_OBJ_COUNT = 64;
const PENTAGON_CTR_PTR = 0x0000;
const PENTAGON_OBJ_PTR = 0x0002;
const PENTAGON_GRA_PTR = 0x0004;
const PENTAGON_BSCRLX_PTR = 0x0006;
const PENTAGON_BSCRLY_PTR = 0x0007;
const PENTAGON_WSCRLX_PTR = 0x0008;
const PENTAGON_WSCRLY_PTR = 0x0009;

const PENTAGON_SPRITE_LOC = 0x0000;
const PENTAGON_BACKGROUND_LOC = 0x1000;
const PENTAGON_BACKGROUND_ATTR_LOC = 0x1400;
const PENTAGON_BACKGROUND_WIDTH = 32;
const PENTAGON_BACKGROUND_HEIGHT = 32;
const PENTAGON_WINDOW_LOC = 0x1500;
const PENTAGON_PALETTE_LOC = 0x18c0;

const ezPentagonGenerateImageData = (ctx, ram, ramOffset) => {
    const imageData = ctx.createImageData(PENTAGON_SCREEN_WIDTH, PENTAGON_SCREEN_WIDTH);
    const data = imageData.data;

    const objPtr = ram[ramOffset + PENTAGON_OBJ_PTR] + (ram[ramOffset + PENTAGON_OBJ_PTR + 1] * 0x100);
    const graPtr = ram[ramOffset + PENTAGON_GRA_PTR] + (ram[ramOffset + PENTAGON_GRA_PTR + 1] * 0x100);
    const backgroundPtr = graPtr + PENTAGON_BACKGROUND_LOC;
    const backgroundAttrPtr = graPtr + PENTAGON_BACKGROUND_ATTR_LOC;

    const xScroll = ram[ramOffset + PENTAGON_BSCRLX_PTR];
    const yScroll = ram[ramOffset + PENTAGON_BSCRLY_PTR];

    // Draw background
    for (let x = 0; x < PENTAGON_BACKGROUND_WIDTH; x += 1) {
        for (let y = 0; y < PENTAGON_BACKGROUND_HEIGHT; y += 1) {
            const tile = x + (y * PENTAGON_BACKGROUND_WIDTH);

            const attrIndex = (x >> 1) + ((y >> 1) * (PENTAGON_BACKGROUND_WIDTH >> 1));
            const attrPtr = backgroundAttrPtr + attrIndex;

            const attr = ram[attrPtr];

            const sprite = ram[backgroundPtr + tile];
            // TODO - look up palette
            const palette = attr & 7;

            debugger;
            // TODO - look up attr
            const isHorizontalFlip = 0;
            // TODO - look up attr
            const isVerticalFlip = 0;
            // TODO - look up size
            const size = 0;

            const xPos = ((x * 8) + xScroll) % 256;
            const yPos = ((y * 8) + yScroll) % 256;

            ezPentagonDrawSprite({
                ram,
                graPtr,
                palette,
                xPos,
                yPos,
                isHorizontalFlip,
                isVerticalFlip,
                palette,
                sprite,
                size,
                hasTransparency: false,
                drawPixel: (imageDataIndex, red, green, blue) => {
                    data[imageDataIndex] = red;
                    data[imageDataIndex + 1] = green;
                    data[imageDataIndex + 2] = blue;
                    data[imageDataIndex + 3] = 255;
                }
            })
        }
    }

    // Draw objects
    for (let i = 0; i < PENTAGON_OBJ_COUNT; i += 1) {
        const ptr = objPtr + (i * 4);

        const xPos = ram[ptr];
        const yPos = ram[ptr + 1];
        const attr = ram[ptr + 2];
        const sprite = ram[ptr + 3];

        // Get palette index from sprite attributes (bottom 3 bits)
        const palette = attr & 0x07;

        const isHorizontalFlip = (attr >> 6) & 1;
        const isVerticalFlip = (attr >> 7) & 1;

        ezPentagonDrawSprite({
            ram,
            graPtr,
            palette,
            xPos,
            yPos,
            isHorizontalFlip,
            isVerticalFlip,
            palette,
            sprite,
            size: 0,
            hasTransparency: true,
            drawPixel: (imageDataIndex, red, green, blue) => {
                data[imageDataIndex] = red;
                data[imageDataIndex + 1] = green;
                data[imageDataIndex + 2] = blue;
                data[imageDataIndex + 3] = 255;
            }
        })
    }

    // TODO - draw window

    return imageData;
};

/**
 * ezPentagonGenerateImageData - used for drawing sprites onto image data for
 * the Pentagon graphics layer
 * x - 8byte - x position
 * y - 8byte - y position
 */
const ezPentagonDrawSprite = ({
    ram,
    graPtr,
    isHorizontalFlip,
    isVerticalFlip,
    xPos,
    yPos,
    palette,
    sprite,
    size,
    hasTransparency,
    drawPixel
}) => {
    const spritePtr = graPtr + (sprite * 16);
    const palettePtr = graPtr + PENTAGON_PALETTE_LOC;

    for (let y = 0; y < 8; y += 1) {
        const yOffset = isVerticalFlip ? (7 - y) : y;
        const spriteRowA = ram[spritePtr + yOffset];
        const spriteRowB = ram[spritePtr + yOffset + 8];
        // TODO - 4x4, 8x16, etc (size)

        for (let x = 0; x < 8; x += 1) {
            const imageDataIndex = (((xPos + x) % PENTAGON_SCREEN_WIDTH) + (PENTAGON_SCREEN_WIDTH * ((yPos + y) % PENTAGON_SCREEN_WIDTH))) * 4;

            const xOffset = isHorizontalFlip ? x : (7 - x);

            const spriteBitA = (spriteRowA >> xOffset) & 1;
            const spriteBitB = (spriteRowB >> xOffset) & 1;
            const colourIndex = spriteBitA + (spriteBitB * 2);

            // If the colour is transparent, don't draw
            if (hasTransparency && colourIndex === 0) {
                continue;
            }

            const paletteAddress = palettePtr + (palette * 4) + colourIndex;

            const colourValue = ram[paletteAddress];

            // Extract individual RGB components (2 bits each)
            //const opacity = ((colourValue >> 6) & 0x03) * 85;
            const red = ((colourValue >> 4) & 0x03) * 85;
            const green = ((colourValue >> 2) & 0x03) * 85;
            const blue = (colourValue & 0x03) * 85;

            drawPixel(imageDataIndex, red, green, blue);
        }
    }
};

// RAM
let ram = {};

function getRAM(ramId) {
    if (ram[ramId]) {
        return ram[ramId];
    }

    ram[ramId] = new Uint8ClampedArray(0xffff);

    return ram[ramId];
}

function ramGetShort(ram, ptr) {
    return (ram[ptr] << 8) | ram[ptr + 1];
}

function ramGetArray(ram, ptr, length) {
    return ram.subarray(ptr, ptr + length);
}

function ramSetShort(ram, ptr, short) {
    ram[ptr] = ((short & 0xFF00) >> 8);
    ram[ptr + 1] = (short & 0x00FF);
}

function ramUpdateShort(ram, ptr, f) {
    const value = ramGetShort(ram, ptr);

    ramSetShort(ram, ptr, f(value));
}

function ramUpdateSerialised(ram, ptr, parse, serialise, f) {
    const parsed = parse(ram, ptr);

    const result = f(parsed);

    ramSetArray(ram, ptr, serialise(result));
}

function ramGetByte(ram, ptr) {
    return ram[ptr];
}

function ramSetByte(ram, ptr, byte) {
    ram[ptr] = byte & 0xFF;
}

function ramSetArray(ram, ptr, array) {
    ram.set(array, ptr);
}

function ramUpdateByte(ram, ptr, f) {
    const value = ramGetByte(ram, ptr);

    ramSetByte(ram, ptr, f(value));
}

// logiclogue-zx-screen - for interfacing RAM with a screen
(function () {
    const { getEmptyZxScreen, drawZXScreenDataToCanvas } = ZXScreen();

    const zxCanvases = document.querySelectorAll(".logiclogue-zx-screen");

    zxCanvases.forEach((canvas, index) => {
        const ctx = canvas.getContext("2d");
        let rect = canvas.getBoundingClientRect();

        const ram = getRAM(canvas.dataset.ramId || "default");
        const ramOffset = parseInt(canvas.dataset.ramOffset || "0x4000");

        drawZXScreenDataToCanvas(ctx, ram, ramOffset);

        setInterval(() => {
            rect = canvas.getBoundingClientRect();
        }, 1000);

        canvas.addEventListener("mousemove", e => {
            const x = Math.floor(((e.clientX - rect.left) / rect.width) * 256);
            const y = Math.floor(((e.clientY - rect.top) / rect.height) * 192);

            ram[0x3FFE] = x;
            ram[0x3FFF] = y;
        });

        canvas.addEventListener("mousedown", e => {
            ram[0x3FFD] = 1;
        });

        canvas.addEventListener("mouseup", e => {
            ram[0x3FFD] = 0;
        });

        function animate() {
            drawZXScreenDataToCanvas(ctx, ram, ramOffset);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });
}());

// logiclogue-ez-pentagon-screen - for more advanced graphics, named after the spectrum clone
(function () {
    const canvases = document.querySelectorAll(".logiclogue-ez-pentagon-screen");

    canvases.forEach((canvas, index) => {
        const ram = getRAM(canvas.dataset.ramId || "default");
        const ramOffset = parseInt(canvas.dataset.ramOffset || "0x2000");

        const ctx = canvas.getContext("2d");

        function animate() {
            const imageData = ezPentagonGenerateImageData(ctx, ram, ramOffset);

            ctx.putImageData(imageData, 0, 0);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });
}());

const SUSA_OBJ_COUNT = 512;
const SUSA_BACKGROUND_WIDTH = 64;
const SUSA_BACKGROUND_HEIGHT = 64;

const SUSA_CTRL_PTR = 0x1000;
const SUSA_STATUS_PTR = 0x1001;
const SUSA_OSCRLY = 0x1004;
const SUSA_BSCRLX = 0x1006;
const SUSA_BSCRLY = 0x1008;
const SUSA_WSCRLX = 0x100a;
const SUSA_WSCRLY = 0x100c;
const SUSA_SWIDTH = 0x100e;
const SUSA_SHIGHT = 0x1010;
const SUSA_TICKKK = 0x1012;
const SUSA_MILLIS = 0x1014;
const SUSA_MOUSEX = 0x1016;
const SUSA_MOUSEY = 0x1018;
const SUSA_KEYPRA = 0x101a;
const SUSA_KEYPRB = 0x101b;
const SUSA_SPALET = 0x1020;
const SUSA_BPALET = 0x1040;

const SUSA_SPRITE_PTR = 0x2000;
const SUSA_OBJECT_PTR = 0x6000;
const SUSA_BACKGR_PTR = 0x7000;
const SUSA_WINDOW_PTR = 0x8000;
const SUSA_UNALLO_PTR = 0x9000;

const susaObjectGet = (ram, ptr) => {
    const subarray = ramGetArray(ram, ptr, 8);

    const view = new DataView(subarray.slice().buffer);

    const xPos = view.getUint16(0, true);
    const yPos = view.getUint16(2, true);

    const attAByte = view.getUint8(4);
    const attA = {
        textMode: (attAByte >> 7) & 0x1 ? true : false,
        twoColour: (attAByte >> 6) & 0x1 ? true : false,
        mode: (attAByte >> 4) & 0x3,
        palette: attAByte & 0xF,
    };

    const attBByte = view.getUint8(5);
    const attB = {
        transparency: (attBByte >> 7) & 0x1 ? true : false,
        scrollMode: (attBByte >> 5) & 0x3,
        flipV: (attBByte >> 4) & 0x1 ? true : false,
        flipH: (attBByte >> 3) & 0x1 ? true : false,
        priority: attBByte & 0x3,
    };

    const addr = view.getUint16(6, true);

    return { xPos, yPos, attA, attB, addr };
};

const susaStringGet = (ram, ptr) => {
    const length = ram[ptr];

    const array = ram.slice(ptr + 1, ptr + length + 1);

    const str = new TextDecoder("ascii").decode(array);

    return str;
};

const susaObjectSerialise = ({ xPos, yPos, attA, attB, addr }) => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);

    view.setUint16(0, xPos, true);
    view.setUint16(2, yPos, true);

    // attA: build bit-packed value
    let attAByte = 0;
    attAByte |= (attA.textMode & 0x1) << 7;
    attAByte |= (attA.twoColour & 0x1) << 6;
    attAByte |= (attA.mode & 0x3) << 4;
    attAByte |= (attA.palette & 0xF);
    view.setUint8(4, attAByte);

    // attB: build bit-packed value
    let attBByte = 0;
    attBByte |= (attB.transparency & 0x1) << 7;
    attBByte |= (attB.scrollMode & 0x3) << 5;
    attBByte |= (attB.flipV & 0x1) << 4;
    attBByte |= (attB.flipH & 0x1) << 3;
    attBByte |= (attB.priority & 0x3);
    view.setUint8(5, attBByte);

    view.setUint16(6, addr, true);

    return new Uint8Array(buffer);
};

const susaStringSerialise = (str) => {
    const array = new Uint8ClampedArray(str.length + 1);

    array[0] = str.length;
    array.set(Uint8Array.from(str.split("").map(x => x.charCodeAt())), 1);

    return array;
};

const ezSusaGenerateImageData = (ctx, ram) => {
    const screenWidth = ramGetShort(ram, SUSA_SWIDTH);
    const screenHeight = ramGetShort(ram, SUSA_SHIGHT);

    const imageData = ctx.createImageData(screenWidth, screenHeight);
    const data = imageData.data;

    const xBackgroundScroll = ramGetShort(ram, SUSA_BSCRLX);
    const yBackgroundScroll = ramGetShort(ram, SUSA_BSCRLY);

    // Draw background
    for (let x = 0; x < SUSA_BACKGROUND_WIDTH; x += 1) {
        for (let y = 0; y < SUSA_BACKGROUND_HEIGHT; y += 1) {
            const tile = x + (y * SUSA_BACKGROUND_WIDTH);

            const attrIndex = tile * 2;
            const attrPtr = SUSA_BACKGR_PTR + attrIndex;

            const spriteIndex = ram[attrPtr];
            const attr = ram[attrPtr + 1];
            const spriteSheet = attr & 0b00000011;
            const palette = 8 + ((attr & 0b00011100) >> 2);

            const sprite = spriteIndex | (spriteSheet << 8);

            const isHorizontalFlip = ((attr & 0b01000000) >> 5) ? true : false;
            const isVerticalFlip = ((attr & 0b10000000) >> 7) ? true : false;
            const xPos = ((x * 8) + xBackgroundScroll + 8) % (SUSA_BACKGROUND_WIDTH * 8) - 8;
            const yPos = ((y * 8) + yBackgroundScroll + 8) % (SUSA_BACKGROUND_HEIGHT * 8) - 8;

            ezSusaDrawSprite({
                ram,
                palette,
                xPos,
                yPos,
                isHorizontalFlip,
                isVerticalFlip,
                sprite,
                drawPixel: (imageDataIndex, red, green, blue) => {
                    data[imageDataIndex] = red;
                    data[imageDataIndex + 1] = green;
                    data[imageDataIndex + 2] = blue;
                    data[imageDataIndex + 3] = 255;
                }
            });
        }
    }

    // Draw objects
    for (let i = 0; i < SUSA_OBJ_COUNT; i += 1) {
        const ptr = SUSA_OBJECT_PTR + (i * 8);

        const { xPos, yPos, attA, attB, addr } = susaObjectGet(ram, ptr);

        const sprite = attA.twoColour
            ? (addr - SUSA_SPRITE_PTR) >> 3
            : (addr - SUSA_SPRITE_PTR) >> 4;

        if (sprite < 0) {
            break;
        }

        if (attA.textMode) {
            ezSusaDrawText({
                ram,
                palette: attA.palette,
                xPos,
                yPos,
                isTransparent: attB.transparency,
                textPtr: addr,
                mode: attA.mode,
                drawPixel: (imageDataIndex, red, green, blue) => {
                    data[imageDataIndex] = red;
                    data[imageDataIndex + 1] = green;
                    data[imageDataIndex + 2] = blue;
                    data[imageDataIndex + 3] = 255;
                }
            });
        } else {
            ezSusaDrawCompositeSprite({
                ram,
                palette: attA.palette,
                xPos,
                yPos,
                isTransparent: attB.transparency,
                isHorizontalFlip: attB.flipH,
                isVerticalFlip: attB.flipV,
                sprite,
                mode: attA.mode,
                isTwoColours: attA.twoColour,
                drawPixel: (imageDataIndex, red, green, blue) => {
                    data[imageDataIndex] = red;
                    data[imageDataIndex + 1] = green;
                    data[imageDataIndex + 2] = blue;
                    data[imageDataIndex + 3] = 255;
                }
            })
        }
    }

    // TODO - draw window

    return imageData;
};

/*
 * ezSusaDrawSprite - used for drawing sprites onto image data for the Susa
 * advanced graphics layer
 */
const ezSusaDrawSprite = ({
    ram,
    isHorizontalFlip,
    isVerticalFlip,
    xPos,
    yPos,
    palette,
    sprite,
    isTransparent,
    isTwoColours,
    xStart,
    xEnd,
    drawPixel
}) => {
    const spriteSize = isTwoColours ? 8 : 16;

    const screenWidth = ramGetShort(ram, SUSA_SWIDTH);
    const screenHeight = ramGetShort(ram, SUSA_SHIGHT);
    const spritePtr = SUSA_SPRITE_PTR + (sprite * spriteSize);

    for (let y = 0; y < 8; y += 1) {
        const yOffset = isVerticalFlip ? (7 - y) : y;
        const spriteRowA = ram[spritePtr + yOffset];
        const spriteRowB = ram[spritePtr + yOffset + 8];

        for (let x = xStart || 0; x < (xEnd || 8); x += 1) {
            const thisX = xPos + x;
            const thisY = yPos + y;

            if (thisX < 0 || thisX >= screenWidth || thisY < 0 || thisY >= screenHeight) {
                continue;
            }

            const imageDataIndex = (thisX + (screenWidth * thisY)) * 4;

            const xOffset = isHorizontalFlip ? x : (7 - x);

            const spriteBitA = (spriteRowA >> xOffset) & 1;
            const spriteBitB = isTwoColours ? 0 : (spriteRowB >> xOffset) & 1;
            const colourIndex = spriteBitA + (spriteBitB * 2);

            const paletteAddress = SUSA_SPALET + (palette * 4) + colourIndex;

            const colourValue = ram[paletteAddress];

            const red = ((colourValue >> 4) & 0x03) * 85;
            const green = ((colourValue >> 2) & 0x03) * 85;
            const blue = (colourValue & 0x03) * 85;

            if (colourIndex === 0 && isTransparent) {
                continue;
            }

            drawPixel(imageDataIndex, red, green, blue);
        }
    }
};

/*
 * ezSusaDrawCompositeSprite - used for drawing sprites by mode, uses
 * ezSusaDrawSprite
 */
const ezSusaDrawCompositeSprite = ({
    ram,
    isHorizontalFlip,
    isVerticalFlip,
    xPos,
    yPos,
    palette,
    sprite,
    mode,
    isTransparent,
    isTwoColours,
    drawPixel
}) => {
    const is16width = mode & 0b10;
    const is16height = mode & 0b01;
    const spritesOnRow = isTwoColours ? 32 : 16;

    // top left sprite
    ezSusaDrawSprite({
        ram,
        isHorizontalFlip,
        isVerticalFlip,
        xPos: isHorizontalFlip && is16width ? xPos + 8 : xPos,
        yPos: isVerticalFlip && is16height ? yPos + 8 : yPos,
        palette,
        sprite,
        isTransparent,
        isTwoColours,
        drawPixel
    });

    // bottom left sprite
    if (mode & 0b01) {
        ezSusaDrawSprite({
            ram,
            isHorizontalFlip,
            isVerticalFlip,
            xPos: isHorizontalFlip && is16width ? xPos + 8 : xPos,
            yPos: isVerticalFlip && is16height ? yPos : yPos + 8,
            palette,
            sprite: sprite + spritesOnRow,
            isTransparent,
            isTwoColours,
            drawPixel
        });
    }

    // top right sprite
    if (mode & 0b10) {
        ezSusaDrawSprite({
            ram,
            isHorizontalFlip,
            isVerticalFlip,
            xPos: isHorizontalFlip && is16width ? xPos : xPos + 8,
            yPos: isVerticalFlip && is16height ? yPos + 8 : yPos,
            palette,
            sprite: sprite + 1,
            isTransparent,
            isTwoColours,
            drawPixel
        });
    }

    // bottom right sprite
    if (mode === 0b11) {
        ezSusaDrawSprite({
            ram,
            isHorizontalFlip,
            isVerticalFlip,
            xPos: isHorizontalFlip && is16width ? xPos : xPos + 8,
            yPos: isVerticalFlip && is16height ? yPos : yPos + 8,
            palette,
            sprite: sprite + spritesOnRow + 1,
            isTransparent,
            isTwoColours,
            drawPixel
        });
    }
};

/*
 * ezSusaDrawText - used for drawing text, uses ezSusaDrawSprite
 */
const ezSusaDrawText = ({
    ram,
    palette,
    xPos,
    yPos,
    isTransparent,
    textPtr,
    mode,
    drawPixel
}) => {
    const length = ram[textPtr];

    // TODO - use mode

    for (let i = 0; i < length; i += 1) {
        const charCode = ram[textPtr + i + 1];

        ezSusaDrawSprite({
            ram,
            isHorizontalFlip: false,
            isVerticalFlip: false,
            // TODO - alternate
            xPos: charCode % 2 ? xPos + (i * 4) - 4 : xPos + (i * 4),
            yPos,
            palette,
            sprite: charCode >> 1,
            mode: 1,
            isTransparent,
            isTwoColours: true,
            xStart: charCode % 2 ? 4 : 0,
            xEnd: charCode % 2 ? 8 : 4,
            drawPixel
        });
    }
};

const ezSusaRunSampleLogic = ram => {
    const mouseObjectPtr = SUSA_OBJECT_PTR;

    const font = [
        0x06, 0x09, 0x0F, 0x09, 0x09, 0x0F, 0x06, 0x00,
        0x60, 0xFA, 0x9E, 0xFE, 0xFE, 0x94, 0x64, 0x00,
        0x44, 0x44, 0xEA, 0xEA, 0xE4, 0x44, 0x4E, 0x00,
        0x40, 0x40, 0xE4, 0xEE, 0xEE, 0x44, 0xE0, 0x00,
        0xF0, 0xF0, 0xB4, 0x1A, 0x1A, 0xB4, 0xF0, 0xF0,
        0xFF, 0xFF, 0xBB, 0x55, 0x55, 0xBB, 0xFF, 0xFF,
        0x07, 0x45, 0xA7, 0xA4, 0x44, 0xEC, 0x4C, 0x00,
        0x74, 0x5D, 0x56, 0x5F, 0x56, 0xFB, 0xF2, 0x00,
        0x81, 0xC3, 0xE7, 0xFF, 0xE7, 0xC3, 0x81, 0x00,
        0x6A, 0xFA, 0x6A, 0x6A, 0x6A, 0xF0, 0x6A, 0x00,
        0x77, 0xB8, 0xB6, 0x79, 0x39, 0x36, 0x31, 0x0E,
        0x06, 0x0F, 0x06, 0x06, 0x06, 0xFF, 0xF6, 0x0F,
        0x66, 0xF6, 0x66, 0x66, 0x66, 0x6F, 0x66, 0x00,
        0x00, 0x00, 0x24, 0xFF, 0xFF, 0x24, 0x00, 0x00,
        0x00, 0x00, 0x06, 0x0F, 0x86, 0xF0, 0x00, 0x00,
        0x00, 0x6F, 0x6F, 0x6F, 0xF6, 0xF6, 0xF6, 0x00,
        0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04, 0x00, //  , !
        0xA0, 0xAA, 0xAE, 0x0A, 0x0E, 0x0A, 0x00, 0x00, // ", #
        0x4A, 0xE2, 0x84, 0x44, 0x24, 0xE8, 0x4A, 0x00, // $, %
        0x46, 0xA2, 0xA4, 0x40, 0x50, 0xA0, 0xE0, 0x30, // &, '
        0x28, 0x44, 0x82, 0x82, 0x82, 0x44, 0x28, 0x00, // (, )
        0x00, 0xA4, 0x44, 0xEE, 0x44, 0xA4, 0x00, 0x00, // *, +
        0x00, 0x00, 0x00, 0x0E, 0x00, 0x60, 0x20, 0x40, // ,, -
        0x02, 0x02, 0x04, 0x04, 0x04, 0x48, 0x48, 0x00, // ., /
        0x44, 0xAC, 0xE4, 0xE4, 0xA4, 0xA4, 0x4E, 0x00, // 0, 1
        0x44, 0xAA, 0x22, 0x44, 0x42, 0x8A, 0xE4, 0x00, // 2, 3
        0x2E, 0xA8, 0xAC, 0xE2, 0x22, 0x2A, 0x24, 0x00, // 4, 5
        0x4E, 0xA2, 0x82, 0xC4, 0xA4, 0xA8, 0x48, 0x00, // 6, 7
        0x44, 0xAA, 0xAA, 0x46, 0xA2, 0xAA, 0x44, 0x00, // 8, 9
        0x00, 0x44, 0x44, 0x00, 0x00, 0x44, 0x44, 0x08, // :, ;
        0x10, 0x20, 0x4E, 0x80, 0x4E, 0x20, 0x10, 0x00, // <, =
        0x84, 0x4A, 0x22, 0x14, 0x24, 0x40, 0x84, 0x00, // >, ?
        0x44, 0xAA, 0xAA, 0xEE, 0xEA, 0x8A, 0x6A, 0x00, // @, A
        0xC4, 0xAA, 0xA8, 0xC8, 0xA8, 0xAA, 0xC4, 0x00, // B, C
        0xCE, 0xA8, 0xA8, 0xAC, 0xA8, 0xA8, 0xCE, 0x00, // D, E
        0xE4, 0x8A, 0x88, 0xCE, 0x8A, 0x8A, 0x84, 0x00, // F, G
        0xAE, 0xA4, 0xA4, 0xE4, 0xA4, 0xA4, 0xAE, 0x00, // H, I
        0x2A, 0x2A, 0x2C, 0x2C, 0x2A, 0xAA, 0x4A, 0x00, // J, K
        0x8A, 0x8E, 0x8E, 0x8E, 0x8A, 0x8A, 0xEA, 0x00, // L, M
        0x2E, 0xAA, 0xEA, 0xEA, 0xEA, 0xAA, 0xAE, 0x00, // N, O
        0xC4, 0xAA, 0xAA, 0xCA, 0x8A, 0x8A, 0x84, 0x02, // P, Q
        0xC4, 0xAA, 0xA8, 0xC4, 0xA2, 0xAA, 0xA4, 0x00, // R, S
        0xEA, 0x4A, 0x4A, 0x4A, 0x4A, 0x4A, 0x4E, 0x00, // T, U
        0xAA, 0xAA, 0xAA, 0xAA, 0xAE, 0x4E, 0x4A, 0x00, // V, W
        0xAA, 0xAA, 0xEA, 0x44, 0xE4, 0xA4, 0xA4, 0x00, // X, Y
        0xE6, 0x24, 0x44, 0x44, 0x44, 0x84, 0xE6, 0x00, // Z, [
        0x06, 0x82, 0x82, 0x42, 0x42, 0x22, 0x26, 0x00, // \, ]
        0x00, 0x40, 0xE0, 0xA0, 0x00, 0x00, 0x00, 0x0F, // ^, _
        0x60, 0x40, 0x2C, 0x02, 0x06, 0x0A, 0x06, 0x00, // `, a
        0x80, 0x80, 0xC4, 0xAA, 0xA8, 0xAA, 0xC4, 0x00, // b, c
        0x20, 0x20, 0x64, 0xAA, 0xAE, 0xA8, 0x66, 0x00, // d, e
        0x20, 0x40, 0x46, 0xEA, 0x4A, 0x46, 0x42, 0x0C, // f, g
        0x84, 0x80, 0xCC, 0xA4, 0xA4, 0xA4, 0xA4, 0x00, // h, i
        0x28, 0x08, 0x2A, 0x2A, 0x2C, 0x2A, 0xAA, 0x40, // j, k
        0xC0, 0x40, 0x4A, 0x4E, 0x4E, 0x4A, 0xEA, 0x00, // l, m
        0x00, 0x00, 0xC4, 0xAA, 0xAA, 0xAA, 0xA4, 0x00, // n, o
        0x00, 0x00, 0xC6, 0xAA, 0xAA, 0xC6, 0x82, 0x83, // p, q
        0x00, 0x00, 0xC6, 0xA8, 0x84, 0x82, 0x8C, 0x00, // r, s
        0x00, 0x40, 0xEA, 0x4A, 0x4A, 0x4A, 0x26, 0x00, // t, u
        0x00, 0x00, 0xAA, 0xAA, 0xAE, 0x4E, 0x4A, 0x00, // v, w
        0x00, 0x00, 0xAA, 0xAA, 0x4A, 0xA6, 0xA2, 0x0C, // x, y
        0x02, 0x04, 0xE4, 0x28, 0x44, 0x84, 0xE2, 0x00, // z, {
        0x48, 0x44, 0x44, 0x02, 0x44, 0x44, 0x48, 0x00, // |, }
        0x50, 0xA0, 0x04, 0x04, 0x0A, 0x0A, 0x0E, 0x00
    ];

    // init
    if (!ram[0x0000]) {
        ram.set(font, SUSA_SPRITE_PTR);

        // set palette
        ram[SUSA_SPALET + 0] = 0x00;
        ram[SUSA_SPALET + 1] = 0xf0;
        ram[SUSA_SPALET + 2] = 0x0f;
        ram[SUSA_SPALET + 3] = 0xff;

        ram[SUSA_BPALET + 0] = 0x40;
        ram[SUSA_BPALET + 1] = 0x0f;
        ram[SUSA_BPALET + 2] = 0xf0;
        ram[SUSA_BPALET + 3] = 0xff;

        // set background to that sprite
        for (let x = 0; x < SUSA_BACKGROUND_WIDTH; x += 1) {
            for (let y = 0; y < SUSA_BACKGROUND_HEIGHT; y += 1) {
                const i = x + (y * SUSA_BACKGROUND_WIDTH);

                // set the sprite
                ram[SUSA_BACKGR_PTR + (i * 2)] = Math.floor(Math.random() * 5);
                // set the attribute
                ram[SUSA_BACKGR_PTR + (i * 2) + 1] = 0b00000000;
            }
        }

        ram.set(susaStringSerialise("Hey there!"), SUSA_UNALLO_PTR);

        ramUpdateSerialised(ram, mouseObjectPtr, susaObjectGet, susaObjectSerialise, () => {
            return {
                xPos: 0,
                yPos: 0,
                attA: {
                    textMode: false,
                    twoColour: true,
                    mode: 3,
                    palette: 0
                },
                attB: {
                    transparency: false,
                    scrollMode: 0,
                    flipV: 0,
                    flipH: 0,
                    priority: 0
                },
                addr: SUSA_SPRITE_PTR + 0
            };
        });

        ramUpdateSerialised(ram, SUSA_OBJECT_PTR + 8, susaObjectGet, susaObjectSerialise, () => {
            return {
                xPos: 0,
                yPos: 0,
                attA: {
                    textMode: true,
                    twoColour: true,
                    mode: 0,
                    palette: 0
                },
                attB: {
                    transparency: false,
                    scrollMode: 0,
                    flipV: 0,
                    flipH: 0,
                    priority: 0
                },
                addr: SUSA_UNALLO_PTR + 0
            };
        });

        ram[0x0000] = 1;
    }

    ramUpdateShort(ram, SUSA_BSCRLX, () => {
        //const tick = ramGetShort(ram, SUSA_TICKKK);

        //return tick >> 3;

        //return 0;
        return Math.floor(ramGetShort(ram, SUSA_MOUSEX) / 8);
    });

    ramUpdateShort(ram, SUSA_BSCRLY, () => {
        //const tick = ramGetShort(ram, SUSA_TICKKK);

        //return tick >> 3;

        return Math.floor(ramGetShort(ram, SUSA_MOUSEY) / 8);
    });

    ramUpdateSerialised(ram, mouseObjectPtr, susaObjectGet, susaObjectSerialise, obj => {
        return {
            ...obj,
            xPos: ramGetShort(ram, SUSA_MOUSEX),
            yPos: ramGetShort(ram, SUSA_MOUSEY)
        };
    });

    ramUpdateSerialised(ram, mouseObjectPtr + 8, susaObjectGet, susaObjectSerialise, obj => {
        return {
            ...obj,
            xPos: ramGetShort(ram, SUSA_MOUSEX),
            yPos: ramGetShort(ram, SUSA_MOUSEY) + 17
        };
    });
};

// logiclogue-ez-susa-screen - for more advanced graphics, named after some
// place to do with heptagons
(function () {
    const canvases = document.querySelectorAll(".logiclogue-ez-susa-screen");

    canvases.forEach((canvas, index) => {
        const ram = getRAM(canvas.dataset.ramId || "default");
        const screenWidth = canvas.dataset.screenWidth || 256;
        const screenHeight = canvas.dataset.screenHeight || 192;

        ramSetShort(ram, SUSA_SWIDTH, screenWidth);
        ramSetShort(ram, SUSA_SHIGHT, screenHeight);

        const ctx = canvas.getContext("2d");

        canvas.addEventListener("mousemove", e => {
            const rect = canvas.getBoundingClientRect();

            const x = Math.floor(((e.clientX - rect.left) / rect.width) * screenWidth);
            const y = Math.floor(((e.clientY - rect.top) / rect.height) * screenHeight);

            ramSetShort(ram, SUSA_MOUSEX, x);
            ramSetShort(ram, SUSA_MOUSEY, y);
        });

        function animate() {
            ramUpdateShort(ram, SUSA_TICKKK, tick => {
                return tick + 1;
            });

            ezSusaRunSampleLogic(ram);

            const imageData = ezSusaGenerateImageData(ctx, ram);

            ctx.putImageData(imageData, 0, 0);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    });
}());

(function () {
    window.onload = function() {
        const {
            convertCanvasToZXScreen,
            drawZXScreenDataToCanvas
        } = ZXScreen();

        const zxCanvases = document.querySelectorAll(".logiclogue-zx-image");

        zxCanvases.forEach((canvas, index) => {
            const img = new Image();

            img.src = canvas.getAttribute("src");

            img.onload = function() {
                const ctx = canvas.getContext("2d");

                // Resize and draw image onto the canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert canvas data to ZX Spectrum format
                const zxData = convertCanvasToZXScreen(canvas, ctx);

                let currentZxData = zxData.map(() => Math.floor(Math.random() * 256));

                drawZXScreenDataToCanvas(ctx, currentZxData);

                // reintroduce bytes
                function reintroduceBytes() {
                    currentZxData = zxData.map((thisByte, i) => {
                        const rand = Math.random();

                        if (rand > 0.9999 && thisByte !== "\n") {
                            return Math.floor(rand * 256);
                        } else if (rand > (i / zxData.length)) {
                            return thisByte;
                        }

                        return currentZxData[i];
                    });

                    drawZXScreenDataToCanvas(ctx, currentZxData);
                }

                // Start the interval
                let intervalId = setInterval(reintroduceBytes, 100);
            };

            if (img.complete) {
                img.onload();
            }
        });
    };
}());

///// 3D ENGINE

(function () {
    const {
        getEmptyZxScreen,
        drawZXScreenDataToCanvas,
        getZXScreenIndexes
    } = ZXScreen();

    const m4Id = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    function m4Projection(fov, far, near, aspect) {
        const f = 1 / Math.tan(fov / 2);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
            0, 0, -1, 0
        ];
    }

    function m4Multiply(a, b) {
        return [
            a[0] * b[0] + a[1] * b[4] + a[2] * b[8]  + a[3] * b[12],
            a[0] * b[1] + a[1] * b[5] + a[2] * b[9]  + a[3] * b[13],
            a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
            a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

            a[4] * b[0] + a[5] * b[4] + a[6] * b[8]  + a[7] * b[12],
            a[4] * b[1] + a[5] * b[5] + a[6] * b[9]  + a[7] * b[13],
            a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
            a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

            a[8] * b[0] + a[9] * b[4] + a[10] * b[8]  + a[11] * b[12],
            a[8] * b[1] + a[9] * b[5] + a[10] * b[9]  + a[11] * b[13],
            a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
            a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

            a[12] * b[0] + a[13] * b[4] + a[14] * b[8]  + a[15] * b[12],
            a[12] * b[1] + a[13] * b[5] + a[14] * b[9]  + a[15] * b[13],
            a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
            a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]
        ];
    }

    function m4MultiplyVec4(m, v) {
        return [
            m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3],
            m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3],
            m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3],
            m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3]
        ];
    }

    function m4Transpose(m) {
        return [
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ];
    }

    // This is only be applied to translate and rotation matrices
    function m4Inverse(m) {
        // Separate translation and rotation components
        const translation = [m[3], m[7], m[11], m[15]];
        const rotation = [
            m[0], m[1], m[2], 0,
            m[4], m[5], m[6], 0,
            m[8], m[9], m[10], 0,
            0, 0, 0, 1
        ];

        // Calculate inverse rotation matrix
        const invRotation = m4Transpose(rotation);

        // Calculate inverse translation matrix
        const invTranslation = [
            1, 0, 0, -translation[0],
            0, 1, 0, -translation[1],
            0, 0, 1, -translation[2],
            0, 0, 0, 1
        ];

        return m4Multiply(invRotation, invTranslation);
    }

    function m4RotateY(theta) {
        return [
            Math.cos(theta), 0, -Math.sin(theta), 0,
            0, 1, 0, 0,
            Math.sin(theta), 0, Math.cos(theta), 0,
            0, 0, 0, 1
        ];
    }

    function m4Translate(x, y, z) {
        return [
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        ];
    }

    function vec4Normalise(vec4) {
        const [x, y, z, w] = vec4;

        return [
            x / w,
            y / w,
            z / w,
            1
        ];
    }

    function projectToScreen(point, width, height) {
        // Assuming point is already in normalized device coordinates [-1, 1]
        return {
            x: Math.floor((point[0] + 1) * 0.5 * width),
            y: Math.floor((1 - (point[1] + 1) * 0.5) * height) // flip y for canvas coordinates
        };
    }

    function isWithinFrustum(point) {
        // Perspective division
        const [x, y, z] = point;

        // Check if the point is within the clip space
        return (x >= -1 && x <= 1) &&
               (y >= -1 && y <= 1) &&
               (z >= -1 && z <= 1);
    }

    // Example usage
    const fov = Math.PI / 4; // 45 degrees field of view
    const aspect = 256 / 192; // aspect ratio
    const near = 0.1; // near plane
    const far = 1000; // far plane

    // TODO - replace this with byte mapped memory - currently a cube
    let vec4Space = [
        [0, 0, 0, 1],
        [0, 0, 1, 1],
        [0, 1, 0, 1],
        [0, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 1, 1],
        [1, 1, 0, 1],
        [1, 1, 1, 1]
    ].map(vec4 => m4MultiplyVec4(m4Translate(-0.5, -0.5, -0.5), vec4));

    const zxCanvases = document.querySelectorAll(".logiclogue-zx-three");

    zxCanvases.forEach((canvas, index) => {
        const ctx = canvas.getContext("2d");

        let zxScreenData = getEmptyZxScreen();

        drawZXScreenDataToCanvas(ctx, zxScreenData);

        let tick = 0;

        const theta = 0.001;

        function animate() {
            const thisVec4Space = vec4Space.map(vec4 => m4MultiplyVec4(m4RotateY(tick / 1000), vec4));

            const camera = m4Multiply(m4Translate(0, 0, tick / 100), m4Id);
            //const camera = m4Multiply(m4RotateY(tick / 10), m4Id);
            //const camera = m4Multiply(m4Translate(0, 0, tick), m4Id);

            const projectionMatrix = m4Projection(fov, far, near, aspect);

            thisVec4Space
                .map(vec4 => m4MultiplyVec4(m4Inverse(camera), vec4))
                .map(vec4 => vec4Normalise(m4MultiplyVec4(projectionMatrix, vec4)))
                .filter((vec4, index) => {
                    if (!isWithinFrustum(vec4)) {
                        return false;
                    }

                    return true;
                })
                .forEach(vec4 => {
                    const { x, y } = projectToScreen(vec4, 256, 192);

                    const { attrIndex, pixelIndex } = getZXScreenIndexes(x, y);

                    zxScreenData[attrIndex] = 3;
                    zxScreenData[pixelIndex] = 255;
                });

            // TODO - raytracing
            const x = 255;
            const y = 191;

            const { attrIndex, pixelIndex } = getZXScreenIndexes(x, y);

            // TODO - to inverse these to get the origin and direction vectors
            /*
             * x = (a + 1) * 0.5 * 256
             * x = (a + 1) * (256 / 2)
             * a + 1 = x / (256 / 2)
             * a = (2 * x) / 256 - 1
             *
             * y = (1 - (b + 1) * 0.5) * 192
             * y = (1 - b * 0.5 - 0.5) * 192
             * y = (0.5 - b * 0.5) * 192
             * y = (0.5 - b * 0.5) * 192
             * y = 0.5 * 192 - b * 0.5 * 192
             * b * 0.5 * 192 = 0.5 * 192 - y
             * b = (0.5 * 192 - y) / (0.5 * 192)
             * b = 1 - y / (0.5 * 192)
             * b = 1 - (2 * y) / 192
             */
            const a = (2 * x) / 256 - 1;
            const b = 1 - (2 * y) / 192;

            console.log("a, b", a, b);

            // TODO - unproject this point a, b, these live at the focal length
            // TODO - origin is the camera, get the direction using these points

            // TODO - draw a point if they intersect
            zxScreenData[attrIndex] = 3;
            zxScreenData[pixelIndex] = 128;

            drawZXScreenDataToCanvas(ctx, zxScreenData);

            zxScreenData = getEmptyZxScreen();

            console.log("Drawn to screen", tick);

            tick += 1;
        }

        // Start the interval
        let intervalId = setInterval(animate, 100);
    });
}());

class EthSendTransaction {
    constructor(transaction) {
        this.transaction = transaction;
    }
}

// ethers (logiclogue-8bit-ethers)
(function () {
    const ethersElements = document.querySelectorAll(".logiclogue-8bit-ethers");
    const originalTexts = {};

    ethersElements.forEach(async (el, index) => {
        const ram = getRAM(el.dataset.ramId || "default");

        let signer, address;
        // It will prompt user for account connections if it isnt connected
        //const signer = await provider.getSigner();
        //console.log("Account:", await signer.getAddress());

        const ETH_STATUS_ADDR = 0x6000;
        const ETH_REQUEST_ADDR = 0x6001;
        const WALLET_ADDR = 0x6002;
        const CHAIN_ID_ADDR = 0x6002;
        const NO_ETH = 0;
        const ETH = 1;
        const AUTH_REQUESTED = 3;
        const AUTH_GRANTED = 5;

        setInterval(async function () {
            console.log("ram before", ram[0x6001], ram[0x6000]);
            if (!window.ethereum) {
                ram[ETH_STATUS_ADDR] = NO_ETH;
            } else if (ram[ETH_STATUS_ADDR] === NO_ETH) {
                ram[ETH_STATUS_ADDR] = ETH;
            }

            if (ram[ETH_REQUEST_ADDR] & 1 && ram[ETH_STATUS_ADDR] === ETH) {
                ram[ETH_STATUS_ADDR] = AUTH_REQUESTED;
                console.log("ram after", ram[0x6001], ram[0x6000]);

                console.log("Before provider", window.ethereum);

                window.ethereum.request({ method: "eth_requestAccounts" })
                    .then(function () {
                        ram[ETH_STATUS_ADDR] = AUTH_GRANTED;
                    })
                    .catch(function () {
                        ram[ETH_STATUS_ADDR] = ETH;
                    });
            }

            if ([ETH, AUTH_GRANTED].includes(ram[ETH_STATUS_ADDR])) {
                const chainId = await window.ethereum.request({ method: "eth_chainId" });

                console.log("chainId", chainId);

                window.ethereum.request({ method: "eth_accounts" })
                    .then(function (accounts) {
                        console.log("accounts", accounts);

                        if (accounts.length > 0) {
                            ram[ETH_STATUS_ADDR] = AUTH_GRANTED;

                            const extensionCodec = new msgpack.ExtensionCodec();

                            extensionCodec.register({
                                type: 0x00,
                                decode: function (data) {
                                    const address = (data[1] << 8) + data[0];
                                    const ramSlice = ram.slice(address);

                                    return msgpack.decode(ramSlice, { extensionCodec });
                                }
                            });

                            extensionCodec.register({
                                type: 0x10,
                                decode: function (data) {
                                    return "0x" + Array.from(data).map(byte => byte.toString(16).padStart(2, "0")).join("");
                                }
                            });

                            extensionCodec.register({
                                type: 0x20,
                                decode: function (data) {
                                    console.log("Unpacking:", data);
                                    const result = msgpack.decodeMulti(data, { extensionCodec });

                                    console.log("Unpacked:", result);

                                    const [to, value, input] = result;

                                    // TODO
                                    return {
                                        method: "eth_sendTransaction",
                                        params: [
                                            {
                                                from: accounts[0],
                                                to,
                                                //gas: "0x76c0", // 30400
                                                //gasPrice: "0x9184e72a000", // 10000000000000
                                                value,
                                                input,
                                            }
                                        ]
                                    }
                                }
                            });

                            const testInput = "C74920C71410D46E8DD67C5D32BE8058BB8EB970870F07244567D6109184E72AC72910d46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675";
                            const output = new Uint8Array(testInput.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

                            const transaction = msgpack.decode(output, { extensionCodec });

                            console.log("hexstring unpack", transaction, "0x1234");

                            //window.ethereum.request(transaction);

                            // TODO - end
                        } else {
                            ram[ETH_STATUS_ADDR] = ETH;
                        }
                    })
                    .catch(function (error) {
                        console.log("error", error);

                        ram[ETH_STATUS_ADDR] = ETH;
                    });
            }
        }, 1000);
    });
}());

// 6502 assembler (logiclogue-6502-asm)
(function () {
    const asmElements = document.querySelectorAll(".logiclogue-6502-asm");
    const originalTexts = {};

    console.log(asmElements);

    asmElements.forEach((el, index) => {
        const asmFile = el.textContent;

        const ram = getRAM(el.dataset.ramId || "default");

        const src = { name: "test-file", content: asmFile };
        const asmRes = assemble(src, {});

        console.log("----- DISASM -----");
        console.log(asmRes.disasm.trim());
        console.log("----- OBJ -----");
        console.log(asmRes.obj);
        console.log("----- HEXDUMP -----");

        asmRes.dump("CODE");

        console.log("----- SEGMENTS -----");
        console.log(asmRes.segments);
        console.log("----- SYMBOLS -----");
        console.log(asmRes.symbols.dump());

        ram.set(asmRes.obj.CODE, asmRes.segments.CODE.start);

        // store reset vector as code start (little endian)
        ram[0xfffc] = asmRes.segments.CODE.start & 0xff;
        ram[0xfffd] = asmRes.segments.CODE.start >> 8;

        const accessMemory = (readWrite, address, value) => {
            // capture a write to 0x6000 as a magic output address, print to console
            if (address === 0x6000 && readWrite === ReadWrite.write) {
                console.log("Output: ", value.toString(16));
                return;
            }

            // capture a write to 0x6005 as a magic output address, pause the clock
            if (address === 0x6005 && readWrite === ReadWrite.write) {
                console.log("Exit captured! pausing clock");
                cpu.pauseClock();
                return;
            }

            // write value to RAM (processor is reading from [address])
            if (readWrite === ReadWrite.read) {
                return ram[address];
            }

            // store value in RAM (processor is writing [value] to [address])
            ram[address] = value;
        };

        const cpu = new CPU6502({
            accessMemory
        });

        cpu.reset();
        cpu.startClock();
    });
}());

// Analytics rom
(function () {
    const startTime = performance.now();
    const uuid = crypto.randomUUID();
    const romEndpoint = "TODO";

    window.addEventListener("load", function () {
        const timeSpent = performance.now() - startTime;

        fetch(romEndpoint, {
            method: "POST",
            body: JSON.stringify({
                type: "load",
                uuid: uuid,
                isSolflare: window.solflare ? true : false,
                isEthereum: window.ethereum ? true : false,
                pathname: window.location.pathname,
                href: window.location.href,
                referrer: document.referrer,
                useragent: navigator.userAgent,
                language: navigator.language || navigator.languages,
                online: navigator.onLine,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                timeSpent: timeSpent
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
    });

    let events = [];

    window.addEventListener("click", function (e) {
        const timeSpent = performance.now() - startTime;

        events.push({
            type: "click",
            timeSpent: timeSpent,
            id: e.target.id,
            tagName: e.target.tagName,
            className: e.target.className,
            pageX: e.pageX,
            pageY: e.pageY,
            x: e.x,
            y: e.y
        });
    });

    window.addEventListener("scrollend", function () {
        const timeSpent = performance.now() - startTime;

        events.push({
            type: "scroll",
            timeSpent: timeSpent
        });
    });

    setInterval(function () {
        if (events.length > 0) {
            fetch(romEndpoint, {
                method: "POST",
                body: JSON.stringify({
                    type: "events",
                    uuid: uuid,
                    events
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            events = [];
        }
    }, 5000);
}());
