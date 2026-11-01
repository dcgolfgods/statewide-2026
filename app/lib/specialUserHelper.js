// Client-side helper for specialUser functionality
export const handleSpecialUser = () => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const specialUserParam = urlParams.get('specialUser');
  
  if (specialUserParam === 'true') {
    // Set cookie for 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `specialUser=true; Path=/; SameSite=Lax; Expires=${expiryDate.toUTCString()}`;
    
    // Remove the parameter from URL without page reload
    urlParams.delete('specialUser');
    const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash;
    window.history.replaceState({}, '', newUrl);
  }
};

// Helper to check if specialUser exists in cookies
export const checkSpecialUserCookie = () => {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'specialUser' && value === 'true') {
      return true;
    }
  }
  return false;
};

// Helper to check if user is special user (returns true/false)
export const isSpecialUser = () => {
  return checkSpecialUserCookie();
}; 