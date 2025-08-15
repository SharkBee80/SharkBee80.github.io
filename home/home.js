document.addEventListener('wheel', function (event) {
    const scroll_down_bar = jQuery('.scroll-down-bar');
    if (scroll_down_bar.length !== 1 || scroll_down_bar[0].offsetHeight <= 0) {
        return;
    }
    if (event.deltaY > 0) {
        scroll_down_bar.click();
        document.removeEventListener('wheel', arguments.callee);
    }
});

window.onbeforeunload = function (e) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
};
