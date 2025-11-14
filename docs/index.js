document.addEventListener("DOMContentLoaded",dom=>{
    // force the user to hover and unhover to make the model photo smaller!
    document.querySelector("#headerimage").addEventListener("mouseover",e=>{
        document.querySelector("#headerimage").classList.remove("selected")
    })
})