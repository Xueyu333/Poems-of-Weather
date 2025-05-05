const PAGECOUNT = 8;
let pageNo = 0;
let pages = document.querySelectorAll('.book-page');
let cover = document.querySelectorAll('.book-cover');
let btn = document.querySelectorAll('#control button');
let book = document.querySelector('#book');
let allPages = document.querySelectorAll('.one-page');

const weatherTypes = ['rainy', 'sunny', 'foggy', 'cloudy', 'snowy', 'windy'];
const weatherMap = {};
let userPrefersMuted = false; // 默认不静音


//change images number
const weatherImageCounts = {
    rainy: 8,  // rainy01.jpg, rainy02.jpg, rainy03.jpg，04
    sunny: 8,  // sunny01.jpg, sunny02.jpg, sunny03.jpg，04
    foggy: 8,  // foggy01.jpg, foggy02.jpg, foggy03.jpg，04
    cloudy: 8, // cloudy01.jpg, cloudy02.jpg, cloudy03.jpg，04
    snowy: 8,  // snowy01.jpg, snowy02.jpg, snowy03.jpg，04
    windy: 8   // windy01.jpg, windy02.jpg, windy03.jpg，04
};


const weatherSounds = {
    rainy: 'sound/rainy.mp3',
    sunny: 'sound/sunny.mp3',
    foggy: 'sound/foggy.mp3',
    cloudy: 'sound/cloudy.mp3',
    snowy: 'sound/snowy.mp3',
    windy: 'sound/windy.mp3'
};

// 创建一个单例音频元素来播放声音
let currentSound = null;
let audioElement = null;

// 初始化音频元素
function initializeAudio() {
    audioElement = new Audio();
    audioElement.loop = true; // 循环播放
    audioElement.volume = 0.4; // 设置默认音量为40%

    updateSoundButtonState();

  
}

//PLayWeatherSound
// 播放与当前天气类型对应的声音
function playWeatherSound(weatherType) {
    if (!audioElement) {
        initializeAudio();
    }
    
    // 如果是封面、封底或倒数第二页，停止声音
    if (pageNo === 0 || pageNo === PAGECOUNT - 1 || pageNo === PAGECOUNT) {
        stopWeatherSound();
        return;
    }
    
    // 如果没有传入天气类型，使用当前页的天气
    if (!weatherType && pageNo > 0 && pageNo < PAGECOUNT - 1) {
        weatherType = weatherMap[pageNo];
    }
    
    // 如果没有有效的天气类型，停止播放
    if (!weatherType) {
        stopWeatherSound();
        return;
    }
    
    const soundPath = weatherSounds[weatherType];
    
    // 如果请求的声音与当前播放的相同，不做任何操作
    if (currentSound === soundPath) {
        return;
    }
    
    // 停止当前声音
    if (audioElement.src) {
        audioElement.pause();
    }
    
    // 播放新的声音
    audioElement.src = soundPath;
    currentSound = soundPath;

    // 只有在用户未选择静音时才播放
    if (!userPrefersMuted) {
        audioElement.play().catch(err => {
            console.warn('音频播放失败，可能需要用户交互:', err);
        });
    }
    
    // 更新图标状态以匹配当前状态
    updateSoundButtonState();
    
    console.log(`设置天气声音: ${weatherType}, 是否播放: ${!userPrefersMuted}`);


    
}



function updateSoundButtonState() {
    const soundBtnIcon = document.querySelector('#sound-control img.sound-icon');
    if (soundBtnIcon) {
        soundBtnIcon.src = userPrefersMuted ? 'icon/SoundOff.png' : 'icon/SoundOn.png';
    }
}


// 停止播放当前声音
function stopWeatherSound() {
    if (audioElement && audioElement.src) {
        audioElement.pause();
        currentSound = null;
        console.log('停止播放天气声音');
    }
}

// 暂停/继续声音
function toggleWeatherSound() {
    if (!audioElement) return;
    
    // 获取声音按钮图标元素
    const soundBtnIcon = document.querySelector('#sound-control img.sound-icon');
    
    if (!soundBtnIcon) {
        console.warn('Sound icon element not found');
        return;
    }
    
    userPrefersMuted = !userPrefersMuted; // 切换全局静音首选项
    
    if (userPrefersMuted) {
        // 用户想要静音
        audioElement.pause();
        soundBtnIcon.src = 'icon/SoundOff.png'; // 更新图标为关闭状态
    } else {
        // 用户想要声音
        if (currentSound) { // 如果有声音可以播放
            audioElement.play().catch(err => {
                console.warn('音频播放失败，可能需要用户交互:', err);
            });
            soundBtnIcon.src = 'icon/SoundOn.png'; // 更新图标为开启状态
        }
    }
    
    console.log('Sound preference changed, muted:', userPrefersMuted);
}





//Get random images
function getRandomWeatherImage(weatherType) {
    const imageCount = weatherImageCounts[weatherType] || 1;
    const randomIndex = Math.floor(Math.random() * imageCount) + 1;
    const paddedIndex = randomIndex.toString().padStart(2, '0'); // Creates "01", "02", etc.
    return `image/${weatherType}${paddedIndex}.jpg`;
}

// Randomly assign weather types to pages
function randomizeWeather() {
    // Create a copy of the weather types array we can modify
    const availableTypes = [...weatherTypes];
    
    // Shuffle the array
    for (let i = availableTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTypes[i], availableTypes[j]] = [availableTypes[j], availableTypes[i]];
    }
    
    // Assign to pages 1-6
    for (let i = 1; i <= 6; i++) {
        weatherMap[i] = availableTypes[i-1];
    }
    
    console.log("Randomized weather map:", weatherMap);
}

// Call this function before init()
randomizeWeather();




