var Fluid = window.Fluid || {};
Fluid.ctx = Object.assign({}, Fluid.ctx)
var CONFIG = {
    "hostname": "example.com",
    "root": "/",
    "version": "1.9.8",
    "typing": {
        "enable": true,
        "typeSpeed": 70,
        "cursorChar": "_",
        "loop": false,
        "scope": []
    },
    "anchorjs": {
        "enable": true,
        "element": "h1,h2,h3,h4,h5,h6",
        "placement": "left",
        "visible": "hover",
        "icon": ""
    },
    "progressbar": {
        "enable": true,
        "height_px": 3,
        "color": "#29d",
        "options": {
            "showSpinner": false,
            "trickleSpeed": 100
        }
    },
    "code_language": {
        "enable": true,
        "default": "TEXT"
    },
    "copy_btn": true,
    "image_caption": {
        "enable": true
    },
    "image_zoom": {
        "enable": true,
        "img_url_replace": ["", ""]
    },
    "toc": {
        "enable": true,
        "placement": "right",
        "headingSelector": "h1,h2,h3,h4,h5,h6",
        "collapseDepth": 0
    },
    "lazyload": {
        "enable": true,
        "loading_img": "/img/loading.gif",
        "onlypost": false,
        "offset_factor": 2
    },
    "web_analytics": {
        "enable": false,
        "follow_dnt": true,
        "baidu": null,
        "google": {
            "measurement_id": null
        },
        "tencent": {
            "sid": null,
            "cid": null
        },
        "leancloud": {
            "app_id": null,
            "app_key": null,
            "server_url": null,
            "path": "window.location.pathname",
            "ignore_local": false
        },
        "umami": {
            "src": null,
            "website_id": null,
            "domains": null,
            "start_time": "2024-01-01T00:00:00.000Z",
            "token": null,
            "api_server": null
        }
    },
    "search_path": "/local-search.xml",
    "include_content_in_search": true
};

if (CONFIG.web_analytics.follow_dnt) {
    var dntVal = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    Fluid.ctx.dnt = dntVal && (dntVal.startsWith('1') || dntVal.startsWith('yes') || dntVal.startsWith('on'));
}