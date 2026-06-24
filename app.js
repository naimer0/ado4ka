document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hearts-canvas');
    const ctx = canvas.getContext('2d');
    
    let heartsArray = [];
    let animationFrameId = null;
    
    const isMobile = window.innerWidth < 768;
    
    const colors = ['#ff85a2', '#ffccd5', '#ff4d6d', '#ffb3c1', '#c3b1e1', '#e8dbfc'];
    const heartTemplates = {};
    const templateSize = 48;
    
    function preRenderHearts() {
        colors.forEach(color => {
            const offscreen = document.createElement('canvas');
            offscreen.width = templateSize;
            offscreen.height = templateSize;
            const oCtx = offscreen.getContext('2d');
            
            oCtx.fillStyle = color;
            oCtx.beginPath();
            
            oCtx.moveTo(0, templateSize / 4);
            oCtx.quadraticCurveTo(0, 0, templateSize / 2, 0);
            oCtx.quadraticCurveTo(templateSize, 0, templateSize, templateSize / 4);
            oCtx.quadraticCurveTo(templateSize, templateSize * 0.6, templateSize / 2, templateSize * 0.9);
            oCtx.quadraticCurveTo(0, templateSize * 0.6, 0, templateSize / 4);
            
            oCtx.closePath();
            oCtx.fill();
            
            heartTemplates[color] = offscreen;
        });
    }
    preRenderHearts();
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Heart {
        constructor(isBurst = false, startX = null, startY = null) {
            this.isBurst = isBurst;
            this.reset(startX, startY);
        }
        
        reset(startX = null, startY = null) {
            this.x = startX !== null ? startX : Math.random() * canvas.width;
            this.y = startY !== null ? startY : (this.isBurst ? startY : -20 - Math.random() * 100);
            this.size = Math.random() * 12 + 8;
            
            if (this.isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 1;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed - 1.5;
                this.opacity = 1.0;
                this.decay = Math.random() * 0.02 + 0.015;
            } else {
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 0.8 + 0.5;
                this.opacity = Math.random() * 0.4 + 0.3;
                this.swaySpeed = Math.random() * 0.02 + 0.01;
                this.swayOffset = Math.random() * 100;
            }
            
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            if (this.isBurst) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity -= this.decay;
            } else {
                this.y += this.speedY;
                this.x += this.speedX + Math.sin((this.y * this.swaySpeed) + this.swayOffset) * 0.3;
                
                if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
                    this.reset();
                }
            }
        }
        
        draw() {
            const template = heartTemplates[this.color];
            if (!template) return;
            
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(
                template,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
            ctx.restore();
        }
    }
    
    const baseCount = Math.min(30, Math.floor((window.innerWidth * window.innerHeight) / 40000));
    const numHearts = isMobile ? Math.min(12, baseCount) : baseCount;
    for (let i = 0; i < numHearts; i++) {
        heartsArray.push(new Heart(false, Math.random() * canvas.width, Math.random() * canvas.height));
    }
    
    function animateHearts() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        heartsArray = heartsArray.filter(heart => {
            heart.update();
            heart.draw();
            return !heart.isBurst || heart.opacity > 0;
        });
        
        animationFrameId = requestAnimationFrame(animateHearts);
    }
    animateHearts();
    
    function createHeartBurst(x, y) {
        const count = isMobile ? 8 : 15;
        for (let i = 0; i < count; i++) {
            heartsArray.push(new Heart(true, x, y));
        }
    }
    
    const envelope = document.getElementById('envelope');
    const letter = document.getElementById('letter-card');
    
    envelope.addEventListener('click', (e) => {
        envelope.classList.toggle('open');
        const rect = envelope.getBoundingClientRect();
        createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    
    letter.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    
    polaroidCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const img = card.querySelector('img');
            const caption = card.querySelector('.polaroid-caption');
            
            lightboxImg.src = img.src;
            lightboxCaption.textContent = caption ? caption.textContent : "";
            
            lightbox.classList.add('show');
            createHeartBurst(e.clientX, e.clientY);
        });
    });
    
    function closeLightbox() {
        lightbox.classList.remove('show');
    }
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            if (envelope.classList.contains('open')) {
                envelope.classList.remove('open');
            }
        }
    });
    
    const reasons = [
        "Твоя улыбка поднимает мне настроение даже в самый ужасный день",
        "Твои очки тебе очень идут",
        "Ты умеешь по-настоящему выслушать и поддержать меня, когда это нужно.",
        "С тобой можно часами болтать обо всем на свете",
        "Ты умеешь понимать меня без лишних слов, с одного только взгляда.",
        "Ты любишь обнимать меня без причины, и мне это нравится",
        "Ты очень искренняя, честная и настоящая.",
        "У тебя очень милый смех.",
        "Ты всегда веришь в меня, даже когда у меня опускаются руки.",
        "Ты самая лучшая девочка, и я тебя безумно люблю. С днем рождения! ❤️"
    ];
    
    let currentReasonIndex = 0;
    const reasonBubble = document.getElementById('reason-bubble');
    const nextReasonBtn = document.getElementById('next-reason-btn');
    
    nextReasonBtn.addEventListener('click', (e) => {
        currentReasonIndex = (currentReasonIndex + 1) % reasons.length;
        const reasonNumber = currentReasonIndex === 0 ? reasons.length : currentReasonIndex;
        reasonBubble.style.opacity = 0;
        
        setTimeout(() => {
            reasonBubble.innerHTML = `<strong>Причина №${reasonNumber}:</strong> ${reasons[currentReasonIndex - 1 < 0 ? reasons.length - 1 : currentReasonIndex - 1]}`;
            reasonBubble.style.opacity = 1;
            reasonBubble.style.animation = 'none';
            reasonBubble.offsetHeight;
            reasonBubble.style.animation = 'fadeIn 0.4s ease';
        }, 150);
        
        createHeartBurst(e.clientX, e.clientY);
    });
});
