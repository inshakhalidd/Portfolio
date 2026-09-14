import { useEffect, useState } from 'react';
import { getSignedImageUrl } from '../lib/db.js';

export default function SignedImage({ path, alt, className }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    getSignedImageUrl(path)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!url) return <div className={className} />;
  return <img className={className} src={url} alt={alt} />;
}
