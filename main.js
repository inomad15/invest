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
    try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await response.json();
        const fngData = data.data[0];
        
        const value = fngData.value;
        const status = fngData.value_classification;

        document.getElementById('fng-value').innerText = value;
        document.getElementById('fng-text').innerText = status;
        document.getElementById('fng-bar').style.width = `${value}%`;
    } catch (error) {
        console.error('FnG Error:', error);
        document.getElementById('fng-value').innerText = "Error";
    }
}

// 2. 환율 정보 가져오기 (Frankfurter API - 일일 기준)
async function fetchExchange() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW');
        const data = await response.json();
        
        const rate = data.rates.KRW;
        document.getElementById('usd-value').innerText = `₩${formatNumber(rate.toFixed(2))}`;
        document.getElementById('usd-date').innerText = `기준일: ${data.date}`;
    } catch (error) {
        console.error('Exchange Error:', error);
        document.getElementById('usd-value').innerText = "Error";
    }
}

// 3. 암호화폐 정보 가져오기 (CoinGecko API)
async function fetchCrypto() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=krw&include_24hr_change=true');
        const data = await response.json();

        // Bitcoin
        const btcPrice = data.bitcoin.krw;
        const btcChange = data.bitcoin.krw_24h_change;
        const btcEl = document.getElementById('btc-value');
        const btcChangeEl = document.getElementById('btc-change');

        btcEl.innerText = `₩${formatNumber(btcPrice)}`;
        btcChangeEl.innerText = formatChange(btcChange);
        btcChangeEl.className = `card-change ${getColorClass(btcChange)}`;

        // Ethereum
        const ethPrice = data.ethereum.krw;
        const ethChange = data.ethereum.krw_24h_change;
        const ethEl = document.getElementById('eth-value');
        const ethChangeEl = document.getElementById('eth-change');

        ethEl.innerText = `₩${formatNumber(ethPrice)}`;
        ethChangeEl.innerText = formatChange(ethChange);
        ethChangeEl.className = `card-change ${getColorClass(ethChange)}`;

    } catch (error) {
        console.error('Crypto Error:', error);
    }
}

// 초기화 및 실행
window.onload = () => {
    fetchFnG();
    fetchExchange();
    fetchCrypto();
    // 60초마다 데이터 갱신
    setInterval(() => {
        fetchCrypto();
    }, 60000);
};
