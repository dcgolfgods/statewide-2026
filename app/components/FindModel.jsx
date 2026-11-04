import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from './Link';
import {modelData} from './findModelData';

/**
 * "Where do I find my model number?" guide, used on /findyourmodel and in the
 * popup on collection/search pages.
 *
 * Every section is rendered (on the server too) and inactive ones only get
 * the `hidden` attribute, so all of the copy is in the HTML crawlers receive.
 * The appliance list follows the WAI-ARIA tabs pattern, and each section has
 * a stable #slug that opens it on load and is kept in the URL on the page.
 */
export function FindModel({guides, popup = false}) {
  const sections = guides?.length ? guides : modelData;
  const idPrefix = popup ? 'fym-popup' : 'fym';
  const [activeSlug, setActiveSlug] = useState(sections[0]?.slug);
  const tabRefs = useRef({});

  const activate = useCallback(
    (slug, {focus = false, updateHash = true} = {}) => {
      setActiveSlug(slug);
      if (focus) tabRefs.current[slug]?.focus();
      if (updateHash && !popup) {
        window.history.replaceState(window.history.state, '', `#${slug}`);
      }
    },
    [popup],
  );

  // Deep link: /findyourmodel#dishwashers opens and scrolls to that section.
  useEffect(() => {
    if (popup) return;
    const openFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!sections.some((section) => section.slug === slug)) return;
      activate(slug, {updateHash: false});
      requestAnimationFrame(() => {
        document.getElementById(`${idPrefix}-guide`)?.scrollIntoView({block: 'start'});
      });
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [popup, sections, activate, idPrefix]);

  // On mobile the tabs are a horizontal scrolling row: keep the active one in
  // view (scrolls only the row, never the page).
  useEffect(() => {
    const tab = tabRefs.current[activeSlug];
    const row = tab?.parentElement;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const left = tab.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + tab.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({left: left - 16, behavior: 'smooth'});
    }
  }, [activeSlug]);

  const onTabKeyDown = (event, index) => {
    const last = sections.length - 1;
    const next = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowRight: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    activate(sections[next].slug, {focus: true});
  };

  const Heading = popup ? 'h3' : 'h2';

  return (
    <div className="page-body find-your-model-no">
      {popup ? (
        <h2 className="text-[22px] text-[#212529] font-[400] p-[1rem] mb-[1rem] border-b-[1px] border-[#e9ecef]">
          Where do I find my model number?
        </h2>
      ) : (
        <p className="mb-6">
          To obtain spare parts for your appliance Statewide Appliance Spares will require the model number of your
          product. We have compiled a list of the most common places model number information can be found for the
          most popular products.
        </p>
      )}

      <div className="modelnumber-container" id={`${idPrefix}-guide`}>
        <div
          className="modelnumber-menu"
          role="tablist"
          aria-label="Appliance type"
          aria-orientation="vertical"
        >
          {sections.map((section, index) => {
            const isActive = section.slug === activeSlug;
            return (
              <button
                key={section.slug}
                ref={(element) => (tabRefs.current[section.slug] = element)}
                type="button"
                role="tab"
                id={`${idPrefix}-tab-${section.slug}`}
                aria-selected={isActive}
                aria-controls={popup ? `${idPrefix}-${section.slug}` : section.slug}
                tabIndex={isActive ? 0 : -1}
                onClick={() => activate(section.slug)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`modelnumber-item ${isActive ? 'modelnumber-item-active' : ''}`}
              >
                <span className={`modelnumber-arrow ${isActive ? 'dropdown-arrow-left' : ''}`} aria-hidden="true" />
                <span className="modelnumber-heading">{section.appliance}</span>
              </button>
            );
          })}
        </div>

        <div className="modelnumber-appliance">
          {sections.map((section, index) => {
            const isActive = section.slug === activeSlug;
            const headingId = `${idPrefix}-h-${section.slug}`;
            return (
              <section
                key={section.slug}
                id={popup ? `${idPrefix}-${section.slug}` : section.slug}
                role="tabpanel"
                aria-labelledby={headingId}
                tabIndex={0}
                hidden={!isActive}
                className="modelnumber-panel"
              >
                <Heading id={headingId} className="modelnumber-panel-title">
                  {section.appliance}
                </Heading>
                <div className="modelnumber-appliance-img">
                  {section.images.map((image) => (
                    <img
                      key={image.url}
                      className="modelnumber-img"
                      src={image.url}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ))}
                </div>
                <div className="modelnumber-info page-html">
                  {section.summary && <p>{section.summary}</p>}
                  {section.bodyHtml && <div dangerouslySetInnerHTML={{__html: section.bodyHtml}} />}
                  {section.link && (
                    <p className="modelnumber-shop">
                      <Link to={section.link.url} prefetch="intent">
                        {section.link.label}
                      </Link>
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <p className="modelnumber-help">
        Can&apos;t find your model number? Call <a href="tel:+611800005220">1800 005 220</a> or email{' '}
        <a href="mailto:spares@statewideapp.com.au">spares@statewideapp.com.au</a>
      </p>
    </div>
  );
}

export const FindModelPopup = ({showPopup}) => {
  const [guides, setGuides] = useState(null);

  // Same Shopify-managed copy as /findyourmodel; the bundled copy shows until it loads.
  useEffect(() => {
    let isMounted = true;
    fetch('/api/model-guides')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && data?.guides?.length) setGuides(data.guides);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Escape closes the dialog (the backdrop click is the mouse equivalent).
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') showPopup(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showPopup]);

  return (
    <>
      <div
        role="presentation"
        onClick={() => showPopup(false)}
        className="bg-black/[.6] z-[1000] in-stock-popup fixed top-[0] bottom-0 left-0 right-0 h-full w-full bg"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Where do I find my model number?"
        className="in-stock-popup-box z-[1005] fixed top-1/2 left-1/2 overflow-y-auto max-h-[90%] -translate-y-1/2 -translate-x-1/2 w-[90%] max-w-[500px] bg-white rounded-[5px]"
      >
        <button
          onClick={() => showPopup(false)}
          type="button"
          className="absolute right-4 top-[25px] cursor-pointer"
          aria-label="Close"
        >
          <span className="font-bold" aria-hidden="true">
            ×
          </span>
        </button>
        <FindModel popup={true} guides={guides} />
      </div>
    </>
  );
};
