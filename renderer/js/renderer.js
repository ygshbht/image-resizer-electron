const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

let isProportionalBtnActive = true;

const proportionalBtn = document.querySelector("#proportional-button");
let widthValue = 0;
let heightValue = 0;

let proportion = 1;

proportionalBtn.addEventListener("click", toggleProportionalButton);

widthInput.addEventListener("input", handleInputChange);
heightInput.addEventListener("input", handleInputChange);

function handleInputChange(e) {
  const newValue = parseInt(e.target.value);

  if (!newValue || isNaN(newValue)) {
    widthValue = 0;
    heightValue = 0;
    widthInput.value = widthValue;
    heightInput.value = heightValue;
  }

  if (e.target === heightInput) {
    if (isProportionalBtnActive) {
      const newWidth = parseInt(newValue * proportion);
      widthInput.value = parseInt(newWidth);
      widthValue = newWidth;
    }
    heightValue = newValue;
  } else {
    if (isProportionalBtnActive) {
      const newHeight = parseInt(newValue / proportion);
      heightInput.value = parseInt(newHeight);
      heightValue = newHeight;
    }
    widthValue = newValue;
  }
}

function toggleProportionalButton(e) {
  e.stopImmediatePropagation();
  e.preventDefault();
  const btn = proportionalBtn;
  if (isProportionalBtnActive) {
    btn.classList.remove("active");
  } else {
    btn.classList.add("active");
    proportion = widthValue / heightValue;
  }
  isProportionalBtnActive = !isProportionalBtnActive;
}

// Load image and show form
function loadImage(e) {
  const file = e.target.files[0];

  // Check if file is an image
  if (!isFileImage(file)) {
    alertError("Please select an image");
    return;
  }

  // Add current height and width to form using the URL API
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;

    widthValue = parseInt(this.width);
    heightValue = parseInt(this.height);
    proportion = widthValue / heightValue;
  };

  // Show form, image name and output path
  form.style.display = "block";
  filename.innerHTML = img.files[0].name;
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

// Make sure file is an image
function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return file && acceptedImageTypes.includes(file["type"]);
}

// Resize image
function resizeImage(e) {
  e.preventDefault();

  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if (widthInput.value === "" || heightInput.value === "") {
    alertError("Please enter a width and height");
    return;
  }

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  ipcRenderer.send("image:resize", {
    imgPath,
    height,
    width,
  });
}

// When done, show message
ipcRenderer.on("image:done", () =>
  alertSuccess(`Image resized to ${heightInput.value} x ${widthInput.value}`)
);

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

// File select listener
img.addEventListener("change", loadImage);
// Form submit listener
form.addEventListener("submit", resizeImage);
