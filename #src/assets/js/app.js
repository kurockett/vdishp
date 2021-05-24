import testWebP from './webpcss'

document.addEventListener('DOMContentLoaded', () => {
    testWebP(function (support) {
        if (support) {
            document.querySelector('body').classList.add('webp')
        } else {
            document.querySelector('body').classList.add('no-webp')
        }
    })
    AOS.init()
    console.log('we did it!')
})