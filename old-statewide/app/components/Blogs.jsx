import { Image } from '@shopify/hydrogen';
import { Link,BlogSearchBar } from '~/components';
import {ClientReactPaginate} from './ClientReactPaginate';
import { useState, useEffect } from 'react';

const getArticlePreviewText = (article, maxLength = 320) => {
    const rawText = article?.excerpt || article?.content || article?.contentHtml || '';
    const text = rawText
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;?/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

export const Blogs = ({articles,blogs,blogQuery,recentlyViewedBlogs}) => {
    const [itemOffset, setItemOffset] = useState(0);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    const itemsPerPage = isMobile ? 5 : 12;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', checkMobile);
        checkMobile();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setItemOffset(0);
    }, [isMobile]);

    const endOffset = itemOffset + itemsPerPage;
    const currentItems = articles?.nodes.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(articles?.nodes.length / itemsPerPage);

    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % articles?.nodes.length;
      setItemOffset(newOffset);
    };
    let blogsCategories =(blogs?.nodes || []).sort((a, b) => {
        if (a.title < b.title) {
            return -1;
        }
        if (a.title > b.title) {
            return 1;
        }
        return 0;
    });
    return (
        <div className="blogs container my-[2em] mx-auto">
            <h1 className="text-[#1e5099] mb-[1em] font-bold text-[24px] text-center">{blogQuery?`Search results for: ${blogQuery}`:"Statewide Appliance Spares Blog"}</h1>
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
                {(currentItems || []).map((node) => {
                        const date = new Date(node?.publishedAt);
                        let div = getArticlePreviewText(node);

                        const monthName = date.toLocaleString('default', { month: 'long' });
                        return <div key={node.id} className="article-item flex flex-wrap mb-[1.5em] border-[1px] border-[lightgrey] p-[1em]">
                            <div className="img w-full lg:w-[35%] bg-[#f5f5f5] mb-[1em] lg:mb-0 h-[225px]">
                                <Link to={`/blogs/${node?.handle}`} className="block w-full h-full">
                                {node?.image?.url && <Image className='w-full h-full object-cover max-w-full' src={node?.image?.url} />}
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

                    {pageCount > 1 && <ClientReactPaginate
                            breakLabel="..."
                            nextLabel="Next"
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={isMobile ? 2 : 5}
                            marginPagesDisplayed={1}
                            className="react-paginate"
                            pageCount={pageCount}
                            previousLabel={isMobile ? "Prev" : "Previous"}
                            renderOnZeroPageCount={null}
                        />}
                </div>
                <div className='other-items lg:w-[25%] mt-4 lg:mt-0 lg:pl-[2em]'>
                <div className='lg:block hidden'>
                    <BlogSearchBar/>
                </div>
                    <div className='categories border-[2px] border-[#f2f2f5] p-[1em] mb-[1em]'>
                        <h4 className='text-[#0eb2f1] font-bold mb-[.9em] text-[1.3em]'>Recent Posts</h4>
                        <ul>
                            {(articles?.nodes?.slice(0, isMobile ? 5 : 12) || []).map((item)=>{
                                return <li><Link className="text-[#1e5097] block text-[16px] my-[7px] hover:underline" to={`/blogs/${item.handle}`}><span dangerouslySetInnerHTML={{__html: item.title}} /></Link></li>
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
    )
}