import { Image } from '@shopify/hydrogen';
import { BlogSearchBar, Link } from '~/components';

const getArticlePreviewText = (article, maxLength = 320) => {
    const rawText = article?.excerpt || article?.content || article?.contentHtml || '';
    const text = rawText
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;?/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const cleanContentHtml = (html) => {
    if (!html) return html;
    // Remove all inline style attributes from every element (handles both quote styles)
    let result = html.replace(/\s*style\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
    // Remove Word-generated empty MsoNormal paragraphs (often only non-breaking spaces)
    result = result.replace(
        /<p\b([^>]*)>([\s\S]*?)<\/p>/gi,
        (match, attrs = '', inner = '') => {
            const classMatch = attrs.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
            const classValue = classMatch ? (classMatch[1] || classMatch[2] || classMatch[3] || '') : '';
            const hasMsoNormalClass = /\bMsoNormal\b/i.test(classValue);
            if (!hasMsoNormalClass) return match;

            const textOnly = inner
                .replace(/<[^>]+>/g, '')
                .replace(/(?:&nbsp;?|&#160;|&#x0*a0;|\u00a0)/gi, '')
                .replace(/\s+/g, '');

            return textOnly.length === 0 ? '' : match;
        },
    );
    // Unwrap <strong> and <b> tags inside headings (keep inner content, drop the tags)
    result = result.replace(/(<h[1-6][^>]*>)([\s\S]*?)(<\/h[1-6]>)/gi, (match, open, inner, close) => {
        const cleanedInner = inner.replace(/<\/?(?:strong|b)\b[^>]*>/gi, '');
        return open + cleanedInner + close;
    });
    // Wrap tables so only table area scrolls on mobile
    result = result.replace(
        /<table\b[\s\S]*?<\/table>/gi,
        (tableHtml) => `<div class="article-table-scroll">${tableHtml}</div>`,
    );
    return result;
};

export const Article = ({articles, article, blogs,recentlyViewedBlogs}) => {
    // console.log("article",article)
    const date = new Date(article?.publishedAt);
    const monthName = date.toLocaleString('default', { month: 'long' });
    let desktopImage = article?.image?.url;
    let mobileImage = article?.image?.url;
    if(article?.desktop_image?.reference?.image?.url){
        desktopImage = article?.desktop_image?.reference?.image?.url;
    }
    if(article?.mobile_image?.reference?.image?.url){
        mobileImage = article?.mobile_image?.reference?.image?.url;
    }
    let blogsCategories =(blogs?.nodes || []).sort((a, b) => {
        if (a.title < b.title) {
            return -1;
        }
        if (a.title > b.title) {
            return 1;
        }
        return 0;
    });
    // console.log("articles",articles)
    const releatedArticles = articles?.nodes?.filter((node)=>{
        return node.handle !== article.handle
    })

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
        <>
        <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
        <div className="blogs container my-[2em] mx-auto">
            <h1 className="text-[#1e5099] mb-[1em] font-bold text-[24px] text-center">Statewide Appliance Spares Blog</h1>
            <div className=' lg:hidden'>
                    <BlogSearchBar/>
                    <div className='categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]'>
                        <h4 className='text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]'>Categories</h4>
                        <ul>
                            {(blogsCategories || []).map((item)=>{
                                return <li><Link className="text-[#1e5097] block text-[16px] hover:underline" to={`/blogs/category/${item.handle}`}><span dangerouslySetInnerHTML={{__html: item.title}} /></Link></li>
                            })}
                        </ul>
                    </div>
            </div>
            <div className='flex flex-wrap'>
                <div className="posts lg:w-[72%]  w-full">
                        <div key={article.id} className="article-template__content article-page-item overflow-hidden flex-wrap mb-[1.5em] border-[1px] border-[lightgrey] p-[1em]">
                            <div className="img mb-[2em] bg-[#f5f5f5] w-full">
                                <Link to={`/blogs/${article.handle}`}  className="block w-full">
                                {desktopImage && <Image className='w-full h-auto max-w-full hidden lg:block' src={desktopImage} width={880} height={400} loading="eager" />}
                                {mobileImage && <Image className='w-full h-auto max-w-full lg:hidden block' src={mobileImage} width={535} height={300} loading="eager" />}

                                </Link>
                            </div>
                            <div className='single-details '>
                                {/* <Link to={`/blogs/${article.handle}`}  className="block text-[#0eb2f1] hover:underline"> */}
                                    <h2 className='entry-title'>{article.title}</h2>
                                {/* </Link> */}
                                <div className='flex mb-[16px]'>
                                    <Link to={`/blogs/${article.handle}`}  className="text-[#0056b3]  hover:underline">
                                        {monthName} {date.getDate()}, {date.getFullYear()}
                                    </Link>
                                    <span className='mx-2'>|</span>
                                    <Link to={`/blogs/${article.handle}`}  className="text-[#0056b3]  hover:underline">
                                        <span dangerouslySetInnerHTML={{__html: article.blog.title}} />
                                    </Link>
                                </div>
                                <div className='mb-[16px]'>
                                    <div
                                    dangerouslySetInnerHTML={{__html: cleanContentHtml(article.contentHtml)}}
                                    id="ph-topic"
                                    className="page-html page topic-page"
                                    />
                                </div>
                            </div>
                        </div>
                        {releatedArticles?.length > 0 &&
                        <div className='related-articles mb-[30px]'>
                        <h4 className='text-[#1e5099] font-bold ml-[0.5em] text-[24px] mb-[24px]'>Related articles</h4>
                        {(releatedArticles?.slice(0,4) || []).map((node) => {
                        const date = new Date(node?.publishedAt);
                        let div = getArticlePreviewText(node);

                        const monthName = date.toLocaleString('default', { month: 'long' });
                        return <div key={node.id} className="article-item flex flex-wrap mb-[1.5em] border-[1px] border-[lightgrey] p-[1em]">
                            <div className="img w-full lg:w-[35%] bg-[#f5f5f5] mb-[1em] lg:mb-0 h-[225px]">
                                <Link to={`/blogs/${node.handle}`} className="block w-full h-full">
                                {node?.image?.url && <Image className='w-full h-full object-cover max-w-full' src={node?.image?.url} width={400} height={300} loading="lazy" />}
                                </Link>
                            </div>
                            <div className='single-details lg:w-[60%] lg:pl-[1em] w-full'>
                                <Link to={`/blogs/${node.handle}`} className="block text-[#0eb2f1] hover:underline">
                                    <h2 className='text-[#0eb2f1] leading-[28px] mb-[8px] font-bold text-[24px]'>{node.title}</h2>
                                </Link>
                                <div className='flex mb-[16px]'>
                                    <Link to={`/blogs/${node.handle}`} className="text-[#0056b3]  hover:underline">
                                        {monthName} {date.getDate()}, {date.getFullYear()}
                                    </Link>
                                    <span className='mx-2'>|</span>
                                    <Link to={`/blogs/${node.handle}`} className="text-[#0056b3]  hover:underline">
                                        <span dangerouslySetInnerHTML={{__html: node.blog.title}} />
                                    </Link>
                                </div>
                                <div className='single-description mb-[16px]'>
                                    {div}
                                </div>
                                <Link to={`/blogs/${node.handle}`} className="text-[#0056b3]  hover:underline">
                                    Read More
                                </Link>
                            </div>
                        </div>
                    })}
                    </div>
                    }
                </div>
                <div className='other-items lg:w-[25%] mt-4 lg:mt-0 lg:pl-[2em]'>
                <div className='lg:block hidden'>
                        <BlogSearchBar/>
                </div>
                {/* <div className='categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]'>
                        <h4 className='text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]'>Recent Posts</h4>
                        <ul>
                            {(articles?.nodes?.slice(0,12) || []).map((item)=>{
                                return <li><Link className="text-[#1e5097] block text-[16px] my-[7px] hover:underline"  to={`/blogs/${item.handle}`}><span dangerouslySetInnerHTML={{__html: item.title}} /></Link></li>
                            })}
                        </ul>
                    </div> */}
                    <div className='categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]'>
                        <h4 className='text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]'>Recent Posts</h4>
                        <ul>
                            {(articles?.nodes?.slice(0,12) || []).map((item)=>{
                                return <li><Link className="text-[#1e5097] block text-[16px] my-[7px] hover:underline"  to={`/blogs/${item.handle}`}><span dangerouslySetInnerHTML={{__html: item.title}} /></Link></li>
                            })}
                        </ul>
                    </div>
                    <div className='lg:block hidden'>
                    <div className='categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]'>
                        <h4 className='text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]'>Categories</h4>
                        <ul>
                            {(blogsCategories || []).map((item)=>{
                                return <li><Link className="text-[#1e5097] block text-[16px] hover:underline" to={`/blogs/category/${item.handle}`}><span dangerouslySetInnerHTML={{__html: item.title}} /></Link></li>
                            })}
                        </ul>
                    </div>
                    </div>
                    <ul className="social-links hidden gap-[10px] justify-center mt-8">
                        <li>
                        <a target="_blank" href="https://www.facebook.com/statewideapp">
                            <img
                            src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Facebook.webp?v=1697975772"
                            alt="Facebook"
                            height="40"
                            width="40"
                            loading="lazy"
                            />
                        </a>
                        </li>
                        <li>
                        <a
                            target="_blank"
                            href="https://au.linkedin.com/company/statewide-appliance-spares"
                        >
                            <img
                            src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/LinkedIn.webp?v=1697975772"
                            alt="LinkedIn"
                            height="40"
                            width="40"
                            loading="lazy"
                            />
                        </a>
                        </li>
                        <li>
                        <a
                            target="_blank"
                            href="https://www.youtube.com/user/StatewideAppliances"
                        >
                            <img
                            src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/youtube.webp?v=1697975771"
                            alt="YouTube"
                            height="40"
                            width="40"
                            loading="lazy"
                            />
                        </a>
                        </li>
                        <li>
                        <a target="_blank" href="https://www.statewideapp.com.au/blogs">
                            <img
                            src="https://cdn.shopify.com/s/files/1/0799/5929/4245/files/Blog.webp?v=1697975772"
                            alt="Statewide Appliance Spares Blog"
                            height="40"
                            width="40"
                            loading="lazy"
                            />
                        </a>
                        </li>
                    </ul>
                    {
                        recentlyViewedBlogs.length > 0 && <div className='mt-3 categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]'>
                        <h4 className='text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]'>Recently viewed</h4>
                        <ul>
                            {recentlyViewedBlogs.map((item)=>{
                                return <li className='mb-1'><Link className="text-[#1e5097] block text-[16px] hover:underline" to={`/blogs/${item.handle}`}><span dangerouslySetInnerHTML={{__html: item.title}} /></Link></li>
                            })}
                        </ul>
                    </div>
                    }
                
                </div>
            </div>
        </div>
        </>
    )
}