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
