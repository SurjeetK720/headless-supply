import {Suspense, useEffect, useState} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [isScrolled,setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollingY,setLastScrollingY] = useState(0);
  const {asideType} = useAside();
  useEffect(()=>{
    const root = document.documentElement;

    root.style.setProperty('--announcement-height', isScrolled ? '0px' : '40px');
    root.style.setProperty('--header-height', isScrolled ? '64px' : '80px');

    const handleScroll = () =>{
      if(asideType !== 'closed') return;

      const currentScrollY = window.scrollY;
      setIsScrollingUp(currentScrollY < lastScrollingY);
      setLastScrollingY(currentScrollY);
      setIsScrolled(currentScrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, {passive:true});
    return ()=> window.removeEventListener('scroll',handleScroll);

  },[isScrolled,lastScrollingY,asideType])
  return (
    <div className={`fixed w-full z-40 transition-transform duration-500 ease-in-out
    ${!isScrollingUp && isScrolled && asideType === 'closed' ? '-translate-y-full':'translate-y-0'}`}>

      {/* Announcement Bar */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out bg-black text-white ${isScrolled ? 'max-h-0' : 'max-h-12'}`} style={{'height':`${isScrolled ? '0px' : '40px'}`}}> 
        <div className='container mx-auto text-center py-2.5 px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          <div className='text-[10px] leading-tight font-light tracking-wider'>
          Enjoy FREE shipping with every single order. 🔥 
          </div>
          <div className='text-[10px] leading-tight font-light tracking-wider'>
          Enjoy FREE shipping with every single order. 🔥 
          </div>
          <div className='text-[10px] leading-tight  font-light tracking-wider'>
          Enjoy FREE shipping with every single order. 🔥 
          </div>
          <div className='text-[10px] leading-tight   font-light tracking-wider'>
          Enjoy FREE shipping with every single order. 🔥 
          </div>
        </div>
      </div>
      {/* Main Header */}
      <header className={`header transition-all duration-500 ease-in-out border-b ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadom-sm border-transparent' : ''} `}>
       <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
         <strong>{shop.name}</strong>
       </NavLink>
       <HeaderMenu
         menu={menu}
         viewport="desktop"
         primaryDomainUrl={header.shop.primaryDomain.url}
         publicStoreDomain={publicStoreDomain}
       />
       <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
    </div>
  )
  // return (
  //   <header className="header">
  //     <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
  //       <strong>{shop.name}</strong>
  //     </NavLink>
  //     <HeaderMenu
  //       menu={menu}
  //       viewport="desktop"
  //       primaryDomainUrl={header.shop.primaryDomain.url}
  //       publicStoreDomain={publicStoreDomain}
  //     />
  //     <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
  //   </header>
  // );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Cart {count === null ? <span>&nbsp;</span> : count}
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
