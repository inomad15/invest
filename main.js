
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
        updateForex('usdkrw', 'PEPPERSTONE:10995'),
        updateVix()
    ]);
    updateTime();
}

async function updateForex(elementId, symbol) {
    const valueEl = document.getElementById(`${elementId}-value`);
    const changeEl = document.getElementById(`${elementId}-change`);
    
    valueEl.innerText = "Loading...";
    changeEl.innerText = "";

    const data = await fetchStockData(symbol);

    if (data && data.c) {
        valueEl.innerText = `₩${formatNumber(data.c.toFixed(2))}`;
        // Forex data from PEPPERSTONE might not have dp (percent change) in the same way as stocks
        // Let's check if dp exists, if not, hide or show N/A
        if (data.dp !== undefined && data.dp !== null) {
            changeEl.innerText = formatChange(data.dp);
            changeEl.className = `card-change ${getColorClass(data.dp)}`;
        } else {
            changeEl.innerText = "";
            changeEl.className = "card-change";
        }
    } else {
        valueEl.innerText = "Error";
        changeEl.innerText = "N/A";
        changeEl.className = "card-change text-flat";
    }
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
    console.log('Fetching briefing...');
    try {
        const response = await fetch('briefing.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const briefingData = await response.json();
        console.log('Briefing data received:', briefingData);
        
        // 날짜 처리 (YYYY-MM-DD)
        let formattedDate = "";
        try {
            const dateStr = briefingData.date.split(' ')[0];
            const dateParts = dateStr.split('-');
            const year = dateParts[0];
            const month = parseInt(dateParts[1]);
            const day = parseInt(dateParts[2]);
            formattedDate = `${year}년 ${month}월 ${day}일 모닝브리핑`;
        } catch (e) {
            console.error('Date parsing error:', e);
            formattedDate = "오늘의 모닝브리핑";
        }

        const briefingContentEl = document.getElementById('briefing-content');
        if (briefingContentEl) {
            // 내부 HTML을 통째로 교체하여 h3 '로딩 중' 메시지 제거
            briefingContentEl.innerHTML = `
                <h2 id="briefing-title" style="font-size: 1.5rem; font-weight: bold; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px; color: #ffffff !important; display: block !important;">
                    ${formattedDate}
                </h2>
                <div class="briefing-text" style="color: #ffffff !important; line-height: 1.6;">
                    ${briefingData.content}
                </div>
            `;
            console.log('Briefing HTML injected');
        } else {
            console.error('briefing-content element not found');
        }
    } catch (error) {
        console.error('Briefing Fetch Error:', error);
        const briefingContentEl = document.getElementById('briefing-content');
        if (briefingContentEl) {
            briefingContentEl.innerHTML = "<p style='color: white;'>브리핑 데이터를 불러오는 데 실패했습니다.</p>";
        }
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
