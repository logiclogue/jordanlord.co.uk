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

// RAM
let ram = {};

function getRAM(ramId) {
    if (ram[ramId]) {
        return ram[ramId];
    }

    ram[ramId] = new Uint8ClampedArray(0xffff);

    return ram[ramId];
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
