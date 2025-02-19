'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function Error() {
  return (
    <div>
      <div>
        <div>
          <h2>Something went wrong!</h2>
          <p>
            Please try again later or contact support if the problem persists.
          </p>
        </div>
        <div>
          <Link href="/">
            <button>
              Go to Homepage →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
