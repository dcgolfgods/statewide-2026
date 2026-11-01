import {Image} from '@shopify/hydrogen';

import {AnnouncementSearchBar} from './AnnouncementSearchBar';

import {Link} from '~/components';
import {getAnnouncementMonthKey} from '~/lib/announcements';

export function AnnouncementDetail({
  announcement,
  announcements = [],
  announcementQuery = '',
}) {
  const announcementDate = new Date(announcement.date);
  const monthWiseItems = buildMonthWiseItems(announcements);
  const recentItems = announcements
    .filter((item) => item.handle !== announcement.handle)
    .slice(0, 12);
  const bannerImage = announcement.bannerImage;
  const bodyHtml = announcementBodyToHtml(announcement.body);
  const selectedMonth = getAnnouncementMonthKey(announcement.date);
  const articleStyles = `
  .article-template__content h2,
  .article-content h2,
  .rte h2 {
    font-size: 24px !important;
    font-weight: 700 !important;
    color: #1e5099 !important;
    line-height: 1.3;
  }

  .article-template__content h3,
  .article-content h3,
  .rte h3 {
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #0eb2f1 !important;
    line-height: 1.35;
  }

  .article-template__content h4,
  .article-content h4,
  .rte h4 {
    font-size: 18px !important;
    font-weight: 700 !important;
    color: #1e5099 !important;
    line-height: 1.4;
  }

  .article-template__content p,
  .article-content p,
  .rte p,
  .article-template__content li,
  .article-content li,
  .rte li {
    font-size: 16px;
    line-height: 1.7;
  }

  .article-template__content table,
  .article-content table,
  .rte table {
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse;
    margin: 16px 0;
    table-layout: auto;
    display: table;
  }

  .article-template__content th,
  .article-template__content td,
  .article-content th,
  .article-content td,
  .rte th,
  .rte td {
    border: 1px solid #d7dbe2;
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
    font-size: 16px;
    line-height: 1.5;
  }

  .article-template__content th,
  .article-content th,
  .rte th {
    font-weight: 700;
    background: #f7f9fc;
  }

  .article-template__content .article-table-scroll,
  .article-content .article-table-scroll,
  .rte .article-table-scroll {
    width: 100%;
  }

  @media (max-width: 767px) {
    .article-template__content .article-table-scroll,
    .article-content .article-table-scroll,
    .rte .article-table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 16px 0;
    }

    .article-template__content .article-table-scroll table,
    .article-content .article-table-scroll table,
    .rte .article-table-scroll table {
      display: table;
      width: max-content !important;
      max-width: none !important;
      min-width: 560px;
      margin: 0;
    }

    .article-template__content th,
    .article-template__content td,
    .article-content th,
    .article-content td,
    .rte th,
    .rte td {
      white-space: nowrap;
      font-size: 15px;
      padding: 8px 10px;
    }
  }

  .article-template__content h2 *,
  .article-template__content h3 *,
  .article-template__content h4 *,
  .article-content h2 *,
  .article-content h3 *,
  .article-content h4 *,
  .rte h2 *,
  .rte h3 *,
  .rte h4 * {
    font-size: inherit !important;
    font-weight: inherit !important;
    color: inherit !important;
  }
    .article-template__content ul p{
        margin: 0;
    }
`;
  return (
    <div className="blogs container my-[2em] mx-auto">
              <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
      <h1 className="text-[#1e5099] mb-[1em] font-bold text-[24px] text-center">
        Statewide Announcements
      </h1>
      <div className="lg:hidden">
        <AnnouncementSearchBar
          defaultValue={announcementQuery}
          month={selectedMonth}
        />
      </div>
      <div className="flex flex-wrap">
        <div className="posts mx-auto lg:w-[72%] w-full">
          <div className="article-template__content single-details  article-page-item overflow-hidden flex-wrap mb-[1.5em] border-[1px] border-[lightgrey] p-[1em]">
            {bannerImage?.url ? (
              <div className="img mb-[2em] bg-[#f5f5f5] w-full">
                <Image
                  className="w-full h-auto max-w-full"
                  src={bannerImage.url}
                  alt={bannerImage.altText || announcement.title}
                />
              </div>
            ) : null}
            <h2 className="entry-title text-[#1e5097] leading-[32px] mb-[8px] font-bold text-[32px]">
              {announcement.title}
            </h2>
            <div className="flex mb-[16px] text-[#0056b3]">
              {announcementDate.toLocaleString('default', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            {bodyHtml ? (
              <div
                dangerouslySetInnerHTML={{__html: bodyHtml}}
                className="page-html page topic-page"
              />
            ) : null}
          </div>
        </div>
        {recentItems.length > 0 ? (<div className="other-items lg:w-[25%] mt-4 lg:mt-0 lg:pl-[2em]">
          <div className="lg:block hidden">
            <AnnouncementSearchBar
              defaultValue={announcementQuery}
              month={selectedMonth}
            />
          </div>
          {recentItems.length > 0 ? (
            <div className="categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]">
              <h4 className="text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]">
                Recent Posts
              </h4>
              <ul>
                {recentItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      className="text-[#1e5097] block text-[16px] my-[7px] hover:underline"
                      to={`/announcement/${item.handle}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="hiddencategories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]">
            <h4 className="text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]">
              Month
            </h4>
            <ul>
              {monthWiseItems.map((item) => (
                <li key={item.key}>
                  <Link
                    className={`text-[#1e5097] block text-[16px] hover:underline ${
                      selectedMonth === item.key ? 'font-bold' : ''
                    }`}
                    to={`/announcement?month=${item.key}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>) : null}
      </div>
    </div>
  );
}

function buildMonthWiseItems(announcements) {
  const groups = new Map();
  announcements.forEach((item) => {
    const key = getAnnouncementMonthKey(item.date);
    if (!key || groups.has(key)) return;
    groups.set(key, item.date);
  });

  return Array.from(groups.entries())
    .map(([key, date]) => ({
      key,
      label: new Date(date).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
    }))
    .sort((a, b) => (a.key > b.key ? -1 : 1));
}

function announcementBodyToHtml(value = '') {
  if (!value) return '';

  const parsed = safeJsonParse(value);
  if (!parsed) {
    return /<[^>]+>/.test(value) ? value : `<p>${escapeHtml(value)}</p>`;
  }

  return richTextNodeToHtml(parsed);
}

function richTextNodeToHtml(node) {
  if (!node) return '';
  if (typeof node === 'string') return escapeHtml(node);
  if (Array.isArray(node)) return node.map(richTextNodeToHtml).join('');
  if (node.type === 'root') return richTextNodeToHtml(node.children || []);
  if (node.type === 'paragraph') {
    return `<p>${richTextNodeToHtml(node.children || [])}</p>`;
  }
  if (node.type === 'heading') {
    const level = Math.min(Math.max(Number(node.level || 2), 1), 6);
    return `<h${level}>${richTextNodeToHtml(node.children || [])}</h${level}>`;
  }
  if (node.type === 'list') {
    const listTag = node.listType === 'ordered' ? 'ol' : 'ul';
    return `<${listTag}>${richTextNodeToHtml(
      node.children || [],
    )}</${listTag}>`;
  }
  if (node.type === 'list-item') {
    return `<li>${richTextNodeToHtml(node.children || [])}</li>`;
  }
  if (node.type === 'link') {
    const href = escapeHtml(node.url || '#');
    return `<a href="${href}">${richTextNodeToHtml(node.children || [])}</a>`;
  }
  if (node.type === 'text') {
    let content = escapeHtml(node.value || '');
    if (node.bold) content = `<strong>${content}</strong>`;
    if (node.italic) content = `<em>${content}</em>`;
    if (node.underline) content = `<u>${content}</u>`;
    return content;
  }

  return richTextNodeToHtml(node.children || []);
}

function safeJsonParse(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}