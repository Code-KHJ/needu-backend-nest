import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
import redis
import json
import datetime

load_dotenv()

# Redis 설정
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_DB = 0

yesterday = str(datetime.datetime.today().date() - datetime.timedelta(days=1))


# 크롤러 함수
def fetch_data(url):
    try:
        # 요청 보내기
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # HTTP 에러가 있으면 예외 발생
        soup = BeautifulSoup(response.text, 'html.parser')

        # 데이터 추출 (예: 제목과 링크 크롤링)
        data = []
        for item in soup.select('.item-class'):  # 적절한 CSS 선택자로 변경
            title = item.select_one('.title-class').get_text(strip=True)
            link = item.select_one('a')['href']
            data.append({'title': title, 'link': link})
        
        return data

    except requests.RequestException as e:
        print(f"HTTP 요청 실패: {e}")
        return []
    
# 복지넷
def fetch_data_bokjinet():
    url = 'https://www.bokji.net/not/biz/01.bokji'

    try:
        # 요청 보내기
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # HTTP 에러가 있으면 예외 발생
        soup = BeautifulSoup(response.text, 'html.parser')

        # 데이터 추출 (예: 제목과 링크 크롤링)
        bokji_data = []
        for item in soup.select('.board_list_type1 > tbody > tr'):  # 적절한 CSS 선택자로 변경
            date = item.select_one('.date').get_text(strip=True)
            if yesterday == date:
                title = item.select_one('.subject').get_text(strip=True)
                writer = item.select_one('.writer').get_text(strip=True)
                postId = item.select_one('.subject > a').get('href').split("'")[1]
                link = f"https://www.bokji.net/not/biz/01_01.bokji?BOARDIDX={postId}"

                data = {
                    'title': title,
                    'writer': writer,
                    'link': link
                }
                bokji_data.append(data)
        return bokji_data

    except requests.RequestException as e:
        print(f"복지넷 HTTP 요청 실패: {e}")
        return []

# 모금회
def fetch_data_moguem():
    url = 'https://proposal.chest.or.kr/main/mainBusinessList.do'

    try:
        # 요청 보내기
        headers = {
            "Referer": "https://proposal.chest.or.kr/main/main.do",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # HTTP 에러가 있으면 예외 발생
        soup = BeautifulSoup(response.text, 'html.parser')

        # 데이터 추출 (예: 제목과 링크 크롤링)
        mogeum_data = []
        for item in soup.select('.table-wrap > table > tbody > tr'):  # 적절한 CSS 선택자로 변경
            region = item.select('td')[0].get_text(strip=True)
            title =  item.select('td')[1].get_text(strip=True)
            deadline =  item.select('td')[2].get_text(strip=True)
            postId = item.select('td')[1].select_one('a').get('href').split("'")[1]
            link = f"https://proposal.chest.or.kr/popup/mainBusinessDetail.do?dstbBsnsCode={postId}&appnDocNo="

            data = {
                'title':title,
                'writer': f"사회복지공동모금회 {region}지회",
                'deadline':deadline,
                'link':link
            }
            mogeum_data.append(data)
        return mogeum_data

    except requests.RequestException as e:
        print(f"모금회 HTTP 요청 실패: {e}")
        return []
    
# 우양재단
def fetch_data_wooyang():
    url = 'https://www.wooyang.org/News'

    try:
        headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
        }
        # 요청 보내기
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # HTTP 에러가 있으면 예외 발생
        soup = BeautifulSoup(response.text, 'html.parser')

        # 데이터 추출 (예: 제목과 링크 크롤링)
        wooyang_data = []
        for item in soup.select('.li_body'):  # 적절한 CSS 선택자로 변경
            date = item.select_one('.time').get('title')
            title =  item.select_one('.tit > .list_text_title > span').get_text(strip=True)
            if yesterday == date and title[:4] == '[공모]':
                link_source = item.select_one('.tit > .list_text_title').get('href')
                link = f"https://www.wooyang.org{link_source}"
                writer = '우양재단'
                data = {
                    'title': title,
                    'writer': writer,
                    'link': link
                }
                wooyang_data.append(data)

        return wooyang_data

    except requests.RequestException as e:
        print(f"우양 HTTP 요청 실패: {e}")
        return []


def save_to_redis(key, data):
    try:
        # Redis 연결
        pool = redis.ConnectionPool(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, max_connections=10)
        r = redis.StrictRedis(connection_pool=pool)
        r.set(key, json.dumps(data), 259200)
        # JSON 데이터를 Redis에 저장
        # r.setex(key, 86400, json.dumps(data))  # 24시간 동안 유효
        print(f"데이터 저장 완료: {key}")
    except redis.RedisError as e:
        print(f"Redis 저장 실패: {e}")

def main():
    # 크롤링 대상 URL
    print(f"[{datetime.datetime.now()}] 크롤링 시작...")

    # 데이터 크롤링
    total_data = {}
    total_data['bokjinet'] = fetch_data_bokjinet()
    total_data['moguem'] = fetch_data_moguem()
    total_data['wooyang'] = fetch_data_wooyang()

    if not total_data:
        print("데이터가 없습니다.")
        return

    # Redis에 저장
    today = datetime.datetime.now().strftime('%m/%d/%Y')
    redis_key = f"{today} Proposal"
    save_to_redis(redis_key, total_data)

    print(total_data)

if __name__ == "__main__":
    main()
