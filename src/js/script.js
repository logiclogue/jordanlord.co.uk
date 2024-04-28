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

    function attrByteToObj(attr) {
        return {
            flash: (attr & 0b10000000) !== 0,
            bright: (attr & 0b01000000) !== 0,
            paper: (attr & 0b00111000) >>> 3,
            ink: attr & 0b00000111
        };
    }

    function displayScreen(ctx, arScr, scrX, scrY) {
        const imageData = ctx.createImageData(screenWidth, screenHeight);
        const data = imageData.data;

        for (let area = 0; area < 3; area++) {
            for (let line = 0; line < 8; line++) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 32; col++) {
                        const index = area * 2048 + (line * 8 + row) * 32 + col;
                        const byte = arScr[index];

                        const attrIndex = area * 256 + row * 32 + col;
                        const attr = arScr[6144 + attrIndex];
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

    function drawZXScreenDataToCanvas(ctx, screenData) {
        displayScreen(ctx, screenData, 0, 0);
    }

    function getZXScreenIndexes(x, y) {
        // Validate x, y coordinates
        if (x < 0 || x >= screenWidth || y < 0 || y >= screenHeight) {
            throw new Error("Coordinates out of bounds.");
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
        const zxScreenData = new Uint8Array(6912); // 6144 for bitmap + 768 for attributes

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
        convertCanvasToZXScreen
    };
};


(function () {
    window.onload = function() {
        const {
            convertCanvasToZXScreen,
            drawZXScreenDataToCanvas
        } = ZXScreen();

        const img = document.getElementById("sourceImage");

        img.onload = function() {
            const canvas = document.getElementById("myCanvas");
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
    };
}());
