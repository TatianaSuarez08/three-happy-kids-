const iconNames = {
  activity: 'bi-activity',
  bank: 'bi-bank',
  arrowDown: 'bi-chevron-down',
  arrowLeft: 'bi-arrow-left',
  arrowRight: 'bi-arrow-right',
  arrowUp: 'bi-chevron-up',
  box: 'bi-box',
  calendar: 'bi-calendar3',
  camera: 'bi-camera',
  cash: 'bi-cash-coin',
  cart: 'bi-cart3',
  check: 'bi-check-lg',
  checkCircle: 'bi-check-circle',
  chevronRight: 'bi-chevron-right',
  clock: 'bi-clock',
  dashboard: 'bi-grid-1x2',
  dollar: 'bi-currency-dollar',
  eye: 'bi-eye',
  eyeSlash: 'bi-eye-slash',
  heart: 'bi-heart',
  heartFill: 'bi-heart-fill',
  image: 'bi-image',
  info: 'bi-info-circle',
  lock: 'bi-lock',
  lockOpen: 'bi-unlock',
  logout: 'bi-box-arrow-right',
  mail: 'bi-envelope',
  mapPin: 'bi-geo-alt',
  menu: 'bi-list',
  moon: 'bi-moon-stars',
  more: 'bi-three-dots',
  package: 'bi-box-seam',
  pencil: 'bi-pencil',
  people: 'bi-people',
  person: 'bi-person',
  phone: 'bi-telephone',
  plus: 'bi-plus-lg',
  receipt: 'bi-receipt',
  search: 'bi-search',
  settings: 'bi-gear',
  shield: 'bi-shield-check',
  shoppingBag: 'bi-bag',
  sun: 'bi-sun',
  tags: 'bi-tags',
  trash: 'bi-trash3',
  truck: 'bi-truck',
  warning: 'bi-exclamation-triangle',
  x: 'bi-x-lg',
};

export default function Icon({ name, size = 20, className = '', title, ...props }) {
  const iconClass = iconNames[name] || iconNames.info;
  const labelProps = title ? { title, 'aria-hidden': undefined } : { 'aria-hidden': true };

  return (
    <i
      className={`bi ${iconClass} icon icon-${size} ${className}`.trim()}
      role={title ? 'img' : undefined}
      {...labelProps}
      {...props}
    />
  );
}
