import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { FaArrowLeft, FaFire, FaBolt, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION BANK — 18 Categories
// ─────────────────────────────────────────────────────────────────────────────
const questionBank: Record<string, Question[]> = {

  'Singing & Music': [
    { question: 'What is the term for the highness or lowness of a sound?', options: ['Tempo', 'Pitch', 'Rhythm', 'Timbre'], correct: 1, category: 'Singing & Music' },
    { question: 'Which voice type is the highest female singing voice?', options: ['Alto', 'Mezzo-soprano', 'Soprano', 'Contralto'], correct: 2, category: 'Singing & Music' },
    { question: 'What does "a cappella" mean?', options: ['With instruments', 'Without instruments', 'Very softly', 'Very loudly'], correct: 1, category: 'Singing & Music' },
    { question: 'What is vibrato in singing?', options: ['Singing very fast', 'A rapid slight variation in pitch', 'A breathing technique', 'A type of harmony'], correct: 1, category: 'Singing & Music' },
    { question: 'What is the term for singing two notes simultaneously?', options: ['Melody', 'Harmony', 'Chorus', 'Bridge'], correct: 1, category: 'Singing & Music' },
    { question: 'What is the lowest male voice type called?', options: ['Tenor', 'Baritone', 'Bass', 'Alto'], correct: 2, category: 'Singing & Music' },
    { question: 'What does "forte" mean in music?', options: ['Soft', 'Loud', 'Fast', 'Slow'], correct: 1, category: 'Singing & Music' },
    { question: 'Which part of the body is most important for breath support in singing?', options: ['Throat', 'Chest', 'Diaphragm', 'Mouth'], correct: 2, category: 'Singing & Music' },
    { question: 'What is the repeated section of a song called?', options: ['Verse', 'Bridge', 'Chorus', 'Intro'], correct: 2, category: 'Singing & Music' },
    { question: 'What does BPM stand for in music?', options: ['Bass Per Minute', 'Beats Per Minute', 'Bars Per Melody', 'Beat Pattern Measure'], correct: 1, category: 'Singing & Music' },
  ],

  'Drawing & Art': [
    { question: 'What are the three primary colors?', options: ['Red, Green, Blue', 'Red, Yellow, Blue', 'Cyan, Magenta, Yellow', 'Orange, Green, Purple'], correct: 1, category: 'Drawing & Art' },
    { question: 'What is "perspective" in drawing?', options: ['The use of color', 'Creating depth and 3D illusion', 'Shading technique', 'Line thickness'], correct: 1, category: 'Drawing & Art' },
    { question: 'What is a "sketch"?', options: ['A finished painting', 'A rough preliminary drawing', 'A type of sculpture', 'A digital image'], correct: 1, category: 'Drawing & Art' },
    { question: 'Which technique uses small dots to create an image?', options: ['Hatching', 'Stippling', 'Blending', 'Crosshatching'], correct: 1, category: 'Drawing & Art' },
    { question: 'What is "hatching" in drawing?', options: ['Coloring large areas', 'Parallel lines to show shading', 'Drawing curves', 'Erasing mistakes'], correct: 1, category: 'Drawing & Art' },
    { question: 'What does "contour drawing" focus on?', options: ['Shading', 'Color', 'Outlines and edges', 'Background'], correct: 2, category: 'Drawing & Art' },
    { question: 'Which color is made by mixing red and blue?', options: ['Green', 'Orange', 'Purple', 'Brown'], correct: 2, category: 'Drawing & Art' },
    { question: 'What is the "vanishing point" in perspective drawing?', options: ['Where light disappears', 'Where parallel lines appear to meet', 'The darkest area', 'The center of drawing'], correct: 1, category: 'Drawing & Art' },
    { question: 'What is "shading" used for in drawing?', options: ['Adding color', 'Creating depth and form', 'Drawing outlines', 'Adding texture only'], correct: 1, category: 'Drawing & Art' },
    { question: 'What is negative space in art?', options: ['Dark colors', 'The empty space around the subject', 'The background color', 'Erased areas'], correct: 1, category: 'Drawing & Art' },
  ],

  'Cooking': [
    { question: 'What does "sauté" mean?', options: ['Boiling in water', 'Cooking quickly in a little fat', 'Baking in oven', 'Steaming vegetables'], correct: 1, category: 'Cooking' },
    { question: 'At what temperature does water boil at sea level?', options: ['90°C', '95°C', '100°C', '110°C'], correct: 2, category: 'Cooking' },
    { question: 'What is the purpose of "marinating"?', options: ['To cook meat faster', 'To add flavor and tenderize', 'To remove salt', 'To preserve food'], correct: 1, category: 'Cooking' },
    { question: 'Which cooking method uses dry heat in an enclosed space?', options: ['Boiling', 'Steaming', 'Baking', 'Poaching'], correct: 2, category: 'Cooking' },
    { question: 'What does "julienne" mean in cooking?', options: ['A French sauce', 'Cutting food into thin matchstick strips', 'A baking technique', 'A type of pastry'], correct: 1, category: 'Cooking' },
    { question: 'What is a "roux" used for?', options: ['Seasoning meat', 'Thickening sauces', 'Marinating vegetables', 'Decorating desserts'], correct: 1, category: 'Cooking' },
    { question: 'Which herb is commonly used in Italian cooking?', options: ['Lemongrass', 'Cardamom', 'Basil', 'Turmeric'], correct: 2, category: 'Cooking' },
    { question: 'What does "blanching" vegetables involve?', options: ['Frying in oil', 'Brief boiling then cold water', 'Slow roasting', 'Grilling on open flame'], correct: 1, category: 'Cooking' },
    { question: 'What is the main leavening agent in bread?', options: ['Baking soda', 'Salt', 'Yeast', 'Sugar'], correct: 2, category: 'Cooking' },
    { question: 'What does "al dente" mean for pasta?', options: ['Well cooked', 'Firm to the bite', 'Overcooked', 'Raw'], correct: 1, category: 'Cooking' },
  ],

  'Fitness & Yoga': [
    { question: 'What does "BMI" stand for?', options: ['Body Mass Index', 'Basic Muscle Intensity', 'Body Muscle Intake', 'Balanced Movement Index'], correct: 0, category: 'Fitness & Yoga' },
    { question: 'Which yoga pose is called "Downward Facing Dog"?', options: ['Savasana', 'Adho Mukha Svanasana', 'Tadasana', 'Vrikshasana'], correct: 1, category: 'Fitness & Yoga' },
    { question: 'How many minutes of moderate exercise does WHO recommend per week?', options: ['75 minutes', '150 minutes', '200 minutes', '300 minutes'], correct: 1, category: 'Fitness & Yoga' },
    { question: 'What muscle group do squats primarily target?', options: ['Arms', 'Back', 'Quadriceps and glutes', 'Shoulders'], correct: 2, category: 'Fitness & Yoga' },
    { question: 'What is "HIIT"?', options: ['High Intensity Interval Training', 'Heavy Isometric Impact Training', 'High Impact Interval Technique', 'Healthy Integrated Interval Training'], correct: 0, category: 'Fitness & Yoga' },
    { question: 'What does the yoga term "Namaste" mean?', options: ['Good morning', 'I bow to you / The divine in me honors you', 'Peace be with you', 'Thank you'], correct: 1, category: 'Fitness & Yoga' },
    { question: 'Which nutrient is the primary energy source during exercise?', options: ['Fat', 'Protein', 'Carbohydrates', 'Vitamins'], correct: 2, category: 'Fitness & Yoga' },
    { question: 'What is "Savasana" in yoga?', options: ['A standing pose', 'A balance pose', 'Corpse pose — final relaxation', 'A breathing exercise'], correct: 2, category: 'Fitness & Yoga' },
    { question: 'How many calories does 1 gram of fat contain?', options: ['4', '7', '9', '11'], correct: 2, category: 'Fitness & Yoga' },
    { question: 'What does "reps" mean in fitness?', options: ['Rest periods', 'Repetitions of an exercise', 'Resistance levels', 'Recovery points'], correct: 1, category: 'Fitness & Yoga' },
  ],

  'Photography': [
    { question: 'What does "aperture" control in photography?', options: ['Shutter speed', 'How much light enters the lens', 'Image color', 'Focus distance'], correct: 1, category: 'Photography' },
    { question: 'What does ISO measure in photography?', options: ['Lens zoom level', 'Camera sensor sensitivity to light', 'Image resolution', 'Shutter speed'], correct: 1, category: 'Photography' },
    { question: 'What is the "rule of thirds"?', options: ['Using 3 cameras', 'A composition guideline dividing image into 9 parts', 'Shooting 3 photos per second', 'Using 3 light sources'], correct: 1, category: 'Photography' },
    { question: 'What does a fast shutter speed do?', options: ['Blurs motion', 'Freezes motion', 'Adds more light', 'Zooms in'], correct: 1, category: 'Photography' },
    { question: 'What is "bokeh" in photography?', options: ['A camera brand', 'The blur in out-of-focus areas', 'A type of lens', 'High contrast effect'], correct: 1, category: 'Photography' },
    { question: 'What is "golden hour" in photography?', options: ['The most expensive time to shoot', 'The soft light just after sunrise or before sunset', 'Midday sunlight', 'Studio lighting technique'], correct: 1, category: 'Photography' },
    { question: 'What does RAW format mean?', options: ['Uncompressed, unprocessed image data', 'A low quality format', 'A video format', 'Black and white photos'], correct: 0, category: 'Photography' },
    { question: 'What is a wide-angle lens best used for?', options: ['Wildlife close-ups', 'Portraits', 'Landscapes and architecture', 'Sports photography'], correct: 2, category: 'Photography' },
    { question: 'What is "exposure" in photography?', options: ['The lens type used', 'Amount of light reaching the sensor', 'Image editing technique', 'Camera model'], correct: 1, category: 'Photography' },
    { question: 'What does "DSLR" stand for?', options: ['Digital Single Lens Reflex', 'Digital Super Light Recorder', 'Dual Sensor Lens Rotation', 'Direct Single Light Receiver'], correct: 0, category: 'Photography' },
  ],

  'Dance': [
    { question: 'Which dance style originates from Cuba?', options: ['Tango', 'Salsa', 'Waltz', 'Flamenco'], correct: 1, category: 'Dance' },
    { question: 'What is the basic unit of rhythm in dance called?', options: ['Step', 'Beat', 'Phrase', 'Tempo'], correct: 1, category: 'Dance' },
    { question: 'Which dance is performed on pointe shoes?', options: ['Hip Hop', 'Jazz', 'Ballet', 'Tap'], correct: 2, category: 'Dance' },
    { question: 'What country does the Tango originate from?', options: ['Spain', 'Brazil', 'Argentina', 'Mexico'], correct: 2, category: 'Dance' },
    { question: 'What is "choreography"?', options: ['Dance music composition', 'The art of designing dance sequences', 'A type of dance floor', 'Stage lighting for dance'], correct: 1, category: 'Dance' },
    { question: 'Which dance style uses rhythmic footwork and arm movements from Spain?', options: ['Salsa', 'Flamenco', 'Tango', 'Samba'], correct: 1, category: 'Dance' },
    { question: 'What does "freestyle" dance mean?', options: ['Dancing for free', 'Improvised, unscripted dancing', 'A specific dance style', 'Dancing outdoors'], correct: 1, category: 'Dance' },
    { question: 'In ballet, what does "plié" mean?', options: ['Jump', 'Turn', 'Bend the knees', 'Stretch the leg'], correct: 2, category: 'Dance' },
    { question: 'Which dance is associated with Brazil\'s Carnival?', options: ['Tango', 'Salsa', 'Samba', 'Merengue'], correct: 2, category: 'Dance' },
    { question: 'What is a "pas de deux" in ballet?', options: ['A solo dance', 'A dance for two', 'A dance jump', 'A dance position'], correct: 1, category: 'Dance' },
  ],

  'Guitar & Instruments': [
    { question: 'How many strings does a standard guitar have?', options: ['4', '5', '6', '7'], correct: 2, category: 'Guitar & Instruments' },
    { question: 'What is a "chord" in music?', options: ['A single note', 'Three or more notes played simultaneously', 'A type of guitar', 'A music scale'], correct: 1, category: 'Guitar & Instruments' },
    { question: 'What does "fret" mean on a guitar?', options: ['A type of string', 'The metal strips on the neck', 'The body of the guitar', 'The tuning peg'], correct: 1, category: 'Guitar & Instruments' },
    { question: 'What is the name of the hole in the body of an acoustic guitar?', options: ['Sound hole', 'Air vent', 'Resonance port', 'Bass hole'], correct: 0, category: 'Guitar & Instruments' },
    { question: 'What is a "capo" used for?', options: ['To tune the guitar', 'To raise the pitch of all strings', 'To mute strings', 'To pluck strings'], correct: 1, category: 'Guitar & Instruments' },
    { question: 'Which finger is used for the guitar nut?', options: ['Thumb', 'Index', 'No finger — it is a fixed part', 'Pinky'], correct: 2, category: 'Guitar & Instruments' },
    { question: 'What is "tablature" (tabs) in guitar?', options: ['Guitar brand', 'A visual way to show which frets to play', 'A type of chord', 'Guitar accessories'], correct: 1, category: 'Guitar & Instruments' },
    { question: 'How many keys does a standard piano have?', options: ['72', '76', '88', '92'], correct: 2, category: 'Guitar & Instruments' },
    { question: 'What is "strumming"?', options: ['Playing single notes', 'Brushing across multiple strings', 'Tuning the guitar', 'Reading sheet music'], correct: 1, category: 'Guitar & Instruments' },
    { question: 'What family of instruments does the violin belong to?', options: ['Wind', 'Brass', 'Percussion', 'String'], correct: 3, category: 'Guitar & Instruments' },
  ],

  'Public Speaking': [
    { question: 'What is the most common fear among people?', options: ['Heights', 'Public speaking', 'Spiders', 'Darkness'], correct: 1, category: 'Public Speaking' },
    { question: 'What does "eye contact" help establish in public speaking?', options: ['Confusion', 'Trust and connection with audience', 'Fear', 'Distraction'], correct: 1, category: 'Public Speaking' },
    { question: 'What is a "hook" at the start of a speech?', options: ['A question at the end', 'An attention-grabbing opening', 'A type of microphone', 'A slide transition'], correct: 1, category: 'Public Speaking' },
    { question: 'What does "pacing" mean in public speaking?', options: ['Walking on stage', 'The speed at which you speak', 'Volume of your voice', 'Hand gestures'], correct: 1, category: 'Public Speaking' },
    { question: 'What is the "rule of three" in speeches?', options: ['Speak for only 3 minutes', 'Group ideas in sets of three', 'Use 3 slides only', 'Practice 3 times'], correct: 1, category: 'Public Speaking' },
    { question: 'What is "filler words" in public speaking?', options: ['Important transition words', 'Um, uh, like — words used to fill pauses', 'Technical vocabulary', 'Opening statements'], correct: 1, category: 'Public Speaking' },
    { question: 'What is the best way to handle nervousness before speaking?', options: ['Avoid the audience', 'Deep breathing and preparation', 'Speak very fast', 'Read from notes the whole time'], correct: 1, category: 'Public Speaking' },
    { question: 'What does "impromptu" speaking mean?', options: ['Memorized speech', 'Reading from paper', 'Speaking without prior preparation', 'Team presentation'], correct: 2, category: 'Public Speaking' },
    { question: 'What is body language in public speaking?', options: ['Written communication', 'Non-verbal communication through gestures and posture', 'Speaking style', 'Slide design'], correct: 1, category: 'Public Speaking' },
    { question: 'What is a good way to end a speech?', options: ['Just stop talking', 'A strong call to action or memorable conclusion', 'Ask if there are questions first', 'Thank the audience first'], correct: 1, category: 'Public Speaking' },
  ],

  'Web Development': [
    { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High-level Text Machine Language', 'HyperText Machine Learning', 'Hyperlink Text Markup Language'], correct: 0, category: 'Web Development' },
    { question: 'Which CSS property controls text size?', options: ['font-weight', 'text-size', 'font-size', 'text-scale'], correct: 2, category: 'Web Development' },
    { question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Syntax', 'Colorful Style Sheets'], correct: 1, category: 'Web Development' },
    { question: 'Which HTML tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], correct: 2, category: 'Web Development' },
    { question: 'What is the correct way to link a CSS file in HTML?', options: ['<style src="style.css">', '<link rel="stylesheet" href="style.css">', '<css href="style.css">', '<script src="style.css">'], correct: 1, category: 'Web Development' },
    { question: 'Which HTTP method is used to send data to a server?', options: ['GET', 'DELETE', 'POST', 'FETCH'], correct: 2, category: 'Web Development' },
    { question: 'What is the default display value of a <div>?', options: ['inline', 'block', 'flex', 'grid'], correct: 1, category: 'Web Development' },
    { question: 'Which tag creates a hyperlink?', options: ['<link>', '<href>', '<a>', '<url>'], correct: 2, category: 'Web Development' },
    { question: 'What does API stand for?', options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Protocol Interface', 'Application Process Integration'], correct: 0, category: 'Web Development' },
    { question: 'What is "responsive design"?', options: ['Fast loading website', 'Design that adapts to different screen sizes', 'Colorful website', 'Animated website'], correct: 1, category: 'Web Development' },
  ],

  'JavaScript': [
    { question: 'What does "===" mean in JavaScript?', options: ['Assignment', 'Loose equality', 'Strict equality', 'Not equal'], correct: 2, category: 'JavaScript' },
    { question: 'Which method adds elements to end of an array?', options: ['unshift()', 'push()', 'concat()', 'splice()'], correct: 1, category: 'JavaScript' },
    { question: 'What is a closure?', options: ['A loop that runs forever', 'A function with access to its outer scope', 'A way to close the browser', 'A type of error'], correct: 1, category: 'JavaScript' },
    { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'int', 'define'], correct: 1, category: 'JavaScript' },
    { question: 'What does JSON.parse() do?', options: ['Converts JS object to string', 'Converts JSON string to JS object', 'Deletes JSON data', 'Creates a JSON file'], correct: 1, category: 'JavaScript' },
    { question: 'What is the output of typeof null?', options: ['"null"', '"undefined"', '"object"', '"string"'], correct: 2, category: 'JavaScript' },
    { question: 'What does "async/await" help with?', options: ['Styling elements', 'Handling asynchronous code', 'Creating loops', 'Managing memory'], correct: 1, category: 'JavaScript' },
    { question: 'Which operator is used for optional chaining?', options: ['??', '||', '?.', '&&'], correct: 2, category: 'JavaScript' },
    { question: 'What does the spread operator (...) do?', options: ['Deletes items', 'Expands an iterable into individual elements', 'Creates a loop', 'Compresses arrays'], correct: 1, category: 'JavaScript' },
    { question: 'Which method converts an array to a string?', options: ['toString()', 'join()', 'Both A and B', 'stringify()'], correct: 2, category: 'JavaScript' },
  ],

  'React': [
    { question: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useRef'], correct: 1, category: 'React' },
    { question: 'What does useState return?', options: ['Just the state value', 'Just the setter function', 'An array with state and setter', 'An object'], correct: 2, category: 'React' },
    { question: 'What is JSX?', options: ['A database query language', 'JavaScript with HTML-like syntax', 'A CSS framework', 'A testing library'], correct: 1, category: 'React' },
    { question: 'What is a React key prop used for?', options: ['Styling elements', 'Identifying list items uniquely', 'Passing data to child', 'Handling events'], correct: 1, category: 'React' },
    { question: 'What is prop drilling?', options: ['Removing unused props', 'Passing props through many components', 'Drilling into the DOM', 'A performance optimization'], correct: 1, category: 'React' },
    { question: 'Which hook prevents re-creating a function on every render?', options: ['useMemo', 'useCallback', 'useRef', 'useReducer'], correct: 1, category: 'React' },
    { question: 'What does React.memo do?', options: ['Memoizes a value', 'Prevents re-render if props unchanged', 'Creates a new context', 'Replaces useState'], correct: 1, category: 'React' },
    { question: 'What is the virtual DOM?', options: ['A copy of the database', 'A lightweight JS representation of the DOM', 'A CSS engine', 'A browser extension'], correct: 1, category: 'React' },
    { question: 'Which hook is used to access context?', options: ['useRef', 'useContext', 'useState', 'useMemo'], correct: 1, category: 'React' },
    { question: 'What is the correct way to update state based on previous state?', options: ['setState(state + 1)', 'setState(prev => prev + 1)', 'state = state + 1', 'updateState(+1)'], correct: 1, category: 'React' },
  ],

  'Python': [
    { question: 'Which keyword defines a function in Python?', options: ['function', 'def', 'func', 'define'], correct: 1, category: 'Python' },
    { question: 'What does len() do?', options: ['Returns the length', 'Converts to list', 'Sorts a sequence', 'Removes duplicates'], correct: 0, category: 'Python' },
    { question: 'Which is NOT a Python data type?', options: ['int', 'float', 'char', 'bool'], correct: 2, category: 'Python' },
    { question: 'What is a Python dictionary?', options: ['An ordered list', 'A set of unique values', 'A key-value pair collection', 'A type of loop'], correct: 2, category: 'Python' },
    { question: 'What does range(5) return?', options: ['[1,2,3,4,5]', '[0,1,2,3,4]', '(0,5)', '[0,5]'], correct: 1, category: 'Python' },
    { question: 'What is a lambda function?', options: ['A named class method', 'A small anonymous function', 'A loop shorthand', 'A built-in module'], correct: 1, category: 'Python' },
    { question: 'How do you start a comment in Python?', options: ['//', '#', '/*', '--'], correct: 1, category: 'Python' },
    { question: 'Which keyword handles exceptions?', options: ['catch', 'error', 'except', 'handle'], correct: 2, category: 'Python' },
    { question: 'What does "self" refer to in a class?', options: ['The parent class', 'The current instance', 'A new object', 'The module'], correct: 1, category: 'Python' },
    { question: 'What is list comprehension in Python?', options: ['A way to understand lists', 'A compact way to create lists', 'A type of loop', 'A sorting method'], correct: 1, category: 'Python' },
  ],

  'Data Structures': [
    { question: 'Which uses LIFO?', options: ['Queue', 'Tree', 'Stack', 'Graph'], correct: 2, category: 'Data Structures' },
    { question: 'Time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2, category: 'Data Structures' },
    { question: 'Which uses FIFO?', options: ['Stack', 'Queue', 'Heap', 'Tree'], correct: 1, category: 'Data Structures' },
    { question: 'What is a linked list?', options: ['A list in a hash table', 'Nodes connected by pointers', 'A sorted array', 'A balanced tree'], correct: 1, category: 'Data Structures' },
    { question: 'Worst-case time complexity of quicksort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 2, category: 'Data Structures' },
    { question: 'Time complexity of array access by index?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 3, category: 'Data Structures' },
    { question: 'What does a hash table use?', options: ['Sorted arrays', 'Key-value pairs with hash function', 'Linked nodes', 'Binary trees'], correct: 1, category: 'Data Structures' },
    { question: 'Which traversal visits root first?', options: ['Inorder', 'Postorder', 'Preorder', 'Level order'], correct: 2, category: 'Data Structures' },
    { question: 'A graph with no cycles is called?', options: ['Complete graph', 'Tree', 'Directed graph', 'Weighted graph'], correct: 1, category: 'Data Structures' },
    { question: 'What is a "heap" data structure?', options: ['A pile of data', 'A tree-based structure satisfying heap property', 'A type of queue', 'A hash variant'], correct: 1, category: 'Data Structures' },
  ],

  'General Knowledge': [
    { question: 'Which planet is the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correct: 2, category: 'General Knowledge' },
    { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Rome', 'Paris'], correct: 3, category: 'General Knowledge' },
    { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2, category: 'General Knowledge' },
    { question: 'Who invented the telephone?', options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Albert Einstein'], correct: 1, category: 'General Knowledge' },
    { question: 'How many bones in the adult human body?', options: ['196', '206', '216', '226'], correct: 1, category: 'General Knowledge' },
    { question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci'], correct: 3, category: 'General Knowledge' },
    { question: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, category: 'General Knowledge' },
    { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, category: 'General Knowledge' },
    { question: 'Which country has the most population?', options: ['USA', 'India', 'China', 'Russia'], correct: 1, category: 'General Knowledge' },
    { question: 'How many days are in a leap year?', options: ['364', '365', '366', '367'], correct: 2, category: 'General Knowledge' },
  ],

  'Science': [
    { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], correct: 2, category: 'Science' },
    { question: 'Newton\'s second law: F = ?', options: ['mv', 'ma', 'mg', 'mh'], correct: 1, category: 'Science' },
    { question: 'What gas do plants absorb in photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, category: 'Science' },
    { question: 'Atomic number of Carbon?', options: ['6', '8', '12', '14'], correct: 0, category: 'Science' },
    { question: 'Unit of electric current?', options: ['Volt', 'Watt', 'Ohm', 'Ampere'], correct: 3, category: 'Science' },
    { question: 'DNA stands for?', options: ['Deoxyribonucleic Acid', 'Dynamic Nucleic Atom', 'Dual Nucleotide Acid', 'Dense Nitrogen Acid'], correct: 0, category: 'Science' },
    { question: 'Most abundant gas in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], correct: 2, category: 'Science' },
    { question: 'How many chambers does the heart have?', options: ['2', '3', '4', '5'], correct: 2, category: 'Science' },
    { question: 'What is the speed of light?', options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], correct: 1, category: 'Science' },
    { question: 'What is the pH of pure water?', options: ['5', '6', '7', '8'], correct: 2, category: 'Science' },
  ],

  'Mathematics': [
    { question: 'Value of π (pi)?', options: ['2.718', '3.141', '1.618', '1.414'], correct: 1, category: 'Mathematics' },
    { question: 'Square root of 144?', options: ['11', '12', '13', '14'], correct: 1, category: 'Mathematics' },
    { question: '25% of 200?', options: ['25', '40', '50', '75'], correct: 2, category: 'Mathematics' },
    { question: 'Sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correct: 1, category: 'Mathematics' },
    { question: 'What is 2⁸?', options: ['64', '128', '256', '512'], correct: 2, category: 'Mathematics' },
    { question: 'Area of a circle formula?', options: ['2πr', 'πr²', '4πr²', 'πd'], correct: 1, category: 'Mathematics' },
    { question: 'What is log₁₀(1000)?', options: ['2', '3', '4', '10'], correct: 1, category: 'Mathematics' },
    { question: 'Next prime number after 7?', options: ['8', '9', '10', '11'], correct: 3, category: 'Mathematics' },
    { question: 'What is 15% of 300?', options: ['35', '40', '45', '50'], correct: 2, category: 'Mathematics' },
    { question: 'What is the Pythagorean theorem?', options: ['a+b=c', 'a²+b²=c²', 'a×b=c²', '2a+b=c'], correct: 1, category: 'Mathematics' },
  ],

  'History': [
    { question: 'When did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: 2, category: 'History' },
    { question: 'First President of the USA?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'John Adams', 'George Washington'], correct: 3, category: 'History' },
    { question: 'Which civilization built the Pyramids of Giza?', options: ['Romans', 'Greeks', 'Ancient Egyptians', 'Mesopotamians'], correct: 2, category: 'History' },
    { question: 'India gained independence in?', options: ['1945', '1946', '1947', '1948'], correct: 2, category: 'History' },
    { question: '"Father of the Nation" in India?', options: ['Nehru', 'Sardar Patel', 'Bose', 'Mahatma Gandhi'], correct: 3, category: 'History' },
    { question: 'French Revolution began in?', options: ['1776', '1789', '1799', '1815'], correct: 1, category: 'History' },
    { question: 'Who discovered America in 1492?', options: ['Vasco da Gama', 'Ferdinand Magellan', 'Christopher Columbus', 'Amerigo Vespucci'], correct: 2, category: 'History' },
    { question: 'Cold War was between?', options: ['UK and Germany', 'USA and USSR', 'France and China', 'Japan and USA'], correct: 1, category: 'History' },
    { question: 'First country to land on the Moon?', options: ['USSR', 'China', 'USA', 'UK'], correct: 2, category: 'History' },
    { question: 'The Berlin Wall fell in?', options: ['1987', '1988', '1989', '1991'], correct: 2, category: 'History' },
  ],

  'English': [
    { question: 'Plural of "child"?', options: ['Childs', 'Children', 'Childes', 'Childrens'], correct: 1, category: 'English' },
    { question: 'Past tense of "run"?', options: ['Runned', 'Runs', 'Ran', 'Running'], correct: 2, category: 'English' },
    { question: 'Synonym of "happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correct: 2, category: 'English' },
    { question: '"Benevolent" means?', options: ['Cruel', 'Kind and generous', 'Lazy', 'Intelligent'], correct: 1, category: 'English' },
    { question: 'Correct spelling?', options: ['Recieve', 'Receieve', 'Receive', 'Recieive'], correct: 2, category: 'English' },
    { question: 'Antonym of "ancient"?', options: ['Old', 'Historic', 'Modern', 'Traditional'], correct: 2, category: 'English' },
    { question: 'Which is passive voice?', options: ['The dog chased the cat', 'The cat was chased by the dog', 'The dog is chasing', 'The cat runs fast'], correct: 1, category: 'English' },
    { question: 'Which word is an adjective?', options: ['Quickly', 'Beautiful', 'Run', 'Happiness'], correct: 1, category: 'English' },
    { question: 'What is a "metaphor"?', options: ['A comparison using like/as', 'A direct comparison without like/as', 'A type of poem', 'An exaggeration'], correct: 1, category: 'English' },
    { question: 'Correct sentence?', options: ['She don\'t know', 'She doesn\'t knows', 'She doesn\'t know', 'She not know'], correct: 2, category: 'English' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const categories = [
  { name: 'Singing & Music',    emoji: '🎵', color: 'from-pink-500 to-rose-600',     light: 'bg-pink-500/15 border-pink-500/30 text-pink-300',     group: 'Creative Arts' },
  { name: 'Drawing & Art',      emoji: '🎨', color: 'from-purple-500 to-violet-600', light: 'bg-purple-500/15 border-purple-500/30 text-purple-300', group: 'Creative Arts' },
  { name: 'Photography',        emoji: '📷', color: 'from-slate-500 to-gray-700',    light: 'bg-slate-500/15 border-slate-500/30 text-slate-300',   group: 'Creative Arts' },
  { name: 'Dance',              emoji: '💃', color: 'from-fuchsia-500 to-pink-700',  light: 'bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300', group: 'Creative Arts' },
  { name: 'Guitar & Instruments', emoji: '🎸', color: 'from-amber-500 to-orange-600', light: 'bg-amber-500/15 border-amber-500/30 text-amber-300', group: 'Creative Arts' },
  { name: 'Cooking',            emoji: '🍳', color: 'from-orange-500 to-red-600',    light: 'bg-orange-500/15 border-orange-500/30 text-orange-300', group: 'Lifestyle' },
  { name: 'Fitness & Yoga',     emoji: '🧘', color: 'from-green-500 to-teal-600',    light: 'bg-green-500/15 border-green-500/30 text-green-300',   group: 'Lifestyle' },
  { name: 'Public Speaking',    emoji: '🎤', color: 'from-cyan-500 to-blue-600',     light: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',      group: 'Lifestyle' },
  { name: 'Web Development',    emoji: '🌐', color: 'from-blue-600 to-indigo-700',   light: 'bg-blue-500/15 border-blue-500/30 text-blue-300',      group: 'Technology' },
  { name: 'JavaScript',         emoji: '⚡', color: 'from-yellow-500 to-amber-600',  light: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300', group: 'Technology' },
  { name: 'React',              emoji: '⚛️', color: 'from-cyan-500 to-sky-600',      light: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',      group: 'Technology' },
  { name: 'Python',             emoji: '🐍', color: 'from-green-600 to-emerald-700', light: 'bg-green-500/15 border-green-500/30 text-green-300',   group: 'Technology' },
  { name: 'Data Structures',    emoji: '🧩', color: 'from-violet-600 to-purple-700', light: 'bg-violet-500/15 border-violet-500/30 text-violet-300', group: 'Technology' },
  { name: 'General Knowledge',  emoji: '🌍', color: 'from-teal-500 to-cyan-600',    light: 'bg-teal-500/15 border-teal-500/30 text-teal-300',      group: 'Knowledge' },
  { name: 'Science',            emoji: '🔬', color: 'from-lime-500 to-green-600',    light: 'bg-lime-500/15 border-lime-500/30 text-lime-300',      group: 'Knowledge' },
  { name: 'Mathematics',        emoji: '📐', color: 'from-indigo-600 to-blue-700',   light: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300', group: 'Knowledge' },
  { name: 'History',            emoji: '📜', color: 'from-amber-600 to-yellow-700',  light: 'bg-amber-500/15 border-amber-500/30 text-amber-300',   group: 'Knowledge' },
  { name: 'English',            emoji: '📝', color: 'from-rose-500 to-pink-700',     light: 'bg-rose-500/15 border-rose-500/30 text-rose-300',      group: 'Knowledge' },
];

const groups = ['Creative Arts', 'Lifestyle', 'Technology', 'Knowledge'];

const TIMER_MAX = 15;
const QUESTIONS_PER_GAME = 8;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Gamification: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [activeGroup, setActiveGroup] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(TIMER_MAX);
  const [answers, setAnswers] = useState<{ correct: boolean; skipped: boolean }[]>([]);

  const currentQ = questions[currentIndex];
  const catConfig = categories.find((c) => c.name === selectedCategory);

  const endGame = useCallback((finalScore: number, finalXp: number) => {
    setScore(finalScore);
    setXpEarned(finalXp);
    setGameState('result');
    const token = localStorage.getItem('token');
    if (token && finalXp > 0) {
      fetch('http://localhost:5000/api/users/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: finalXp }),
      }).catch(() => {});
    }
  }, []);

  const nextQuestion = useCallback((wasCorrect: boolean, skipped = false) => {
    setAnswers((prev) => [...prev, { correct: wasCorrect, skipped }]);
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      endGame(score + (wasCorrect ? 1 : 0), xpEarned);
    } else {
      setCurrentIndex(nextIdx);
      setSelected(null);
      setTimer(TIMER_MAX);
    }
  }, [currentIndex, questions.length, score, xpEarned, endGame]);

  const handleAnswer = useCallback((optionIdx: number) => {
    if (selected !== null) return;
    setSelected(optionIdx);
    const isCorrect = optionIdx === currentQ.correct;
    if (isCorrect) {
      const speed = timer > 10 ? 3 : timer > 5 ? 2 : 1;
      const newStreak = streak + 1;
      setStreak(newStreak);
      const earned = 10 * speed + (newStreak >= 3 ? 5 : 0);
      setXpEarned((prev) => prev + earned);
      setScore((prev) => prev + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => nextQuestion(isCorrect), 1200);
  }, [selected, currentQ, timer, streak, nextQuestion]);

  useEffect(() => {
    if (gameState !== 'playing' || selected !== null) return;
    if (timer === 0) { setStreak(0); nextQuestion(false, true); return; }
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, gameState, selected, nextQuestion]);

  const startGame = (category: string) => {
    const pool = questionBank[category] || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME);
    setSelectedCategory(category);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setXpEarned(0);
    setStreak(0);
    setTimer(TIMER_MAX);
    setAnswers([]);
    setGameState('playing');
  };

  const timerPct = (timer / TIMER_MAX) * 100;
  const timerColor = timer > 10 ? 'bg-green-500' : timer > 5 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse';
  const visibleCats = activeGroup === 'All' ? categories : categories.filter((c) => c.group === activeGroup);

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (gameState === 'menu') return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white p-2 transition-colors">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-white text-2xl font-black">Quiz Game 🎮</h1>
          <p className="text-slate-400 text-sm">Choose a category and test your knowledge</p>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-gradient-to-r from-indigo-600/15 to-purple-600/15 border border-indigo-500/20 rounded-2xl p-4 mb-6 flex flex-wrap gap-4">
        {[{ e: '❓', v: `${QUESTIONS_PER_GAME} Questions` }, { e: '⏱', v: '15s Each' }, { e: '⚡', v: 'Earn XP' }, { e: '🔥', v: 'Streak Bonus' }, { e: '📚', v: '18 Categories' }].map((s) => (
          <div key={s.v} className="flex items-center gap-2">
            <span className="text-lg">{s.e}</span>
            <span className="text-white text-sm font-medium">{s.v}</span>
          </div>
        ))}
      </div>

      {/* Group Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['All', ...groups].map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${activeGroup === g ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#141830] border-white/8 text-slate-400 hover:border-white/20 hover:text-white'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {visibleCats.map((cat) => (
          <button
            key={cat.name}
            onClick={() => startGame(cat.name)}
            className="group bg-[#141830] border border-white/8 rounded-2xl p-4 text-center hover:border-white/20 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center gap-2.5"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md`}>
              {cat.emoji}
            </div>
            <p className="text-white font-semibold text-xs leading-tight">{cat.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${cat.light}`}>{cat.group}</span>
          </button>
        ))}
      </div>

      {/* XP guide */}
      <div className="mt-6 bg-[#141830] border border-white/8 rounded-2xl p-4">
        <p className="text-white font-bold text-sm mb-3">⚡ XP Rewards</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
          {[
            { l: 'Fast answer (>10s left)', v: '+30 XP' },
            { l: 'Medium answer (5–10s)', v: '+20 XP' },
            { l: 'Slow answer (<5s)', v: '+10 XP' },
            { l: '3+ correct streak', v: '+5 bonus XP' },
          ].map((g) => (
            <div key={g.l} className="bg-white/5 rounded-xl p-2.5 text-center">
              <p className="text-yellow-400 font-bold">{g.v}</p>
              <p className="mt-0.5">{g.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── PLAYING ───────────────────────────────────────────────────────────────
  if (gameState === 'playing' && currentQ) return (
    <div className="min-h-screen bg-[#0a0d1a] p-4 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setGameState('menu')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
            <FaArrowLeft /> Exit
          </button>
          <div className="flex items-center gap-2">
            {catConfig && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${catConfig.light}`}>
                {catConfig.emoji} {selectedCategory}
              </span>
            )}
            {streak >= 2 && (
              <span className="flex items-center gap-1 text-orange-400 font-bold text-sm animate-bounce">
                <FaFire /> {streak}x
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm">{currentIndex + 1}/{questions.length}</span>
            <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
              <FaBolt className="text-xs" />{xpEarned}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-slate-500 text-xs flex items-center gap-1"><FaClock className="text-xs" /> Time</span>
            <span className={`text-sm font-black ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timer}s</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5 justify-center">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i < currentIndex ? (answers[i]?.correct ? 'bg-green-500 w-4' : 'bg-red-500 w-4') : i === currentIndex ? 'bg-white w-6' : 'bg-white/20 w-4'}`} />
          ))}
        </div>

        {/* Question */}
        <div className="bg-[#141830] border border-white/8 rounded-2xl p-6 mb-4">
          <p className="text-white text-lg font-bold leading-relaxed">{currentQ.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let cls = 'bg-[#141830] border-white/8 text-white hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer';
            if (selected !== null) {
              if (idx === currentQ.correct) cls = 'bg-green-500/20 border-green-500 text-green-300 cursor-default';
              else if (idx === selected && selected !== currentQ.correct) cls = 'bg-red-500/20 border-red-500 text-red-300 cursor-default';
              else cls = 'bg-[#141830] border-white/5 text-slate-500 cursor-default';
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                className={`w-full border rounded-xl px-5 py-4 text-left text-sm font-medium transition-all flex items-center justify-between ${cls}`}>
                <span>{option}</span>
                {selected !== null && idx === currentQ.correct && <FaCheck className="text-green-400 flex-shrink-0" />}
                {selected !== null && idx === selected && selected !== currentQ.correct && <FaTimes className="text-red-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (gameState === 'result') return (
    <div className="min-h-screen bg-[#0a0d1a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#141830] border border-white/8 rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4">{score >= 7 ? '🏆' : score >= 5 ? '🥈' : score >= 3 ? '🥉' : '💪'}</div>
        <h2 className="text-3xl font-black text-white mb-1">{score >= 7 ? 'Excellent!' : score >= 5 ? 'Good Job!' : score >= 3 ? 'Keep Going!' : 'Keep Practicing!'}</h2>
        {catConfig && (
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border ${catConfig.light}`}>
            {catConfig.emoji} {selectedCategory}
          </span>
        )}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-white/5 rounded-2xl py-4"><p className="text-white font-black text-2xl">{score}/{questions.length}</p><p className="text-slate-500 text-xs mt-1">Score</p></div>
          <div className="bg-yellow-500/10 rounded-2xl py-4">
            <p className="text-yellow-400 font-black text-2xl flex items-center justify-center gap-1"><FaBolt className="text-base" />{xpEarned}</p>
            <p className="text-slate-500 text-xs mt-1">XP Earned</p>
          </div>
          <div className="bg-white/5 rounded-2xl py-4"><p className="text-white font-black text-2xl">{Math.round((score / questions.length) * 100)}%</p><p className="text-slate-500 text-xs mt-1">Accuracy</p></div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
          <p className="text-slate-300 text-sm font-semibold mb-3">Answer Review</p>
          <div className="flex flex-wrap gap-2">
            {answers.map((a, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${a.correct ? 'bg-green-500/20 text-green-400' : a.skipped ? 'bg-slate-500/20 text-slate-400' : 'bg-red-500/20 text-red-400'}`}>
                {a.correct ? <FaCheck /> : a.skipped ? '–' : <FaTimes />}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => startGame(selectedCategory)} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all">
            🔄 Play Again ({catConfig?.emoji} {selectedCategory})
          </button>
          <button onClick={() => setGameState('menu')} className="w-full py-3.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/8">
            🎯 Choose Another Category
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full py-2 text-slate-400 hover:text-white text-sm transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return null;
};

export default Gamification;