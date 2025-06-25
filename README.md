# SpellWise
SpellWise is a smart and easy-to-use spelling checker that works right in your browser. It has a modern, stylish design with a smooth glass-like look and animated background. You can see and fix spelling mistakes instantly as you type.

# Features

- Real-time Spell Checking :- Instantly detects and highlights spelling errors as you type.
  
- "Correct All" Feature :- One-click auto-correction using intelligent suggestions.
  
- Custom Dictionary Support :- Add your own words so they won’t be flagged as incorrect again. 
  

- Debounced Input Handling :- Optimized performance with delayed checks after you stop typing.

 
- Glassmorphism UI + Animated Background :- Modern design with smooth effects and visual clarity. 
  

- 100% Client-Side :- No data is sent to any server – all logic runs in your browser.
  

  # Tech Stack
  
 - HTML5:- Structure and semantic layout.
      
 - CSS3:-  Styling, flexbox layout, animations.
                             
 - JavaScript (ES6+):- Logic, interaction, spell checking.
   
 - Typo.js:- Spell-check engine using Hunspell dictionaries.
   
 - Google Fonts:- Typography (Poppins font).
   
 - Font Awesome:- Icons for UI elements.
   

  # How It Works
  

1. **Initialization**:  
   Loads Hunspell .aff and .dic files via Typo.js and prepares the overlay system.

2. **Dual Layer UI**:  
   Uses a hidden <textarea> for typing and a visible overlay `<div>` to display styled words and suggestions.

3. **Debounced Checking**:  
   Typing is monitored with debouncing to avoid lag; spell check runs 300ms after input stops.

4. **Smart Suggestions**:  
   Hovering over a misspelled word shows alternatives; clicking replaces the word or adds it to your personal dictionary.

5. **Interactive Buttons**:  
   - **Correct All**: Fixes all errors using the top suggestion.  
   - **Copy**: Copies corrected text to clipboard.  
   - **Clear**: Empties the input box.

 
