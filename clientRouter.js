let routes = null;
let routeContainer = null;

// Handles matching the current path to defined routes
function processRoutes() {
  const currentPath = window.location.pathname;

  if (!routeContainer) return;

  // Try to match the current path against each defined route
  for (const route in routes) {
    if (route === "404") continue;

    const routeParts = route.split("/").filter(Boolean);
    const pathParts = currentPath.split("/").filter(Boolean);

    // If path and route have different segment counts, skip
    if (routeParts.length !== pathParts.length) continue;

    const params = {};
    let matched = true;

    // Compare each segment of route and path
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        // Extract param name and value
        const paramName = routeParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      // Render matched route
      const content = routes[route](params);
      routeContainer.innerHTML = content;
      handleLinks(); // Rebind link events
      return;
    }
  }

  // No route matched, render 404 page
  if (routes["404"]) {
    routeContainer.innerHTML = routes["404"]();
    handleLinks();
  }
}

//  Adds click event listeners to all links with [data-href] attributes.
function handleLinks() {
  const links = document.querySelectorAll("a[data-href]");
  links.forEach((link) => {
    link.removeEventListener("click", handleLinkClick); // Prevent duplicate listeners
    link.addEventListener("click", handleLinkClick);
  });
}


//  Handles single-page navigation when a link is clicked.
function handleLinkClick(e) {
  e.preventDefault();
  const href = e.currentTarget.dataset.href;
  if (href && window.location.pathname !== href) {
    // Change URL without reloading the page
    window.history.pushState(null, "", href);
    processRoutes(); // Re-render the route
  }
}

// Listens to back/forward browser button events and re-renders the route.
function handleRouteChange() {
  window.onpopstate = processRoutes;
}



export function initializeRouter(routeList, container) {
  routes = routeList;
  routeContainer = container;

  processRoutes();      // Render initial route
  handleRouteChange();  // Handle back/forward buttons
}
