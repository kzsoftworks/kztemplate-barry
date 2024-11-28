'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';

import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle
} from 'app/lib/components/ui/card';
import { Button } from 'app/lib/components/ui/button';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="mx-auto max-w-sm">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
          {/* <CardDescription>{error}</CardDescription> */}
        </CardHeader>
        <CardFooter>
          <Link href="/" className="w-full">
            <Button className="w-full">
              Go to Homepage <ArrowRightIcon className="ml-2 size-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
