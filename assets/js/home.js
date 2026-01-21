/**
 * HOME.JS
 * Contains: YouTube Hero Video Player + Scroll Animation Triggers
 */

// ========================================
// YOUTUBE HERO VIDEO PLAYER
// ========================================

// Load YouTube IFrame Player API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

// Called automatically when YouTube API is ready
function onYouTubeIframeAPIReady() {
    player = new YT.Player('hero-video-player', {
        height: '100%',
        width: '100%',
        videoId: 'JSJRRm2XEG8',
        playerVars: {
            'autoplay': 1,
            'mute': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'modestbranding': 1,
            'start': 7,
            'enablejsapi': 1,
            'loop': 1,
            'playlist': 'JSJRRm2XEG8'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Player ready event
function onPlayerReady(event) {
    event.target.playVideo();
}

// Player state change event - loop between 7-19 seconds
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        var checkTime = setInterval(function () {
            if (player && player.getCurrentTime) {
                var currentTime = player.getCurrentTime();
                if (currentTime >= 19) {
                    player.seekTo(7);
                }
            }
        }, 100); // Check every 100ms

        // Store interval ID to clear it later if needed
        if (window.heroVideoInterval) {
            clearInterval(window.heroVideoInterval);
        }
        window.heroVideoInterval = checkTime;
    }
}

// ========================================
// SCROLL ANIMATIONS (if not already in scroll-animations.js)
// ========================================
// Note: This is handled by scroll-animations.js which is already loaded
// No additional code needed here unless you want page-specific triggers
