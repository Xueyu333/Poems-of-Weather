/**
 * Creates and applies the SVG gooey filter effect for text animations
 */
(function() {
    // Execute when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Create SVG filter for gooey effect
        const filterSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        filterSvg.style.position = 'absolute';
        filterSvg.style.width = '0';
        filterSvg.style.height = '0';
        filterSvg.style.overflow = 'hidden';
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'gooey');
        
        const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        blur.setAttribute('in', 'SourceGraphic');
        // Reduced blur value for better readability
        blur.setAttribute('stdDeviation', '2');
        blur.setAttribute('result', 'blur');
        
        const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        colorMatrix.setAttribute('in', 'blur');
        colorMatrix.setAttribute('mode', 'matrix');
        // Adjusted matrix values to reduce gooey effect strength
        colorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -8');
        colorMatrix.setAttribute('result', 'gooey');
        
        const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        composite.setAttribute('in', 'SourceGraphic');
        composite.setAttribute('in2', 'gooey');
        // Changed operator to lighter for more visible original text
        composite.setAttribute('operator', 'lighter');
        
        // Assemble the SVG filter components
        filter.appendChild(blur);
        filter.appendChild(colorMatrix);
        filter.appendChild(composite);
        defs.appendChild(filter);
        filterSvg.appendChild(defs);
        
        // Insert the SVG filter at the beginning of the document body
        document.body.insertBefore(filterSvg, document.body.firstChild);
        
        // Process title text for animation effects
        const titleElements = document.querySelectorAll('.poems-of-the');
        
        titleElements.forEach(titleElement => {
            // Save original text
            const originalText = titleElement.textContent;
            
            // Clear existing text
            titleElement.innerHTML = '';
            
            // Create individual spans for each letter for animation
            [...originalText].forEach((letter, index) => {
                const span = document.createElement('span');
                span.textContent = letter === ' ' ? '\u00A0' : letter; // Use non-breaking space
                span.style.setProperty('--i', index);
                titleElement.appendChild(span);
            });
        });
    });
})();