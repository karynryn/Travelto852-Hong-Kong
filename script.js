function dosubmit() {
    const name = document.getElementById('name').value;
    window.alert("Welcome back " + name + "!");
    window.location.href = "index.html";
    return false;
}



   // DOM Elements
        const track = document.getElementById("image-track");
        const modal = document.getElementById("modal");
        const modalImage = document.getElementById("modal-image");
        const modalDescription = document.getElementById("modal-description");
        const closeModal = document.getElementById("close-modal");
        const scrollIndicator = document.querySelector(".scroll-indicator");
        const galleryContainer = document.querySelector('.gallery-container');
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Initial center position
        window.addEventListener('DOMContentLoaded', () => {
            const initialPercentage = -50;
            track.dataset.percentage = initialPercentage;
            track.dataset.prevPercentage = initialPercentage;
            
            requestAnimationFrame(() => {
                applyTrackTransform(initialPercentage);
            });
            
            if (isTouchDevice) {
                const span = scrollIndicator.querySelector('span');
                if (span) span.textContent = "Swipe to navigate";
            }
            
            // Hide scroll indicator after 5 seconds
            setTimeout(() => scrollIndicator.classList.add('hidden'), 5000);
        });
        
        // Throttle function for performance
        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };
        
        // Apply track transform with animation
        const applyTrackTransform = (percentage) => {
            const duration = window.innerWidth <= 768 ? 800 : 1200;
            
            track.animate(
                { transform: `translate(${percentage}%, -50%)` },
                { duration, fill: "forwards", easing: "ease-out" }
            );
            track.style.transform = `translate(${percentage}%, -50%)`;
            
            for (const image of track.getElementsByClassName("image")) {
                image.animate(
                    { objectPosition: `${100 + percentage}% center` },
                    { duration, fill: "forwards", easing: "ease-out" }
                );
                image.style.objectPosition = `${100 + percentage}% center`;
            }
        };
        
        // Handle mouse/touch events
        const handleOnDown = (e) => {
            if (!modal.classList.contains('active')) {
                track.dataset.mouseDownAt = e.clientX || (e.touches && e.touches[0].clientX);
            }
        };
        
        const handleOnUp = () => {
            track.dataset.mouseDownAt = "0";
            track.dataset.prevPercentage = track.dataset.percentage;
        };
        
        const handleOnMove = throttle((e) => {
            if (track.dataset.mouseDownAt === "0" || modal.classList.contains('active')) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (!clientX) return;
            
            const mouseDelta = parseFloat(track.dataset.mouseDownAt) - clientX;
            const maxDelta = window.innerWidth / 2;
            const sensitivityFactor = e.type === "touchmove" ? 0.8 : 1;
            const percentage = (mouseDelta / maxDelta) * -100 * sensitivityFactor;
            const nextPercentage = Math.max(Math.min(parseFloat(track.dataset.prevPercentage) + percentage, 0), -100);
            
            track.dataset.percentage = nextPercentage;
            applyTrackTransform(nextPercentage);
            
            if (!scrollIndicator.classList.contains('hidden')) {
                setTimeout(() => scrollIndicator.classList.add('hidden'), 2000);
            }
        }, 16);
        
        // Wheel event handler
        const handleWheel = throttle((e) => {
            if (modal.classList.contains('active')) return;
            
            if (e.deltaX !== 0 || e.shiftKey) {
                e.preventDefault();
                
                const currentPercentage = parseFloat(track.dataset.percentage) || 0;
                const scrollSensitivity = window.innerWidth <= 768 ? 0.5 : 0.3;
                const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                let nextPercentage = currentPercentage - (delta * scrollSensitivity);
                nextPercentage = Math.max(Math.min(nextPercentage, 0), -100);
                
                track.dataset.percentage = nextPercentage;
                track.dataset.prevPercentage = nextPercentage;
                
                applyTrackTransform(nextPercentage);
                
                if (!scrollIndicator.classList.contains('hidden')) {
                    setTimeout(() => scrollIndicator.classList.add('hidden'), 2000);
                }
            }
        }, 16);
        
        // Modal functions
        const openModal = (image) => {
            modalImage.src = image.src;
            modalImage.alt = image.alt || "Gallery image";
            modalDescription.textContent = image.dataset.description || "Image description not available.";
            modal.style.display = "flex";
            
            void modal.offsetWidth;
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        };
        
        const closeModalWithTransition = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = "none";
                document.body.style.overflow = '';
            }, 400);
        };
        
        // Event Listeners
        track.addEventListener("mousedown", handleOnDown);
        track.addEventListener("touchstart", handleOnDown, { passive: true });
        window.addEventListener("mouseup", handleOnUp);
        window.addEventListener("touchend", handleOnUp);
        window.addEventListener("mousemove", handleOnMove);
        window.addEventListener("touchmove", (e) => {
            if (track.dataset.mouseDownAt !== "0") {
                e.preventDefault();
                handleOnMove(e);
            }
        }, { passive: false });
        
        galleryContainer.addEventListener('wheel', handleWheel, { passive: false });
        
        document.querySelectorAll(".image").forEach(image => {
            image.addEventListener("click", () => openModal(image));
        });
        
        closeModal.addEventListener("click", closeModalWithTransition);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModalWithTransition();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModalWithTransition();
                return;
            }
            
            if (modal.classList.contains('active')) return;
            
            const currentPercentage = parseFloat(track.dataset.percentage) || 0;
            let nextPercentage = currentPercentage;
            const moveAmount = window.innerWidth <= 768 ? 15 : 10;
            
            if (e.key === 'ArrowLeft') {
                nextPercentage = Math.min(currentPercentage + moveAmount, 0);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                nextPercentage = Math.max(currentPercentage - moveAmount, -100);
                e.preventDefault();
            } else {
                return;
            }
            
            track.dataset.percentage = nextPercentage;
            track.dataset.prevPercentage = nextPercentage;
            applyTrackTransform(nextPercentage);
            
            if (!scrollIndicator.classList.contains('hidden')) {
                setTimeout(() => scrollIndicator.classList.add('hidden'), 2000);
            }
        });
        
        // Handle resize
        const handleResize = throttle(() => {
            const currentPercentage = parseFloat(track.dataset.percentage) || 0;
            applyTrackTransform(currentPercentage);
            
            scrollIndicator.classList.remove('hidden');
            setTimeout(() => scrollIndicator.classList.add('hidden'), 3000);
        }, 250);
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.container > div:not(.logo):not(.navbar):not(.user)').forEach(el => {
    el.classList.add('animate-on-load');
  });
});