//初始化
function init() {
    // 初始化每一页的z-index
    // 这是关键部分 - 确保所有页面都有正确的初始z-index
    for (let index = 0; index < allPages.length; index++) {
        if (index === 0) {
            // 封面
            allPages[index].style.zIndex = PAGECOUNT;
        } else {
            // 其他页面
            allPages[index].style.zIndex = PAGECOUNT - index;
        }
        
        // 确保每个页面的内容包装器可见
        let contentWrapper = allPages[index].querySelector('.page-content-wrapper');
        if (contentWrapper) {
            contentWrapper.style.zIndex = 3; // 确保内容在最上层
        }
    }


    // 默认页面为封面，左按钮无效
    btn[0].classList.add('disabled-button', 'hidden-button');
    btn[0].disabled = true;



    // 设置右边按钮的初始状态
    btn[1].classList.add('enabled-button');
    btn[1].disabled = false;



    // 左翻页逻辑保持不变（left flip）
    btn[0].onclick = function() {
        playPageTurnSound();
        pageNo--;
                
        // 如果当前是最后一页，并往前翻
        if ((PAGECOUNT - 1) == pageNo) {
            allPages[pageNo].style.transform = 'rotateY(0deg)';
            book.style.transform = 'translateX(340px)';

            //恢复显示右按钮
            //翻完最后一页往前翻页的右边的button的颜色
            btn[1].classList.remove('disabled-button', 'hidden-button');
            btn[1].classList.add('enabled-button');
            btn[1].disabled = false;
        }
        else {
            allPages[pageNo].style.transform = 'rotateY(0deg)';
        }
        
        allPages[pageNo].style.zIndex = PAGECOUNT - pageNo;

        if (0 == pageNo) { 
            // 当回到第一页时
            book.style.transform = 'translateX(0px)';
            // //重新翻到cover时候左边的button
            btn[0].classList.add('disabled-button', 'hidden-button');
            btn[0].classList.remove('enabled-button');
            btn[0].disabled = true;
        }
        
        // 更新背景以匹配当前页面
        updateBackgroundToMatchPage();
        
        // 添加以下代码来更新声音
        // 如果是封面、封底或倒数第二页，停止声音
        if (pageNo === 0 || pageNo === PAGECOUNT - 1 || pageNo === PAGECOUNT) {
            stopWeatherSound();
        } else {
            // 否则播放对应天气的声音
            playWeatherSound(weatherMap[pageNo]);
        }

        // 隐藏重启按钮（因为我们已离开最后一页）
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.classList.remove('visible');
        }
    };

    // 右翻页
    btn[1].onclick = function() {
        playPageTurnSound();
        // 如果当前是第一页，并往后翻
        if (0 == pageNo) {
            allPages[pageNo].style.transform = 'rotateY(-180deg)';
            //( 240px + 50px ) * 0.5
            //书本对其正中间（往右翻）
            book.style.transform = 'translateX(340px)';

            // // 显示左按钮
            // btn[0].style.display = "inline-block";
            // //（除了cover页）翻页过程中的左边的button颜色
            // btn[0].style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            // btn[0].style.color = "white";
            // btn[0].disabled = false;   
            btn[0].classList.remove('disabled-button', 'hidden-button');
            btn[0].classList.add('enabled-button');
            btn[0].disabled = false;
        }
        else {
            allPages[pageNo].style.transform = 'rotateY(-180deg)';
        }

        // 更新当前页面的z-index
        allPages[pageNo].style.zIndex = 1000 + pageNo;
        
        // 增加页码前确保下一页可见
        if (pageNo + 1 < allPages.length) {
            // 预先设置下一页的z-index，确保它可见
            allPages[pageNo + 1].style.zIndex = PAGECOUNT - pageNo - 1;
        }
        
        
        // 生成当前页的诗歌（右翻页时）
const weatherType = weatherMap[pageNo + 1]; // 下一页的页码
if (weatherType) {
    const pageElement = allPages[pageNo + 1];
    getPoemForWeather(weatherType, pageElement);
}

        pageNo++;
        

        if (PAGECOUNT == pageNo) {
            // btn[1].style.display = "none";
            // //最后一页右边的button颜色
            // btn[1].style.color = "darkgray";
            // btn[1].disabled = true;
            btn[1].classList.add('disabled-button', 'hidden-button');
            btn[1].classList.remove('enabled-button');
            btn[1].disabled = true;
            
            //最后底面的位置
            book.style.transform = 'translateX(530px)';


         
    // 显示重启按钮 - 使用类名切换而不是直接修改 style
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        // 添加一个小延时，使动画在页面翻完后显示
        setTimeout(() => {
            restartButton.classList.add('visible');
        }, 500); // 500ms 后显示，给翻页动画留出时间
    }

        }
        
        // 更新背景以匹配当前页面
        updateBackgroundToMatchPage();
        
        // 添加以下代码来更新声音
        // 如果是封面、封底或倒数第二页，停止声音
        if (pageNo === 0 || pageNo === PAGECOUNT - 1 || pageNo === PAGECOUNT) {
            stopWeatherSound();
        } else {
            // 否则播放对应天气的声音
            playWeatherSound(weatherMap[pageNo]);
        }
    };

    // 添加用户首次交互后播放声音的逻辑
    const firstInteractionHandler = () => {
        // 如果当前在内容页面（非封面、封底或倒数第二页），开始播放声音
        if (pageNo > 0 && pageNo < PAGECOUNT - 1) {
            playWeatherSound(weatherMap[pageNo]);
        }
        
        // 移除事件监听器，确保只触发一次
        ['click', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, firstInteractionHandler);
        });
    };
    
    // 添加事件监听器
    ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, firstInteractionHandler);
    });
    
    // 在初始化函数末尾调用
    initializeBackground();
}

// 在文档加载时创建背景层
document.addEventListener('DOMContentLoaded', function() {

   // 创建重启按钮
   const restartButton = document.createElement('button');
   restartButton.id = 'restart-button';
   restartButton.textContent = 'RESTART';
   // 不需要设置 display: none，因为已在 CSS 中设置了 opacity: 0
   
   // 添加点击事件处理程序
   restartButton.addEventListener('click', function(event) {
       console.log("重启按钮点击 - 重置到封面");
       // 保存按钮引用
       const button = event.currentTarget;
       // 重置到封面
       resetToFirstPage();
   });
   
   // 添加到文档
   document.body.appendChild(restartButton);


//------//

    // 创建背景容器
    const bgContainer = document.createElement('div');
    bgContainer.id = 'background-container';
    
    // 创建两个背景层
    const bgLayer1 = document.createElement('div');
    bgLayer1.id = 'bg-layer1';
    bgLayer1.style.backgroundImage = "linear-gradient(to bottom, #3381ff, hsl(217, 100%, 74%), #3dd6f5)";
    bgLayer1.style.opacity = '1';
    
    const bgLayer2 = document.createElement('div');
    bgLayer2.id = 'bg-layer2';
    bgLayer2.style.opacity = '0';
    
    // 组装DOM
    bgContainer.appendChild(bgLayer1);
    bgContainer.appendChild(bgLayer2);
    
    // 添加到文档
    document.body.insertBefore(bgContainer, document.body.firstChild);
    
    // 添加音频控制按钮
    const soundControlBtn = document.createElement('button');
    soundControlBtn.id = 'sound-control';
    // 不再设置文本内容，而是添加一个图像元素
    const soundBtnIcon = document.createElement('img');
    soundBtnIcon.src = 'icon/SoundOn.png'; // 初始图片路径
    soundBtnIcon.alt = 'Sound control';
    soundBtnIcon.className = 'sound-icon';
    soundControlBtn.appendChild(soundBtnIcon);

    soundControlBtn.addEventListener('click', toggleWeatherSound);

    document.body.appendChild(soundControlBtn);
    
    // 可选：创建音量控制器
 
    const volumeControl = document.createElement('div');
    volumeControl.id = 'volume-control';
    
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.id = 'volume-slider';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.value = '0.4';
    
    volumeSlider.addEventListener('input', function() {
        if (audioElement) {
            audioElement.volume = this.value;
        }
    });
    
    volumeControl.appendChild(volumeSlider);
    document.body.appendChild(volumeControl);
    
    // 显示/隐藏音量控制器
    soundControlBtn.addEventListener('dblclick', function() {
        volumeControl.style.display = volumeControl.style.display === 'none' || volumeControl.style.display === '' ? 'flex' : 'none';
    });
  
    
    // 初始化音频
    initializeAudio();
    
    // 存储按钮引用到全局变量，以便其他函数使用
    window.soundControlBtn = soundControlBtn;
});

