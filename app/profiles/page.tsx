import { HomeIcon, MapIcon, SquarePlus, User } from 'lucide-react';
import Link from 'next/link';

export interface PageProps {}

function Page(props: PageProps) {
  return (
    <>
      <main className='relative h-[100dvh]'>
        <div className='h-8'></div>
        <header className='h-12 flex items-center px-6 sticky top-0 z-50 backdrop-blur-xl'>
          <h1 className='text-2xl font-semibold'>Profile</h1>
        </header>
        <div className='mx-6 mt-8 p-4 rounded-xl bg-white'>
          <div className='space-y-4'>
            <div className='flex'>
              <div className='w-24 text-base'>App</div>
              <div className='text-base'>Smart Bot</div>
            </div>
            <div className='flex'>
              <div className='w-24 text-base'>Version</div>
              <div className='text-base'>0.1.0</div>
            </div>
          </div>
        </div>
        <div className='fixed bottom-0 h-16 w-full backdrop-blur-xl flex justify-evenly'>
          <Link href='/'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <HomeIcon className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Home</div>
            </div>
          </Link>
          <Link href='/devices/add'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <SquarePlus className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Add Device</div>
            </div>
          </Link>
          <Link href='/scenarios'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <MapIcon className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Scenario</div>
            </div>
          </Link>
          <Link href='/profiles'>
            <div className='relative h-16 w-16 grid place-items-center text-gray-600 hover:active:bg-green-50'>
              <User className='-translate-y-2' size={26} />
              <div className='absolute text-[11px] bottom-2'>Profile</div>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}

export default Page;
