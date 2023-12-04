document.addEventListener("DOMContentLoaded", function () {
  const magnetArea = document.querySelector(".content");

  document.addEventListener("mousemove", function (event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    console.log(mouseX, mouseY);
    const magnetAreaRect = magnetArea.getBoundingClientRect();

    if (
      mouseX >= magnetAreaRect.left &&
      mouseX <= magnetAreaRect.right &&
      mouseY >= magnetAreaRect.top &&
      mouseY <= magnetAreaRect.bottom
    ) {
      console.log("true");
      // Mouse is inside the magnet area
      moveIconsToMouse(mouseX, mouseY);
      // magnetizeIcons();
    } else {
      console.log("false");
      // Mouse is outside the magnet area
      demagnetizeIcons();
      // demagnetizeIcons();
    }
  });

  function moveIconsToMouse(mouseX, mouseY) {
    console.log(mouseX, mouseY);
    const icons = document.querySelectorAll(".icons-dance");

    let x = 4;
    let y = 4;
    let time = 6;
    icons.forEach((icon) => {
      const iconRect = icon.getBoundingClientRect();
   
      x = y + x + 2;
      y = y + x - 2;
      const offsetX = mouseX - iconRect.width / 2;
      const offsetY = mouseY - iconRect.height / 2;
      time = time + 2;
      icon.style.transition = "transform 0.5s";
  // icon.style.transform = `translate(-50%, -50%)`;
      icon.style.animation = `icons ${10}s infinite`;
      icon.style.left = `${offsetX}px`;
      icon.style.top = `${offsetY - y}px`;
      console.log(offsetY);
      // Change the left property directly
      // icon.style.left = `${offsetX}px`;
      
    });
  }

  function demagnetizeIcons() {
    const icons = document.querySelectorAll(".icons-dance");
    let x = 5;
    let time = 6;
    icons.forEach((icon) => {
      x = x + 5;
      time = time + 2;
      console.log("false");
      // icon.style.transition = "transform 0.5s";
      // icon.style.transform = `translate(-50%, -50%)`;
      icon.style.left = `${x}%`;
      icon.style.top = `0`;
      icon.style.animation = `icons ${time}s infinite`;
      console.log(x);
    });
  }
});
