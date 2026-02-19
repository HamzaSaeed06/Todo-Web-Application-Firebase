export function showLoader(btn, text) {
  btn.disabled = true;
  const img = btn.querySelector("img");
  const imgSrc = img ? img.src : null;

  btn.innerHTML = `
    ${imgSrc ? `<img src="${imgSrc}" />` : ""}
    <p class="m-0">${text}</p>
    <svg class='loader' viewBox='25 25 50 50' width='20' height='20'>
      <circle r='20' cy='50' cx='50'></circle>
    </svg>`;
}

export function resetBtn(btn, text) {
  btn.disabled = false;
  const img = btn.querySelector("img");
  const imgSrc = img ? img.src : null;

  if (imgSrc) {
    btn.innerHTML = `<img src="${imgSrc}" /> <span class="m-0">${text}</span>`;
  } else {
    btn.innerHTML = `<p class="m-0">${text}</p>`;
  }
}
