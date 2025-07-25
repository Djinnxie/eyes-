const controlContainer = document.getElementById('controlContainer');
const phosphorsContainer = document.querySelector('.phosphorsContainer');
const bloom = document.querySelector('.RGB-Bloom')
const sizeDisplay = document.querySelector('.sizeDisplay');
phosphorsContainer.style.display = 'block';
let opacityValue = .9;
let opacityMask = .9;
let testImageId = 0;
let size = 16;
setSize();
// sizeDisplay.innerHTML = `Dot Size: ${size}`


function controlClickHandler(event) {
    switch (event.target.id) {
        case 'toggle-all':
            toggleAll();
            break;
        case 'toggle-r':
            togglePhosphors('red');
            break;
        case 'toggle-g':
            togglePhosphors('green');
            break;
        case 'toggle-b':
            togglePhosphors('blue');
            break;
        case 'toggle-mask':
            toggleDisplay('mask');
            break;
        case 'opacity-mask':
            maskOpacity();
            break;
        case 'reset':
            resetAll();
            break;
        case 'opacitySet':
            changeOpacity();
            break;
        case 'type':
            toggleBloom();
            break;
        case 'flicker':
            toggleDisplay('flicker');
            break;
        case 'imageSet':
            imageSet();
            break;
        case 'sizeUp':
            size++;
            setSize()
            break;
        case 'sizeDown':
            size--;
            setSize()
            break;

    };

    sizeDisplay.textContent = `Dot Size: ${size}`
}


function toggleAll() {
    const crtBlur = document.querySelector('.test-image')
    if (phosphorsContainer.style.display == 'none') {
        phosphorsContainer.style.display = 'block'
        // event.target.style.color = 'black'
        crtBlur.className = 'test-image crt'
    } else {
        crtBlur.className = 'test-image'
        phosphorsContainer.style.display = 'none'

        // event.target.style.color = 'red'
    }
}

function toggleDisplay(elClass) {
    const phosphor = document.querySelector(`.${elClass}`);
    if (phosphor.style.display == 'none') {
        phosphor.style.display = 'block'
        // event.target.style.color = 'black'
    } else {
        phosphor.style.display = 'none'
        // event.target.style.color = 'red'
    }
}

function togglePhosphors(color) {
    const elements = document.querySelector(`.${color}`).children;
    Object.values(elements).forEach(e => {
        f = e.className.split(' ')[1];
        if (document.querySelector(`.${f}`).style.background == '') {

            switch (color) {
                case 'red':
                    document.querySelector(`.${f}`).style.background = 'url(./assets/img/Red.png)'
                    break;
                case 'green':
                    document.querySelector(`.${f}`).style.background = 'url(./assets/img/Green.png)'
                    break;
                case 'blue':
                    document.querySelector(`.${f}`).style.background = 'url(./assets/img/Blue.png)'
                    break;
            }

            event.target.style.color = 'red'
        } else {

            document.querySelector(`.${f}`).style.background = '';
            document.querySelector(`.${f}`).style.setProperty('mix-blend-mode', '');
            event.target.style.color = 'black'
        }
        setSize();
    })
}

function resetAll() {
    const elements = document.querySelectorAll('.scanlines');
    Object.values(elements).forEach(e => {
        f = e.className.split(' ')[1];
        document.querySelector(`.${f}`).style.opacity = ''
        document.querySelector('#opacitySet').innerHTML = 'Phosphor Opacity'
        opacityValue = .9;
    })
    const mask = document.querySelector('.mask');
    const maskBtn = document.querySelector('#opacity-mask');
    mask.style.opacity = '';
    maskBtn.innerHTML = 'Mask Opacity';
    opacityMask = .9;
    size = 16;
    setSize();
}

function changeOpacity(o=-1) {
    const elements = document.querySelectorAll('.scanlines');
    if(o==-1){
        opacityValue+=.1
    }else{
        opacityValue=o;
    }
    opacityValue = parseFloat(opacityValue.toFixed(2))
    Object.values(elements).forEach(e => {
        f = e.className.split(' ')[1];
        if (opacityValue > 1) {
            opacityValue = 0;
            document.querySelector(`.${f}`).style.opacity = `${opacityValue}`;
        } else {
            document.querySelector(`.${f}`).style.opacity = `${opacityValue}`;
        }
    })
}

function maskOpacity(o=-1) {
    const e = document.querySelector('.mask');
    if(o==-1){
        opacityMask+=.1
    }else{
        opacityMask=o;
    }

    // opacityMask += .1;
    opacityMask = parseFloat(opacityMask.toFixed(2));

    if (opacityMask > 1) {
        opacityMask = 0;
        e.style.opacity = `${opacityMask}`;
        // event.target.innerHTML = `Mask Opacity ${opacityMask}`
    } else {

        e.style.opacity = `${opacityMask}`;
        // event.target.innerHTML = `Mask Opacity ${opacityMask}`
    }

}

function maskBlend() {
    const e = document.querySelector('.mask')
}

function imageSet() {
    (testImageId === 6) ? testImageId = 0 : testImageId += 1;

    const el = document.querySelector('.test-image');

    el.style.background = `url(./assets/img/image${testImageId}.png) no-repeat center/100vw`;

    if (testImageId >= 4) {
        el.style.background = `url(./assets/img/video${testImageId}.gif) no-repeat center/100vw`;
    }

}

function setSize() {
    const elements = document.querySelectorAll('.scanlines');
    Object.values(elements).forEach(e => {
        f = e.className.split(' ')[1];
        document.querySelector(`.${f}`).style.backgroundSize = `${size}px ${size}px`
        // document.querySelector('#opacitySet').innerHTML = 'Phosphor Opacity'

    })
    const mask = document.querySelector('.mask');
    const maskBtn = document.querySelector('#opacity-mask');
    mask.style.backgroundSize = `${size}px ${size}px`;

}

function toggleBloom() {
    toggleDisplay('red');
    toggleDisplay('green');
    toggleDisplay('blue');
    toggleDisplay('RGB-bloom');

    const e = document.querySelector(".RGB-bloom");
    (e.style.display == 'none') ? event.target.style.color = 'red' : event.target.style.color = 'black';
}



// controlContainer.addEventListener('mouseup', controlClickHandler)