document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const textInput = document.getElementById('text-input');
    const resultOverlay = document.getElementById('result-overlay');
    const statsEl = document.getElementById('stats');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const correctAllBtn = document.getElementById('correct-all-btn');
    const loader = document.getElementById('loader');
    const toast = document.getElementById('toast-notification');

    // --- State Management ---
    let dictionary = null;
    let customDictionary = new Set();
    let ignoredWords = new Set();
    let toastTimeout;

    // --- Utility Functions ---
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const showToast = (message) => {
        clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // --- Background Animation ---
    const createAnimatedBackground = () => {
        const background = document.getElementById('background-letters');
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < 50; i++) {
            const span = document.createElement('span');
            span.textContent = letters.charAt(Math.floor(Math.random() * letters.length));
            span.style.top = `${Math.random() * 100}vh`;
            span.style.left = `${Math.random() * 100}vw`;
            span.style.fontSize = `${Math.random() * 5 + 2}vw`;
            span.style.animationDelay = `${Math.random() * 25}s`;
            span.style.animationDuration = `${Math.random() * 10 + 15}s`;
            background.appendChild(span);
        }
    };

    // --- Dictionary Initialization ---
    const initializeDictionary = async () => {
        loader.style.display = 'block';
        textInput.disabled = true;
        try {
            const dictionaryPath = 'https://cdn.jsdelivr.net/npm/typo-js@1.2.1/dictionaries/en_US/';
            const [affData, dicData] = await Promise.all([
                fetch(`${dictionaryPath}en_US.aff`).then(res => res.text()),
                fetch(`${dictionaryPath}en_US.dic`).then(res => res.text())
            ]);
            dictionary = new Typo('en_US', affData, dicData);
        } catch (error) {
            console.error('Error loading dictionary:', error);
            showToast('Error: Could not load dictionary.');
        } finally {
            loader.style.display = 'none';
            textInput.disabled = false;
            textInput.focus();
        }
    };

    // --- Core Spell Checking and UI Update ---
    const checkSpelling = () => {
        if (!dictionary) return;
        
        const text = textInput.value;
        const wordsAndSeparators = text.split(/([^\w']+|\n)/);
        let errorCount = 0;

        const highlightedHtml = wordsAndSeparators.map(part => {
            if (part.match(/[\w']+/)) { // It's a word
                if (customDictionary.has(part.toLowerCase()) || ignoredWords.has(part) || dictionary.check(part)) {
                    return part;
                }
                errorCount++;
                const suggestions = dictionary.suggest(part);
                return createIncorrectWordHtml(part, suggestions);
            }
            return part;
        }).join('');

        resultOverlay.innerHTML = highlightedHtml;
        updateStats(text, errorCount);
        correctAllBtn.disabled = errorCount === 0;
    };

    const createIncorrectWordHtml = (word, suggestions) => {
        const suggestionItems = suggestions.length > 0
            ? suggestions.slice(0, 5).map(s => `<button class="suggestion-item" data-word="${word}" data-suggestion="${s}">${s}</button>`).join('')
            : '<div class="no-suggestions">No suggestions</div>';

        return `<span class="incorrect" tabindex="0">${word}<div class="suggestion-popup">
                    ${suggestionItems}
                    <div class="popup-divider"></div>
                    <button class="popup-action" data-action="add" data-word="${word}"><i class="fa-solid fa-book-medical"></i> Add to Dictionary</button>
                    <button class="popup-action" data-action="ignore" data-word="${word}"><i class="fa-solid fa-eye-slash"></i> Ignore Once</button>
                </div></span>`;
    };

    // --- Event Handlers ---
    const handleOverlayClick = (e) => {
        const target = e.target;
        
        if (target.classList.contains('suggestion-item')) {
            const originalWord = target.dataset.word;
            const suggestion = target.dataset.suggestion;
            replaceWord(originalWord, suggestion);
        }
        
        if (target.classList.contains('popup-action')) {
            const action = target.dataset.action;
            const word = target.dataset.word;
            if (action === 'add') {
                customDictionary.add(word.toLowerCase());
                showToast(`'${word}' added to dictionary.`);
            } else if (action === 'ignore') {
                ignoredWords.add(word);
                showToast(`'${word}' will be ignored.`);
            }
            debouncedCheck();
        }
    };

    const replaceWord = (original, replacement) => {
        const regex = new RegExp(`\\b${original}\\b`, 'i');
        textInput.value = textInput.value.replace(regex, replacement);
        debouncedCheck();
    };


    const updateStats = (text, errorCount) => {
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        statsEl.innerHTML = `<span>Errors: ${errorCount}</span> | <span>Words: ${wordCount}</span>`;
    };

    const copyCorrectedText = () => {
        navigator.clipboard.writeText(textInput.value)
            .then(() => showToast('Text copied to clipboard!'))
            .catch(() => showToast('Failed to copy text.'));
    };

    const correctAllErrors = () => {
        let currentText = textInput.value;
        const incorrectSpans = resultOverlay.querySelectorAll('.incorrect');
        let correctionsMade = 0;
        
        incorrectSpans.forEach(span => {
            const originalWord = span.childNodes[0].nodeValue;
            const firstSuggestion = span.querySelector('.suggestion-item');
            if (firstSuggestion) {
                const suggestion = firstSuggestion.dataset.suggestion;
                // Use a regex to only replace whole words
                const regex = new RegExp(`\\b${originalWord}\\b`, 'g');
                currentText = currentText.replace(regex, suggestion);
                correctionsMade++;
            }
        });
        
        if(correctionsMade > 0) {
            textInput.value = currentText;
            showToast(`Corrected ${correctionsMade} error(s).`);
            debouncedCheck();
        } else {
            showToast('No corrections to apply.');
        }
    };

    const clearAll = () => {
        textInput.value = '';
        debouncedCheck();
        textInput.focus();
    };
    
    // --- Event Listeners ---
    const debouncedCheck = debounce(checkSpelling, 300);
    textInput.addEventListener('input', debouncedCheck);
    textInput.addEventListener('scroll', () => {
      resultOverlay.scrollTop = textInput.scrollTop;
      resultOverlay.scrollLeft = textInput.scrollLeft;
    });

    resultOverlay.addEventListener('click', handleOverlayClick);
    copyBtn.addEventListener('click', copyCorrectedText);
    clearBtn.addEventListener('click', clearAll);
    correctAllBtn.addEventListener('click', correctAllErrors);

    // --- Initial Load ---
    createAnimatedBackground();
    initializeDictionary();
    updateStats('', 0);
});