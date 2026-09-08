import { useState } from "react";
import { WorkspaceDrawer } from "../components/ui/WorkspaceDrawer";
import type { TeaProduct } from "../types/domain";
import { ArrowDown, ArrowUpRight, Play } from "lucide-react";
import { brandStoryCards } from "../data/brandStories";
import { heroAssets, teaProducts, mediaAssets } from "../data/mockData";

export function MarketPage() {
  const [selectedProduct, setSelectedProduct] = useState<TeaProduct | null>(
    null,
  );
  const onProductClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    product: TeaProduct,
  ) => {
    if (product.actionUrl.startsWith("#")) {
      event.preventDefault();
      setSelectedProduct(product);
    }
  };

  return (
    <div className="market-editorial">
      <section className="editorial-hero">
        <div className="editorial-hero__copy">
          <p className="edition-label">
            CHUNJIAN TEA JOURNAL <span>春建 · 茶事</span>
          </p>
          <div className="editorial-seal">
            香途
            <br />
            畅鸣
          </div>
          <h1>
            山野有信，
            <br />
            一叶知春。
          </h1>
          <p className="editorial-lead">
            从春建的层层茶山，到日常的一杯清茶。
            <br />
            循着茶香，认识这片土地与它的生活。
          </p>
          <a href="#tea-collection" className="editorial-link">
            寻一味春茶 <ArrowDown size={18} />
          </a>
          <small className="editorial-caption">产地 / 风味 / 手作 / 共富</small>
        </div>
        <figure className="editorial-hero__image">
          <img src={heroAssets.market} alt="茶汤与茶器" />
          <figcaption>
            <span>一杯茶里的山野</span>
            <span>01 — 春日茶集</span>
          </figcaption>
        </figure>
      </section>
      <section className="editorial-section" id="tea-collection">
        <header className="editorial-section-heading">
          <div>
            <p className="edition-label">01 / THE COLLECTION</p>
            <h2>把春天，留在杯中</h2>
          </div>
          <p>
            茶叶与衍生产品
            <br />
            来自春建的日常好物
          </p>
        </header>
        <div className="editorial-products">
          {teaProducts.map((product, index) => (
            <article key={product.id}>
              <a
                className="editorial-product-image"
                href={product.actionUrl}
                onClick={(event) => onProductClick(event, product)}
              >
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
                <span>0{index + 1}</span>
                <ArrowUpRight />
              </a>
              <div className="editorial-product-title">
                <h3>{product.name}</h3>
                <span>{product.grade}</span>
              </div>
              <p>{product.intro}</p>
              <small>{product.spec}</small>
              <div className="editorial-tags">
                {product.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <a
                className="editorial-link"
                href={product.actionUrl}
                onClick={(event) => onProductClick(event, product)}
              >
                {product.actionUrl.startsWith("#")
                  ? "查看产品资料"
                  : product.actionLabel}
                <ArrowUpRight size={17} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="editorial-stories">
        <header className="editorial-section-heading">
          <div>
            <p className="edition-label">02 / PEOPLE & PLACE</p>
            <h2>茶之外，还有故事</h2>
          </div>
          <p>一片叶，连接山野与人。</p>
        </header>
        {brandStoryCards.map((story, index) => (
          <article className="editorial-story" key={story.id}>
            <a
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className="editorial-story-image"
            >
              <img
                src={
                  mediaAssets[index % mediaAssets.length]?.coverUrl ??
                  heroAssets.market
                }
                alt={story.title}
                loading="lazy"
              />
              <span>0{index + 1}</span>
            </a>
            <div>
              <p className="edition-label">
                CHAPTER 0{index + 1} / {story.title}
              </p>
              <h3>{story.subtitle.split("・")[0]}</h3>
              <p>{story.description}</p>
              <a
                className="editorial-link"
                href={story.url}
                target="_blank"
                rel="noreferrer"
              >
                阅读{story.title}
                <ArrowUpRight size={18} />
              </a>
            </div>
          </article>
        ))}
      </section>
      <section className="editorial-section">
        <header className="editorial-section-heading">
          <div>
            <p className="edition-label">03 / FIELD NOTES</p>
            <h2>茶乡影像手记</h2>
          </div>
          <span>看见一杯茶的来处</span>
        </header>
        <div className="editorial-gallery">
          {mediaAssets.map((asset) => (
            <article key={asset.id}>
              <div className="editorial-gallery-image">
                {asset.type === "video" &&
                !asset.url.includes("/placeholders/") &&
                /\.(mp4|webm|ogg)(\?|$)/i.test(asset.url) ? (
                  <video
                    controls
                    preload="none"
                    poster={asset.coverUrl}
                    src={asset.url}
                    aria-label={asset.title}
                  />
                ) : (
                  <img src={asset.coverUrl} alt={asset.title} loading="lazy" />
                )}
              </div>
              <h3>{asset.title}</h3>
              <p>{asset.description}</p>
              {asset.type === "video" &&
              asset.url &&
              !asset.url.includes("/placeholders/") &&
              !asset.url.startsWith("#") &&
              !/\.(mp4|webm|ogg)(\?|$)/i.test(asset.url) ? (
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="editorial-link"
                >
                  查看影像来源
                  <Play size={15} />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
      <WorkspaceDrawer
        open={selectedProduct !== null}
        title={selectedProduct?.name ?? "产品资料"}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div className="product-information">
            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
            <h3>{selectedProduct.grade}</h3>
            <p>{selectedProduct.intro}</p>
            <p>{selectedProduct.spec}</p>
            <p className="product-availability">
              该产品当前提供展示资料，购买与合作联系方式待补充。
            </p>
          </div>
        )}
      </WorkspaceDrawer>
      <footer className="editorial-footer">
        <span>一叶问茶 · 春声三鸣</span>
        <p>让一叶春茶，走向更远的日常。</p>
        <a href="#tea-collection">回到茶集 ↑</a>
      </footer>
    </div>
  );
}
