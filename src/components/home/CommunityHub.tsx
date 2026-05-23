export function CommunityHub() {
  // MVP-only visual content: do not connect community APIs here; backend should expose a service first.
  const communityItems = [
    {
      author: 'Lena Explorer',
      text: '刚从冰岛回来，带回一张像月光一样冷的瀑布照片。',
      meta: '128 喜欢 · 24 回应',
      place: 'Iceland',
      imageUrl: '/mock-images/reykjavik-cover.jpg',
    },
    {
      author: 'Wanderer Kai',
      text: '今晚的京都雨声很轻，Mochi 说石板路适合慢慢走。',
      meta: '96 喜欢 · 18 回应',
      place: 'Kyoto',
      imageUrl: '/mock-images/kyoto-cover.jpg',
    },
    {
      author: 'Room With Me',
      text: '海边路线已收进手账，下一站想让宠物替我去看落日。',
      meta: '76 喜欢 · 15 回应',
      place: 'Coast',
      imageUrl: '/mock-images/lisbon-cover.jpg',
    },
  ];

  return (
    <section className="panel home-side-panel community-panel">
      <div className="panel-title-row">
        <div>
          <span className="eyebrow">Community Hub</span>
          <h2>社区广场</h2>
        </div>
        <span className="panel-glyph" aria-hidden="true">
          ♧
        </span>
      </div>
      <div className="community-tabs" aria-label="社区动态分类">
        <span className="active">Discover</span>
        <span>For You</span>
        <span>Following</span>
      </div>
      <div className="community-feed">
        {communityItems.map((item) => (
          <article className="community-item" key={item.author}>
            <span className="avatar-dot" aria-hidden="true">
              {item.author.slice(0, 1)}
            </span>
            <div>
              <h3>{item.author}</h3>
              <p>{item.text}</p>
              <small>{item.meta}</small>
            </div>
            <div className="community-side-media">
              <span className="place-chip">{item.place}</span>
              <img src={item.imageUrl} alt="" />
            </div>
          </article>
        ))}
      </div>
      <button className="community-button" type="button" disabled>
        Explore Community
      </button>
    </section>
  );
}
