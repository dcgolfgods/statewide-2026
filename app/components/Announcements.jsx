import {Image} from '@shopify/hydrogen';
import {useEffect, useMemo, useState} from 'react';

import {ClientReactPaginate} from './ClientReactPaginate';
import {AnnouncementSearchBar} from './AnnouncementSearchBar';

import {Link} from '~/components';
import {getAnnouncementMonthKey} from '~/lib/announcements';

export function Announcements({
  announcements = [],
  announcementQuery = '',
  announcementMonth = '',
}) {
  const [itemOffset, setItemOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  );
  const itemsPerPage = isMobile ? 5 : 12;
  const searchTerm = (announcementQuery || '').trim().toLowerCase();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const monthWiseItems = useMemo(() => {
    const groups = new Map();
    announcements.forEach((item) => {
      const monthKey = getAnnouncementMonthKey(item.date);
      if (!monthKey) return;
      if (!groups.has(monthKey)) groups.set(monthKey, item.date);
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
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const titleMatches = item.title.toLowerCase().includes(searchTerm);
      const monthMatches =
        !announcementMonth ||
        getAnnouncementMonthKey(item.date) === announcementMonth;
      return titleMatches && monthMatches;
    });
  }, [announcements, searchTerm, announcementMonth]);

  useEffect(() => {
    setItemOffset(0);
  }, [itemsPerPage, searchTerm, announcementMonth]);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredAnnouncements.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset =
      (event.selected * itemsPerPage) %
      Math.max(filteredAnnouncements.length, 1);
    setItemOffset(newOffset);
  };

  const recentItems = announcements.slice(0, isMobile ? 5 : 12);

  return (
    <div className="blogs container my-[2em] mx-auto">
      <h1 className="text-[#1e5099] mb-[1em] font-bold text-[24px] text-center">
        {announcementQuery
          ? `Search results for: ${announcementQuery}`
          : 'Statewide Announcements'}
      </h1>
      <div className="lg:hidden">
        <AnnouncementSearchBar
          defaultValue={announcementQuery}
          month={announcementMonth}
        />
        <ArchiveList
          monthWiseItems={monthWiseItems}
          announcementMonth={announcementMonth}
          announcementQuery={announcementQuery}
        />
      </div>
      <div className="flex flex-wrap">
        <div className="posts lg:w-[72%] w-full">
          {currentItems.map((node) => {
            const date = new Date(node.date);
            return (
              <div
                key={node.id}
                className="article-item flex flex-wrap mb-[1.5em] border-[1px] border-[lightgrey] p-[1em]"
              >
                <div className="img w-full lg:w-[35%] bg-[#f5f5f5] mb-[1em] lg:mb-0 h-[225px]">
                  <Link
                    to={`/announcement/${node.handle}`}
                    className="block w-full h-full"
                  >
                    {node.coverImage?.url ? (
                      <Image
                        className="w-full h-full object-cover max-w-full"
                        src={node.coverImage.url}
                        alt={node.coverImage.altText || node.title}
                      />
                    ) : null}
                  </Link>
                </div>
                <div className="single-details lg:w-[60%] lg:pl-[1em] w-full">
                  <Link
                    to={`/announcement/${node.handle}`}
                    className="block text-[#0eb2f1] hover:underline"
                  >
                    <h2 className="text-[#1e5097]! leading-[28px] mb-[8px] font-bold text-[32px]!">
                      {node.title}
                    </h2>
                  </Link>
                  <div className="flex mb-[16px] text-[#0056b3]">
                    {date.toLocaleString('default', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="single-description mb-[16px]">
                    {createAnnouncementExcerpt(node.body)}
                  </div>
                  <Link
                    to={`/announcement/${node.handle}`}
                    className="text-[#0056b3] hover:underline"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            );
          })}

          {pageCount > 1 ? (
            <ClientReactPaginate
              breakLabel="..."
              nextLabel="Next"
              onPageChange={handlePageClick}
              pageRangeDisplayed={isMobile ? 2 : 5}
              marginPagesDisplayed={1}
              className="react-paginate"
              pageCount={pageCount}
              previousLabel={isMobile ? 'Prev' : 'Previous'}
              renderOnZeroPageCount={null}
            />
          ) : null}
        </div>
        <div className="other-items lg:w-[25%] mt-4 lg:mt-0 lg:pl-[2em]">
          <div className="lg:block hidden">
            <AnnouncementSearchBar
              defaultValue={announcementQuery}
              month={announcementMonth}
            />
          </div>
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
          <div className="lg:block hidden">
            <ArchiveList
              monthWiseItems={monthWiseItems}
              announcementMonth={announcementMonth}
              announcementQuery={announcementQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchiveList({monthWiseItems, announcementMonth, announcementQuery}) {
  return (
    <div className="hidden categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]">
      <h4 className="text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]">
        Month
      </h4>
      <ul>
        <li>
          <Link
            className="text-[#1e5097] block text-[16px] hover:underline"
            to={
              announcementQuery
                ? `/announcement?s=${encodeURIComponent(announcementQuery)}`
                : '/announcement'
            }
          >
            All announcements
          </Link>
        </li>
        {monthWiseItems.map((item) => (
          <li key={item.key}>
            <Link
              className={`text-[#1e5097] block text-[16px] hover:underline ${
                announcementMonth === item.key ? 'font-bold' : ''
              }`}
              to={`/announcement?month=${item.key}${
                announcementQuery
                  ? `&s=${encodeURIComponent(announcementQuery)}`
                  : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function createAnnouncementExcerpt(body = '') {
  const plainText = parseAnnouncementBodyToText(body)
    .replace(/\s+/g, ' ')
    .trim();
  if (!plainText) return '';
  return plainText.length > 220 ? `${plainText.slice(0, 220)}...` : plainText;
}

function parseAnnouncementBodyToText(value = '') {
  if (!value) return '';

  const parsed = safeJsonParse(value);
  if (parsed) return richTextNodeToText(parsed);

  return value.replace(/<[^>]+>/g, ' ');
}

function richTextNodeToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(richTextNodeToText).join(' ');
  if (node.type === 'text') return node.value || '';
  return richTextNodeToText(node.children || []);
}

function safeJsonParse(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}