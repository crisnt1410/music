const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const playList = $('.playlist')
const cd = $('.cd')
const cdWidth = cd.offsetWidth
const cdThumb = $('.cd-thumb')
const heading = $('header h2')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
var playedList = []

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đường Tôi Chở Em Về [REMIX]',
            singer: 'Buitruonglinh',
            path: './assets/music/duong-toi-tro-em-ve.mp3',
            image: './assets/Images/duongoichoemve.jpg'
        },
        {
            name: 'Có hẹn với thanh xuân [REMIX]',
            singer: 'MONSTAR',
            path: './assets/music/co-hen-voi-thanh-xuan.mp3',
            image: './assets/Images/cohenvoithanhxuan.jpg'
        },
        {
            name: 'Forget me now [REMIX]',
            singer: 'fishy & Trí Dũng',
            path: './assets/music/forget-me-now.mp3',
            image: './assets/Images/forgetmenow.jpg'
        },
        {
            name: 'Thắc mắc',
            singer: 'Thịnh Suy',
            path: './assets/music/thac-mac.mp3',
            image: './assets/Images/song5.jpg'
        },
        {
            name: 'Waiting For Love',
            singer: 'Avicii',
            path: './assets/music/waiting-for-love.mp3',
            image: './assets/Images/waiting-for-love.jpg'
        },  
        {
            name: 'The girl i haven\'t met',
            singer: 'Kudasai',
            path: './assets/music/the-girl-i-havent-met.mp3',
            image: './assets/Images/thegirls.jpg'
        },
        {
            name: 'Never be alone',
            singer: 'TheFatRat',
            path: './assets/music/never-be-alone.mp3',
            image: './assets/Images/never.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        console.log(this.config);
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    }
    ,
    render: function () {
        const htmls = this.songs.map(function (song, index) {

            return `
                <div class="song" id="song-${index}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('\n');
        $(`#song-${this.currentIndex}`).classList.add('active')
    },
    handelEvent: function () {
        const _this = this;
        // xử lí cd quay
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //handle scroll 
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth;
        }
        //when play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }
        // when isPlaying
        audio.onplay = function () {
            player.classList.add('playing')
            _this.isPlaying = true
            cdThumbAnimate.play()
        }
        // when pause
        audio.onpause = function () {
            player.classList.remove('playing')
            _this.isPlaying = false
            cdThumbAnimate.pause()
        }
        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            const progressPercent = (audio.currentTime / audio.duration) * 100
            progress.value = progressPercent
        }
        // when seeks
        progress.oninput = function (e) {
            const seekTime = (e.target.value / 100) * audio.duration
            audio.currentTime = seekTime
        }
        // next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            _this.nextSong()
            _this.activeSong()
            audio.play()
        }
        // prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            }
            _this.prevSong()
            _this.activeSong()
            audio.play()
        }
        // random click
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            console.log(_this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        // repeat click
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // end song
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            }
            nextBtn.click()
        }
        // play song when click
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    // when click on song
                    _this.currentIndex = songNode.dataset.index
                    _this.activeSong()
                    _this.loadCurrentSong()
                    audio.play()
                }
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        if (this.currentIndex >= this.songs.length - 1) {
            this.currentIndex = 0
        }
        else {
            this.currentIndex++
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        if (this.currentIndex == 0) {
            this.currentIndex = this.songs.length - 1
        }
        else {
            this.currentIndex--
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        if (playedList.length === this.songs.length) {
            playedList = []
        } else {
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
            } while (newIndex === this.currentIndex || playedList.includes(newIndex))
            playedList.push(newIndex)
            this.currentIndex = newIndex
        }
    },
    activeSong: function () {
        $('.song.active').classList.remove('active')
        $(`#song-${this.currentIndex}`).classList.add('active')
        setTimeout(() => {
            $(`#song-${this.currentIndex}`).scrollIntoView()
        }, 300)
    },
    start: function () {
        //load config
        this.loadConfig()
        //define properties
        this.defineProperties()
        //handel event
        this.handelEvent()
        //load current song
        this.loadCurrentSong()

        //render the songs
        this.render()
        //load trạng thái của 2 nút repeat & random
        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom)
    }
}

app.start()