// BackgroundImage使用淡入淡出效果
function updateBackgroundToMatchPage() {
    console.log("Updating background for page:", pageNo);
    
    // 获取两个背景层
    const bgLayer1 = document.getElementById('bg-layer1');
    const bgLayer2 = document.getElementById('bg-layer2');
    
    if (!bgLayer1 || !bgLayer2) {
        console.error("Background layers not found!");
        return;
    }
    
    // 设置新背景图片
    let newBackground = "linear-gradient(to bottom, #3381ff, hsl(217, 100%, 74%), #3dd6f5)";


// Check if we're on a snowy page
const currentWeather = weatherMap[pageNo];
    
// Remove any previous weather classes
document.body.classList.remove('snowy-weather');

// If it's a snowy page, add the snowy-weather class
if (currentWeather === 'snowy') {
    document.body.classList.add('snowy-weather');
}




    
    // 如果是封面、封底或倒数第二页，使用默认渐变背景
    if (pageNo === 0 || pageNo === PAGECOUNT - 1 || pageNo === PAGECOUNT) {
        // 使用默认渐变
    } else {
        // 获取当前可见页面的图片元素
        let visibleImage;
        
        if (pageNo === 1) {
            // 第一页翻过，显示封面背面的图片
            visibleImage = allPages[0].querySelector(".cover-back .page-image");
        } else {
            // 其他页面，获取当前页的前一页的背面图片
            visibleImage = allPages[pageNo-1].querySelector(".page-back .page-image");
        }
        
        // 如果找到了图片元素并且有背景图片，使用它
        if (visibleImage && visibleImage.style.backgroundImage) {
            newBackground = visibleImage.style.backgroundImage;
            console.log("Setting background to:", newBackground);
        }
    }
    
    // 确定哪一层当前可见
    const visibleLayer = bgLayer1.style.opacity === '1' ? bgLayer1 : bgLayer2;
    const hiddenLayer = bgLayer1.style.opacity === '0' ? bgLayer1 : bgLayer2;
    
    // 在隐藏层上设置新背景
    hiddenLayer.style.backgroundImage = newBackground;
    
    // 开始淡入淡出
    hiddenLayer.style.opacity = '1';
    visibleLayer.style.opacity = '0';
    
    console.log(`Fading in layer: ${hiddenLayer.id}, fading out layer: ${visibleLayer.id}`);
    
    // 播放与当前页面天气对应的声音
    playWeatherSound();
}





// 添加这个函数以确保初始背景正确设置
function initializeBackground() {
    const bgLayer1 = document.getElementById('bg-layer1');
    if (bgLayer1) {
        bgLayer1.style.backgroundImage = "linear-gradient(to bottom, #3381ff, hsl(217, 100%, 74%), #3dd6f5)";
        bgLayer1.style.opacity = '1';
    }
}

