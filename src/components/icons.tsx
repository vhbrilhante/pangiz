// Ícones do pangiz: Material Symbols Rounded, preenchidos e em negrito (FILL 1, peso 700), os mesmos da landing.
// A fonte é carregada em app/layout.tsx. Os nomes seguem os do lucide que o app usava, para trocar só o import.

export type IconProps = { size?: number; className?: string; strokeWidth?: number };
export type IconType = (props: IconProps) => React.ReactElement;

function make(glyph: string): IconType {
  function Icon({ size = 20, className }: IconProps) {
    return (
      <span aria-hidden className={["ms", className].filter(Boolean).join(" ")} style={{ fontSize: Math.round(size * 1.15) }}>
        {glyph}
      </span>
    );
  }
  Icon.displayName = `Icon(${glyph})`;
  return Icon;
}

export const ArrowLeft = make("arrow_back");
export const ArrowUpRight = make("north_east");
export const ArrowDownLeft = make("south_west");
export const ChartNoAxesCombined = make("insights");
export const TrendingUp = make("trending_up");
export const Check = make("check");
export const ChevronLeft = make("chevron_left");
export const ChevronRight = make("chevron_right");
export const CreditCard = make("credit_card");
export const Receipt = make("receipt_long");
export const Delete = make("backspace");
export const Eye = make("visibility");
export const EyeOff = make("visibility_off");
export const House = make("home");
export const Landmark = make("account_balance");
export const LockKeyhole = make("lock");
export const LogOut = make("logout");
export const Minus = make("remove");
export const Plus = make("add");
export const RefreshCw = make("refresh");
export const RotateCcw = make("undo");
export const ScanFace = make("face");
export const Search = make("search");
export const ShieldCheck = make("verified_user");
export const Trash2 = make("delete");
export const UserRound = make("person");
export const X = make("close");
export const BookOpen = make("school");
export const Car = make("directions_car");
export const Coffee = make("restaurant");
export const Film = make("movie");
export const HeartPulse = make("favorite");
export const Music = make("music_note");
export const PiggyBank = make("savings");
export const ShoppingBag = make("shopping_bag");
export const ShoppingBasket = make("shopping_cart");
export const Wallet = make("payments");
export const Zap = make("bolt");
export const Send = make("category");

/** Nomes que o link da fonte precisa pedir (o Google só manda os glifos listados). */
export const ICON_NAMES =
  "account_balance,add,arrow_back,backspace,bolt,category,check,chevron_left,chevron_right,close,credit_card,delete,directions_car,face,favorite,home,insights,lock,logout,movie,music_note,north_east,payments,person,receipt_long,refresh,remove,restaurant,savings,school,search,shopping_bag,shopping_cart,south_west,trending_up,undo,verified_user,visibility,visibility_off";
