import {useEffect, useState} from 'react';

/**
 * Drawer component that opens on user click.
 * @param heading - string. Shown at the top of the drawer.
 * @param open - boolean state. if true opens the drawer.
 * @param onClose - function should set the open state.
 * @param openFrom - right, left
 * @param children - react children node.
 */
export function Drawer({heading, open, onClose, openFrom = 'right', children}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Force an initial off-screen paint before animating in.
      setIsVisible(false);
      setShouldRender(true);
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      return () => clearTimeout(timeout);
    }

    setIsVisible(false);
    const timeout = setTimeout(() => {
      setShouldRender(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!shouldRender) {
      setIsVisible(false);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  const panelPositionClass = openFrom === 'right' ? 'right-0' : 'left-0';
  const panelTranslateClass =
    openFrom === 'right'
      ? isVisible
        ? 'translate-x-0'
        : 'translate-x-full'
      : isVisible
      ? 'translate-x-0'
      : '-translate-x-full';

  return (
    <div className="fixed inset-0 z-[10000000000]" role="dialog" aria-modal="true" aria-label={heading}>
      <button
        type="button"
        className={`fixed inset-0 bg-black/25 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close drawer"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${panelPositionClass} flex max-w-full`}>
        <div
          className={`w-screen max-w-[400px] text-left align-middle shadow-xl h-screen-dynamic bg-contrast transform transition-transform duration-300 ease-in-out ${panelTranslateClass}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* Use for associating arialabelledby with the title*/
Drawer.Title = function DrawerTitle({children, ...props}) {
  return (
    <h2 {...props}>
      {children}
    </h2>
  );
};

export function useDrawer(openDefault = false) {
  const [isOpen, setIsOpen] = useState(openDefault);

  function openDrawer() {
    setIsOpen(true);
  }

  function closeDrawer() {
    setIsOpen(false);
  }

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  };
}