async function getPoemForWeather(weatherType, pageElement) {
    const keywordMap = {
        rainy: 'rain',
        sunny: 'sun',
        foggy: 'mist',
        cloudy: 'cloud',
        snowy: 'snow',
        windy: 'wind'  
    };
    
    // Add fallback poems for when API fails
    const fallbackPoems = {
        rain: "The rain falls gently on the ground<br>Nature's music, a calming sound",
        sun: "Golden rays warm the earth below<br>In sunlight's embrace, all things grow",
        fog: "Misty veils shroud the morning light<br>Mysterious beauty, a ghostly sight",
        cloud: "Cotton castles drift through the sky<br>Dreams taking shape as they float by",
        snow: "Silent flakes drift down from above<br>Covering the world in winter's love",
        wind: "Invisible force that makes trees dance<br>Whispering secrets with each chance"  
    };

    const keyword = keywordMap[weatherType];

    const poemContainer = pageElement.querySelector(".page-content p");
    const title = pageElement.querySelector(".page-content h2");
    
    // Get the image on the back of the CURRENT page, not this page's back
    const pageIndex = Array.from(allPages).indexOf(pageElement);
    let imageBack;
    
    if (pageIndex > 0) {
        // If this isn't the first page, get previous page's back
        imageBack = allPages[pageIndex - 1].querySelector(".page-back .page-image");
    } else {
        // For the first poem page, use the cover's back
        imageBack = allPages[0].querySelector(".page-back .page-image");
    }

    // Special handling for the first poem page
if (pageIndex === 1) {
    
    const coverBack = allPages[0].querySelector(".cover-back .page-image");
    if (coverBack) {
        // Get a random image for this weather
        const randomImage = getRandomWeatherImage(weatherType);
        coverBack.style.backgroundImage = `url('${randomImage}')`;
        console.log("Updated cover back image for first poem:", randomImage);
    } else {
        console.error("Could not find cover back image element!");
    }
} else if (pageIndex > 1) {
    // For other pages, continue using page-back
    const prevPageBack = allPages[pageIndex - 1].querySelector(".page-back .page-image");
    if (prevPageBack) {
        // Get a random image for this weather
        const randomImage = getRandomWeatherImage(weatherType);
        prevPageBack.style.backgroundImage = `url('${randomImage}')`;
    }
}

if (poemContainer) poemContainer.innerHTML = "Loading poem...";
    
// Set title and image immediately - these don't depend on API
if (title) title.innerText = `${weatherType[0].toUpperCase()}${weatherType.slice(1)} Day`;
if (imageBack) {
    // Get a random image for this weather
    const randomImage = getRandomWeatherImage(weatherType);
    imageBack.style.backgroundImage = `url('${randomImage}')`;
}

    // Define more search terms for each weather type
const expandedKeywords = {
    rainy: ['rain', 'rainy', 'shower', 'downpour', 'drizzle', 'storm', 'thunder'],
    sunny: ['sun', 'sunny', 'sunshine', 'bright', 'light', 'radiant', 'summer'],
    foggy: ['fog', 'mist', 'haze', 'vapor', 'blur', 'cloud'],
    cloudy: ['cloud', 'clouds', 'cloudy', 'overcast', 'gray', 'shade', 'shadow'],
    snowy: ['snow', 'snowy', 'winter', 'frost', 'ice', 'cold', 'frozen'],
    windy: ['wind', 'windy', 'breeze', 'gust', 'blow', 'air', 'gale']  
};

    // Try to fetch poem from API, with multiple fallbacks
    try {
        // Define alternative proxies and endpoints to try
        const proxyUrls = [
            "https://corsproxy.io/?",
            "https://api.allorigins.win/raw?url=",
            "https://api.codetabs.com/v1/proxy?quest="
        ];
        
        const apiEndpoints = [
            `https://poetrydb.org/lines/contains/${keyword}`,
            `https://poetrydb.org/title/${keyword}`,
            `https://poetrydb.org/author,title/${keyword}`
            
        ];
        
        let poem = null;
        let success = false;
        
        // Try all combinations of proxies and endpoints
        for (const proxy of proxyUrls) {
            if (success) break;
            
            for (const endpoint of apiEndpoints) {
                try {
                    console.log(`Trying ${proxy}${endpoint}`);
                    const fullUrl = `${proxy}${encodeURIComponent(endpoint)}`;
                    
                    const response = await fetch(fullUrl);
                    console.log("Response status:", response.status);
                    
                    if (!response.ok) {
                        throw new Error(`Bad response: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log("Got data:", data);
                    
                    // Check if we got valid poem data
                    if (data && Array.isArray(data) && data.length > 0) {
                        poem = data[Math.floor(Math.random() * data.length)];
                        success = true;
                        console.log("Found poem:", poem);
                        break;
                    }
                } catch (endpointError) {
                    console.warn(`Error with ${proxy}${endpoint}:`, endpointError);
                    // Continue to next endpoint
                }
            }
        }

      
// Try all the expanded keywords for this weather type
if (expandedKeywords[weatherType]) {
    const altKeywords = expandedKeywords[weatherType];
    for (const altKeyword of altKeywords) {
        if (success) break; // Stop if we already found a poem
        
        for (const proxy of proxyUrls) {
            if (success) break;
            
            for (const endpoint of apiEndpoints) {
                try {
                    const modifiedEndpoint = endpoint.replace(keyword, altKeyword);
                    console.log(`Trying alternative keyword ${altKeyword} with ${proxy}${modifiedEndpoint}`);
                    const fullUrl = `${proxy}${encodeURIComponent(modifiedEndpoint)}`;
                    
                    const response = await fetch(fullUrl);
                    
                    if (!response.ok) {
                        throw new Error(`Bad response: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Check if we got valid poem data
                    if (data && Array.isArray(data) && data.length > 0) {
                        poem = data[Math.floor(Math.random() * data.length)];
                        success = true;
                        console.log("Found poem with alternate keyword:", altKeyword);
                        break;
                    }
                } catch (endpointError) {
                    console.warn(`Error with ${proxy} and keyword ${altKeyword}:`, endpointError);
                    // Continue to next endpoint
                }
            }
        }
    }
}
        
        // If we found a poem, display it
        if (success && poem) {
            const lines = poem.lines;
            const author = poem.author;
            const poemTitle = poem.title;
            
            // Select up to 4 lines without character limit
            // let selectedLines = "";
            // if (lines.length >= 4) {
            //     // Get the first 4 lines
            //     selectedLines = `${lines[0]}<br>${lines[1]}<br>${lines[2]}<br>${lines[3]}`;
            // } else if (lines.length >= 2) {
            //     // Get as many lines as available (at least 2)
            //     selectedLines = lines.slice(0, 4).join("<br>");
            // } else if (lines.length === 1) {
            //     // Just one line
            //     selectedLines = lines[0];
            // }

            // Select up to 4 lines, but ensure it ends with a complete sentence
        let selectedLines = "";
        if (lines.length > 0) {
        // 首先选择最多4行
        let selectedLinesArray = lines.slice(0, 4);
    
        // 检查最后一行是否以句号、感叹号或问号结束
        const lastLine = selectedLinesArray[selectedLinesArray.length - 1];
        if (lastLine && !lastLine.match(/[.!?]$/)) {
        // 最后一行不是完整句子，尝试找到下一个完整句子
        for (let i = 4; i < Math.min(lines.length, 8); i++) {
            selectedLinesArray.push(lines[i]);
            
        // 如果找到了以句号、感叹号或问号结尾的行，就停止
        if (lines[i].match(/[.!?]$/)) {
                break;
            }
        }
    }
    
    // 将选择的行组合成最终文本
    selectedLines = selectedLinesArray.join("<br>");
}

  
            //texts animation
            // Display the poem with title and author
            if (poemContainer) {
                if (weatherType === 'rainy') {
                    // Create an element to hold the final HTML
                    const textWrapper = document.createElement('span');
                    textWrapper.className = 'rain-text';
                    
                    // Convert the selected lines to a rain animation
                    let animatedHTML = '';
                    
                    // Process the selectedLines by splitting at <br> tags
                    const textSegments = selectedLines.split('<br>');
                    
                    textSegments.forEach((segment, lineIndex) => {
                        // Split the segment into words
                        const words = segment.split(' ');
                        
                        words.forEach((word, wordIndex) => {
                            // Process each character in the word
                            for (let i = 0; i < word.length; i++) {
                                const char = word[i];
                                // Random delay between 0.1s and 1.5s for natural rain effect
                                const delay = Math.random() * 1.4 + 0.1;
                                animatedHTML += `<span class="rain-letter" style="animation-delay: ${delay}s;">${char}</span>`;
                            }
                            
                            // Add a space after each word (except the last word in the line)
                            if (wordIndex < words.length - 1) {
                                animatedHTML += '<span class="rain-space">&nbsp;</span>';
                            }
                        });
                        
                        // Add a line break if not the last line
                        if (lineIndex < textSegments.length - 1) {
                            animatedHTML += '<br>';
                        }
                    });
                    
                    // Set the animated HTML
                    textWrapper.innerHTML = animatedHTML;
                    
                    // Format with poem, then attribution
                    poemContainer.innerHTML = '';
                    poemContainer.appendChild(textWrapper);
                    
                    // Add the attribution after a delay
                    setTimeout(() => {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = `— ${author}, "${poemTitle}"`;
                        poemContainer.appendChild(attribution);
                    }, 2000); // Add attribution after most letters have dropped
                } 
                else if (weatherType === 'windy') {
                    // Create an element to hold the final HTML
                    const textWrapper = document.createElement('span');
                    textWrapper.className = 'wind-text';
                    
                    // Convert the selected lines to a wind animation
                    let animatedHTML = '';
                    
                    // Process the selectedLines by splitting at <br> tags
                    const textSegments = selectedLines.split('<br>');
                    
                    textSegments.forEach((segment, lineIndex) => {
                        // Split the segment into words
                        const words = segment.split(' ');
                        
                        words.forEach((word, wordIndex) => {
                            // Process each character in the word
                            for (let i = 0; i < word.length; i++) {
                                const char = word[i];
                                // Random delay between 0.1s and 1.5s for natural wind effect
                                const delay = Math.random() * 1.4 + 0.1;
                                // Random duration for more natural wind movement
                                const duration = Math.random() * 0.6 + 1.5;
                                animatedHTML += `<span class="wind-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</span>`;
                            }
                            
                            // Add a space after each word (except the last word in the line)
                            if (wordIndex < words.length - 1) {
                                animatedHTML += '<span class="wind-space">&nbsp;</span>';
                            }
                        });
                        
                        // Add a line break if not the last line
                        if (lineIndex < textSegments.length - 1) {
                            animatedHTML += '<br>';
                        }
                    });
                    
                    // Set the animated HTML
                    textWrapper.innerHTML = animatedHTML;
                    
                    // Format with poem, then attribution
                    poemContainer.innerHTML = '';
                    poemContainer.appendChild(textWrapper);
                    
                    // Add the attribution after a delay
                    setTimeout(() => {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = `— ${author}, "${poemTitle}"`;
                        poemContainer.appendChild(attribution);
                    }, 2200); // Add attribution after most letters have settled
                }
                else if (weatherType === 'snowy') {
                    // Create an element to hold the final HTML
                    const textWrapper = document.createElement('span');
                    textWrapper.className = 'snow-text';
                    
                    // Convert the selected lines to a snow animation
                    let animatedHTML = '';
                    
                    // Process the selectedLines by splitting at <br> tags
                    const textSegments = selectedLines.split('<br>');
                    
                    textSegments.forEach((segment, lineIndex) => {
                        // Split the segment into words
                        const words = segment.split(' ');
                        
                        words.forEach((word, wordIndex) => {
                            // Process each character in the word
                            for (let i = 0; i < word.length; i++) {
                                const char = word[i];
                                // More randomized delays (0.1s to 3s) for a more natural snowfall look
                                const delay = Math.random() * 2.9 + 0.1;
                                // Longer durations (3s to 6s) for slower, gentler falling
                                const duration = Math.random() * 3 + 3;
                                // Random initial rotation for each snowflake
                                const initialRotX = Math.floor(Math.random() * 360);
                                const initialRotY = Math.floor(Math.random() * 360);
                                const initialRotZ = Math.floor(Math.random() * 360);
                                // Apply custom styling with initial rotation and animation properties
                                animatedHTML += `<span class="snow-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s; transform: translateY(-200px) rotateX(${initialRotX}deg) rotateY(${initialRotY}deg) rotateZ(${initialRotZ}deg);">${char}</span>`;
                            }
                            
                            // Add a space after each word (except the last word in the line)
                            if (wordIndex < words.length - 1) {
                                animatedHTML += '<span class="snow-space">&nbsp;</span>';
                            }
                        });
                        
                        // Add a line break if not the last line
                        if (lineIndex < textSegments.length - 1) {
                            animatedHTML += '<br>';
                        }
                    });
                    
                    // Set the animated HTML
                    textWrapper.innerHTML = animatedHTML;
                    
                    // Format with poem, then attribution
                    poemContainer.innerHTML = '';
                    poemContainer.appendChild(textWrapper);
                    
                    // Add the attribution after a delay
                    setTimeout(() => {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = `— ${author}, "${poemTitle}"`;
                        poemContainer.appendChild(attribution);
                    }, 3000);
                }
                else if (weatherType === 'foggy') {
                    // Create an element to hold the final HTML
                    const textWrapper = document.createElement('span');
                    textWrapper.className = 'fog-text';
                    
                    // Convert the selected lines to a fog animation
                    let animatedHTML = '';
                    
                    // Process the selectedLines by splitting at <br> tags
                    const textSegments = selectedLines.split('<br>');
                    
                    textSegments.forEach((segment, lineIndex) => {
                        // Split the segment into words
                        const words = segment.split(' ');
                        
                        words.forEach((word, wordIndex) => {
                            // Process each character in the word
                            for (let i = 0; i < word.length; i++) {
                                const char = word[i];
                                // Random delay between 0.1s and 2s for a natural fog reveal effect
                                const delay = Math.random() * 1.9 + 0.1;
                                // Random duration between 3s and 5s for slow fog dissipation
                                const duration = Math.random() * 2 + 3;
                                // Random initial blur strength for more natural appearance
                                const initialBlur = Math.floor(Math.random() * 5) + 8; // 8px to 13px
                                
                                // Apply custom styling with animation properties
                                animatedHTML += `<span class="fog-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s; filter: blur(${initialBlur}px);">${char}</span>`;
                            }
                            
                            // Add a space after each word (except the last word in the line)
                            if (wordIndex < words.length - 1) {
                                animatedHTML += '<span class="fog-space">&nbsp;</span>';
                            }
                        });
                        
                        // Add a line break if not the last line
                        if (lineIndex < textSegments.length - 1) {
                            animatedHTML += '<br>';
                        }
                    });
                    
                    // Set the animated HTML
                    textWrapper.innerHTML = animatedHTML;
                    poemContainer.innerHTML = '';
                    poemContainer.appendChild(textWrapper);
                    
                    // Add the attribution after a delay
                    setTimeout(() => {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = `— ${author}, "${poemTitle}"`;
                        poemContainer.appendChild(attribution);
                    }, 3500); // Add attribution after most letters have become visible
                }
                else if (weatherType === 'cloudy') {
                    // Create an element to hold the final HTML
                    const textWrapper = document.createElement('span');
                    textWrapper.className = 'cloud-text';
                    
                    // Convert the selected lines to a cloud animation
                    let animatedHTML = '';
                    
                    // Process the selectedLines by splitting at <br> tags
                    const textSegments = selectedLines.split('<br>');
                    
                    textSegments.forEach((segment, lineIndex) => {
                        // Split the segment into words
                        const words = segment.split(' ');
                        
                        words.forEach((word, wordIndex) => {
                            // Process each character in the word
                            for (let i = 0; i < word.length; i++) {
                                const char = word[i];
                                
                                // // Random delay between 0.1s and 2.5s
                                // const delay = Math.random() * 2.4 + 0.1;
                                
                                // // Random duration between 3s and 5s
                                // const duration = Math.random() * 2 + 3;

                                // 使用相同的延迟让所有字母同时开始动画
                                const delay = 0; // 所有字母同时开始动画
                                const duration = 6; // 所有字母使用相同的 4 秒动画


                                
                                // Random initial positions and rotation for cloud-like effect
                                const randX = Math.floor(Math.random() * 200 - 100); // -100px to 100px
                                const randY = Math.floor(Math.random() * 200 - 100); // -100px to 100px
                                const randRotate = Math.floor(Math.random() * 360); // 0 to 360 degrees
                                const randScale = (Math.random() * 1.5 + 0.5).toFixed(2); // 0.5 to 2
                                
                                // Apply custom styling with random cloud-like positioning
                                animatedHTML += `<span class="cloud-letter" style="--rand-x: ${randX}px; --rand-y: ${randY}px; --rand-rotate: ${randRotate}deg; --rand-scale: ${randScale}; animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</span>`;
                            }
                            
                            // Add a space after each word (except the last word in the line)
                            if (wordIndex < words.length - 1) {
                                animatedHTML += '<span class="cloud-space">&nbsp;</span>';
                            }
                        });
                        
                        // Add a line break if not the last line
                        if (lineIndex < textSegments.length - 1) {
                            animatedHTML += '<br>';
                        }
                    });
                    
                    // Set the animated HTML
                    textWrapper.innerHTML = animatedHTML;
                    poemContainer.innerHTML = '';
                    poemContainer.appendChild(textWrapper);
                    
                    // Add the attribution after a delay
                    setTimeout(() => {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = `— ${author}, "${poemTitle}"`;
                        poemContainer.appendChild(attribution);
                    }, 3800); // Add attribution after most letters have settled
                }
                else if (weatherType === 'sunny') {
                    // Create an element to hold the final HTML
                    const textWrapper = document.createElement('span');
                    textWrapper.className = 'sunny-text';
                    
                    // Convert the selected lines to a sunny animation
                    let animatedHTML = '';
                    
                    // Process the selectedLines by splitting at <br> tags
                    const textSegments = selectedLines.split('<br>');
                    
                    
                    textSegments.forEach((segment, lineIndex) => {
                        // Split the segment into words
                        const words = segment.split(' ');
                        
                        words.forEach((word, wordIndex) => {
                            // Process each character in the word
                            for (let i = 0; i < word.length; i++) {
                                const char = word[i];
                                
                                // // 随机延迟，创造自然的阳光闪耀效果
                                // const delay = Math.random() * 0.8; // 0到0.8秒的延迟
                                const delay = 0
                                
                                // // 随机动画持续时间，但保持在合理范围内
                                // const duration = 5 + Math.random() * 1;5-6秒
                                const duration = 5; // 固定持续时间
                                
                                // 应用自定义样式
                                animatedHTML += `<span class="sunny-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</span>`;
                            }
                            
                            // Add a space after each word (except the last word in the line)
                            if (wordIndex < words.length - 1) {
                                animatedHTML += '<span class="sunny-space">&nbsp;</span>';
                            }
                        });
                        
                        // Add a line break if not the last line
                        if (lineIndex < textSegments.length - 1) {
                            animatedHTML += '<br>';
                        }
                    });
                    
                    // Set the animated HTML
                    textWrapper.innerHTML = animatedHTML;
                    
                    // Format with poem, then attribution
                    poemContainer.innerHTML = '';
                    poemContainer.appendChild(textWrapper);
                    
                    // Add the attribution after a delay
                    setTimeout(() => {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = `— ${author}, "${poemTitle}"`;
                        poemContainer.appendChild(attribution);
                    }, 5500); // Add attribution after glow effect has mostly faded
                }
                else {
                    // For other weather types, use the original display method
                    poemContainer.innerHTML = `
                        ${selectedLines}<br>
                        <small style="font-size: 0.8em; color: #666; font-style: italic; display: block; margin-top: 8px;">
                            — ${author}, "${poemTitle}"
                        </small>
                    `;
                }
            }
            return;
        }
        
        // If we get here, all API attempts failed
        throw new Error("Could not fetch poem from any source");
        
    } catch (err) {
        console.error("All poem API attempts failed:", err);
        
        // Use fallback poem
        if (poemContainer) {
            const fallback = fallbackPoems[keyword];
            
            if (weatherType === 'rainy') {
                // Apply rain animation to the fallback poem
                const textWrapper = document.createElement('span');
                textWrapper.className = 'rain-text';
                
                // Convert the fallback to a rain animation
                let animatedHTML = '';
                
                // Process the fallback by splitting at <br> tags
                const textSegments = fallback.split('<br>');
                
                textSegments.forEach((segment, lineIndex) => {
                    // Split the segment into words
                    const words = segment.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        // Process each character in the word
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            // Random delay between 0.1s and 1.5s for natural rain effect
                            const delay = Math.random() * 1.4 + 0.1;
                            animatedHTML += `<span class="rain-letter" style="animation-delay: ${delay}s;">${char}</span>`;
                        }
                        
                        // Add a space after each word (except the last word in the line)
                        if (wordIndex < words.length - 1) {
                            animatedHTML += '<span class="rain-space">&nbsp;</span>';
                        }
                    });
                    
                    // Add a line break if not the last line
                    if (lineIndex < textSegments.length - 1) {
                        animatedHTML += '<br>';
                    }
                });
                
                // Set the animated HTML
                textWrapper.innerHTML = animatedHTML;
                poemContainer.innerHTML = '';
                poemContainer.appendChild(textWrapper);
                
                // Add the attribution after a delay
                setTimeout(() => {
                    const attribution = document.createElement('small');
                    attribution.className = 'poem-attribution';
                    attribution.innerHTML = `— Weather Poems`;
                    poemContainer.appendChild(attribution);
                }, 2000); // Add attribution after most letters have dropped
            } 
            else if (weatherType === 'windy') {
                // Apply wind animation to the fallback poem
                const textWrapper = document.createElement('span');
                textWrapper.className = 'wind-text';
                
                // Convert the fallback to a wind animation
                let animatedHTML = '';
                
                // Process the fallback by splitting at <br> tags
                const textSegments = fallback.split('<br>');
                
                textSegments.forEach((segment, lineIndex) => {
                    // Split the segment into words
                    const words = segment.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        // Process each character in the word
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            // Random delay between 0.1s and 1.5s for natural wind effect
                            const delay = Math.random() * 1.4 + 0.1;
                            // Random duration for more natural wind movement
                            const duration = Math.random() * 0.6 + 1.5;
                            animatedHTML += `<span class="wind-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</span>`;
                        }
                        
                        // Add a space after each word (except the last word in the line)
                        if (wordIndex < words.length - 1) {
                            animatedHTML += '<span class="wind-space">&nbsp;</span>';
                        }
                    });
                    
                    // Add a line break if not the last line
                    if (lineIndex < textSegments.length - 1) {
                        animatedHTML += '<br>';
                    }
                });
                
                // Set the animated HTML
                textWrapper.innerHTML = animatedHTML;
                poemContainer.innerHTML = '';
                poemContainer.appendChild(textWrapper);
                
                // Add the attribution after a delay for windy fallbacks
                setTimeout(() => {
                    if (poemContainer) {
                        const attribution = document.createElement('small');
                        attribution.className = 'poem-attribution';
                        attribution.innerHTML = "— Weather Poems";
                        poemContainer.appendChild(attribution);
                    }
                }, 2200);
            } 
            else if (weatherType === 'snowy') {
                // Apply snow animation to the fallback poem
                const textWrapper = document.createElement('span');
                textWrapper.className = 'snow-text';
                
                // Convert the fallback to a snow animation
                let animatedHTML = '';
                
                // Process the fallback by splitting at <br> tags
                const textSegments = fallback.split('<br>');
                
                textSegments.forEach((segment, lineIndex) => {
                    // Split the segment into words
                    const words = segment.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        // Process each character in the word
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            // More randomized delays (0.1s to 3s) for a more natural snowfall look
                            const delay = Math.random() * 1.5 + 0.1;
                            // Longer durations (3s to 6s) for slower, gentler falling
                            const duration = Math.random() * 1 + 2.5;
                            // Random initial rotation for each snowflake
                            const initialRotX = Math.floor(Math.random() * 360);
                            const initialRotY = Math.floor(Math.random() * 360);
                            const initialRotZ = Math.floor(Math.random() * 360);
                            // Apply custom styling with initial rotation and animation properties
                            animatedHTML += `<span class="snow-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s; transform: translateY(-200px) rotateX(${initialRotX}deg) rotateY(${initialRotY}deg) rotateZ(${initialRotZ}deg);">${char}</span>`;
                        }
                        
                        // Add a space after each word (except the last word in the line)
                        if (wordIndex < words.length - 1) {
                            animatedHTML += '<span class="snow-space">&nbsp;</span>';
                        }
                    });
                    
                    // Add a line break if not the last line
                    if (lineIndex < textSegments.length - 1) {
                        animatedHTML += '<br>';
                    }
                });
                
                // Set the animated HTML
                textWrapper.innerHTML = animatedHTML;
                poemContainer.innerHTML = '';
                poemContainer.appendChild(textWrapper);
                
                // Add the attribution after a delay
                setTimeout(() => {
                    const attribution = document.createElement('small');
                    attribution.className = 'poem-attribution';
                    attribution.innerHTML = "— Weather Poems";
                    poemContainer.appendChild(attribution);
                }, 3000); // Add attribution after most letters have settled
            }
            else if (weatherType === 'foggy') {
                // Apply fog animation to the fallback poem
                const textWrapper = document.createElement('span');
                textWrapper.className = 'fog-text';
                
                // Convert the fallback to a fog animation
                let animatedHTML = '';
                
                // Process the fallback by splitting at <br> tags
                const textSegments = fallback.split('<br>');
                
                textSegments.forEach((segment, lineIndex) => {
                    // Split the segment into words
                    const words = segment.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        // Process each character in the word
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            // Random delay between 0.1s and 2s for a natural fog reveal effect
                            const delay = Math.random() * 1.9 + 0.1;
                            // Random duration between 3s and 5s for slow fog dissipation
                            const duration = Math.random() * 2 + 3;
                            // Random initial blur strength for more natural appearance
                            const initialBlur = Math.floor(Math.random() * 5) + 8; // 8px to 13px
                            
                            // Apply custom styling with animation properties
                            animatedHTML += `<span class="fog-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s; filter: blur(${initialBlur}px);">${char}</span>`;
                        }
                        
                        // Add a space after each word (except the last word in the line)
                        if (wordIndex < words.length - 1) {
                            animatedHTML += '<span class="fog-space">&nbsp;</span>';
                        }
                    });
                    
                    // Add a line break if not the last line
                    if (lineIndex < textSegments.length - 1) {
                        animatedHTML += '<br>';
                    }
                });
                
                // Set the animated HTML
                textWrapper.innerHTML = animatedHTML;
                poemContainer.innerHTML = '';
                poemContainer.appendChild(textWrapper);
                
                // Add the attribution after a delay
                setTimeout(() => {
                    const attribution = document.createElement('small');
                    attribution.className = 'poem-attribution';
                    attribution.innerHTML = "— Weather Poems";
                    poemContainer.appendChild(attribution);
                }, 3500); // Add attribution after most letters have become visible
            }
            else if (weatherType === 'cloudy') {
                // Apply cloud animation to the fallback poem
                const textWrapper = document.createElement('span');
                textWrapper.className = 'cloud-text';
                
                // Convert the fallback to a cloud animation
                let animatedHTML = '';
                
                // Process the fallback by splitting at <br> tags
                const textSegments = fallback.split('<br>');
                
                textSegments.forEach((segment, lineIndex) => {
                    // Split the segment into words
                    const words = segment.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        // Process each character in the word
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            
                            // // Random delay between 0.1s and 2.5s
                            // const delay = Math.random() * 2.4 + 0.1;
                            
                            // // Random duration between 3s and 5s
                            // const duration = Math.random() * 2 + 3;

                            // 使用相同的延迟让所有字母同时开始动画
                            const delay = 0; // 所有字母同时开始动画
                            const duration = 6; // 所有字母使用相同的 4 秒动画
                            // Random initial positions and rotation for cloud-like effect
                            const randX = Math.floor(Math.random() * 200 - 100); // -100px to 100px
                            const randY = Math.floor(Math.random() * 200 - 100); // -100px to 100px
                            const randRotate = Math.floor(Math.random() * 360); // 0 to 360 degrees
                            const randScale = (Math.random() * 1.5 + 0.5).toFixed(2); // 0.5 to 2
                            

                            // Apply custom styling with random cloud-like positioning
                            animatedHTML += `<span class="cloud-letter" style="--rand-x: ${randX}px; --rand-y: ${randY}px; --rand-rotate: ${randRotate}deg; --rand-scale: ${randScale}; animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</span>`;
                        }
                        
                        // Add a space after each word (except the last word in the line)
                        if (wordIndex < words.length - 1) {
                            animatedHTML += '<span class="cloud-space">&nbsp;</span>';
                        }
                    });
                    
                    // Add a line break if not the last line
                    if (lineIndex < textSegments.length - 1) {
                        animatedHTML += '<br>';
                    }
                });
                
                // Set the animated HTML
                textWrapper.innerHTML = animatedHTML;
                poemContainer.innerHTML = '';
                poemContainer.appendChild(textWrapper);
                
                // Add the attribution after a delay
                setTimeout(() => {
                    const attribution = document.createElement('small');
                    attribution.className = 'poem-attribution';
                    attribution.innerHTML = "— Weather Poems";
                    poemContainer.appendChild(attribution);
                }, 3800); // Add attribution after most letters have settled
            }
            else if (weatherType === 'sunny') {
                // Apply sunny animation to the fallback poem
                const textWrapper = document.createElement('span');
                textWrapper.className = 'sunny-text';
                
                // Convert the fallback to a sunny animation
                let animatedHTML = '';
                
                // Process the fallback by splitting at <br> tags
                const textSegments = fallback.split('<br>');
                
                textSegments.forEach((segment, lineIndex) => {
                    // Split the segment into words
                    const words = segment.split(' ');
                    
                    words.forEach((word, wordIndex) => {
                        // Process each character in the word
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            
                            // 随机延迟，创造自然的阳光闪耀效果
                            const delay = Math.random() * 0.8; // 0到0.8秒的延迟
                            
                            // 随机动画持续时间，但保持在合理范围内
                            const duration = 5 + Math.random() * 1; // 4-6秒
                            
                            // 应用自定义样式
                            animatedHTML += `<span class="sunny-letter" style="animation-delay: ${delay}s; animation-duration: ${duration}s;">${char}</span>`;
                        }
                        
                        // Add a space after each word (except the last word in the line)
                        if (wordIndex < words.length - 1) {
                            animatedHTML += '<span class="sunny-space">&nbsp;</span>';
                        }
                    });
                    
                    // Add a line break if not the last line
                    if (lineIndex < textSegments.length - 1) {
                        animatedHTML += '<br>';
                    }
                });
                
                // Set the animated HTML
                textWrapper.innerHTML = animatedHTML;
                poemContainer.innerHTML = '';
                poemContainer.appendChild(textWrapper);
                
                // Add the attribution after a delay
                setTimeout(() => {
                    const attribution = document.createElement('small');
                    attribution.className = 'poem-attribution';
                    attribution.innerHTML = "— Weather Poems";
                    poemContainer.appendChild(attribution);
                }, 5500); // Add attribution after glow effect has mostly faded
            }
            else {
                poemContainer.innerHTML = fallback || "Weather poem for your day.";
            }
        }
    }
}





