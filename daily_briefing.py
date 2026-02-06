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
    
    # AI 모델 설정 (gemini-pro 사용)
    model = genai.GenerativeModel('gemini-pro')

    # 프롬프트 구성
    news_text = ""
    for idx, news in enumerate(news_list):
        # timestamp to readable date
        dt = datetime.fromtimestamp(news['datetime']).strftime('%Y-%m-%d %H:%M:%S')
        news_text += f"{idx+1}. [{dt}] {news['headline']}\nSummary: {news['summary']}\n\n"

    prompt = f"""
    You are a professional financial analyst for Korean investors.
    Based on the following recent global market news, write a "Morning Briefing" in Korean.

    <News Data>
    {news_text}
    </News Data>

    <Instructions>
    1. **Title:** Create a catchy title summarizing the key market sentiment today.
    2. **Key Takeaways:** Summarize the most important 3-5 points in a bullet list.
    3. **Market Analysis:** Briefly explain the market atmosphere and what investors should watch out for.
    4. **Format:** Return the result in **clean HTML format** (without ```html code blocks).
       - Use `<h3>` for the title.
       - Use `<ul>` and `<li>` for key takeaways.
       - Use `<p>` for paragraphs.
       - Use emojis appropriately to make it engaging.
       - The tone should be professional yet easy to read.
    </Instructions>
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating briefing: {e}")
        return f"<h3>⚠️ 브리핑 생성 실패</h3><p>AI 요약 중 오류가 발생했습니다: {e}</p>"

def save_briefing(content):
    """결과를 JSON 파일로 저장합니다."""
    data = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "content": content
    }
    
    with open("briefing.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("briefing.json updated successfully.")

if __name__ == "__main__":
    print("Starting Daily Briefing Generation...")
    news = fetch_market_news()
    if news:
        print(f"Fetched {len(news)} news items.")
        briefing_html = generate_briefing(news)
        save_briefing(briefing_html)
    else:
        print("No news found.")
