import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import type { TeaProduct } from '../../types/domain';

interface ProductCardProps {
  product: TeaProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="asset-frame aspect-[4/3]">
        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute bottom-4 left-4 z-10 rounded-full bg-white/88 px-3 py-1 text-xs font-black text-tea-leaf backdrop-blur">{product.grade}</div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-black text-tea-ink">{product.name}</h3>
        <p className="mt-3 text-sm leading-6 text-tea-ink/66">{product.intro}</p>
        <p className="mt-4 text-sm font-bold text-tea-clay">{product.spec}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-tea-mist px-3 py-1 text-xs font-bold text-tea-ink/58">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={product.actionUrl}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-tea-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-leaf"
        >
          <ShoppingBag className="h-4 w-4" />
          {product.actionLabel}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