// restart button
function resetToFirstPage() {
    console.log("正在重置到封面，当前页码:", pageNo);
    
    // 1. 首先添加淡出效果
    book.style.opacity = '0';
    
    // 2. 平滑隐藏重启按钮
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.classList.remove('visible');
    }
    
    // 3. 等待淡出完成
    setTimeout(() => {
        // 3. 保存原始页码
        const currentPageNo = pageNo;
        
        // 4. 重置页码
        pageNo = 0;
        
        // 5. 循环重置所有页面（从最后一页开始）
        for (let i = allPages.length - 1; i >= 0; i--) {
            allPages[i].style.transition = 'none'; // 临时禁用过渡
            allPages[i].style.transform = 'rotateY(0deg)';
            allPages[i].style.zIndex = PAGECOUNT - i;
        }
        
        // 6. 重置书本位置
        book.style.transition = 'none'; // 临时禁用过渡
        book.style.transform = 'translateX(0px)';
        
        // 7. 强制重排（重新计算布局）
        void book.offsetWidth;
        
        // 8. 恢复过渡效果
        for (let i = 0; i < allPages.length; i++) {
            allPages[i].style.transition = '';
        }
        book.style.transition = '';
        
        // 9. 重置按钮状态
        btn[0].classList.add('disabled-button', 'hidden-button');
        btn[0].classList.remove('enabled-button');
        btn[0].disabled = true;
        
        btn[1].classList.remove('disabled-button', 'hidden-button');
        btn[1].classList.add('enabled-button');
        btn[1].disabled = false;
        
        // 10. 更新背景
        updateBackgroundToMatchPage();
        
        // 11. 停止声音
        stopWeatherSound();
        
        // 12. 延迟后淡入
        setTimeout(() => {
            book.style.opacity = '1';
            console.log("重置完成，从页码", currentPageNo, "回到封面");
        }, 50);
    }, 300);

    // 发送自定义事件通知云效果重置
const event = new Event('bookRestarted');
document.dispatchEvent(event);
console.log("发送bookRestarted事件");
}






// Add this function near your other audio-related functions
function playPageTurnSound() {
    // Create a new audio element each time to allow overlapping sounds
    const pageTurnSound = new Audio('sound/BookFlip.mp3');
    pageTurnSound.volume = 0.4; // Adjust volume as needed
    
    // Play the sound
    pageTurnSound.play().catch(err => {
        console.warn('Failed to play page turn sound:', err);
    });
}




init();
const firstWeatherType = weatherMap[1];
getPoemForWeather(firstWeatherType, allPages[1]);
document.body.style.backgroundImage = "linear-gradient(to bottom, #3381ff, hsl(217, 100%, 74%), #3dd6f5)";



