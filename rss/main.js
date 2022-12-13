if ("serviceWorker" in navigator) {
    // register service worker
    navigator.serviceWorker.register("service-worker.js").then((registration) => {
        console.log('Service worker registration succeeded:', registration);
    }, /*catch*/(error) => {
        console.error(`Service worker registration failed: ${error}`);
    });
} else {
    console.error('Service workers are not supported.');
}

let text_samples = [
    "Lorem ipsum dolor sit amet. Rem consequatur necessitatibus in amet voluptates eum distinctio voluptatem.",
    "Eos galisum vero qui odio dolorum qui atque doloremque ut optio libero sed natus corporis.",
    "Est necessitatibus Quis sed reiciendis magni aut voluptas explicabo.",
    "Est laudantium earum est tenetur doloremque ut quos pariatur est laborum expedita qui ullam ipsum.",
    "Eos officia sunt non quas obcaecati aut corrupti repellendus et consequatur commodi aut quae nihil."
]

let text_index = 0;
let characterTyped = 0;
let mistakes_num = 0;
let total_words_typed = 0;
let isTypingStarted = false;
let total_wpm = 0;
let timer = 0;
let interval_id;

let text = document.getElementById("text");
let userInput = document.getElementById("userInput");
let acc = document.getElementById("acc");
let wpm = document.getElementById("wpm");
let mistakes = document.getElementById("mistakes");
let counter = document.getElementById("counter");
let current_txt = null;

changeText();

// Functions

function changeText() {
    text.textContent = null;
    current_txt = text_samples[text_index];

    current_txt.split('').forEach(char => {
        const charSpan = document.createElement('span')
        charSpan.innerText = char
        text.appendChild(charSpan)
    })

    counter.textContent = text_index + 1 + "/" + text_samples.length;
    text_index < text_samples.length ? text_index++ : text_index = 0;
}

function processCurrentText() {

    if (userInput.value && !isTypingStarted) {
        isTypingStarted = true;
        startTimer();
    }

    let input_arr = userInput.value.split('');

    // increment total characters typed
    characterTyped++;

    let sample_spans = text.querySelectorAll('span');

    sample_spans.forEach((char, index) => {
        let typedChar = input_arr[index]

        // character not currently typed
        if (typedChar == null) {
            char.classList.remove('correct');
            char.classList.remove('incorrect');

            // correct character
        } else if (typedChar === char.innerText) {
            char.classList.add('correct');
            char.classList.remove('incorrect');

            // incorrect character
        } else if (!char.classList.contains("incorrect")) {
            char.classList.add('incorrect');
            char.classList.remove('correct');
            mistakes_num++;
        }
    });

    // display the number of errors
    mistakes.textContent = mistakes_num;

    // update accuracy text
    let correctCharacters = characterTyped - mistakes_num;
    let accuracyVal = ((correctCharacters * 100) / characterTyped);
    acc.textContent = accuracyVal > 0 ? Math.round(accuracyVal) : 0;

    // if current text is completely typed
    // irrespective of errors
    if (userInput.value.length === current_txt.length) {

        if (text_index < text_samples.length) {
            changeText();
        } else {
            finish();
        }

        // clear the input area
        userInput.value = "";
    } else {

    }
}

function startTimer() {
    interval_id = setInterval(() => {
        let curr_total_words = Math.round((characterTyped / 5));
        timer += 3;

        total_words_typed = curr_total_words;

        total_wpm = Math.round((total_words_typed * 60) / timer);
        wpm.textContent = Math.round(total_wpm);
    }, 3000);
}

function finish() {
    userInput.blur();
    userInput.disabled = true;
    document.querySelectorAll("#calcs>div").forEach(el => el.classList.add("result"));
    clearInterval(interval_id);
}

function reset() {
    clearInterval(interval_id);
    userInput.value = "";
    acc.textContent = 0;
    wpm.textContent = 0;
    mistakes.textContent = 0;
    text_index = 0;
    characterTyped = 0;
    mistakes_num = 0;
    total_words_typed = 0;
    isTypingStarted = false;
    total_wpm = 0;
    timer = 0;
    current_txt = null;
    document.querySelectorAll("#calcs>div").forEach(el => el.classList.remove("result"))
    userInput.classList.remove("events-none");
    userInput.disabled = false;
    changeText()
}
