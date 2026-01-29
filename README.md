# 🗞️ 뉴스 AI 챗봇

구글 뉴스를 검색하고 Gemini AI와 대화할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- 🔍 키워드로 구글 뉴스 검색 (최대 10개)
- 💬 검색된 뉴스에 대해 Gemini AI와 대화
- 📊 뉴스 요약 및 분석
- 🎨 현대적이고 반응형 UI

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **AI**: Google Gemini AI (gemini-2.0-flash-exp)
- **Styling**: CSS Modules
- **Deployment**: Vercel

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
GEMINI_API_KEY=your_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## Vercel 배포

### 방법 1: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 방법 2: GitHub 연동

1. GitHub에 레포지토리 생성 및 푸시
2. [Vercel](https://vercel.com)에 로그인
3. "New Project" 클릭
4. GitHub 레포지토리 선택
5. Environment Variables에 `GEMINI_API_KEY` 추가
6. Deploy 클릭

## 사용 방법

1. **뉴스 검색**: 검색창에 키워드 입력 (예: "인공지능", "삼성전자", "비트코인")
2. **뉴스 확인**: 검색 결과에서 최신 뉴스 10개 확인
3. **AI와 대화**: 
   - "주요 내용을 요약해줘"
   - "이 뉴스들의 공통점은 뭐야?"
   - "가장 중요한 뉴스는 뭐야?"
   - 등의 질문으로 AI와 대화

## 프로젝트 구조

```
CHATBOT2/
├── app/
│   ├── api/
│   │   ├── news/
│   │   │   └── route.ts      # 뉴스 검색 API
│   │   └── chat/
│   │       └── route.ts      # AI 챗봇 API
│   ├── layout.tsx            # 레이아웃
│   ├── page.tsx              # 메인 페이지
│   ├── page.module.css       # 페이지 스타일
│   └── globals.css           # 글로벌 스타일
├── .env.local                # 환경 변수 (gitignore)
├── package.json
├── tsconfig.json
└── next.config.js
```

## 라이선스

MIT
