import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '키워드가 필요합니다' },
        { status: 400 }
      );
    }

    // Google News 검색 URL
    const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;

    // Google News 페이지 가져오기
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const news: NewsItem[] = [];

    // Google News 기사 파싱
    $('article').each((index, element) => {
      if (index >= 10) return false; // 최대 10개만

      const $article = $(element);
      const $titleLink = $article.find('a[href^="./articles/"]').first();
      const title = $titleLink.text().trim();
      const relativeLink = $titleLink.attr('href');
      const link = relativeLink ? `https://news.google.com${relativeLink.substring(1)}` : '';
      
      const source = $article.find('div[data-n-tid]').first().text().trim() || 
                     $article.find('a[data-n-tid]').first().text().trim() || 
                     '출처 미상';
      
      const timeElement = $article.find('time');
      const pubDate = timeElement.attr('datetime') || 
                     timeElement.text().trim() || 
                     '날짜 미상';
      
      // 스니펫 추출 (기사 설명)
      let snippet = '';
      $article.find('p, div').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20 && !snippet) {
          snippet = text;
        }
      });

      if (title && link) {
        news.push({
          title,
          link,
          source,
          pubDate,
          snippet: snippet || '요약 없음',
        });
      }
    });

    // 뉴스를 찾지 못한 경우 대체 방법
    if (news.length === 0) {
      // RSS 피드 방식으로 재시도
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
        const rssResponse = await axios.get(rssUrl);
        const $rss = cheerio.load(rssResponse.data, { xmlMode: true });

        $rss('item').each((index, element) => {
          if (index >= 10) return false;

          const $item = $(element);
          const title = $item.find('title').text().trim();
          const link = $item.find('link').text().trim();
          const pubDate = $item.find('pubDate').text().trim();
          const source = $item.find('source').text().trim() || '출처 미상';
          const description = $item.find('description').text().trim();

          if (title && link) {
            news.push({
              title,
              link,
              source,
              pubDate,
              snippet: description || '요약 없음',
            });
          }
        });
      } catch (rssError) {
        console.error('RSS 피드 오류:', rssError);
      }
    }

    if (news.length === 0) {
      return NextResponse.json(
        { success: false, error: '뉴스를 찾을 수 없습니다. 다른 키워드를 시도해보세요.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, news });
  } catch (error: any) {
    console.error('뉴스 검색 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '뉴스 검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
