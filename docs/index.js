function renderPhoto(ele, url){
    let _img = ele;
    let _bImage = new Image();
    _bImage.src = url;
    _bImage.onload = ()=>{
        _img.style.backgroundImage = `url(${_bImage.src})`;
    }
}

document.addEventListener("DOMContentLoaded",dom=>{
    // force the user to hover and unhover to make the model photo smaller!
    // deprecated, i think it looks better expanded
    // document.querySelector("#headerimage").addEventListener("mouseover",e=>{
    //     document.querySelector("#headerimage").classList.remove("selected")
    // })

    // replace small w/ big image
    renderPhoto(document.querySelector("#altimage"), "art/big_icon.webp")
    renderPhoto(document.querySelector("#extrainfo"), "art/big_background.webp")
})