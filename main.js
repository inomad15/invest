
// Finnhub API 키를 입력하세요.
const API_KEY = "d62v1n9r01qnpqnv70n0d62v1n9r01qnpqnv70ng"; // 여기에 실제 API 키를 입력하세요.

// 숫자 포맷팅 함수 (콤마 추가)
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 등락률에 따른 색상 클래스 반환
const getColorClass = (value) => {
    if (value > 0) return 'text-up';
    if (value < 0) return 'text-down';
    return 'text-flat';
};

// 화살표 추가
const formatChange = (value) => {
    const arrow = value > 0 ? '▲' : (value < 0 ? '▼' : '-');
    return `${arrow} ${Math.abs(value).toFixed(2)}%`;
};

// 1. 공포/탐욕 지수 가져오기
async function fetchFnG() {
    const valueEl = document.getElementById('fng-value');
    const textEl = document.getElementById('fng-text');
    try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const fngData = data.data[0];
        
        const value = fngData.value;
        const status = fngData.value_classification;

        valueEl.innerText = value;
        textEl.innerText = status;
        document.getElementById('fng-bar').style.width = `${value}%`;
    } catch (error) {
        console.error('FnG Error:', error);
        valueEl.innerText = "Error";
        textEl.innerText = "N/A";
    }
}

// 2. 주식 및 암호화폐 정보 가져오기 (Finnhub API)
async function fetchStockData(symbol) {
    if (API_KEY === "YOUR_FINNHUB_API_KEY") {
        console.error("Finnhub API key is not set. Please replace 'YOUR_FINNHUB_API_KEY' in main.js with your actual key.");
        return null;
    }
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // { c: Current price, dp: Percent change, ... }
    } catch (error) {
        console.error(`Stock Error (${symbol}):`, error);
        return null;
    }
}

async function updateStock(elementId, symbol) {
    const valueEl = document.getElementById(`${elementId}-value`);
    const changeEl = document.getElementById(`${elementId}-change`);
    
    valueEl.innerText = "Loading...";
    changeEl.innerText = "";

    const data = await fetchStockData(symbol);

    if (data && data.c) {
        valueEl.innerText = `$${formatNumber(data.c.toFixed(2))}`;
        changeEl.innerText = formatChange(data.dp);
        changeEl.className = `card-change ${getColorClass(data.dp)}`;
    } else {
        valueEl.innerText = "Error";
        changeEl.innerText = "N/A";
        changeEl.className = "card-change text-flat";
    }
}

async function updateStocks() {
    await Promise.all([
        updateStock('btc', 'BINANCE:BTCUSDT'),
        updateStock('eth', 'BINANCE:ETHUSDT'),
        updateStock('pltr', 'PLTR'),
        updateStock('tsla', 'TSLA'),
        updateStock('spy', 'SPY'),
        updateStock('qqq', 'QQQ'),
        updateVix()
    ]);
    updateTime();
}

async function updateVix() {
    const vixEl = document.getElementById('vix-value');
    const vixChangeEl = document.getElementById('vix-change');
    vixEl.innerText = "Loading...";
    vixChangeEl.innerText = "";

    const vixData = await fetchStockData('VIXY');

    if (vixData) {
        vixEl.innerText = `${formatNumber(vixData.c.toFixed(2))}`;
        vixChangeEl.innerText = formatChange(vixData.dp);
        vixChangeEl.className = `card-change ${getColorClass(vixData.dp)}`;
    } else {
        vixEl.innerText = "Error";
        vixChangeEl.innerText = "N/A";
        vixChangeEl.className = "card-change text-flat";
    }
}


// 5. 시장 뉴스 가져오기 (Finnhub API)
async function fetchMarketNews() {
    const newsListEl = document.getElementById('news-list');
    newsListEl.innerHTML = '<li>Loading news...</li>';

    if (API_KEY === "YOUR_FINNHUB_API_KEY") {
        newsListEl.innerHTML = '<li style="color: red;">Finnhub API 키가 설정되지 않았습니다.</li>';
        return;
    }

    try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // 상위 5개 뉴스만 표시
        const topNews = data.slice(0, 5);
        
        if (topNews.length > 0) {
            newsListEl.innerHTML = ''; // 로딩 텍스트 제거
            topNews.forEach(news => {
                const li = document.createElement('li');
                li.style.marginBottom = '10px';
                li.style.borderBottom = '1px solid #333';
                li.style.paddingBottom = '5px';
                
                // 날짜 포맷팅 (Unix timestamp to readable date)
                const date = new Date(news.datetime * 1000);
                const dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                li.innerHTML = `
                    <a href="${news.url}" target="_blank" style="color: #ffffff; text-decoration: none; display: block; margin-bottom: 4px;">${news.headline}</a>
                    <span style="color: #666; font-size: 0.8rem;">${news.source} | ${dateString}</span>
                `;
                newsListEl.appendChild(li);
            });
        } else {
            newsListEl.innerHTML = '<li style="color: #666;">최신 뉴스가 없습니다.</li>';
        }

    } catch (error) {
        console.error('News Error:', error);
        newsListEl.innerHTML = '<li style="color: red;">뉴스를 불러오는 데 실패했습니다.</li>';
    }
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('last-updated').innerText = `Last updated: ${timeString}`;
}

async function generateAndDisplayBriefing() {
    try {
        const response = await fetch('briefing.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const briefingData = await response.json();
        document.getElementById('briefing-content').innerHTML = briefingData.content;
    } catch (error) {
        console.error('Briefing Error:', error);
        document.getElementById('briefing-content').innerHTML = "<p>브리핑을 불러오는 데 실패했습니다.</p>";
    }
}

// 초기화 및 실행
window.onload = () => {
    generateAndDisplayBriefing();
    fetchFnG();
    updateStocks();
    fetchMarketNews();
    
    // 60초마다 데이터 갱신
    setInterval(() => {
        updateStocks();
    }, 60000);
};
