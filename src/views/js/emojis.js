class Emoji {
    constructor(caja, btn, input) {
      this.caja = caja;
      this.btn = btn;
      this.input = input;
      this.iconExit = `<i class="fa-solid fa-circle-xmark"></i>`;
      this.iconEmoji = `<i class="fa-solid fa-face-grin"></i>`;
    }
  
    views() {
      this.caja.classList.toggle("view");
      if(this.btn.name === "closed") {
          this.btn.innerHTML = this.iconExit;
          this.btn.name = "open";
      } else {
          this.btn.innerHTML = this.iconEmoji;
          this.btn.name = "closed";
      }
    }
  
    write(event) {
      this.input.value += event.detail.unicode;
    }
}