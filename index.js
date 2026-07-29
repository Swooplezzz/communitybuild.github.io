
  // ========================================================
  // 1. ENGINE CONSTANTS & MATHEMATICAL TRACKING SYSTEM
  // ========================================================
  let targetScroll = window.scrollY;
  let currentScroll = window.scrollY;
  let isScrolling = false;



  function smoothScrollLoop() {
    // Linear Interpolation physics (LERP)
    const easeFactor = 0.035; 
    currentScroll += (targetScroll - currentScroll) * easeFactor;
    
    window.scrollTo(0, currentScroll);

    // Keep running frame rendering checks until calculation closes gap
    if (Math.abs(targetScroll - currentScroll) > 0.3) {
      requestAnimationFrame(smoothScrollLoop);
    } else {
      currentScroll = targetScroll;
      window.scrollTo(0, targetScroll);
      isScrolling = false;
    }
  }

  // Desktop Mouse Wheel Integration Listener
  window.addEventListener("wheel", (event) => {
    if (matchMedia('(pointer:coarse)').matches) return; 
    event.preventDefault();

    const scrollSensitivity = 1.0; 
    targetScroll += event.deltaY * scrollSensitivity;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(smoothScrollLoop);
    }
  }, { passive: false });

  window.addEventListener("resize", () => {
    targetScroll = window.scrollY;
    currentScroll = window.scrollY;
  });

  // ========================================================
  // 2. FIXED: INLINE ELEMENT PLUG FOR SCROLL INTO VIEW
  // ========================================================
  // Overrides native element engines to route coordinates straight into the smooth engine
  Element.prototype.scrollIntoView = function () {
    const rect = this.getBoundingClientRect();
    
    // Crucial math fix: adds your document layer position offset to the box window
    const targetY = window.scrollY + rect.top;
    
    // If you have a sticky navbar overlay, adjust this value to prevent covering text
    const navbarOffset = 0; 
    targetScroll = targetY - navbarOffset;
    
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(smoothScrollLoop);
    }
  };

  // ========================================================
  // 3. INLINE HTML EVENT INTERFACES (MUST BE DECLARED EARLY)
  // ========================================================
  function OnHomeClick() {
    const section = document.getElementById("landing");
    if (section) section.scrollIntoView();
  }
  function OnProductsMIClick() {
    const section = document.getElementById("misect");
    if (section) section.scrollIntoView();
  }
  function OnProductsMBClick() {
    const section = document.getElementById("mbsect");
    if (section) section.scrollIntoView();
  }
  function onWhatsNewClick() {
    const section = document.getElementById("misect");
    if (section) section.scrollIntoView();
  }
  function OnDownloadsClick() {
    const element = document.getElementById("dwnsect");
    if (element) element.scrollIntoView();
  }
  function OnMIClick() {
    setTimeout("open('/mineimator', '_self')", 0);
  }
  function onSupportClick() {
    setTimeout("open('https://patreon.com/mineimatorcb?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink', '_self')", 0);
  }
  function OnMBClick() {
    setTimeout("open('/modelbench', '_self')", 0);
  }

  // ========================================================
  // 4. MATRIX 3D ANGLE ROTATION PIPELINE
  // ========================================================
  document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".section");
    const activeSections = new Map();
    const positionData = new Map();

    sections.forEach((section) => {
      const title = section.querySelector(".Title") || section.querySelector(".title");
      if (title && title.id != "ignore-3d") {
        positionData.set(title, {
          currentRot: 0,
          targetRot: 0,
          currentTrans: 0,
          targetTrans: 0
        });
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        activeSections.set(entry.target, entry.isIntersecting);
      });
      requestAnimationFrame(updateAllAnimations);
    }, { threshold: 0 });

    sections.forEach(section => {
      if (section.querySelector(".Title") || section.querySelector(".title")) {
        observer.observe(section);
      }
    });

 function updateAllAnimations() {
      let anyVisible = false;

      sections.forEach(section => {
        if (!activeSections.get(section)) return;
        anyVisible = true;

        const title = section.querySelector(".Title") || section.querySelector(".title");
        const screenshot = section.querySelector("#app-screenshot") || section.querySelector("#app-screenshot");
        const splash = section.querySelector("#splash") || section.querySelector("#splash");
        const data = positionData.get(title);
        if (!data) return;

        const rect = title.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const elementCenter = rect.top + rect.height / 2;
        // -1 at the top of the screen, 0 at center, 1 at the bottom
        const distanceFromCenter = (elementCenter - viewportHeight / 2) / (viewportHeight);
        const normalizedDistance = Math.max(-1, Math.min(1, distanceFromCenter));

        // Used for Y-axis and Translation (peaks at center)
        const smoothCurve = Math.cos(normalizedDistance * Math.PI * 0.5);

        // Maximum values for the animations
        const targetMaxAngleY = 20; 
        const maxMoveInward = -50; 
        const targetMaxAngleX = 45; // Max tilt for the X-axis (adjust for intensity)

        // Calculate targets
        data.targetRotY = targetMaxAngleY * smoothCurve;
        data.targetTrans = maxMoveInward * smoothCurve;
        
        // X-axis target: Tilts elements below center UP, and elements above center DOWN.
        // Multiply by -1 if the tilt is pointing away from you instead of towards you, 
        // depending on your CSS perspective setup.
        data.targetRotX = normalizedDistance * targetMaxAngleX;

        // Apply easing
        const easeFactor = 0.05;
        // Make sure data.currentRotX is initialized in your setup function!
        data.currentRotX = (data.currentRotX || 0) + (data.targetRotX - (data.currentRotX || 0)) * easeFactor;
        
        // I renamed currentRot to currentRotY for clarity
        data.currentRotY = (data.currentRotY || 0) + (data.targetRotY - (data.currentRotY || 0)) * easeFactor;
        data.currentTrans += (data.targetTrans - data.currentTrans) * easeFactor;

        // Apply transforms
        title.style.transform = `
          translateX(${data.currentTrans.toFixed(2)}px) 
          rotateX(${data.currentRotX.toFixed(2)/ 2}deg) 
          rotateY(${data.currentRotY.toFixed(2)}deg) 
          rotateZ(0deg)
        `;
        if(splash){
        splash.style.transform = `
          translateX(${-data.currentTrans.toFixed(2) * 0.5}px) 
          rotateX(${-data.currentRotX.toFixed(2)/ 2}deg) 
          rotateY(${-data.currentRotY.toFixed(2)}deg) 
          rotateZ(0deg)
        `;
        }
        if(screenshot){
          screenshot.style.transform = `
          translateX(${-data.currentTrans.toFixed(2) * 0.5}px) 
          rotateX(${data.currentRotX.toFixed(2)/ 4}deg) 
          rotateY(${-data.currentRotY.toFixed(2) / 2}deg) 
          rotateZ(0deg)
        `;
        }
      });

      if (anyVisible) {
        requestAnimationFrame(updateAllAnimations);
      }
    }

    const usernameLists = [
    ["Frostychillz", "BNMBrandonMI", "Jossamations", "Charlojane", "AntPlayz"],
    ["Hydra", "AhmedAAK", "Myra", "BrunoAventur", "Blue", "Krazescreen"],
    ["WinnyThailandFX", "Realtona", "Kevqqn", "Fng", "LOLIN__MALO", "Wolga"],
    ["Creez", "Em Z", "bbbitsie", "exoticbuilder", "Pearick", "CraftySmitty"],
    ["StatiKSurge", "ZeroAcousta", "Chrisation", "ChrisLight", "K3LP", "StarWeevil"],
    ["Frostychillz", "BNMBrandonMI", "Jossamations", "Charlojane", "AntPlayz"],
    ["Hydra", "AhmedAAK", "Myra", "BrunoAventur", "Blue", "Krazescreen"],
    ["WinnyThailandFX", "Realtona", "Kevqqn", "Fng", "LOLIN__MALO", "Wolga"],
    ["Creez", "Em Z", "bbbitsie", "exoticbuilder", "Pearick", "CraftySmitty"],
    ["StatiKSurge", "ZeroAcousta", "Chrisation", "ChrisLight", "K3LP", "StarWeevil"],
    ["Frostychillz", "BNMBrandonMI", "Jossamations", "Charlojane", "AntPlayz"],
    ["Hydra", "AhmedAAK", "Myra", "BrunoAventur", "Blue", "Krazescreen"],
    ["WinnyThailandFX", "Realtona", "Kevqqn", "Fng", "LOLIN__MALO", "Wolga"],
    ["Creez", "Em Z", "bbbitsie", "exoticbuilder", "Pearick", "CraftySmitty"],
    ["StatiKSurge", "ZeroAcousta", "Chrisation", "ChrisLight", "K3LP", "StarWeevil"]
    // ... add more as needed
];
// Grab the gradient elements
const gradientConfigs = [
    { element: document.getElementById('gradient1'), interval: 7000 },  // 7 seconds
    { element: document.getElementById('gradient2'), interval: 11000 }, // 11 seconds
    { element: document.getElementById('gradient3'), interval: 9000 }   // 9 seconds
  ];

  const moveRange = 1080; 
  const minOpacity = 0.02; // Drops almost completely invisible
  const maxOpacity = 0.4;  // Flares up to full maximum brightness

  gradientConfigs.forEach(config => {
    if (!config.element) return;

    // Set transition with a dramatic ease-in-out for punchier fading
    config.element.style.transition = `transform ${config.interval}ms cubic-bezier(0.37, 0, 0.63, 1), opacity ${config.interval}ms ease-in-out`;

    function floatGradient() {
      const randomX = Math.floor(Math.random() * (moveRange * 2)) - moveRange;
      const randomY = Math.floor(Math.random() * (moveRange * 2)) - moveRange;
      
      // Random opacity favoring the extreme ends (deep fades vs strong flares)
      const randomOpacity = (Math.random() * (maxOpacity - minOpacity) + minOpacity).toFixed(2);

      config.element.style.transform = `translate(${randomX}px, ${randomY}px)`;
      config.element.style.opacity = randomOpacity;

      setTimeout(floatGradient, config.interval);
    }

    floatGradient();
  });
const container = document.querySelectorAll('.text-wall');

usernameLists.forEach((list, index) => {
    const wall = document.createElement('div');
    wall.className = 'username-wall';
    wall.style.setProperty('--t', `${45 + index}s`);
    
    // Create the text string
    const text = `• ${list.join(' • ')} `;
    
    // Repeat the content 3 times to ensure there's enough 
    // buffer for the animation to loop seamlessly
    wall.innerHTML = `<p>${text.repeat(8)}</p> <p>${text.repeat(8)}</p>`;
    console.log("Text appended.");
    container[0].appendChild(wall);
});
usernameLists.forEach((list, index) => {
    const wall = document.createElement('div');
    wall.className = 'username-wall';
    wall.style.setProperty('--t', `${45 + index}s`);
    
    // Create the text string
    const text = `• ${list.join(' • ')} `;
    
    // Repeat the content 3 times to ensure there's enough 
    // buffer for the animation to loop seamlessly
    wall.innerHTML = `<p>${text.repeat(8)}</p> <p>${text.repeat(8)}</p>`;
    console.log("Text appended.");
    container[1].appendChild(wall);
});

  });
