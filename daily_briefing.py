import os
import json
import requests
import google.generativeai as genai
from datetime import datetime

# 설정
FINNHUB_API_KEY = "d62v1n9r01qnpqnv70n0d62v1n9r01qnpqnv70ng" # 공개되어도 되는 무료 키라면 하드코딩 가능, 보안상 Secret 추천
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def fetch_market_news():
    """Finnhub에서 최신 일반 시장 뉴스를 가져옵니다."""
    url = f"https://finnhub.io/api/v1/news?category=general&token={FINNHUB_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        # 상위 10개 뉴스만 추출 (AI 컨텍스트 길이 및 관련성 고려)
        return data[:10]
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def generate_briefing(news_list):
    """Gemini AI를 사용하여 뉴스를 한국어로 요약 및 브리핑을 생성합니다."""
    if not news_list:
        return "<h3>⚠️ 뉴스 데이터 수집 실패</h3><p>최신 뉴스를 가져오는 데 실패했습니다.</p>"

    if not GEMINI_API_KEY:
        return "<h3>⚠️ API 키 누락</h3><p>GitHub Secrets에 GEMINI_API_KEY를 설정해주세요.</p>"

    genai.configure(api_key=GEMINI_API_KEY)
    
    # AI 모델 설정 (Gemini 3 Flash Preview 사용, 실패 시 Gemini 1.5로 폴백)
    model_name = 'gemini-3-flash-preview'
    try:
        model = genai.GenerativeModel(model_name)
        # 테스트를 위해 간단한 호출을 시도해볼 수 있으나, 여기서는 바로 설정합니다.
    except Exception as e:
        print(f"Gemini 3 Flash Preview not available, falling back to 1.5: {e}")
        model_name = 'gemini-1.5-flash-latest'
        model = genai.GenerativeModel(model_name)

    # 프롬프트 구성
    news_text = ""
    for idx, news in enumerate(news_list):
        # timestamp to readable date
        dt = datetime.fromtimestamp(news['datetime']).strftime('%Y-%m-%d %H:%M:%S')
        news_text += f"{idx+1}. [{dt}] {news['headline']}\nSummary: {news['summary']}\n\n"

    prompt = f"""
    You are a professional financial analyst for Korean investors.
    Based on the following recent global market news, write a "Morning Briefing" in Korean following the structured format below.

    <News Data>
    {news_text}
    </News Data>

    <Instructions>
    Analyze the provided news and structure the response into these 5 specific sections.
    **IMPORTANT:** Return the result in **clean HTML format** suitable for a web dashboard (do not use markdown code blocks like ```html).

    **1. 핵심 요약 (Executive Summary)**
    - **Headline:** Summarize yesterday's US market in one impactful sentence.
    - **Key Features:** List 3 bullet points (`<li>`) highlighting the most significant market characteristics.

    **2. 주요 지수 및 섹터 동향 (Key Indices & Sector Performance)**
    - **Key Indices:** Trends and closing points of S&P 500, Nasdaq, Dow, and Russell 2000 (if available in news).
    - **Sector Flow:** Identify the Top 3 strongest and weakest sectors with brief reasons.

    **3. 시장을 움직인 핵심 동인 (Key Market Drivers)**
    - **Macro Economy:** Impacts of economic indicators (CPI, Jobs, Fed events).
    - **Corporate News:** Significant company news (Earnings, M&A, Product launches).
    - **Other Variables:** Oil prices, Geopolitical risks, etc.

    **4. 특징주 및 시장 심리 (Movers & Sentiment)**
    - **Top Movers:** List up to 5 notable stocks with reasons for their movement.
    - **Market Sentiment:** Analyze VIX and 10Y Bond Yield movements to explain Risk-on/off sentiment.

    **5. 오늘의 전망 및 관전 포인트 (Outlook & What to Watch)**
    - **Schedule:** Upcoming economic data or earnings releases for today.
    - **Watch Point:** The single most important point investors should focus on today.

    **HTML Formatting Rules:**
    - Use `<h3>` for the 5 section titles (e.g., `<h3>1. 핵심 요약</h3>`).
    - Use `<ul>` and `<li>` for lists.
    - Use `<p>` for descriptive paragraphs.
    - Use `<strong>` to highlight key terms, numbers, or stock names.
    - Use relevant emojis to make it professional yet engaging.
    - Keep the tone professional, analytical, and easy to read for Korean investors.
    </Instructions>
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating briefing: {e}")
        try:
            available_models = [m.name for m in genai.list_models()]
            print(f"Available models: {available_models}")
        except Exception as list_e:
            print(f"Could not list models: {list_e}")
        return f"<h3>⚠️ 브리핑 생성 실패</h3><p>AI 요약 중 오류가 발생했습니다: {e}</p>"

from datetime import datetime, timedelta, timezone

# ... (기존 코드 생략)

def save_briefing(content):
    """결과를 JSON 파일로 저장합니다. 날짜는 한국 시간(KST) 기준입니다."""
    # UTC 시간을 한국 시간(UTC+9)으로 변환
    kst_now = datetime.now(timezone.utc) + timedelta(hours=9)
    
    # 요일 한글 변환 매핑
    weekday_map = ['월', '화', '수', '목', '금', '토', '일']
    weekday_str = weekday_map[kst_now.weekday()]
    
    formatted_date = kst_now.strftime(f"%Y-%m-%d ({weekday_str}) %H:%M")
    
    data = {
        "date": formatted_date,
        "content": content
    }
    
    with open("briefing.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"briefing.json updated successfully with date: {formatted_date}")

if __name__ == "__main__":
    print("Starting Daily Briefing Generation...")
    news = fetch_market_news()
    if news:
        print(f"Fetched {len(news)} news items.")
        briefing_html = generate_briefing(news)
        save_briefing(briefing_html)
    else:
        print("No news found.")
