![](https://github.com/Code-KHJ/needu-frontend-react/blob/main/src/assets/images/logo_NeedU.png?raw=true)

## 프로젝트 개요

- 사회복지 커리어 플랫폼 **NEEDU**는 사회복지 종사자의 정보 공유와 생태계 발전을 위한 커뮤니티입니다.
- 현재 약 **700명의 회원**을 대상으로 다음 기능을 제공합니다:
  - 전·현직자 기관 리뷰
  - 실습생 기관 리뷰
  - 커피챗 연계
  - 커뮤니티 (자유게시판, Q&A)
  - 뉴스레터(레터) 구독

> 🧪 데모 계정: test@test.com / test1234

> 🔗 배포 URL: https://needu.site

## 기술 스택

- Language: **TypeScript**
- Framework: **NestJS**
- ORM: TypeORM
- DB: **MySQL** (AWS RDS), Redis(Cache)
- 인증: JWT (access / refresh), OAuth2 (Kakao, Google)
- 배포: AWS EC2, PM2, Nginx
- 문서화: Swagger
- CI/CD: GitHub Actions

## 아키텍처 다이어그램

![Architecture](./docs/NEEDU%20Architecture.drawio.png)

## 폴더 구조

```
src/
├── auth/ # 인증 및 인가 모듈 (JWT)
├── common/ # 공통 데코레이터 및 가드
├── community/ # 커뮤니티 서비스 API, 로직
├── corp/ # 기관 관리 API
├── entity/ # 데이터 엔터티 정의
├── notice/ # 공지사항 관리 API
├── redis/ # Redis 설정
├── review/ # 리뷰 서비스 API, 로직
├── shared/ # 공통 서비스(신고, 포인트 등) API, 로직
├── user/ # 사용자 관리 API, 로직
├── util/ # 유틸 기능
```

## 데이터베이스

> 🗄️ ERD : https://azsllk.short.gy/needu/erd

## API 목록

> ✉️ Swagger UI : http://43.203.214.137/api

## 주요 기능 구현

### 🔐 인증 및 인가

- **JWT 기반 인증**을 사용하며, `accessToken` 및 `refreshToken`은 **쿠키에 저장**하여 응답합니다. (NestJS Passport, JWT, 쿠키 기반 인증)
- `refreshToken`은 **Redis에 캐싱**하여 `accessToken` 만료 시 `refreshToken`을 확인하여 토큰을 재발급합니다.
- **카카오, 구글 OAuth** 로그인도 지원하며, 로그인 성공 시 동일한 방식으로 JWT 토큰을 발급, 저장하여 인증을 유지합니다.
- 관리자와 일반 사용자 권한을 NestJS **Guard**를 통해 구분하여 API 접근을 제어합니다. (Role 기반 권한 관리, Guard 적용)

### 📝 리뷰 서비스

- **기관 리뷰 CRUD**
  - 기관 리뷰 CRUD API를 제공합니다. 작성자는 인증 후 별점(정수형), 텍스트, 항목별 점수를 포함한 리뷰를 등록, 수정, 삭제할 수 있습니다. (TypeORM Entity, RESTful API 설계, 인증 미들웨어)
- **기관 검색 및 필터링**
  - 지역, 평점 범위, 해시태그 등을 쿼리 파라미터로 받아 필터링된 기관 목록을 조회할 수 있습니다. (Query Builder, 동적 조건 처리)
  - 최신순, 평점순 등 정렬 옵션에 따라 서버에서 정렬된 결과를 반환합니다. (DB 인덱스 활용, 정렬 로직)

### 🗣 커뮤니티 서비스

- 게시글 및 댓글 CRUD
  - 자유게시판, Q&A 게시판별로 게시글, 댓글, 대댓글 CRUD API를 제공합니다. JWT 인증과 권한 검사를 통해 작성자만 수정/삭제 가능하도록 제어합니다. (NestJS CRUD, 인증/인가 미들웨어)
  - Q&A 게시판에서는 작성자가 댓글을 답변으로 채택하는 기능을 지원합니다. (비즈니스 로직 구현)
- 페이지네이션 및 정렬
  - 클라이언트는 페이지 번호와 정렬 기준(최신순, 조회순 등)을 API에 전달하며, 서버에서 해당 조건으로 페이징된 데이터를 반환합니다.
- 공감(좋아요)/비공감(싫어요) 기능
  - 서버에서 게시글/댓글에 대한 사용자별 감정표현 상태를 기록하고 중복 입력을 제한합니다.
- 욕설/비속어 제한
  - **Perspective API**를 활용하여 게시글과 댓글 입력 시 욕설·비속어를 서버에서 필터링합니다. (외부 API 연동, 콘텐츠 검수)
- 관리자 기능
  - 관리자 권한을 가진 사용자는 부적절한 게시글을 블라인드 처리하거나 인기 게시글을 선정할 수 있습니다. (관리자 전용 API, 상태 플래그 관리)
  - 공지사항 CRUD API를 제공하여, 운영자가 공지사항을 관리할 수 있습니다. (관리자 전용 기능)

### 👤 사용자 관리

- 프로필 편집 기능
  - 사용자 프로필 이미지, 닉네임, 개인정보 등을 수정하는 API를 제공합니다. (Express Multer S3 사용하여 S3에 업로드)
- 사용자 활동 조회
  - 마이페이지에서 본인이 작성한 게시글, 댓글, 리뷰 등을 확인하며, 수정, 삭제가 가능합니다.
  - 활동에 따른 포인트가 부여되며 사용자 레벨 시스템에 반영됩니다.

### 💻 서비스 운영

- 모니터링 시스템
  - **Slack Webhook**을 통해 사용자 이벤트, 시스템 이벤트 알림을 전송합니다. (Slack API 연동, 이벤트 핸들링)
  - **Google Analytics** 연동으로 사용자 유입 및 행동 데이터를 분석합니다.
- 자동화 시스템
  - **추천 기관 선정 알고리즘**을 주기적으로 실행하여 추천 기관 목록을 업데이트하며, **Redis에 캐싱**을 통해 빠른 응답을 제공합니다. (NestJS Schedule Cron, Redis 캐싱)
  - **웹 크롤러**를 운영하여 공모사업 정보를 수집하고 커뮤니티에 자동 게시하는 봇을 운영합니다. (Python 크롤링, 스케줄링)

### 🖥️ 기술적 처리

- AWS S3를 활용해 프로필 이미지 및 첨부파일을 안전하게 저장하고 관리합니다.
- GitHub Actions를 활용한 CI/CD 파이프라인을 구축하여 빌드, 배포 자동화를 구현합니다. (CI/CD 자동화)
- NestJS와 TypeORM 기반으로 Controller, Service, Module로 레이어를 명확히 분리하여 확장성과 유지보수성을 확보하고, DTO 및 타입 설계로 타입 안정성을 강화했습니다.
