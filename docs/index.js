document.addEventListener("DOMContentLoaded",dom=>{
    // force the user to hover and unhover to make the model photo smaller!
    // deprecated, i think it looks better expanded
    // document.querySelector("#headerimage").addEventListener("mouseover",e=>{
    //     document.querySelector("#headerimage").classList.remove("selected")
    // })

    // replace small w/ big image
    let _img = document.querySelector("#altimage");
    let _bImage = new Image();
    _bImage.src = "art/big_icon.webp";
    _bImage.onload = ()=>{
        _img.style.backgroundImage = `url(${_bImage.src})`;
    }
})