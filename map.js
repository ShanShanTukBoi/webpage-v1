const map = L.map('map').setView([20, 120], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const expandBtn = document.getElementById("expand");
const closeBtn = document.getElementById("close");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

// Load trip data
fetch("trip.json")
  .then(res => res.json())
  .then(data => {

    const coords = [];
    let foundCurrent = false;

    data.locations.forEach((loc, index) => {

      if (foundCurrent) loc.future = true;
      if (loc.current) foundCurrent = true;

      coords.push([loc.lat, loc.lng]);

      const marker = L.marker([loc.lat, loc.lng], {
        icon: L.divIcon({
          className: "number-marker",
          html: `<div class="marker-number">${index + 1}</div>`,
          iconSize: [30, 30]
        })
      }).addTo(map);

      if (loc.current) marker.getElement().classList.add("current-marker");
      else if (loc.future) marker.getElement().classList.add("future-marker");

      marker.on("click", () => openSidebar(loc));
    });

    const route = L.polyline(coords, { color: "blue" }).addTo(map);
    map.fitBounds(route.getBounds());
  });

// Open sidebar with posts
function openSidebar(location) {
  let html = `<h2>${location.name}</h2>`;
  if (location.posts) {
    location.posts.forEach(post => {
      html += `<h3>${post.title}</h3>`;
      html += `<p>${post.text}</p>`;
      if (post.photos && post.photos.length) {
        html += `<div class="post-photos">`;
        post.photos.forEach(photo => {
          html += `<img src="${photo}" alt="Photo from ${location.name}">`;
        });
        html += `</div>`;
      }
    });
  }
  content.innerHTML = html;
  sidebar.classList.add("open");

  // Attach lightbox to all sidebar images
  // Lightbox click
  document.querySelectorAll("#sidebar img").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightbox.classList.remove("hidden");

      // Force size via JS
      lightboxImg.style.width = window.innerWidth * 0.9 + "px";
      lightboxImg.style.height = "auto";
    });
  });

  setTimeout(() => map.invalidateSize(), 310);
}

// Sidebar controls
expandBtn.onclick = () => {
  if (!sidebar.classList.contains("open")) return;
  sidebar.classList.toggle("fullscreen");
  expandBtn.textContent = sidebar.classList.contains("fullscreen") ? "🡼" : "⤢";
  setTimeout(() => map.invalidateSize(), 310);
};

closeBtn.onclick = () => {
  sidebar.classList.remove("open");
  sidebar.classList.remove("fullscreen");
  expandBtn.textContent = "⤢";
  setTimeout(() => map.invalidateSize(), 310);
};

// Lightbox close
lightboxClose.addEventListener("click", () => { 
  lightbox.classList.add("hidden"); 
  lightboxImg.src = ""; 
});
lightbox.addEventListener("click", e => { 
  if (e.target === lightbox) { 
    lightbox.classList.add("hidden"); 
    lightboxImg.src = ""; 
  } 
});