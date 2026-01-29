import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, news } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: '메시지가 필요합니다' },
        { status: 400 }
      );
    }

    if (!news || !Array.isArray(news)) {
      return NextResponse.json(
        { success: false, error: '뉴스 데이터가 필요합니다' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    // Gemini AI 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 뉴스 컨텍스트 생성
    const newsContext = news
      .map((item: NewsItem, index: number) => {
        return `뉴스 ${index + 1}:
제목: ${item.title}
출처: ${item.source}
날짜: ${item.pubDate}
내용: ${item.snippet}
링크: ${item.link}
`;
      })
      .join('\n---\n');

    // 대화 히스토리 구성
    const chatHistory = messages
      .slice(0, -1) // 마지막 메시지는 제외 (현재 사용자 메시지)
      .map((msg: Message) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // 시스템 프롬프트와 함께 채팅 세션 시작
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [
            {
              text: `당신은 뉴스 분석 AI 어시스턴트입니다. 다음 뉴스 기사들을 참고하여 사용자의 질문에 답변해주세요.

${newsContext}

위 뉴스들을 바탕으로 사용자의 질문에 친절하고 상세하게 답변해주세요. 
- 요약을 요청하면 주요 내용을 간결하게 정리해주세요
- 분석을 요청하면 여러 기사를 종합하여 인사이트를 제공해주세요
- 특정 정보를 물으면 관련 기사를 참조하여 답변해주세요
- 한국어로 자연스럽게 대화하세요`,
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: '네, 제공된 뉴스 기사들을 바탕으로 질문에 답변해드리겠습니다. 무엇이 궁금하신가요?',
            },
          ],
        },
        ...chatHistory,
      ],
    });

    // 현재 사용자 메시지
    const userMessage = messages[messages.length - 1].content;

    // AI 응답 생성
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('챗 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI 응답 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
