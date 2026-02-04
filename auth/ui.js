export function showLoader(btn, text) {
  btn.disabled = true;
  btn.innerHTML = `
<img src="${btn.firstElementChild.src}" />    
<p class="m-0">${text}</p>
    <svg class='loader' viewBox='25 25 50 50' width='20' height='20'>
      <circle r='20' cy='50' cx='50'></circle>
    </svg>`;
}

export function resetBtn(btn, text) {
  btn.disabled = false;
  
  btn.innerHTML = `
  <img src="${btn.firstElementChild.src}" />    
  <p class="m-0">${text}</p>`;
}
