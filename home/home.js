window.onbeforeunload = function (e) {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
};
