import {useEffect, useState, useRef, useCallback} from 'react';
import {useFetcher} from '@remix-run/react';
import {usePrefixPathWithLocale} from '~/lib/utils';

const REVIEW_IMAGE_URL = 'https://cdn.shopify.com/s/files/1/0799/5929/4245/files/bluestar_1.webp?v=1715370932';

export function AllReviews() {
  const fetcher = useFetcher();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const endCursorRef = useRef(null);
  const baseApiPath = usePrefixPathWithLocale('/api/reviews');

  // Initial load
  useEffect(() => {
    if (fetcher.state === 'idle' && reviews.length === 0) {
      fetcher.load(`${baseApiPath}?first=250`);
    }
  }, [baseApiPath, fetcher]);

  // Handle initial data load
  useEffect(() => {
    if (fetcher.data && fetcher.state === 'idle') {
      if (reviews.length === 0) {
        // Initial load
        setReviews(fetcher.data.reviews || []);
        endCursorRef.current = fetcher.data.pageInfo?.endCursor || null;
        setHasMore(fetcher.data.pageInfo?.hasNextPage || false);
        setIsLoading(false);
      } else {
        // Load more
        console.log("fetcher.data.reviews",fetcher.data.reviews)
        setReviews((prev) => [...prev, ...(fetcher.data.reviews || [])]);
        endCursorRef.current = fetcher.data.pageInfo?.endCursor || null;
        setHasMore(fetcher.data.pageInfo?.hasNextPage || false);
        setIsLoadingMore(false);
      }
    }
  }, [fetcher.data, fetcher.state]);

  // Infinite scroll observer
  const lastReviewElementRef = useCallback(
    (node) => {
      if (isLoadingMore || isLoading) return;
      if (observerTarget.current) observerTarget.current.disconnect();
      observerTarget.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && fetcher.state === 'idle') {
            setIsLoadingMore(true);
            const url = endCursorRef.current
              ? `${baseApiPath}?first=250&after=${endCursorRef.current}`
              : `${baseApiPath}?first=250`;
            fetcher.load(url);
          }
        },
        {threshold: 0.1}
      );
      if (node) observerTarget.current.observe(node);
    },
    [isLoadingMore, isLoading, hasMore, fetcher, baseApiPath]
  );

  // Render review HTML
  const renderReview = (review, index) => {
    const reviewId = review.reviewId?.value || '';
    const user = review.user?.value || 'Customer Review';
    const reviewContent = review.reviewContent?.value || '';

    return (
      <div key={review.id || index} className="testimonial-container">
        <div className="testimonial-image">
          <img
            style={{width: '140px'}}
            src={REVIEW_IMAGE_URL}
            alt=""
          />
        </div>
        <div className="testimonial-review">{reviewContent}</div>
        <div className="testimonial-user">{user}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="testimonial-content-container">
        <div className="testimonial-description">
          Thousands of happy customers trust and choose Statewide for their appliance spare parts.
        </div>
        <br />
        <div className="testimonial-scrollbar">
          <div style={{textAlign: 'center', padding: '40px'}}>
            <div className="loading-spinner" style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #1e5097',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{marginTop: '20px', color: '#666'}}>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="testimonial-content-container">
      <div className="testimonial-description">
        Thousands of happy customers trust and choose Statewide for their appliance spare parts.
      </div>
      <br />
      <div className="testimonial-scrollbar">
        {reviews.map((review, index) => {
          // Attach ref to last review for infinite scroll
          if (index === reviews.length - 1) {
            return (
              <div key={review.id || index} ref={lastReviewElementRef}>
                {renderReview(review, index)}
              </div>
            );
          }
          return renderReview(review, index);
        })}
        {isLoadingMore && (
          <div style={{textAlign: 'center', padding: '20px'}}>
            <div className="loading-spinner" style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #1e5097',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

