document.getElementById("open-youtube").addEventListener("click", function () {
  chrome.tabs.create({ url: "https://www.youtube.com" });
});
