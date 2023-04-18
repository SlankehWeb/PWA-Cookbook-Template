self.addEventListener("install", (event) => {
    console.log("Service Worker has been installed");
  });
  self.addEventListener("activate", (event) => {
    console.log("Service Worker has been activated");
  });