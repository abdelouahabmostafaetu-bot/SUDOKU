// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navMenu.classList.remove('active');
        }
    });
});

// Mobile navigation toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Animated counter for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate counters
            if (entry.target.classList.contains('stat-number')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
            
            // Animate skill bars
            if (entry.target.classList.contains('skill-progress')) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = progress + '%';
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Observe stat numbers
document.querySelectorAll('.stat-number').forEach(stat => {
    observer.observe(stat);
});

// Observe skill bars
document.querySelectorAll('.skill-progress').forEach(bar => {
    observer.observe(bar);
});

// Tab functionality for mathematics section
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Contact form submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Create mailto link
    const mailtoLink = `mailto:abdelouahab.mostafa@email.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    showNotification('Thank you! Your message has been prepared in your email client.', 'success');
    
    // Reset form
    contactForm.reset();
});

// Notification system
function showNotification(message, type = 'info') {
    const colors = {
        success: 'linear-gradient(135deg, #48bb78, #38a169)',
        error: 'linear-gradient(135deg, #fc8181, #f56565)',
        info: 'linear-gradient(135deg, #667eea, #764ba2)'
    };
    
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Back to top button
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Math proof modal functions
function showProof(theoremName) {
    const proofs = {
        pythagoras: `
            <h3>Pythagorean Theorem Proof</h3>
            <p><strong>Statement:</strong> In a right triangle with legs \\(a\\) and \\(b\\) and hypotenuse \\(c\\): \\(a^2 + b^2 = c^2\\)</p>
            <p><strong>Proof by Areas:</strong></p>
            <ol>
                <li>Consider a square with side length \\((a + b)\\)</li>
                <li>Place 4 identical right triangles inside, leaving a smaller square in the center</li>
                <li>Area of large square: \\((a + b)^2 = a^2 + 2ab + b^2\\)</li>
                <li>Area also equals: \\(4 \\times \\frac{1}{2}ab + c^2 = 2ab + c^2\\)</li>
                <li>Therefore: \\(a^2 + 2ab + b^2 = 2ab + c^2\\)</li>
                <li>Simplifying: \\(a^2 + b^2 = c^2\\) \\(\\square\\)</li>
            </ol>
        `,
        ftc: `
            <h3>Fundamental Theorem of Calculus</h3>
            <p><strong>Statement:</strong> If \\(F\\) is an antiderivative of \\(f\\), then:</p>
            <p>\\[\\int_a^b f(x)\\,dx = F(b) - F(a)\\]</p>
            <p><strong>Intuition:</strong> The definite integral (area under curve) can be computed using antiderivatives.</p>
            <p>This theorem connects differentiation and integration as inverse operations.</p>
            <p><strong>Example:</strong> \\(\\displaystyle\\int_0^1 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3} - 0 = \\frac{1}{3}\\)</p>
        `,
        euler: `
            <h3>Euler's Identity</h3>
            <p><strong>Statement:</strong> \\(e^{i\\pi} + 1 = 0\\)</p>
            <p><strong>Derivation:</strong></p>
            <ol>
                <li>Start with Euler's formula: \\(e^{ix} = \\cos(x) + i\\sin(x)\\)</li>
                <li>Substitute \\(x = \\pi\\): \\(e^{i\\pi} = \\cos(\\pi) + i\\sin(\\pi)\\)</li>
                <li>Evaluate: \\(e^{i\\pi} = -1 + i \\cdot 0 = -1\\)</li>
                <li>Therefore: \\(e^{i\\pi} + 1 = 0\\) \\(\\square\\)</li>
            </ol>
            <p>This beautiful equation connects five fundamental constants: \\(e\\), \\(i\\), \\(\\pi\\), \\(1\\), and \\(0\\).</p>
        `
    };
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 3rem;
        border-radius: 20px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        animation: zoomIn 0.3s;
    `;
    
    content.innerHTML = `
        ${proofs[theoremName]}
        <button onclick="this.closest('[style*=fixed]').remove()" style="
            margin-top: 2rem;
            padding: 0.8rem 2rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
        ">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Trigger MathJax to render the new content
    if (window.MathJax) {
        MathJax.typesetPromise([content]).catch((err) => console.log('MathJax error:', err));
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Toggle solution visibility
function toggleSolution(problemId) {
    const solution = document.getElementById(`solution${problemId}`);
    const button = event.target;
    
    if (solution.style.display === 'none') {
        solution.style.display = 'block';
        button.textContent = 'Hide Solution';
    } else {
        solution.style.display = 'none';
        button.textContent = 'Show Solution';
    }
}

// Typing effect for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        const text = typingElement.textContent;
        typeWriter(typingElement, text, 80);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 800);
    }
});

// Random math facts
const mathFacts = [
    "The number π (pi) has been calculated to over 100 trillion digits!",
    "Zero is the only number that cannot be represented in Roman numerals.",
    "The Fibonacci sequence appears frequently in nature.",
    "A 'jiffy' is an actual unit of time: 1/100th of a second.",
    "The symbol for infinity (∞) is called a lemniscate.",
    "111,111,111 × 111,111,111 = 12,345,678,987,654,321",
    "The word 'mathematics' comes from the Greek 'mathemata' meaning knowledge.",
    "Euler's number (e) is the base of natural logarithms, approximately 2.71828."
];

// Display random math fact on load
if (Math.random() > 0.7) {
    setTimeout(() => {
        const randomFact = mathFacts[Math.floor(Math.random() * mathFacts.length)];
        showNotification(`💡 Math Fact: ${randomFact}`, 'info');
    }, 2000);
}

// Performance tracking
console.log('%c👋 Welcome to Abdelouahab Mostafa\'s Portfolio!', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%c🎨 Beautiful design meets mathematical precision', 'font-size: 14px; color: #764ba2;');
console.log('%c💻 Built with HTML, CSS, and JavaScript', 'font-size: 12px; color: #718096;');

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        document.body.style.animation = 'rainbow 2s infinite';
        showNotification('🎉 Konami Code Activated! You found the secret!', 'success');
        
        const rainbowStyle = document.createElement('style');
        rainbowStyle.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(rainbowStyle);
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

console.log('%cTry the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', 'color: #667eea; font-style: italic;');
