'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const searchNews = async () => {
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();
      if (data.success) {
        setNews(data.news);
        setMessages([
          {
            role: 'assistant',
            content: `"${keyword}"에 대한 뉴스 ${data.news.length}개를 찾았습니다. 뉴스에 대해 궁금한 점을 물어보세요!`,
          },
        ]);
      } else {
        alert('뉴스 검색에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('오류가 발생했습니다: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    if (news.length === 0) {
      alert('먼저 뉴스를 검색해주세요');
      return;
    }

    const userMessage: Message = { role: 'user', content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          news: news,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      } else {
        alert('응답 생성에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      alert('오류가 발생했습니다: ' + error);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>🗞️ 뉴스 AI 챗봇</h1>
        <p className={styles.description}>
          키워드를 입력하고 구글 뉴스를 검색한 후, AI와 대화해보세요
        </p>

        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="뉴스 키워드 입력 (예: 인공지능, 삼성전자, 비트코인)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchNews()}
            className={styles.input}
          />
          <button
            onClick={searchNews}
            disabled={loading}
            className={styles.button}
          >
            {loading ? '검색 중...' : '뉴스 검색'}
          </button>
        </div>

        {news.length > 0 && (
          <div className={styles.newsSection}>
            <h2>📰 검색된 뉴스 ({news.length}개)</h2>
            <div className={styles.newsList}>
              {news.map((item, index) => (
                <div key={index} className={styles.newsItem}>
                  <h3>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p className={styles.newsSource}>
                    {item.source} · {item.pubDate}
                  </p>
                  <p className={styles.newsSnippet}>{item.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className={styles.chatSection}>
            <h2>💬 AI와 대화하기</h2>
            <div className={styles.chatMessages}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <strong>{message.role === 'user' ? '나' : 'AI'}:</strong>{' '}
                  {message.content}
                </div>
              ))}
              {chatLoading && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <strong>AI:</strong> 생각 중...
                </div>
              )}
            </div>
            <div className={styles.chatInput}>
              <input
                type="text"
                placeholder="뉴스에 대해 질문해보세요 (예: 주요 내용을 요약해줘)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className={styles.input}
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading}
                className={styles.button}
              >
                {chatLoading ? '응답 중...' : '전송'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
